// Runs on Vercel at build time. Fills in values the page should not carry in source:
//   CONTACT_EMAIL        the public contact address shown on the page (set in Vercel > Settings > Environment Variables)
//   GOOGLE_SITE_VERIFICATION  optional: Search Console "HTML tag" code
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const env = process.env;
const live = env.VERCEL_ENV === 'production';
let email = (env.CONTACT_EMAIL || '').trim();
if (!/^[^@\s<>"']+@[^@\s<>"']+\.[^@\s<>"']+$/.test(email)) {
  if (live) { console.error('Build stopped: CONTACT_EMAIL is missing or not an email address. Add it in Vercel > Settings > Environment Variables, then deploy again.'); process.exit(1); }
  email = 'contact@example.com'; // previews only, so the layout can be checked
  console.warn('CONTACT_EMAIL not set: preview uses a placeholder address.');
}
const code = (env.GOOGLE_SITE_VERIFICATION || '').trim();
if (code && !/^[\w-]{20,120}$/.test(code)) { console.error('Build stopped: GOOGLE_SITE_VERIFICATION does not look like a verification code.'); process.exit(1); }

let html = readFileSync('index.html', 'utf8');
const count = html.split('%%CONTACT_EMAIL%%').length - 1;
if (count !== 5) { console.error(`Build stopped: expected 5 contact placeholders, found ${count}.`); process.exit(1); }
html = html.split('%%CONTACT_EMAIL%%').join(email);
if (html.split('%%GOOGLE_VERIFY%%').length !== 2) { console.error('Build stopped: verification placeholder missing.'); process.exit(1); }
html = html.replace('%%GOOGLE_VERIFY%%', code ? `<meta name="google-site-verification" content="${code}">\n` : '');
if (html.includes('%%')) { console.error('Build stopped: an unfilled placeholder is left in the page.'); process.exit(1); }
writeFileSync('index.html', html);
rmSync('build.mjs');
console.log(`Page built for ${env.VERCEL_ENV || 'local'}: contact address set, search verification ${code ? 'set' : 'not set'}.`);
