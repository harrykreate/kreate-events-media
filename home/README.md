# Kreative Clan homepage media

Pictures the homepage build pulls in when they are not already in its own checkout
(`scripts/fetch-media.mjs` in the `kreative-clan-site` project). Paths mirror the site:
`home/public/img/harry.webp` is served as `/img/harry.webp`.

| File | Used for |
|---|---|
| `public/img/harry.webp` | Harry's cut-out on the first screen |
| `public/img/harry-desk.webp` | Harry at the desk, contact section |
| `public/img/insta/kannur.webp` | Cover of instagram.com/p/C7lqIsRSfVC |
| `public/img/insta/bengaluru.webp` | Cover of instagram.com/reel/C_dTZY4SpMB |
| `public/img/insta/dubai.webp` | Cover of instagram.com/reel/DBYlQujph0J |

The build checks each file against a SHA-256 written in the script, so a changed picture
needs a new commit here and the new commit id and hash there.
