# The Kreative Clan team page

Source of https://team.kreativeclan.com/ (www.kreativeclan.com/teamkreate forwards there).

- `people.js` is the team list: name, role, team and the month each person joined. Edit this file to add or remove someone.
- `content.js` turns that list into the story, the roster board and the people cards. It runs in the browser and at build time.
- `build.mjs` builds the site into `public/`: it writes the content into the page's HTML, plus `robots.txt` and `sitemap.xml`.
- `manifest.json` lists every file with its checksum. Regenerate it after any change: `node make-manifest.mjs`.

The Vercel project holds two small files only (`vercel.json` and `bootstrap.mjs`). At deploy time `bootstrap.mjs` downloads this
folder at one pinned commit, checks every file against the manifest and runs `build.mjs`. To publish a change: commit here,
put the new commit id in `bootstrap.mjs`, deploy.

Optional setting on the Vercel project: `GOOGLE_SITE_VERIFICATION` (Search Console "HTML tag" code).
