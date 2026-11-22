/* Everything the team page says, built from the list in people.js.
   Runs in the browser and once at build time, so the story, the roster and the cards are already in the
   page's HTML before any script runs (for search engines, link previews and anyone without scripts). */
(function (root) {
  root.CLAN_VIEW = function (D, today) {
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const people = D.people.map(p => Object.assign({}, p));
    const TEAMS = [
      ['Leadership', 'Sets the direction and holds the standard.'],
      ['Creative & Content', 'Design, video, motion, social and websites.'],
      ['Performance Marketing', 'Paid campaigns, lead generation and tracking.'],
      ['Kerala Operations', 'Operations and content from Kannur.'],
    ].filter(t => people.some(p => p.team === t[0]));
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let nowM = today.getFullYear() * 12 + today.getMonth() + 1;
    const asOfM = +D.asOf.slice(0, 4) * 12 + +D.asOf.slice(5, 7);
    if (nowM < asOfM) nowM = asOfM;
    const nowY = Math.floor((nowM - 1) / 12);
    const startM = p => +p.start.slice(0, 4) * 12 + +p.start.slice(5, 7);
    people.forEach(p => {
      p.months = p.founder ? (nowY - D.founded) * 12 : Math.max(0, nowM - startM(p));
      const y = Math.floor(p.months / 12), m = p.months % 12;
      p.since = p.founder ? 'Since ' + D.founded : `Since ${MON[+p.start.slice(5, 7) - 1]} ${p.start.slice(0, 4)}`;
      p.sinceShort = p.founder ? String(D.founded) : `${MON[+p.start.slice(5, 7) - 1]} ${p.start.slice(0, 4)}`;
      p.tenure = p.founder ? 'From day one' : p.months < 1 ? 'Just joined' : [y ? `${y} yr${y === 1 ? '' : 's'}` : '', m ? `${m} mo${m === 1 ? '' : 's'}` : ''].filter(Boolean).join(' ');
      p.initials = p.name.replace(/\./g, '').split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    });
    /* founders first, then longest-standing first */
    const order = people.slice().sort((a, b) => (b.founder ? 1 : 0) - (a.founder ? 1 : 0) || b.months - a.months);
    const staff = order.filter(p => !p.founder), longest = staff[0];
    const words = n => {
      const a = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const t = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      return n < 20 ? a[n] : n < 100 ? t[Math.floor(n / 10)] + (n % 10 ? '-' + a[n % 10].toLowerCase() : '') : String(n);
    };
    const joinedIn = (a, b) => staff.filter(p => +p.start.slice(0, 4) >= a && +p.start.slice(0, 4) <= b).length;
    const counts = {
      people: people.length, 'people-words': words(people.length), 'people-words-lc': words(people.length).toLowerCase(),
      'two-plus': people.filter(p => p.months >= 24).length,
      'total-years': Math.floor(people.reduce((s, p) => s + p.months, 0) / 12),
      'joined-23-25': joinedIn(2023, 2025),
      longest: longest.name, 'longest-since': `${MONTHS[+longest.start.slice(5, 7) - 1]} ${longest.start.slice(0, 4)}`,
    };
    const asOf = `Team list as of ${MONTHS[+D.asOf.slice(5, 7) - 1]} ${D.asOf.slice(0, 4)}.`;

    /* halls: the story so far */
    const chapters = [
      { when: '2018', name: 'It started with a message.', line: 'In 2018 Hrishi sent Harry a message on Instagram. They had never met. They began working with businesses around Kannur, with no outside money, and called it Kreative Clan.',
        imgs: [['beginning', 'Harry and Hrishi taking a selfie beside their first desk'], ['founders', 'Harry Aloysius and Hrishikesh Vinod standing side by side']] },
      { when: '2021', name: 'One desk became a team.', line: `An office, one long desk, a foosball table and a beanbag for the days that needed it. ${longest.short} joined in ${counts['longest-since']} and is still here, longer than anyone but the founders.`,
        imgs: [['desk-2021', 'Two teammates working at a long office desk'], ['beanbag-2021', 'A teammate working on a laptop from a beanbag'], ['foosball-2021b', 'The team playing foosball in the office']] },
      { when: '2023 to 2025', name: 'Onto the show floor.', line: `A bigger office in Bengaluru, then exhibition halls: Lagos in 2023, Dubai in 2024, GITEX in 2025. ${counts['joined-23-25']} of today's team joined in these three years.`,
        imgs: [['big5-nigeria', 'Four teammates on site at Big 5 Construct Nigeria'], ['index-dubai', 'Harry and Hrishi at the INDEX exhibition entrance in Dubai'], ['gitex', 'The team taking a group selfie at GITEX']] },
      { when: '2026', name: `${counts['people-words']} people. One Clan.`, line: 'Work across 25 countries, a TEDx talk, Onam on the terrace and office nights that run late.',
        imgs: [['tedx', 'Hrishi speaking on the TEDx Sreyas Institute stage'], ['office-nights', 'A crowd of teammates at an evening gathering in the office'], ['onam', 'The team in traditional dress for Onam on the office terrace']] },
    ];
    const stands = chapters.map((s, i) => `
    <article class="stand">
      <div class="stand-no">Chapter ${String(i + 1).padStart(2, '0')} · ${esc(s.when)}</div>
      <h3>${esc(s.name)}</h3><p>${esc(s.line)}</p>
      <div class="fan${s.imgs.length === 2 ? ' two' : ''}">${s.imgs.map(([n, alt]) => `<img src="img/years/${n}.webp" alt="${esc(alt)}" loading="lazy" width="800" height="1000">`).join('')}</div>
    </article>`).join('');

    /* roster board */
    const fitName = (name, n) => { // long names keep first and last name, middle names become initials
      const w = name.split(' ');
      for (let i = w.length - 2; i > 0 && w.join(' ').length > n; i--) if (w[i].length > 2) w[i] = w[i][0] + '.';
      return w.join(' ');
    };
    const BOARD_ROLE = { 'Co-founder & CEO': 'Co-founder · CEO', 'Co-founder & COO': 'Co-founder · COO', 'Head of Operations & Content': 'Head Ops & Content', 'Social Media Manager': 'Social Media Mgr', 'Senior Visual Designer': 'Sr Visual Designer', 'Videography & Video Editing': 'Videography & Edit', 'Motion Graphics Designer': 'Motion Graphics', 'Creative Assistant to CEO': 'Creative Assistant', 'Performance Marketing': 'Performance Mktg' };
    const flap = (txt, n, cls = '') => `<span class="flap ${cls}" aria-hidden="true" data-text="${esc(txt.toUpperCase())}">${[...txt.toUpperCase().padEnd(n)].slice(0, n).map(ch => ch === ' ' ? '<b class="sp"> </b>' : `<b>${esc(ch)}</b>`).join('')}</span>`;
    const board = order.map((p, i) => `
      <div class="board-row" role="row" style="--r:${i + 1}"><span role="cell" aria-label="${i + 1}">${flap(String(i + 1).padStart(2, '0'), 2, 'amber')}</span> <span role="cell" aria-label="${esc(p.name)}">${flap(fitName(p.name, 18), 18)}</span> <span role="cell" aria-label="${esc(p.role)}">${flap(BOARD_ROLE[p.role] || p.role, 18)}</span> <span role="cell" aria-label="${esc(p.since)}">${flap(p.sinceShort, 8)}</span></div>`).join('');

    /* meet the Clan: founders, then cards */
    const pic = p => p.photo
      ? `<div class="pic${p.founder ? ' cut' : ''}"><img src="img/people/${p.photo}.webp" alt="${esc(p.name)}, ${esc(p.role)} at Kreative Clan" loading="lazy" width="420" height="560">${p.fun ? `<p class="fun"><span class="grad">${esc(p.fun)}</span></p>` : ''}</div>`
      : `<div class="pic none" role="img" aria-label="${esc(p.name)}"><span aria-hidden="true">${esc(p.initials)}</span></div>`;
    const founders = order.filter(p => p.founder).map(p => `
    <article class="founder" data-team="${esc(p.team)}">
      ${pic(p)}
      <div class="founder-body">
        <p class="stand-no">Founder</p>
        <h3>${esc(p.name)}</h3>
        <p class="role">${esc(p.role)}</p>
        ${p.line ? `<p class="line">${esc(p.line)}</p>` : ''}
        <p class="team">${esc(p.team)}</p>
        <p class="since"><b>${esc(p.since)}</b> <span>${esc(p.tenure)}</span></p>
      </div>
    </article>`).join('');
    const members = staff.map(p => `
    <article class="member" data-team="${esc(p.team)}">
      ${pic(p)}
      <div class="member-body">
        <h3>${esc(p.name)}</h3>
        <p class="role">${esc(p.role)}</p>
        <p class="team">${esc(p.team)}</p>
        <p class="since"><b>${esc(p.since)}</b> <span>${esc(p.tenure)}</span></p>
      </div>
    </article>`).join('');
    const chips = [['All', '']].concat(TEAMS.map(t => [t[0], t[0]])).map(([label, t]) => `<button class="chip" type="button" aria-pressed="${!t}" data-team="${esc(t)}">${esc(label)} <b>${t ? people.filter(p => p.team === t).length : people.length}</b></button>`).join('');

    const html = { stands, board, founders, members, chips };
    const sig = {}; // a short fingerprint of each block, so the browser can tell the HTML it was served is still right
    for (const k in html) { let h = 0; for (let i = 0; i < html[k].length; i++) h = (h * 31 + html[k].charCodeAt(i)) | 0; sig[k] = String(h >>> 0); }
    return { people, order, staff, longest, counts, TEAMS, asOf, chapters, html, sig };
  };
})(typeof window !== 'undefined' ? window : globalThis);
