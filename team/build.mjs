// Builds the Kreative Clan team page into ../public (or the folder given as the first argument).
// Runs on the host at deploy time. It writes the story, roster and people cards into the page's HTML
// from people.js, so search engines and link previews get the full page without running any script.
//   GOOGLE_SITE_VERIFICATION  optional: Search Console "HTML tag" code (Vercel > Settings > Environment Variables)
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(process.argv[2] || path.join(here, '..', 'public'));
const SITE = 'https://team.kreativeclan.com/';
const stop = msg => { console.error('Build stopped: ' + msg); process.exit(1); };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const code = (process.env.GOOGLE_SITE_VERIFICATION || '').trim();
if (code && !/^[\w-]{20,120}$/.test(code)) stop('GOOGLE_SITE_VERIFICATION does not look like a verification code.');
const version = (process.env.TEAM_SOURCE_SHA || String(Date.now())).slice(0, 10);

/* the same content builder the browser uses */
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['people.js', 'content.js']) vm.runInContext(readFileSync(path.join(here, f), 'utf8'), ctx, { filename: f });
const D = ctx.window.CLAN, now = new Date(), V = ctx.window.CLAN_VIEW(D, now);
const founders = V.order.filter(p => p.founder), names = founders.map(p => p.name).join(' and '), n = V.counts.people;

const title = 'The Kreative Clan Team & Founders | Kannur, Bengaluru, Dubai';
const desc = `Meet the ${n} people of Kreative Clan, founded in ${D.founded} by ${names}: who is on the team, what they do and how long they have been here.`;
const ogTitle = 'Founded by two. Grown by the Clan.';
const ogDesc = `Meet the ${n} people behind Kreative Clan, the marketing agency founded in ${D.founded} by ${names}.`;
const ogAlt = 'The line Founded by two, grown by the Clan, beside a wall of Kreative Clan team photos and portraits.';

/* structured data: the organisation and its people, by name and role only */
const ORG = 'https://www.kreativeclan.com/#organization';
const person = p => ({ '@type': 'Person', name: p.name, jobTitle: p.role, worksFor: { '@id': ORG } });
const ld = { '@context': 'https://schema.org', '@graph': [
  { '@type': 'Organization', '@id': ORG, name: 'Kreative Clan', url: 'https://www.kreativeclan.com/', foundingDate: String(D.founded),
    founder: founders.map(person), employee: V.staff.map(person), numberOfEmployees: { '@type': 'QuantitativeValue', value: n } },
  { '@type': 'WebSite', '@id': SITE + '#website', url: SITE, name: 'The Kreative Clan Team', inLanguage: 'en', publisher: { '@id': ORG } },
  { '@type': 'AboutPage', '@id': SITE + '#webpage', url: SITE, name: title, description: desc, inLanguage: 'en', isPartOf: { '@id': SITE + '#website' }, about: { '@id': ORG },
    primaryImageOfPage: { '@type': 'ImageObject', url: SITE + 'og-team.jpg', width: 1200, height: 630 }, dateModified: now.toISOString().slice(0, 10) },
] };

let html = readFileSync(path.join(here, 'index.template.html'), 'utf8');
const fill = { TITLE: esc(title), DESC: esc(desc), URL: SITE, OG_TITLE: esc(ogTitle), OG_DESC: esc(ogDesc), OG_ALT: esc(ogAlt), V: version, YEAR: String(now.getFullYear()),
  GOOGLE_VERIFY: code ? `<meta name="google-site-verification" content="${code}">\n` : '',
  JSONLD: JSON.stringify(ld).replace(/</g, '\\u003c') };
for (const k in V.html) { fill['HTML_' + k] = V.html[k]; fill['SIG_' + k] = V.sig[k]; }
for (const k in fill) {
  if (!html.includes(`%%${k}%%`)) stop(`the page template has no %%${k}%% slot.`);
  html = html.split(`%%${k}%%`).join(fill[k]);
}
/* numbers and names worked out from the list */
html = html.replace(/(data-count="([\w-]+)"[^>]*>)([^<]*)/g, (m, open, key) => V.counts[key] == null ? m : open + esc(V.counts[key]));
html = html.replace(/(id="asOf">)[^<]*/, '$1' + esc(V.asOf));
if (html.includes('%%')) stop('an unfilled slot is left in the page.');
if (desc.length > 165) stop(`the description is ${desc.length} characters; keep it under 165.`);

mkdirSync(OUT, { recursive: true });
for (const f of ['site.css', 'site.js', 'people.js', 'content.js', 'img', 'video', 'og-team.jpg', 'favicon.svg', 'favicon-48.png', 'favicon-96.png', 'favicon-192.png', 'apple-touch-icon.png'])
  cpSync(path.join(here, f), path.join(OUT, f), { recursive: true });
writeFileSync(path.join(OUT, 'index.html'), html);
writeFileSync(path.join(OUT, 'robots.txt'), `# team.kreativeclan.com
User-agent: *
Allow: /

# Answer engines and AI assistants are welcome to read and cite the site
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: ClaudeBot
User-agent: Claude-Web
User-agent: anthropic-ai
User-agent: Google-Extended
User-agent: Bingbot
User-agent: Applebot-Extended
User-agent: Amazonbot
User-agent: Meta-ExternalAgent
Allow: /

Sitemap: ${SITE}sitemap.xml
`);
writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}</loc><lastmod>${now.toISOString().slice(0, 10)}</lastmod></url>
</urlset>
`);
console.log(`Team page built into ${OUT}: ${n} people, title ${title.length} characters, description ${desc.length} characters, search verification ${code ? 'set' : 'not set'}.`);
