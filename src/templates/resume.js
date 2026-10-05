import { esc, safeUrl, formatRange } from '../lib/utils.js';

// Print-optimised, ATS-friendly single-column resume rendered to PDF by headless Chrome.
export function renderResume(data) {
  const { basics } = data;
  const contact = [
    basics.location && esc(basics.location),
    basics.phone && esc(basics.phone),
    `<a href="mailto:${esc(basics.email)}">${esc(basics.email)}</a>`,
    ...basics.profiles.map((p) => `<a href="${esc(safeUrl(p.url))}">${esc(p.url.replace(/^https?:\/\/(www\.)?/, ''))}</a>`),
  ]
    .filter(Boolean)
    .join('<span class="sep">•</span>');

  const experience = data.experience
    .map(
      (job) => `<div class="entry">
      <div class="title"><strong>${esc(job.role)}</strong> <span class="at">|</span> ${esc(job.company)}</div>
      <div class="sub"><span class="date">${esc(formatRange(job.start, job.end))}</span>${[job.location, job.type]
        .filter(Boolean)
        .map((v) => ` <span class="at">|</span> ${esc(v)}`)
        .join('')}</div>
      <ul>${job.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
    </div>`
    )
    .join('');

  const education = data.education
    .map(
      (e) => `<div class="entry">
      <div class="title"><strong>${esc(e.degree)}</strong></div>
      <div class="sub">${esc(e.institution)} <span class="at">|</span> ${esc(e.location)} <span class="at">|</span> <span class="date">${esc(formatRange(e.start, e.end))}</span></div>
    </div>`
    )
    .join('');

  const projects = (data.projects ?? [])
    .filter((p) => p.inPdf)
    .map(
      (p) => `<div class="entry">
      <div class="title"><strong>${esc(p.title)}</strong> <span class="at">|</span> <a href="${esc(safeUrl(p.url))}">${esc(p.url.replace(/^https?:\/\//, ''))}</a></div>
      <div>${esc(p.description)}${p.tags.length ? ` <span class="muted">(${p.tags.slice(0, 5).map(esc).join(', ')})</span>` : ''}</div>
    </div>`
    )
    .join('');

  const certs = data.certifications
    .filter((c) => c.featured)
    .map((c) => `<li>Salesforce Certified ${esc(c.name)}</li>`)
    .join('');
  const skills = data.skills
    .map((g) => `<div class="skill-row"><strong>${esc(g.category)}:</strong> ${g.items.map(esc).join(', ')}</div>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(basics.name)} - ${esc(basics.headline)} - Resume</title>
<style>
  @page { margin: 0.55in 0.6in; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; color: #1b2230; font-size: 10.2pt; line-height: 1.42; margin: 0; }
  a { color: inherit; text-decoration: none; }
  header { border-bottom: 2.5px solid #0b5cab; padding-bottom: 10px; margin-bottom: 4px; }
  h1 { font-size: 23pt; margin: 0; letter-spacing: -0.3px; color: #0b1b33; }
  .headline { color: #0b5cab; font-weight: 600; font-size: 11.5pt; margin: 2px 0 6px; }
  .contact { font-size: 9.2pt; color: #3d4757; }
  .sep { margin: 0 7px; color: #9aa4b2; }
  h2 { font-size: 10.5pt; text-transform: uppercase; letter-spacing: 1.6px; color: #0b5cab; margin: 14px 0 6px; padding-bottom: 3px; border-bottom: 1px solid #d7dde6; }
  p { margin: 0; }
  .entry { margin-bottom: 9px; page-break-inside: avoid; }
  .title { font-size: 10.6pt; }
  .at { color: #9aa4b2; margin: 0 2px; }
  .date { color: #3d4757; font-weight: 600; }
  .sub { color: #5b6575; font-size: 9.2pt; }
  ul { margin: 4px 0 0; padding-left: 16px; }
  li { margin-bottom: 2.5px; }
  .muted { color: #5b6575; }
  .skill-row { margin-bottom: 4px; }
  .certs { columns: 2; }
</style>
</head>
<body>
  <header>
    <h1>${esc(basics.name)}</h1>
    <div class="headline">${esc(basics.headline)}</div>
    <div class="contact">${contact}</div>
  </header>

  <h2>Summary</h2>
  <p>${esc(basics.summary)}</p>

  <h2>Work Experience</h2>
  ${experience}

  ${projects ? `<h2>Open Source Projects</h2>\n  ${projects}` : ''}

  <h2>Certifications</h2>
  <ul class="certs">${certs}</ul>

  <h2>Skills</h2>
  ${skills}

  <h2>Education</h2>
  ${education}
</body>
</html>
`;
}
