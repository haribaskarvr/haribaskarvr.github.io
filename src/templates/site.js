import { esc, safeUrl, formatRange, formatDuration, formatMonthYear, profileIcon } from '../lib/utils.js';

const NAV = [
  ['about', 'About'],
  ['experience', 'Experience'],
  ['projects', 'Projects'],
  ['skills', 'Skills'],
  ['certifications', 'Certifications'],
  ['contact', 'Contact'],
];

function sectionHeading(index, kicker, title) {
  return `<header class="section-head reveal">
      <span class="kicker"><span class="kicker-num">0${index}</span> ${esc(kicker)}</span>
      <h2>${title}</h2>
    </header>`;
}

function renderHero(data) {
  const { basics, site } = data;
  const avatar = basics.photo
    ? `<img src="${esc(safeUrl(basics.photo))}" alt="${esc(basics.name)}" width="160" height="160">`
    : `<span>${esc(basics.initials)}</span>`;
  const socials = basics.profiles
    .map(
      (p) => `<a class="icon-btn" href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer" aria-label="${esc(p.network)}">${profileIcon(p.network)}</a>`
    )
    .join('');

  return `<section class="hero" id="top">
    <div class="hero-inner">
      ${basics.photo ? `<div class="avatar reveal">${avatar}</div>` : ''}
      <p class="eyebrow reveal"><span class="status-dot" aria-hidden="true"></span> Open to architecture conversations</p>
      <h1 class="reveal">${esc(basics.name)}</h1>
      <p class="typed reveal">${esc(basics.headline)}</p>
      <p class="hero-sub reveal">${esc(data.derived.years)}+ years architecting enterprise Salesforce platforms — Revenue Cloud, CPQ, OmniStudio, Industries Clouds &amp; Agentforce.</p>
      <div class="hero-cta reveal">
        <a class="btn btn-primary" href="${esc(site.resumeFileName)}" download>${profileIcon('download')} Download Resume</a>
        <a class="btn btn-ghost" href="#contact">Get in touch</a>
        <div class="socials">${socials}</div>
      </div>
    </div>
  </section>`;
}

function renderAbout(data) {
  const stats = [
    { value: data.derived.years, suffix: '+', label: 'Years of Salesforce experience' },
    { value: data.certifications.length, suffix: '', label: 'Salesforce certifications' },
    ...(data.highlights ?? []),
  ]
    .map(
      (s) => `<div class="stat card reveal">
        <div class="stat-value"><span class="counter" data-target="${esc(s.value)}">${esc(s.value)}</span>${esc(s.suffix ?? '')}</div>
        <div class="stat-label">${esc(s.label)}</div>
      </div>`
    )
    .join('');

  return `<section id="about" class="section">
    ${sectionHeading(1, 'About', 'Architecting <span class="gradient-text">business complexity</span> into elegant systems')}
    <div class="about-grid">
      <p class="lead reveal">${esc(data.basics.summary)}</p>
      <div class="stats">${stats}</div>
    </div>
  </section>`;
}

function renderExperience(data) {
  const items = data.experience
    .map((job) => {
      const current = !job.end;
      const meta = [job.location, job.type].filter(Boolean).map(esc).join(' · ');
      const tech = (job.tech ?? []).map((t) => `<li>${esc(t)}</li>`).join('');
      const bullets = job.highlights.map((h) => `<li>${esc(h)}</li>`).join('');
      return `<li class="timeline-item reveal">
        <span class="timeline-dot${current ? ' is-current' : ''}" aria-hidden="true"></span>
        <article class="card job">
          <div class="job-head">
            <div>
              <h3>${esc(job.role)}</h3>
              <p class="company">${esc(job.company)}${meta ? ` <span class="muted">· ${meta}</span>` : ''}</p>
            </div>
            <div class="job-when">
              <span class="pill${current ? ' pill-live' : ''}">${esc(formatRange(job.start, job.end))}</span>
              <span class="muted small">${esc(formatDuration(job.start, job.end, data.derived.now))}</span>
            </div>
          </div>
          <ul class="bullets">${bullets}</ul>
          ${tech ? `<ul class="tags">${tech}</ul>` : ''}
        </article>
      </li>`;
    })
    .join('');

  return `<section id="experience" class="section">
    ${sectionHeading(2, 'Experience', 'Where I have <span class="gradient-text">made an impact</span>')}
    <ol class="timeline">${items}</ol>
  </section>`;
}

function renderProjects(data) {
  if (!data.projects?.length) return '';
  const cards = data.projects
    .map((p) => {
      const tags = p.tags.slice(0, 6).map((t) => `<li>${esc(t)}</li>`).join('');
      const lang = p.language
        ? `<span class="lang"><span class="lang-dot" data-lang="${esc(p.language.toLowerCase())}"></span>${esc(p.language)}</span>`
        : '';
      const demo = p.demo
        ? `<a class="project-link" href="${esc(safeUrl(p.demo))}" target="_blank" rel="noopener noreferrer">${profileIcon('external')} Live</a>`
        : '';
      return `<article class="card project reveal">
        <div class="project-top">
          <span class="project-icon">${profileIcon('repo')}</span>
          <div class="project-links">
            ${demo}
            <a class="project-link" href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer" aria-label="${esc(p.title)} on GitHub">${profileIcon('github')} Code</a>
          </div>
        </div>
        <h3><a href="${esc(safeUrl(p.demo || p.url))}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a></h3>
        <p class="repo-path">${esc(p.repo)}</p>
        <p class="project-desc">${esc(p.description)}</p>
        ${tags ? `<ul class="tags">${tags}</ul>` : ''}
        <div class="project-meta">
          ${lang}
          ${p.stars ? `<span title="Stars">${profileIcon('star')} ${esc(p.stars)}</span>` : ''}
          ${p.forks ? `<span title="Forks">${profileIcon('fork')} ${esc(p.forks)}</span>` : ''}
        </div>
      </article>`;
    })
    .join('');

  return `<section id="projects" class="section">
    ${sectionHeading(3, 'Open Source', 'Things I have <span class="gradient-text">built &amp; shared</span>')}
    <div class="projects-grid">${cards}</div>
  </section>`;
}

function renderSkills(data) {
  const groups = data.skills
    .map(
      (g) => `<div class="card skill-group reveal">
        <h3>${esc(g.category)}</h3>
        <ul class="chips">${g.items.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      </div>`
    )
    .join('');
  const marquee = data.skills.flatMap((g) => g.items);
  const track = marquee.map((s) => `<span>${esc(s)}</span>`).join('<i aria-hidden="true">✦</i>');

  return `<section id="skills" class="section">
    ${sectionHeading(4, 'Skills', 'The <span class="gradient-text">toolkit</span>')}
    <div class="marquee" aria-hidden="true"><div class="marquee-track">${track}<i>✦</i>${track}<i>✦</i></div></div>
    <div class="skills-grid">${groups}</div>
  </section>`;
}

function renderCertifications(data) {
  const certs = data.certifications
    .map((c) => `<li class="card cert reveal"><span class="cert-icon">${profileIcon('award')}</span><h3>${esc(c.name)}</h3></li>`)
    .join('');

  const verify = (data.trailblazerProfiles ?? [])
    .map(
      (p) => `<a class="btn btn-ghost" href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer">${profileIcon('shield')} ${esc(p.url.replace(/^https?:\/\/(www\.)?salesforce\.com\//, ''))}</a>`
    )
    .join('');

  const edu = data.education
    .map(
      (e) => `<div class="card edu reveal">
        <div class="cert-icon">${profileIcon('cap')}</div>
        <div>
          <h3>${esc(e.degree)}</h3>
          <p>${esc(e.institution)}</p>
          <p class="muted small">${esc(e.location)} · ${esc(formatRange(e.start, e.end))}</p>
        </div>
      </div>`
    )
    .join('');

  return `<section id="certifications" class="section">
    ${sectionHeading(5, 'Credentials', `${data.certifications.length} certifications &amp; <span class="gradient-text">counting</span>`)}
    ${verify ? `<div class="verify reveal"><p>${profileIcon('shield')} Verify my certifications on Salesforce Trailblazer:</p><div class="verify-links">${verify}</div></div>` : ''}
    <ul class="certs-grid">${certs}</ul>
    <h3 class="sub-head reveal">Education</h3>
    <div class="edu-wrap">${edu}</div>
  </section>`;
}

function renderContact(data) {
  const { basics, site } = data;
  const links = [
    { icon: 'email', label: basics.email, href: `mailto:${basics.email}` },
    ...(site.showPhoneOnSite && basics.phone
      ? [{ icon: 'phone', label: basics.phone, href: `tel:${basics.phone.replace(/[^\d+]/g, '')}` }]
      : []),
    ...basics.profiles.map((p) => ({ icon: p.network, label: `${p.network} / ${p.username}`, href: p.url, external: true })),
    ...(data.trailblazerProfiles ?? []).map((p) => ({ icon: 'shield', label: `Trailblazer / ${p.url.split('/').pop()}`, href: p.url, external: true })),
  ]
    .map(
      (l) => `<a class="contact-link card" href="${esc(safeUrl(l.href))}"${l.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
        ${profileIcon(l.icon)}<span>${esc(l.label)}</span>
      </a>`
    )
    .join('');

  return `<section id="contact" class="section contact">
    ${sectionHeading(6, 'Contact', "Let's build something <span class=\"gradient-text\">remarkable</span>")}
    <p class="lead center reveal">Whether it's a Revenue Cloud transformation, an OmniStudio rollout or an Agentforce idea — I'd love to hear about it.</p>
    <div class="contact-links reveal">${links}</div>
  </section>`;
}

function jsonLd(data) {
  const { basics, site } = data;
  const current = data.experience.find((e) => !e.end);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: basics.name,
    jobTitle: basics.headline,
    url: site.url,
    email: `mailto:${basics.email}`,
    sameAs: [...basics.profiles, ...(data.trailblazerProfiles ?? [])].map((p) => p.url),
    ...(current ? { worksFor: { '@type': 'Organization', name: current.company } } : {}),
    hasCredential: data.certifications.map((c) => ({ '@type': 'EducationalOccupationalCredential', name: `Salesforce Certified ${c.name}` })),
  };
  return JSON.stringify(ld).replace(/</g, '\\u003c');
}

export function renderSite(data) {
  const { basics, site } = data;
  const nav = NAV.map(([id, label]) => `<li><a href="#${id}" data-nav="${id}">${label}</a></li>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; object-src 'none'; base-uri 'self'">
  <title>${esc(site.title)}</title>
  <meta name="description" content="${esc(site.description)}">
  <meta name="theme-color" content="#111413">
  <link rel="canonical" href="${esc(site.url)}/">
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${esc(site.title)}">
  <meta property="og:description" content="${esc(site.description)}">
  <meta property="og:url" content="${esc(site.url)}/">
  <meta name="twitter:card" content="summary">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&family=Montserrat:wght@600;700&display=swap">
  <link rel="stylesheet" href="assets/site.css">
  <script type="application/ld+json">${jsonLd(data)}</script>
</head>
<body>
  <div class="progress" aria-hidden="true"></div>

  <nav class="nav" aria-label="Primary">
    <a class="brand" href="#top" aria-label="Home"><span class="brand-mark">${esc(basics.initials)}</span></a>
    <button class="menu-toggle" aria-expanded="false" aria-controls="nav-links" aria-label="Toggle menu"><span></span><span></span></button>
    <ul class="nav-links" id="nav-links">${nav}</ul>
  </nav>

  <main>
    ${renderHero(data)}
    ${renderAbout(data)}
    ${renderExperience(data)}
    ${renderProjects(data)}
    ${renderSkills(data)}
    ${renderCertifications(data)}
    ${renderContact(data)}
  </main>

  <footer class="footer">
    <p>© ${data.derived.now.getFullYear()} ${esc(basics.name)} · Updated ${esc(data.derived.updated)}</p>
  </footer>

  <script src="assets/site.js" defer></script>
</body>
</html>
`;
}
