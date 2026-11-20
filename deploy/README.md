# Deploying events.kreativeclan.com

The site is a static page plus one function (`api/leads.js`). Styles, script and media are served from this
repository through jsDelivr, pinned to a commit hash.

## What goes to Vercel

| File | Source |
|---|---|
| `index.html` | `index.template.html` with `@@CDN@@` replaced by `https://cdn.jsdelivr.net/gh/harrykreate/kreate-events-media@<commit>/` |
| `vercel.json` | `vercel.template.json`, same replacement |
| `build.mjs`, `robots.txt`, `sitemap.xml`, `favicon.svg` | as they are |
| `classic.html`, `creatives.html`, `style.css`, `app.js`, `data.js`, `api/leads.js`, `package.json`, `assets/`, `logos/` | already on Vercel, reused from the previous deployment |

`build.mjs` runs on Vercel, copies the site into `public/` and fills two values from the project's
environment variables:

- `CONTACT_EMAIL` (required for production): the public contact address shown on the page. It is not kept
  in this repository or in the page source. A production build stops if it is missing.
- `GOOGLE_SITE_VERIFICATION` (optional): the Search Console "HTML tag" code.

Preview builds without `CONTACT_EMAIL` use a placeholder address so the layout can be checked.

## After a production deployment

A new deployment does not move the domain by itself. Point both aliases at it:
`events.kreativeclan.com` and `kreate-for-events-alpha.vercel.app`.

## Search and sharing

- Title, description, canonical, social tags and structured data live in the head of `index.template.html`.
- Link thumbnail: `social/og-pass.jpg`, served as `/og-pass.jpg`. Give a new thumbnail a new file name,
  because social apps cache the old one.
- `/classic` is marked noindex. `/creatives` gets its canonical from a response header in `vercel.json`.
- `*.vercel.app` hosts are marked noindex so only the real domain is indexed.
