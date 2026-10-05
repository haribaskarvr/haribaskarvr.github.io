import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as loadYaml } from 'js-yaml';
import { renderSite } from '../src/templates/site.js';
import { renderResume } from '../src/templates/resume.js';
import { yearsSince } from '../src/lib/utils.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const skipPdf = process.argv.includes('--no-pdf');

function validate(data) {
  const required = ['site', 'basics', 'experience', 'education', 'certifications', 'skills'];
  const missing = required.filter((key) => !data?.[key]);
  if (missing.length) throw new Error(`resume.yml is missing: ${missing.join(', ')}`);
  data.experience.forEach((job, i) => {
    ['company', 'role', 'start', 'highlights'].forEach((k) => {
      if (!job[k]) throw new Error(`experience[${i}] is missing "${k}"`);
    });
  });
  (data.projects ?? []).forEach((p, i) => {
    if (!/^[\w.-]+\/[\w.-]+$/.test(p.repo ?? '')) throw new Error(`projects[${i}].repo must look like "owner/name"`);
  });
}

function prettifyRepoName(name) {
  return name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Live repo details from GitHub; YAML values win. Falls back to YAML-only if the API is unreachable.
async function enrichProjects(projects = []) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-build' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  return Promise.all(
    projects.map(async (p) => {
      let gh = {};
      try {
        const res = await fetch(`https://api.github.com/repos/${p.repo}`, { headers, signal: AbortSignal.timeout(10000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        gh = await res.json();
      } catch (err) {
        console.warn(`! Could not fetch ${p.repo} from GitHub (${err.message}); using resume.yml values only`);
      }
      return {
        ...p,
        url: gh.html_url ?? `https://github.com/${p.repo}`,
        title: p.title ?? prettifyRepoName(p.repo.split('/')[1]),
        description: p.description ?? gh.description ?? '',
        language: p.language ?? gh.language ?? '',
        stars: gh.stargazers_count ?? 0,
        forks: gh.forks_count ?? 0,
        tags: p.tags ?? gh.topics ?? [],
        demo: p.demo ?? gh.homepage ?? '',
      };
    })
  );
}

async function buildPdf(html, outFile, data) {
  const { default: puppeteer } = await import('puppeteer');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  let bytes;
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    bytes = await page.pdf({ format: data.site.pdfFormat || 'Letter', printBackground: true, preferCSSPageSize: true, tagged: true });
  } finally {
    await browser.close();
  }

  const { PDFDocument } = await import('pdf-lib');
  const pdf = await PDFDocument.load(bytes);
  const { basics } = data;
  pdf.setTitle(`${basics.name} - ${basics.headline} - Resume`);
  pdf.setAuthor(basics.name);
  pdf.setSubject(`Resume of ${basics.name}, ${basics.headline}`);
  pdf.setKeywords([basics.headline, ...data.skills.flatMap((g) => g.items), ...data.certifications.filter((c) => c.featured).map((c) => `Salesforce Certified ${c.name}`)]);
  pdf.setCreator(data.site.url);
  pdf.setProducer(data.site.url);
  await fs.writeFile(outFile, await pdf.save());
}

async function main() {
  const data = loadYaml(await fs.readFile(path.join(root, 'data', 'resume.yml'), 'utf8'));
  validate(data);
  data.projects = await enrichProjects(data.projects);

  const now = new Date();
  data.derived = {
    now,
    years: yearsSince(data.basics.careerStart, now),
    updated: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  };

  await fs.rm(dist, { recursive: true, force: true });
  await fs.mkdir(dist, { recursive: true });
  await fs.cp(path.join(root, 'src', 'assets'), path.join(dist, 'assets'), { recursive: true });
  await fs.writeFile(path.join(dist, '.nojekyll'), '');

  await fs.writeFile(path.join(dist, 'index.html'), renderSite(data));
  console.log('✓ dist/index.html');

  const resumeHtml = renderResume(data);
  await fs.writeFile(path.join(dist, 'resume.html'), resumeHtml);
  console.log('✓ dist/resume.html');

  if (skipPdf) {
    console.log('- PDF skipped (--no-pdf)');
    return;
  }
  await buildPdf(resumeHtml, path.join(dist, data.site.resumeFileName), data);
  console.log(`✓ dist/${data.site.resumeFileName}`);
}

main().catch((err) => {
  console.error('✗ Build failed:', err.message);
  process.exit(1);
});
