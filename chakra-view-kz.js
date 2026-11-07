/* ============ ЧАКРОАНАЛИЗ (KZ): нәтижені шығару ============ */
(function (window) {
const MONTHS = ["Қаңтар", "Ақпан", "Наурыз", "Сәуір", "Мамыр", "Маусым", "Шілде", "Тамыз", "Қыркүйек", "Қазан", "Қараша", "Желтоқсан"];
const MONTHS_GEN = ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"];
const CH = [
  { k: "adj", name: "Аджна", color: "#5b6cff", glow: "#8f9bff", y: 118 },
  { k: "vis", name: "Вишудха", color: "#1fb4e6", glow: "#7fdcff", y: 176 },
  { k: "ana", name: "Анахата", color: "#2fbf5a", glow: "#86f0a0", y: 236 },
  { k: "man", name: "Манипура", color: "#f2c416", glow: "#ffe77a", y: 292 },
  { k: "sva", name: "Свадхистана", color: "#ff8a1e", glow: "#ffc07a", y: 342 },
  { k: "mul", name: "Муладхара", color: "#e8343a", glow: "#ff8a8e", y: 392 },
];
const LEVEL_LABEL = { low: "қалыптан төмен", norm: "қалыпты", high: "қалыптан жоғары", max: "өте жоғары" };

const CNAME = {"Сангвиник-Флегматик":"Сангвиник-флегматик","Сангвиник":"Сангвиник","Сангвиник-Холерик":"Сангвиник-холерик","Чувствительный Холерик":"Сезімтал холерик","Меланхолик":"Меланхолик","Флегматик":"Флегматик","Холодный":"Салқын (холодный)","Самоотверженный интегративный":"Өзін аямайтын интегративті","Страстный":"Құштар","Эгоистичный (лидерский)":"Өзіне бағытталған (көшбасшылық)","Сентиментальный":"Сентименталды","Эмпатический":"Эмпатиялық","Гармоничный художественный":"Үйлесімді көркем","Сверхпродуктивный":"Аса өнімді","Гармоничный мыслительный":"Үйлесімді ойшыл","Дискретный":"Дискретті","Продуктивный смешанный":"Өнімді аралас","Продуктивный мыслительный":"Өнімді ойшыл","Продуктивный художественный":"Өнімді көркем","Прикладной мыслительный":"Қолданбалы ойшыл","Прикладной смешанный":"Қолданбалы аралас","Аналоговый":"Аналогтық","Аналаговый":"Аналогтық"};
function CN(n) { return CNAME[n] || n; }
const EMO = { "Сверхэнергичный": "Аса энергиялы", "Эгоистический": "Өзіне бағытталған (эгоистический)", "Среднереактивный": "Орташа реактивті", "Энергичный": "Энергиялы", "Самоотверженный": "Өзін аямайтын (самоотверженный)", "Холодный": "Ұстамды-салқын (холодный)" };
function EN(n) { n = String(n || ""); const k = Object.keys(EMO).sort((a, b) => b.length - a.length).find(x => n.indexOf(x) === 0); return k ? EMO[k] + n.slice(k.length) : n; }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function D() { return window.CHAKRA_DATA; }
function levelOf(k, pct) {
  const L = D()[k + "_levels"]; const s = String(pct);
  for (const lv in L) if (L[lv].indexOf(s) >= 0) return lv;
  return "norm";
}
function harmLevelOf(k, pct) {
  const L = D().harm_levels[k]; const s = String(pct);
  for (const lv in L) if (L[lv].indexOf(s) >= 0) return lv;
  return Object.keys(L)[0];
}
// текст: строки «### заголовок» → подзаголовок, остальные — абзацы
function txt(t) {
  return String(t || "").split("\n").map(function (line) {
    line = line.trim(); if (!line) return "";
    if (line.indexOf("### ") === 0) return `<h4 class="ch-h4">${esc(line.slice(4))}</h4>`;
    return `<p>${esc(line)}</p>`;
  }).join("");
}
function lines(t) { return `<ul class="ch-ul">${String(t).split("\n").filter(Boolean).map(l => `<li>${esc(l)}</li>`).join("")}</ul>`; }
function arr(a) { return `<ul class="ch-ul">${a.map(l => `<li>${esc(l)}</li>`).join("")}</ul>`; }
function lab(label, value) { return `<p><b class="ch-lab">${esc(label)}:</b> ${esc(value)}</p>`; }
function sub(title) { return `<h4 class="ch-h4">${esc(title)}</h4>`; }
function chName(n) { return D().chakra_name[String(n)] || ""; }
function fill(s, kind) {
  const W = kind === "rod" ? { W: "рулық", Wg: "рулық", Wa: "рулық", R: "рудың" } : { W: "кармалық", Wg: "кармалық", Wa: "кармалық", R: "карманың" };
  const out = String(s).replace(/\{W\}/g, W.W).replace(/\{Wg\}/g, W.Wg).replace(/\{Wa\}/g, W.Wa).replace(/\{R\}/g, W.R);
  return out.replace(/(^|[.!?]\s+|\n)([а-яәғқңөұүһі])/g, (m, a, b) => a + b.toUpperCase());
}
function code(o) { return o ? o.up + "/" + o.low : "—"; }

/* ---------- диаграмма человека ---------- */
function diagramSvg(r) {
  const cx = 320, W = 640, H = 540;
  let defs = "", glows = "", dots = "", labels = "";
  const ys = { adj: 112, vis: 172, ana: 230, man: 286, sva: 336, mul: 384 };
  CH.forEach(function (c, i) {
    const pct = r.chakras[c.k], y = ys[c.k];
    const lv = levelOf(c.k, pct);
    const R = 12 + pct / 12;
    const op = (0.45 + pct / 180).toFixed(2);
    defs += `<radialGradient id="chg${i}" cx="45%" cy="40%" r="60%"><stop offset="0%" stop-color="#ffffff"/><stop offset="30%" stop-color="${c.glow}"/><stop offset="100%" stop-color="${c.color}"/></radialGradient>
      <radialGradient id="chr${i}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${c.glow}" stop-opacity="${op}"/><stop offset="45%" stop-color="${c.color}" stop-opacity="${(op * 0.55).toFixed(2)}"/><stop offset="100%" stop-color="${c.color}" stop-opacity="0"/></radialGradient>`;
    glows += `<circle cx="${cx}" cy="${y}" r="${(R * 2.6 + pct / 5).toFixed(1)}" fill="url(#chr${i})"/>`;
    // лепестки-лучи
    let rays = "";
    for (let a = 0; a < 12; a++) {
      const ang = a * Math.PI / 6, r1 = R + 3, r2 = R + 6 + pct / 14;
      rays += `<line x1="${(cx + r1 * Math.cos(ang)).toFixed(1)}" y1="${(y + r1 * Math.sin(ang)).toFixed(1)}" x2="${(cx + r2 * Math.cos(ang)).toFixed(1)}" y2="${(y + r2 * Math.sin(ang)).toFixed(1)}" stroke="${c.glow}" stroke-width="2" stroke-linecap="round" opacity=".85"/>`;
    }
    dots += rays + `<circle cx="${cx}" cy="${y}" r="${R.toFixed(1)}" fill="url(#chg${i})" stroke="#fff6d8" stroke-width="1.4"/>
      <text x="${cx}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#0d211f" font-family="Arial, sans-serif">${pct}%</text>`;
    const right = i % 2 === 0;
    const lx = right ? 462 : 178, tx = right ? 470 : 170, anchor = right ? "start" : "end";
    labels += `<line x1="${cx + (right ? R + 10 : -R - 10)}" y1="${y}" x2="${lx}" y2="${y}" stroke="${c.glow}" stroke-width="1.3" stroke-dasharray="2 3" opacity=".9"/>
      <circle cx="${lx}" cy="${y}" r="3" fill="${c.glow}"/>
      <text x="${tx}" y="${y - 2}" text-anchor="${anchor}" font-size="17" font-weight="700" fill="${c.glow}" font-family="Arial, sans-serif">${c.name}</text>
      <text x="${tx}" y="${y + 16}" text-anchor="${anchor}" font-size="13" fill="#d8efe9" font-family="Arial, sans-serif">${pct} % · ${LEVEL_LABEL[lv]}</text>`;
  });
  return `<svg class="ch-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Чакра диаграммасы">
  <defs>
    <linearGradient id="chBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1f4a46"/><stop offset="100%" stop-color="#0d211f"/></linearGradient>
    <linearGradient id="chBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c8efe9" stop-opacity=".30"/><stop offset="100%" stop-color="#3c8783" stop-opacity=".26"/></linearGradient>
    <radialGradient id="chAura" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#f6d66c" stop-opacity=".18"/><stop offset="60%" stop-color="#4fb3a9" stop-opacity=".10"/><stop offset="100%" stop-color="#4fb3a9" stop-opacity="0"/></radialGradient>
    <radialGradient id="chCrownG" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#e6f5f1" stop-opacity=".95"/><stop offset="50%" stop-color="#7fd6c9" stop-opacity=".45"/><stop offset="100%" stop-color="#7fd6c9" stop-opacity="0"/></radialGradient>
    ${defs}
  </defs>
  <rect x="0" y="0" width="${W}" height="${H}" rx="22" fill="url(#chBg)"/>
  ${Array.from({length: 40}, (_, k) => `<circle cx="${(k * 137) % W}" cy="${(k * 89) % H}" r="${k % 3 ? 0.8 : 1.4}" fill="#fff" opacity="${k % 2 ? .35 : .6}"/>`).join("")}
  <ellipse cx="${cx}" cy="260" rx="290" ry="250" fill="url(#chAura)"/>
  <g fill="url(#chBody)" stroke="#e7c766" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
    
    <ellipse cx="${cx}" cy="104" rx="33" ry="38"/>
    <path d="M${cx - 13} 138 C${cx - 12} 148 ${cx - 14} 154 ${cx - 18} 158 L${cx + 18} 158 C${cx + 14} 154 ${cx + 12} 148 ${cx + 13} 138"/>
    
    <path d="M${cx - 18} 158 C${cx - 50} 160 ${cx - 72} 168 ${cx - 78} 190 C${cx - 82} 220 ${cx - 70} 262 ${cx - 60} 300 C${cx - 56} 322 ${cx - 58} 340 ${cx - 62} 356 L${cx + 62} 356 C${cx + 58} 340 ${cx + 56} 322 ${cx + 60} 300 C${cx + 70} 262 ${cx + 82} 220 ${cx + 78} 190 C${cx + 72} 168 ${cx + 50} 160 ${cx + 18} 158 Z"/>
    
    <path d="M${cx - 76} 184 C${cx - 104} 210 ${cx - 112} 262 ${cx - 112} 300 C${cx - 112} 330 ${cx - 120} 360 ${cx - 140} 384 C${cx - 146} 392 ${cx - 138} 402 ${cx - 128} 398 C${cx - 108} 380 ${cx - 92} 350 ${cx - 88} 318 C${cx - 84} 280 ${cx - 82} 246 ${cx - 74} 222"/>
    <path d="M${cx + 76} 184 C${cx + 104} 210 ${cx + 112} 262 ${cx + 112} 300 C${cx + 112} 330 ${cx + 120} 360 ${cx + 140} 384 C${cx + 146} 392 ${cx + 138} 402 ${cx + 128} 398 C${cx + 108} 380 ${cx + 92} 350 ${cx + 88} 318 C${cx + 84} 280 ${cx + 82} 246 ${cx + 74} 222"/>
    
    <path d="M${cx - 64} 352 C${cx - 120} 358 ${cx - 168} 378 ${cx - 168} 406 C${cx - 168} 430 ${cx - 120} 440 ${cx - 40} 436 C${cx - 10} 434 ${cx + 10} 434 ${cx + 40} 436 C${cx + 120} 440 ${cx + 168} 430 ${cx + 168} 406 C${cx + 168} 378 ${cx + 120} 358 ${cx + 64} 352 Z"/>
    <path d="M${cx - 150} 412 C${cx - 90} 396 ${cx - 30} 400 ${cx + 20} 420" fill="none"/>
    <path d="M${cx + 150} 412 C${cx + 90} 396 ${cx + 30} 400 ${cx - 20} 420" fill="none"/>
  </g>
  
  <line x1="${cx}" y1="62" x2="${cx}" y2="404" stroke="#f6d66c" stroke-width="2" opacity=".35"/>
  ${glows}
  <circle cx="${cx}" cy="50" r="30" fill="url(#chCrownG)"/>
  <circle cx="${cx}" cy="50" r="9" fill="#e6f5f1" stroke="#fff6d8" stroke-width="1"/>
  <text x="${cx + 36}" y="46" font-size="13" fill="#c8efe9" font-family="Arial, sans-serif">Сахасрара</text>
  ${dots}${labels}
  <text x="${cx}" y="${H - 22}" text-anchor="middle" font-size="14" fill="#f6d66c" font-family="Arial, sans-serif">Чакралардың базалық сыйымдылығы, %</text>
</svg>`;
}

function forecastCard(r) {
  const yr = r.yearRow, mo = r.months[r.fMonth - 1];
  return `<div class="ch-fc">
    <div class="ch-fc-title">Болжам</div>
    <table class="ch-t">
      <tr><th>Кезең</th><th>Код</th></tr>
      <tr class="ch-hl"><td>${r.fYear} жыл</td><td>${code(yr)}</td></tr>
      <tr class="ch-hl"><td>${MONTHS[r.fMonth - 1]} ${r.fYear}</td><td>${code(mo)}</td></tr>
    </table>
    <div class="ch-fc-sub">${r.fYear} жылдың айлары</div>
    <table class="ch-t ch-t-sm">
      ${[0, 1, 2, 3, 4, 5].map(i => `<tr${i === r.fMonth - 1 ? ' class="ch-hl"' : ""}><td>${MONTHS[i]}</td><td>${code(r.months[i])}</td></tr>`).join("")}
      ${[6, 7, 8, 9, 10, 11].map(i => `<tr${i === r.fMonth - 1 ? ' class="ch-hl"' : ""}><td>${MONTHS[i]}</td><td>${code(r.months[i])}</td></tr>`).join("")}
    </table>
  </div>`;
}

function mainTable(r) {
  const pct = v => Math.round(v * 100) + " %";
  const rows = [
    ["Типология", r.typ + " — " + (D().typ[String(r.typ)] || "").split(".")[0]],
    ["Жасы", r.age],
    ["Ру", code(r.rod)], ["Өткен (карма)", code(r.past)],
    ["Өмір кезеңдері", r.periods.map(p => p ? p.up + "/" + p.low : "").filter(Boolean).join("  ·  ")],
    ["Қазіргі", code(r.now)], ["Ата-ана", code(r.parents)],
    ["Физикалық контур", r.contours.phys.val + " — " + CN(r.contours.phys.name)],
    ["Эмоциялық контур", r.contours.emo.val + " — " + CN(r.contours.emo.name)],
    ["Зияткерлік контур", r.contours.intl.val + " — " + CN(r.contours.intl.name)],
    ["Нәзік денелер (тонкие тела): эфирлік / астралдық / ментальдық", r.subtle.eth + " / " + r.subtle.ast + " / " + r.subtle.men],
    ["Реакция түрі", EN(r.emoType.name) + " (Мен — " + r.emoType.ya + ", Біз — " + r.emoType.my + ")"],
    ["Түйсік (интуиция): вербалды / вербалды емес", pct(r.intuition.verb) + " / " + pct(r.intuition.nonverb)],
    ["Қалаймын / Істей аламын", r.want + " / " + r.can],
    ["Тартымдылық әлеуеті (магнетизм)", r.sex],
    ["Инь / Ян", r.yin + " / " + r.yang],
  ];
  return `<table class="ch-t ch-main">${rows.map(x => `<tr><td>${esc(x[0])}</td><td>${esc(x[1])}</td></tr>`).join("")}</table>`;
}

/* ---------- разделы ---------- */
function secType(r) {
  const k = String(r.typ), d = D();
  let h = `<p class="ch-intro">${esc(d.intro.typ)}</p>` + txt(d.typ[k]);
  h += sub("Әлсіз жағы") + txt(d.neg[k]);
  h += sub("Қарым-қатынас") + txt(d.rel[k]);
  h += sub("Мамандық және дағдылар") + txt(d.skills[k]);
  h += sub("Қызмет салалары") + `<p>${esc(d.spheres[k])}</p>`;
  h += sub("Мамандықтар") + `<p>${esc(d.profs[k])}</p>`;
  h += sub("Тағдыр мақсаты (предназначение)") + d.dest[k].map(x => `<p><b class="ch-lab">${esc(x[0])}.</b> ${esc(x[1])}</p>`).join("");
  return h;
}
function secChakras(r) {
  const d = D();
  let h = `<p class="ch-intro">${esc(d.intro.chakras)}</p>`;
  CH.slice().reverse().forEach(function (c) {
    const pct = r.chakras[c.k], lv = levelOf(c.k, pct);
    h += `<h3 class="ch-h3" style="border-color:${c.color}"><span class="ch-dot" style="background:${c.color}"></span>${c.name} — ${pct} %</h3>`;
    h += txt(d[c.k][lv]);
    if ((d[c.k + "_risk_in"] || []).indexOf(lv) >= 0) h += lab("Денсаулыққа қатысты тәуекелдер", d["risk_" + c.k]);
    h += sub("Чакраны үйлестіру") + lines(d.harm[c.k][harmLevelOf(c.k, pct)]);
  });
  return h;
}
function secContours(r) {
  const d = D();
  const one = (title, c) => `<h3 class="ch-h3">${esc(title)}: ${esc(CN(c.name))} (${esc(c.val)})</h3>` + txt(d.contours[c.name] || d.contours[c.name.replace("Аналоговый", "Аналаговый")] || "");
  return `<p class="ch-intro">${esc(d.intro.contours)}</p>` + one("Темперамент — физикалық контур", r.contours.phys) + one("Мінез — эмоциялық контур", r.contours.emo) + one("Зияткерлік — зияткерлік контур", r.contours.intl);
}
function secTask(r, kind) {
  const d = D();
  const up = String(kind === "rod" ? r.rod.up : r.past.up), low = String(kind === "rod" ? r.rod.low : r.past.low);
  const scen = kind === "rod" ? d.rod_scen[up] : d.kar_scen[up];
  let h = `<p class="ch-intro">${esc(d.intro[kind])}</p>`;
  h += `<p class="ch-code">Міндеттің коды: <b>${up}/${low}</b></p>`;
  h += sub(kind === "rod" ? "Рулық сценарий" : "Кармалық сценарий") + txt(scen);
  h += sub("Тәуекелдер") + `<p>${esc(kind === "rod" ? d.rod_risk_hdr : d.kar_risk_hdr)}</p>` + lab("Ментальдық тәуекелдер", d.risk[up][0]) + lab("Физикалық тәуекелдер", d.risk[up][1]);
  h += sub(kind === "rod" ? "Рулық міндет" : "Кармалық міндет") + `<p>${esc(d.task[up])}</p>`;
  const key = d.key[up];
  h += sub("Міндеттің кілті") + txt(fill(key[0], kind)) + lab("Не көмектеседі", key[1]) + lab("Қызмет, хобби, әуестіктер", key[2]);
  // реализация по нижнему числу
  const rl = d.real[low];
  h += sub("Міндетті жүзеге асыру") + `<p>${esc(fill(d.real_hdr, kind))}</p>`;
  h += `<p>${esc(fill(low === "9" ? d.real_intro9 : d.real_intro.replace("{CH}", chName(low)), kind))}</p>`;
  h += lab("Ментальдық тәуекелдер", d.risk[low][0]) + lab("Физикалық тәуекелдер", d.risk[low][1].replace(/\.$/, "") + (low === "9" ? d.real_risk9_extra : "."));
  h += `<p><b class="ch-lab">Міндетті орындау қадамдары:</b></p>` + rl[0].map(x => `<p><b class="ch-lab">${esc(x[0])}.</b> ${esc(x[1])}</p>`).join("");
  h += lab("Міндетті орындауға қандай істер мен салалар көмектеседі", rl[1]);
  return h;
}
const AGES = ["1–12 жас", "12–24 жас", "24–36 жас", "36–48 жас", "48–60 жас", "60 жастан бастап"];
function secPeriods(r) {
  const d = D();
  let h = `<p class="ch-intro">${esc(d.intro.periods)}</p>`;
  r.periods.forEach(function (p, i) {
    if (!p) return;
    const up = String(p.up), low = String(p.low);
    h += `<h3 class="ch-h3">${i + 1}-кезең — ${AGES[i]} · код ${up}/${low}</h3>`;
    h += txt(d.life_scen[up]);
    const lr = d.life_risk[up];
    h += sub("Кезеңнің сабақтары мен тәуекелдері") + (up === "0" ? `<p>${esc(lr[0])}</p>` : `<p>${esc(lr[0])}</p>` + lab("Ментальдық тәуекелдер", lr[1]) + lab("Физикалық тәуекелдер", lr[2]));
    h += lab("Кезеңнің мүмкіндіктері", d.life_opp[up]);
    h += sub("Кезеңнің міндеттері") + d.life_task[up].map(x => x[0] ? `<p><b class="ch-lab">${esc(x[0])}.</b> ${esc(x[1])}</p>` : `<p>${esc(x[1])}</p>`).join("");
    h += lab("Кезеңнің қызметі (жұмыс, хобби, әуестіктер, қызығушылықтар)", d.life_act[up]);
    if (up !== "0") {
      h += sub("Кезеңнің стратегиясы") + `<p>${esc(d.life_str_intro.replace("{CH}", chName(up)))}</p>` + d.real[up][0].map(x => `<p><b class="ch-lab">${esc(x[0])}.</b> ${esc(x[1])}</p>`).join("") + lab("Кезеңді үйлесімді өткізуге не көмектеседі", d.life_str_act[up]);
    }
    h += sub("Төменгі сан " + low + " — жақсы жағына шығуға не көмектеседі") + `<p>${esc(d.exit_[low])}</p>`;
  });
  return h;
}
function secPotentials(r) {
  const d = D();
  const emoKey = Object.keys(d.emo).find(k => r.emoType.name.indexOf(k) === 0) || r.emoType.name;
  let h = `<h3 class="ch-h3">Эмоциялық реактивтілік типі: ${esc(EN(r.emoType.name))}</h3><p class="ch-intro">${esc(d.intro.emo)}</p><p>${esc(d.emo[emoKey] || "")}</p>`;
  h += `<h3 class="ch-h3">Түйсік (интуиция): вербалды ${Math.round(r.intuition.verb * 100)} %, вербалды емес ${Math.round(r.intuition.nonverb * 100)} %</h3><p>${esc(d.intro.intuition)}</p>`;
  h += `<h3 class="ch-h3">Қалаймын — ${r.want}, Істей аламын — ${r.can}</h3><p>${esc(d.intro.want)}</p>`;
  h += `<h3 class="ch-h3">Инь — ${r.yin}, Ян — ${r.yang}</h3><p>${esc(d.intro.yin)}</p>`;
  h += `<h3 class="ch-h3">Тартымдылық әлеуеті (магнетизм) — ${r.sex}</h3><p>${esc(d.intro.sex)}</p>`;
  h += `<h3 class="ch-h3">«Мен» — ${r.emoType.ya}, «Біз» — ${r.emoType.my}</h3><p>${esc(d.intro.yamy)}</p>`;
  return h;
}
function secKarmaNow(r) {
  const d = D();
  const one = (title, o) => { const k = d.karma_now[String(o.up)]; return `<h3 class="ch-h3">${title} — ${o.up}/${o.low}</h3><p><b class="ch-lab">${esc(k[0])}:</b> ${esc(k[1])} ${esc(k[2].charAt(0).toUpperCase() + k[2].slice(1))}</p>` + sub("Қалай пысықтау керек") + `<p>${esc(d.exit_[String(o.low)])}</p>`; };
  return `<p class="ch-intro">${esc(d.intro.karma_now)}</p>` + one("Қазіргі карма", r.now) + one("Ата-анадан келген карма", r.parents);
}
function strategyBlock(low, withRec) {
  const d = D(), s = d.ystr[String(low)];
  let h = `<p>${esc(d.ystr_intro.replace("{CH}", chName(low)))}</p>` + lab("Әлеует", s[0]) + lab("Әлсіз жағы", s[1]) + lab("Физикалық тәуекелдер", s[2]);
  if (withRec) h += `<p><b class="ch-lab">Ұсыныстар:</b></p>` + arr(s[3]);
  h += lab("Кезеңді үйлесімді өткізуге қандай істер мен салалар көмектеседі", s[4]);
  return h;
}
function secYear(r) {
  const d = D(), yr = r.yearRow;
  if (!yr) return "<p>Бұл жыл есептеу аралығынан тыс.</p>";
  const up = String(yr.up), low = String(yr.low), t = d.year_task[up];
  let h = `<p class="ch-code">${r.fYear} жыл — код <b>${up}/${low}</b></p>`;
  h += sub("Жылдың міндеттері" + (t[0] ? " — " + t[0] : "")) + t[1].map(x => x[0] ? `<p><b class="ch-lab">${esc(x[0])}.</b> ${esc(x[1])}</p>` : `<p>${esc(x[1])}</p>`).join("");
  if (t[2].length) h += sub("Жылды талдауға арналған сұрақтар") + `<p>${esc(d.year_q_intro)}</p>` + arr(t[2]);
  const yrk = d.year_risk[up];
  h += sub("Мәселелер мен тәуекелдер") + `<p>${esc(yrk[0])}</p>` + (yrk[1] ? lab("Денсаулыққа қатысты тәуекелдер", yrk[1]) : "");
  h += sub("Жылдың ресурсы") + `<p>${esc(d.year_res[up])}</p>`;
  h += sub("Жылдың стратегиясы") + strategyBlock(low, true);
  return h;
}
function monthBody(r, i) {
  const d = D(), m = r.months[i], up = String(m.up), low = String(m.low);
  let h = sub("Айдың үрдістері") + txt(d.mon_tr[up]);
  const w = d.mon_warn[up];
  h += sub("Ескертулер") + txt(w[0]) + (w[1] ? lab("Денсаулық", w[1]) : "");
  h += sub("Ұсыныстар") + (up === "0" ? `<p>${esc(d.mon_rec0)}</p>` : arr(d.ystr[up][3]));
  h += sub("Айдың стратегиясы") + strategyBlock(low, false);
  return h;
}
function secMonths(r) {
  let h = "";
  r.months.forEach(function (m, i) {
    h += `<h3 class="ch-h3${i === r.fMonth - 1 ? " ch-h3-hl" : ""}">${MONTHS[i]} ${r.fYear} — код ${m.up}/${m.low}</h3>`;
    h += monthBody(r, i);
  });
  return h;
}
function secDays(r) {
  const d = D();
  const mName = MONTHS[r.fMonth - 1];
  let h = `<p>«${mName} ${r.fYear}» айының әр күніне болжам. Кодтың жоғарғы саны күннің оқиғаларын, төменгісі — күнді жақсы жағында өткізуге не көмектесетінін көрсетеді.</p>`;
  r.days.forEach(function (x) {
    const t = d.day_up[String(x.up)];
    h += `<h3 class="ch-h3">${x.day} ${MONTHS_GEN[r.fMonth - 1]} — код ${x.up}/${x.low}</h3>`;
    h += lab("Жақсы жағында", t[0]) + lab("Әлсіз жағында", t[1]) + lab("Қалай пысықтау керек", t[2]);
    h += lab("Жақсы жағына шығу", d.exit_[String(x.low)]);
  });
  return h;
}

function sections(r) {
  return [
    ["Тұлға типі — " + r.typ, secType(r)],
    ["Чакралардың базалық сыйымдылығы", secChakras(r)],
    ["Контурлар бойынша адамның әлеуеті", secContours(r)],
    ["Рулық міндет — " + code(r.rod), secTask(r, "rod")],
    ["Кармалық міндет — " + code(r.past), secTask(r, "kar")],
    ["Кезеңдер бойынша өмір сценарийі", secPeriods(r)],
    ["Эмоциялық тип, түйсік және басқа әлеуеттер", secPotentials(r)],
    ["Қазіргі карма және ата-ана кармасы", secKarmaNow(r)],
    [r.fYear + " жылға болжам — " + code(r.yearRow), secYear(r)],
    [r.fYear + " жылдың айлары бойынша болжам", secMonths(r)],
    ["Күндер бойынша болжам — " + MONTHS[r.fMonth - 1] + " " + r.fYear, secDays(r)],
  ];
}

const CSS = `<style>
.ch-wrap{max-width:820px;margin:0 auto;}
.ch-top{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;}
.ch-svg{width:100%;max-width:640px;height:auto;display:block;margin:0 auto;}
.ch-diag{flex:1 1 380px;min-width:0;}
.ch-fc{flex:1 1 220px;border:1px solid rgba(225,180,52,.55);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);}
.ch-fc-title{font-family:PT Serif,Georgia,serif;font-size:20px;color:#f6d66c;margin-bottom:8px;text-align:center;}
.ch-fc-sub{color:#f6d66c;margin:12px 0 6px;font-size:14px;text-align:center;}
.ch-t{width:100%;border-collapse:collapse;font-size:14px;}
.ch-t td,.ch-t th{border:1px solid rgba(225,180,52,.35);padding:6px 8px;text-align:left;}
.ch-t th{color:#f6d66c;font-weight:700;background:rgba(225,180,52,.08);}
.ch-t-sm td{padding:4px 8px;font-size:13px;}
.ch-hl td{background:rgba(246,214,108,.16);color:#fff3c2;font-weight:700;}
.ch-main{margin:16px 0 8px;}
.ch-main td:first-child{color:#d8efe9;width:46%;}
.ch-days td{font-size:13px;padding:4px 6px;}
.ch-h3{font-family:PT Serif,Georgia,serif;color:#f6d66c;font-size:18px;margin:18px 0 8px;padding-bottom:4px;border-bottom:1px solid rgba(225,180,52,.5);}
.ch-h3-hl{color:#fff3c2;}
.ch-h4{color:#f6d66c;font-size:16px;margin:14px 0 6px;font-family:PT Serif,Georgia,serif;}
.ch-lab{color:#f6d66c;}
.ch-intro{color:#c8e6e0;font-style:italic;}
.ch-code{font-size:16px;}
.ch-dot{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:8px;vertical-align:middle;box-shadow:0 0 8px currentColor;}
.ch-ul{margin:4px 0 10px;padding-left:20px;} .ch-ul li{margin-bottom:3px;}
.accordion-body p{margin:0 0 8px;line-height:1.55;}
</style>`;

function render(name, birthDate, r, container) {
  window._lastChakra = { name: name, birthDate: birthDate, r: r };
  const secs = sections(r);
  const acc = secs.map(function (s, i) {
    const id = "ch-acc-" + i;
    return `<div class="accordion-item"><button type="button" class="accordion-header" onclick="toggleAccordionBody('${id}')"><span>${esc(s[0])}</span><span>▾</span></button><div class="accordion-body hidden" id="${id}" style="white-space:normal;">${s[1]}</div></div>`;
  }).join("");
  container.innerHTML = CSS + `<div class="ch-wrap">
    <h2 style="font-family:PT Serif,Georgia,serif;color:#f6d66c;text-align:center;margin:0 0 12px;">Чакроанализ — ${esc(name)} (${esc(birthDate)})</h2>
    <div class="ch-top"><div class="ch-diag">${diagramSvg(r)}</div>${forecastCard(r)}</div>
    ${mainTable(r)}
    <div style="margin-top:14px;">${acc}</div>
    <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap;">
      <button type="button" id="calcDownloadBtn" class="material-manager-button" style="width:auto;" onclick="ChakraView.download()">Жүктеу (диаграмма + мәтін)</button>
      <button type="button" class="material-manager-button" style="width:auto;background:rgba(0,0,0,.15);" onclick="openCalculator('chakra')">Жаңа есептеу</button>
    </div></div>`;
}

const PDF_CSS = `<style>
.ch-pdf p,.ch-pdf li,.ch-pdf td,.ch-pdf th{font-size:17px !important;line-height:1.55 !important;}
.ch-pdf h1{font-size:24px !important;} .ch-pdf h2{font-size:21px !important;}
.ch-pdf .ch-h3{font-size:19px !important;} .ch-pdf .ch-h4{font-size:18px !important;}
.ch-cap{text-align:center !important;font-size:19px !important;}
.ch-t{width:100%;border-collapse:collapse;font-size:13px;margin:8px 0;}
.ch-t td,.ch-t th{border:1px solid #d9c38a;padding:5px 7px;text-align:left;color:#221733;}
.ch-t th{background:#f5eee0;color:#2f6d6a;}
.ch-hl td{background:#fbf3d9;font-weight:700;}
.ch-main td:first-child{width:46%;color:#2f6d6a;}
.ch-h3{color:#2f6d6a;font-family:PT Serif,Georgia,serif;font-size:17px;margin:18px 0 8px;border-bottom:1px solid #d7aa31;padding-bottom:4px;}
.ch-h4{color:#2f6d6a;font-size:15px;margin:12px 0 6px;}
.ch-lab{color:#2f6d6a;}
.ch-intro{font-style:italic;color:#3d5754;}
.ch-dot{display:inline-block;width:11px;height:11px;border-radius:50%;margin-right:7px;}
.ch-ul{margin:4px 0 10px;padding-left:20px;} .ch-ul li{margin-bottom:3px;font-size:14px;line-height:1.5;}
.ch-fc-title{font-size:18px;color:#2f6d6a;text-align:center;margin:0 0 6px;font-weight:700;}
.ch-fc-sub{color:#2f6d6a;margin:10px 0 4px;text-align:center;font-size:14px;}
.ch-svg{width:640px;max-width:100%;height:auto;}
.diagram-wrap .ch-svg text{fill:inherit;}
</style>`;

function pdfForecast(r) {
  const yr = r.yearRow;
  const rows = MONTHS.map((m, i) => `<tr${i === r.fMonth - 1 ? ' class="ch-hl"' : ""}><td>${m}</td><td>${code(r.months[i])}</td></tr>`).join("");
  return `<table class="ch-t"><tr><th colspan="2" class="ch-cap">Болжам</th></tr>
      <tr><th>Кезең</th><th>Код</th></tr>
      <tr class="ch-hl"><td>${r.fYear} жыл</td><td>${code(yr)}</td></tr>
      <tr class="ch-hl"><td>${MONTHS[r.fMonth - 1]} ${r.fYear}</td><td>${code(r.months[r.fMonth - 1])}</td></tr></table>
    <table class="ch-t"><tr><th colspan="2" class="ch-cap">${r.fYear} жылдың айлары</th></tr>${rows}</table>`;
}
function download() {
  const s = window._lastChakra; if (!s) return;
  const r = s.r;
  const secs = sections(r);
  let body = PDF_CSS + `<div class="ch-pdf">`;
  body += `<h1 style="text-align:center;">Чакроанализ — ${esc(s.name)} (${esc(s.birthDate)})</h1>`;
  body += `<div style="text-align:center;margin:0 0 10px;">${diagramSvg(r)}</div>`;
  body += `<div style="break-after:page;page-break-after:always;"></div>`;
  body += pdfForecast(r);
  body += `<h2>Негізгі көрсеткіштер</h2>` + mainTable(r);
  body += `<div style="break-after:page;page-break-after:always;"></div>`;
  secs.forEach(x => { body += `<h2>${esc(x[0])}</h2>` + x[1]; });
  body += `</div>`;
  downloadHtmlFile("Чакроанализ - " + s.name + " - " + s.birthDate + ".html", body);
}

window.ChakraView = { render: render, download: download, MONTHS: MONTHS };
})(window);
