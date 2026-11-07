// Чакроанализ бойынша үйлесімділік: екі серіктестің есебі, жұп диаграммасы және таратып жазу (қазақша)
(function () {
  const CHS = [
    { k: "adj", name: "Аджна", color: "#5b3fc4", glow: "#b9a6ff" },
    { k: "vis", name: "Вишудха", color: "#1e78d8", glow: "#8fd0ff" },
    { k: "ana", name: "Анахата", color: "#2e9e4a", glow: "#9cf0a8" },
    { k: "man", name: "Манипура", color: "#e0b100", glow: "#ffe98a" },
    { k: "sva", name: "Свадхистана", color: "#ef7d12", glow: "#ffc48a" },
    { k: "mul", name: "Муладхара", color: "#d8312f", glow: "#ff9b8f" },
  ];
  const D = () => window.CHAKRA_COMPAT_DATA;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const P = (t) => `<p>${esc(t)}</p>`;
  const H3 = (t) => `<h3 class="ch-h3">${esc(t)}</h3>`;
  const H4 = (t) => `<h4 class="ch-h4">${esc(t)}</h4>`;

  function calc(m, w) {
    const rm = window.ChakraEngine.calculate(m.date, m.hand || "правша", 1, new Date().getFullYear());
    const rw = window.ChakraEngine.calculate(w.date, w.hand || "правша", 1, new Date().getFullYear());
    return { m: Object.assign({}, m, { r: rm }), w: Object.assign({}, w, { r: rw }) };
  }

  // ---------- диаграмма пары ----------
  // Силуэт строится по левой половине и зеркально дополняется справа
  function sym(cx, start, segs) {
    const X = (dx) => (cx + dx).toFixed(1), MX = (dx) => (cx - dx).toFixed(1);
    let d = `M${MX(-start[0])} ${start[1]}`;
    d = `M${X(start[0])} ${start[1]}`;
    segs.forEach((q) => { d += ` C${X(q[0])} ${q[1]} ${X(q[2])} ${q[3]} ${X(q[4])} ${q[5]}`; });
    for (let i = segs.length - 1; i >= 0; i--) {
      const q = segs[i], prev = i === 0 ? start : [segs[i - 1][4], segs[i - 1][5]];
      d += ` C${MX(q[2])} ${q[3]} ${MX(q[0])} ${q[1]} ${MX(prev[0])} ${prev[1]}`;
    }
    return d + " Z";
  }
  const MAN = { start: [-10, 124], segs: [
    [-14, 134, -40, 140, -58, 147], [-72, 153, -78, 168, -78, 188], [-80, 230, -84, 270, -86, 302],
    [-87, 318, -84, 334, -76, 336], [-68, 338, -64, 326, -64, 312], [-62, 270, -60, 232, -56, 206],
    [-54, 250, -50, 290, -48, 326], [-46, 350, -44, 380, -42, 420], [-40, 470, -38, 510, -36, 536],
    [-36, 546, -16, 548, -14, 538], [-12, 500, -10, 440, -8, 392], [-6, 380, -3, 376, 0, 376]] };
  const WOMAN = { start: [-9, 126], segs: [
    [-12, 134, -34, 140, -48, 148], [-60, 154, -64, 168, -64, 184], [-66, 226, -70, 266, -72, 298],
    [-73, 314, -70, 328, -63, 330], [-56, 332, -53, 320, -53, 306], [-52, 270, -50, 236, -46, 208],
    [-44, 228, -32, 240, -30, 256], [-30, 272, -46, 292, -50, 316], [-58, 370, -72, 430, -80, 470],
    [-60, 477, -30, 478, 0, 478]] };
  function figure(cx, female) {
    if (!female) {
      const hair = `<path fill="url(#ccHair)" stroke="#e7c766" stroke-width="1.3" d="M${cx - 26} 84 C${cx - 30} 52 ${cx - 12} 50 ${cx} 52 C${cx + 14} 50 ${cx + 30} 54 ${cx + 26} 84 C${cx + 20} 70 ${cx + 6} 66 ${cx - 6} 68 C${cx - 16} 70 ${cx - 22} 74 ${cx - 26} 84 Z"/>`;
      return `<ellipse cx="${cx}" cy="88" rx="26" ry="32"/>` + hair + `<path d="${sym(cx, MAN.start, MAN.segs)}"/>`;
    }
    const hair = `<path fill="url(#ccHair)" stroke="#e7c766" stroke-width="1.3" d="M${cx - 25} 98 C${cx - 32} 64 ${cx - 18} 52 ${cx} 52 C${cx + 18} 52 ${cx + 32} 64 ${cx + 25} 98 C${cx + 22} 82 ${cx + 16} 72 ${cx + 4} 70 C${cx - 6} 76 ${cx - 16} 80 ${cx - 25} 98 Z"/>`;
    const legs = `<path d="M${cx - 26} 478 L${cx - 22} 534 C${cx - 22} 542 ${cx - 8} 542 ${cx - 9} 534 L${cx - 10} 478 Z"/><path d="M${cx + 26} 478 L${cx + 22} 534 C${cx + 22} 542 ${cx + 8} 542 ${cx + 9} 534 L${cx + 10} 478 Z"/>`;
    return `<ellipse cx="${cx}" cy="90" rx="23" ry="29"/>` + hair + `<path d="${sym(cx, WOMAN.start, WOMAN.segs)}"/>` + legs + `<path d="M${cx - 30} 256 C${cx - 10} 262 ${cx + 10} 262 ${cx + 30} 256" fill="none" stroke-width="2"/>`;
  }

  const GIVES = { adj: "түсіністік", vis: "келісе білу", ana: "махаббат пен қамқорлық", man: "ерік пен жетістік", sva: "қуаныш пен ләззат", mul: "өмірлік күш" };
  const EMO = { "Сверхэнергичный": "Аса энергиялы", "Эгоистический": "Өзіне бағытталған (эгоистический)", "Среднереактивный": "Орташа реактивті", "Энергичный": "Энергиялы", "Самоотверженный": "Өзін аямайтын (самоотверженный)", "Холодный": "Ұстамды-салқын (холодный)" };
  const emo = (n) => EMO[n] || n;

  function diagram(res) {
    const W = 820, H = 640, xw = 170, xm = 650;
    const ys = { adj: 86, vis: 142, ana: 198, man: 252, sva: 304, mul: 354 };
    let defs = "", glow = "", dots = "", mid = "";
    function chakra(cx, c, pct, id) {
      const R = 10 + pct / 14, op = (0.45 + pct / 180).toFixed(2), y = ys[c.k];
      defs += `<radialGradient id="cg${id}" cx="45%" cy="40%" r="60%"><stop offset="0%" stop-color="#fff"/><stop offset="30%" stop-color="${c.glow}"/><stop offset="100%" stop-color="${c.color}"/></radialGradient><radialGradient id="cr${id}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${c.glow}" stop-opacity="${op}"/><stop offset="45%" stop-color="${c.color}" stop-opacity="${(op * 0.5).toFixed(2)}"/><stop offset="100%" stop-color="${c.color}" stop-opacity="0"/></radialGradient>`;
      glow += `<circle cx="${cx}" cy="${y}" r="${(R * 2.4 + pct / 6).toFixed(1)}" fill="url(#cr${id})"/>`;
      let rays = "";
      for (let k = 0; k < 12; k++) { const an = k * Math.PI / 6, r1 = R + 2, r2 = R + 5 + pct / 16; rays += `<line x1="${(cx + r1 * Math.cos(an)).toFixed(1)}" y1="${(y + r1 * Math.sin(an)).toFixed(1)}" x2="${(cx + r2 * Math.cos(an)).toFixed(1)}" y2="${(y + r2 * Math.sin(an)).toFixed(1)}" stroke="${c.glow}" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>`; }
      dots += rays + `<circle cx="${cx}" cy="${y}" r="${R.toFixed(1)}" fill="url(#cg${id})" stroke="#fff6d8" stroke-width="1.2"/><text x="${cx}" y="${y + 4.5}" text-anchor="middle" font-size="13" font-weight="700" fill="#10302c" font-family="Arial, sans-serif">${pct}%</text>`;
    }
    CHS.forEach((c, i) => {
      const a = res.m.r.chakras[c.k], b = res.w.r.chakras[c.k], y = ys[c.k];
      chakra(xm, c, a, "m" + i); chakra(xw, c, b, "w" + i);
      const L = 270, Rr = 550;
      mid += `<text x="410" y="${y - 10}" text-anchor="middle" font-size="14" font-weight="700" fill="${c.glow}" font-family="Arial, sans-serif">${c.name}</text>`;
      if (a === b) {
        mid += `<line x1="${L}" y1="${y + 2}" x2="${Rr}" y2="${y + 2}" stroke="${c.glow}" stroke-width="2" stroke-dasharray="4 5" opacity=".85"/><text x="410" y="${y + 20}" text-anchor="middle" font-size="12" fill="#e6f5f1" font-family="Arial, sans-serif">тең: ${GIVES[c.k]}</text>`;
      } else {
        const toW = a > b, x1 = toW ? Rr : L, x2 = toW ? L : Rr, dir = toW ? -1 : 1;
        mid += `<line x1="${x1}" y1="${y + 2}" x2="${x2 - dir * 12}" y2="${y + 2}" stroke="${c.glow}" stroke-width="3" stroke-linecap="round"/><path d="M${x2} ${y + 2} L${x2 - dir * 15} ${y - 5} L${x2 - dir * 15} ${y + 9} Z" fill="${c.glow}"/><text x="410" y="${y + 20}" text-anchor="middle" font-size="12" fill="#e6f5f1" font-family="Arial, sans-serif">${toW ? "Ер адам" : "Әйел"} береді: ${GIVES[c.k]}</text>`;
      }
    });
    const lbl = (x, who, name, date) => `<text x="${x}" y="590" text-anchor="middle" font-size="19" font-weight="700" fill="#f6d66c" font-family="PT Serif, Georgia, serif">${esc(name || who)}</text><text x="${x}" y="612" text-anchor="middle" font-size="13" fill="#d8efe9" font-family="Arial, sans-serif">${esc(who)} · ${esc(date)}</text>`;
    return `<svg class="cc-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Жұптың чакра диаграммасы">
<defs><linearGradient id="ccBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1f4a46"/><stop offset="100%" stop-color="#0d211f"/></linearGradient>
<linearGradient id="ccBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c8efe9" stop-opacity=".32"/><stop offset="100%" stop-color="#3c8783" stop-opacity=".22"/></linearGradient>
<linearGradient id="ccHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9fe0d6" stop-opacity=".7"/><stop offset="100%" stop-color="#2f6d6a" stop-opacity=".55"/></linearGradient>
<radialGradient id="ccAura" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#f6d66c" stop-opacity=".16"/><stop offset="60%" stop-color="#4fb3a9" stop-opacity=".09"/><stop offset="100%" stop-color="#4fb3a9" stop-opacity="0"/></radialGradient>${defs}</defs>
<rect width="${W}" height="${H}" rx="22" fill="url(#ccBg)"/>
${Array.from({ length: 60 }, (_, k) => `<circle cx="${(k * 137) % W}" cy="${(k * 89) % H}" r="${k % 3 ? 0.8 : 1.4}" fill="#fff" opacity="${k % 2 ? .3 : .55}"/>`).join("")}
<ellipse cx="${xm}" cy="300" rx="180" ry="290" fill="url(#ccAura)"/><ellipse cx="${xw}" cy="300" rx="180" ry="290" fill="url(#ccAura)"/>
<g fill="url(#ccBody)" stroke="#e7c766" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">${figure(xw, true)}${figure(xm, false)}</g>
<line x1="${xm}" y1="60" x2="${xm}" y2="370" stroke="#f6d66c" stroke-width="2" opacity=".28"/><line x1="${xw}" y1="62" x2="${xw}" y2="370" stroke="#f6d66c" stroke-width="2" opacity=".28"/>
${glow}${dots}${mid}
<text x="410" y="36" text-anchor="middle" font-size="15" fill="#f6d66c" font-family="Arial, sans-serif">Нұсқар — күштірек чакрадан әлсізіне қарай</text>
${lbl(xw, "Әйел", res.w.name, res.w.date)}${lbl(xm, "Ер адам", res.m.name, res.m.date)}
</svg>`;
  }

  // ---------- расшифровка ----------
  function sections(res) {
    const d = D(), M = res.m.name || "Ер адам", Wn = res.w.name || "Әйел";
    const rm = res.m.r, rw = res.w.r;
    const out = [];

    // типологии
    const tm = rm.typ, tw = rw.typ, key = Math.min(tm, tw) + "+" + Math.max(tm, tw);
    let pairTxt = d.pair[key] || "";
    if (key === "3+4") pairTxt = tm === 3 ? d.pair34.m : d.pair34.w;
    out.push(["Типологиялар үйлесімділігі: " + tw + " және " + tm,
      P("Типология адамның негізгі мінезін және қарым-қатынасты қалай құратынын көрсетеді.") +
      H4(Wn + " — " + tw + "-типология") + P(d.typ[tw] || "") + H4(M + " — " + tm + "-типология") + P(d.typ[tm] || "") + H4("Сіздердің одағыңыз: " + tw + " және " + tm) + P(pairTxt)]);

    // чакры
    let ch = P("Чакралардың сыйымдылығын (ёмкость) салыстыру энергиямен қалай алмасатыныңызды көрсетеді: чакрасы күштірек адам сол чакраның энергиясымен серіктесімен бөліседі."), mDon = 0, wDon = 0;
    CHS.slice().reverse().forEach((c) => {
      const a = rm.chakras[c.k], b = rw.chakras[c.k], t = d.chakra[c.k];
      const cat = (d.lookup[c.k] || {})[a + "-" + b] || (a === b ? "eq" : a > b ? "m" : "w");
      const hi = cat.indexOf("m") === 0 ? M : Wn, lo = cat.indexOf("m") === 0 ? Wn : M;
      if (cat.indexOf("m") === 0) mDon++; if (cat.indexOf("w") === 0) wDon++;
      let txt;
      if (cat.indexOf("eq") === 0) txt = t.eq;
      else if (cat === "sim") txt = t.similar;
      else if (cat === "bw") txt = t.bothWeak;
      else txt = t.hi.replace(/\{HI\}/g, hi).replace(/\{LO\}/g, lo);
      if (cat.indexOf("+bw") > 0 && t.bothWeak) txt += " " + t.bothWeak;
      const lowA = a < 45, lowB = b < 45;
      let lv = "";
      if (lowA && lowB) {
        lv = a === b ? `${c.name} екеуіңізде де қалыптан төмен (екеуіңізде де ${a}%).` : `${c.name} екеуіңізде де қалыптан төмен: ${a < b ? M : Wn} — ${Math.min(a, b)}% (одан да төмен), ${a < b ? Wn : M} — ${Math.max(a, b)}%.`;
        if (t.bothWeak && txt.indexOf(t.bothWeak) < 0) txt += " " + t.bothWeak;
      } else if (lowA || lowB) {
        lv = `${c.name}: ${lowA ? M : Wn} — ${lowA ? a : b}%, қалыптан төмен; ${lowA ? Wn : M} — ${lowA ? b : a}%, қалыпты немесе одан жоғары.`;
      }
      if (lv) txt = lv + " " + txt;
      ch += H4(c.name + ": " + Wn + " — " + b + "%, " + M + " — " + a + "%") + `<p class="ch-intro">${esc(t.about)}</p>` + P(txt);
    });
    out.push(["Чакралар бойынша үйлесімділік", ch]);

    let sum;
    if (wDon > mDon) sum = `Әйелде күштірек чакралар көбірек (6-дан ${wDon}, ер адамда — ${mDon}): сіздердің жұпта энергиямен көбіне әйел бөліседі, ал ер адам оны алып, оның қасында өседі. ${Wn}: берген энергия өзін шаршатпағанын қадағалау маңызды. ${M}: өзі күштірек тұстарда серіктесін толтырып отырған маңызды.`;
    else if (mDon > wDon) sum = `Ер адамда күштірек чакралар көбірек (6-дан ${mDon}, әйелде — ${wDon}): сіздердің жұпта энергиямен көбіне ер адам бөліседі, ал әйел оны алып, оның қасында өседі. ${M}: берген энергия өзін шаршатпағанын қадағалау маңызды. ${Wn}: өзі күштірек тұстарда серіктесін толтырып отырған маңызды.`;
    else sum = `Күшті чакралар саны бойынша сіздер теңсіздер (әрқайсыңызда ${mDon}, қалғандары бірдей): әрқайсыңыз екіншіңізге бірдеңе беріп, бірдеңе аласыздар — бұл бірге дамуға ең жақсы нұсқа.`;
    out.push(["Жұптағы энергия тепе-теңдігі", P(sum)]);

    out.push(["Ру бойынша тағдырлы жар", P("Ру жұмысы (родовая отработка) адамға ру бойынша қандай жар кездесетінін көрсетеді.") +
      H4(Wn + " — ру (род) " + rw.rod.up) + P(d.spouse[rw.rod.up] || "") + H4(M + " — ру (род) " + rm.rod.up) + P(d.spouse[rm.rod.up] || "")]);

    const row = (l, x, y) => `<tr><td>${esc(l)}</td><td>${esc(x)}</td><td>${esc(y)}</td></tr>`;
    const tbl = `<table class="ch-t"><tr><th>Көрсеткіш</th><th>${esc(Wn)}</th><th>${esc(M)}</th></tr>` +
      row("Инь (әйелдік энергия)", rw.yin, rm.yin) + row("Ян (ерлік энергия)", rw.yang, rm.yang) +
      row("Қалаймын (хочу)", rw.want, rm.want) + row("Істей аламын (могу)", rw.can, rm.can) + row("Тартымдылық әлеуеті (магнетизм)", rw.sex, rm.sex) +
      row("Эмоциялық тип", emo(rw.emoType.name), emo(rm.emoType.name)) + row("«Мен» / «Біз»", rw.emoType.ya + " / " + rw.emoType.my, rm.emoType.ya + " / " + rm.emoType.my) + `</table>`;
    const yinT = (r, n) => n + ": " + (Math.abs(r.yin - r.yang) <= 10 ? "әйелдік және ерлік энергиялар тепе-теңдікте." : r.yin > r.yang ? "Инь басым — жұмсақтық, нәзіктік, сезімталдық көбірек." : "Ян басым — қаттылық, батылдық, бастауға ұмтылыс көбірек.");
    const wcT = (r, n) => n + ": " + (r.want > r.can ? "тілек күштен көп — идея мен уәде көп, бірақ ынта тез сөнуі мүмкін; біртіндеп қадам жасау мен демалыс маңызды." : r.can > r.want ? "күш ынтадан көп — ішкі кедергілерді алып тастаса, көп ресурс ашуға болады." : "тілек пен күш тепе-теңдікте.");
    const sxT = (r, n) => n + ": " + r.sex + (r.sex >= 1000 ? " — тартымдылығы жоғары, назарды оңай аударады." : " — харизманы саналы түрде дамытқан жөн.");
    const yaT = (r, n) => n + ": " + (Math.abs(r.emoType.ya - r.emoType.my) <= 5 ? "көшбасшы да, командада жұмыс істейтін адам да бола алады." : r.emoType.ya > r.emoType.my ? "көшбасшылыққа бейім." : "көшбасшы рөлінен гөрі командада күштірек.");
    out.push(["Инь — Ян, қалаймын — істей аламын, «Мен» — «Біз»", tbl +
      P("Инь мен Ян тепе-теңдігі. " + yinT(rw, Wn) + " " + yinT(rm, M)) +
      P("Қалаймын — істей аламын. " + wcT(rw, Wn) + " " + wcT(rm, M)) +
      P("Тартымдылық (магнетизм). " + sxT(rw, Wn) + " " + sxT(rm, M)) +
      P("«Мен — Біз». " + yaT(rw, Wn) + " " + yaT(rm, M) + (rm.emoType.ya > rm.emoType.my && rw.emoType.ya > rw.emoType.my ? " Екеуіңіз де көшбасшылыққа бейімсіздер — ықпал ету аясын (сфера) алдын ала бөліп алыңыздар." : ""))]);
    return out;
  }

  function summaryHtml(res) {
    const M = res.m.name || "Ер адам", Wn = res.w.name || "Әйел";
    const items = CHS.map((c) => {
      const a = res.m.r.chakras[c.k], b = res.w.r.chakras[c.k];
      const head = a === b ? "Тең: " + GIVES[c.k] : (b > a ? Wn : M) + " береді: " + GIVES[c.k];
      return `<div class="cc-row"><span class="cc-dot" style="background:${c.color};box-shadow:0 0 8px ${c.glow};"></span><div><div class="cc-head" style="color:${c.color};">${esc(head)}</div><div class="cc-sub">${c.name}: ${esc(Wn)} — ${b}%${b < 45 ? " (қалыптан төмен)" : ""}, ${esc(M)} — ${a}%${a < 45 ? " (қалыптан төмен)" : ""}</div></div></div>`;
    }).join("");
    return `<div class="cc-sum"><div class="cc-sum-title">Жұпта әрқайсыңыз не бересіз</div>${items}</div>`;
  }

  const CSS = `<style>.cc-svg{width:100%;max-width:820px;height:auto;display:block;margin:0 auto 16px;}.cc-sum{max-width:820px;margin:0 auto 18px;padding:16px 20px;border:1px solid rgba(225,180,52,.55);border-radius:16px;background:rgba(0,0,0,.2);}.cc-sum-title{font-family:PT Serif,Georgia,serif;font-size:20px;color:#f6d66c;text-align:center;margin-bottom:10px;}.cc-row{display:flex;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid rgba(225,180,52,.18);}.cc-row:last-child{border-bottom:none;}.cc-dot{flex:0 0 16px;height:16px;border-radius:50%;}.cc-head{font-size:16px;font-weight:700;filter:brightness(1.5);}.cc-sub{font-size:13px;color:#d8efe9;margin-top:2px;}</style>`;

  function render(m, w, container) {
    const res = calc(m, w);
    window._lastChakraCompat = res;
    const secs = sections(res);
    const acc = secs.map((s, i) => `<div class="accordion-item"><button type="button" class="accordion-header" onclick="toggleAccordionBody('cc-acc-${i}')"><span>${esc(s[0])}</span><span>▾</span></button><div class="accordion-body hidden" id="cc-acc-${i}" style="white-space:normal;">${s[1]}</div></div>`).join("");
    const title = "Чакралар бойынша үйлесімділік — " + (w.name || "Әйел") + " және " + (m.name || "Ер адам");
    container.innerHTML = CSS + `<div class="ch-wrap" style="max-width:820px;margin:0 auto;">
      <h2 style="font-family:PT Serif,Georgia,serif;color:#f6d66c;text-align:center;margin:0 0 12px;">${esc(title)}</h2>
      ${diagram(res)}
      ${summaryHtml(res)}
      <div style="margin-top:10px;">${acc}</div>
      <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap;">
        <button type="button" id="calcDownloadBtn" class="material-manager-button" style="width:auto;" onclick="ChakraCompat.download()">Жүктеп алу (диаграмма + мәтін)</button>
        <button type="button" class="material-manager-button" style="width:auto;background:rgba(0,0,0,.15);" onclick="openCalculator('chakra_compat')">Жаңа есептеу</button>
      </div></div>`;
    return res;
  }

  function download() {
    const res = window._lastChakraCompat; if (!res) return;
    const M = res.m.name || "Ер адам", Wn = res.w.name || "Әйел";
    let body = `<style>.ch-pdf p,.ch-pdf li,.ch-pdf td,.ch-pdf th{font-size:17px !important;line-height:1.55 !important;}
.ch-pdf h1{font-size:24px !important;} .ch-pdf h2{font-size:21px !important;color:#2f6d6a;font-family:PT Serif,Georgia,serif;border-bottom:1px solid #d7aa31;padding-bottom:4px;}
.ch-h4{color:#2f6d6a;font-size:18px;margin:14px 0 6px;} .ch-intro{font-style:italic;color:#3d5754;}
.ch-t{width:100%;border-collapse:collapse;margin:8px 0;} .ch-t td,.ch-t th{border:1px solid #d9c38a;padding:5px 7px;text-align:left;color:#221733;} .ch-t th{background:#f5eee0;color:#2f6d6a;}
.cc-svg{width:640px;max-width:100%;height:auto;} .cc-sum{margin:10px 0;padding:10px 16px;border:1px solid #d7aa31;border-radius:14px;} .cc-sum-title{font-size:20px;color:#2f6d6a;text-align:center;font-weight:700;margin-bottom:6px;} .cc-row{display:flex;gap:12px;align-items:center;padding:5px 0;border-bottom:1px solid #eadcb4;} .cc-dot{flex:0 0 14px;height:14px;border-radius:50%;} .cc-head{font-size:16px;font-weight:700;} .cc-sub{font-size:14px;color:#3d5754;}</style><div class="ch-pdf">`;
    body += `<h1 style="text-align:center;">Чакралар бойынша үйлесімділік — ${esc(Wn)} (${esc(res.w.date)}) және ${esc(M)} (${esc(res.m.date)})</h1>`;
    body += `<div style="text-align:center;">${diagram(res)}</div>` + summaryHtml(res) + `<div style="break-after:page;page-break-after:always;"></div>`;
    sections(res).forEach((s) => { body += `<h2>${esc(s[0])}</h2>` + s[1]; });
    body += `</div>`;
    downloadHtmlFile("Чакралар бойынша үйлесімділік - " + Wn + " " + res.w.date + " және " + M + " " + res.m.date + ".html", body);
  }

  window.ChakraCompat = { render, download, calc, sections };
})();
