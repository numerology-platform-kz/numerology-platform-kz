// «Прогнозирование по методу Луна и Солнце» — таблица прогноза на 5 лет.
// Все формулы повторяют листы «Расчет» и «Matr» Excel-калькулятора «Луна и Солнце по годам».
(function () {
  const digitsOf = (n) => String(n).split("").map(Number);
  const digitSum = (n) => digitsOf(n).reduce((a, b) => a + b, 0);

  // Код жизни: день × месяц × год (Matr!C9) и его цифры
  function lifeCode(d, m, y) { return d * m * y; }

  // Расширенный код для Луны и Солнца (Matr!BI7)
  function paddedCode(d, m, y) {
    const p = d * m * y;
    const q = p < 10000 ? p * 100 : p;
    return q < 100000 ? p * 10 : q;
  }

  // Луна и Солнце для возраста (Matr!BL, BM): цифры числа ⌊код / возраст⌋
  function moonSun(code, age) {
    if (age <= 0) return { moon: 0, sun: 0 };
    const s = String(Math.floor(code / age));
    return { moon: Number(s[0]) + Number(s[1]), sun: Number(s[2] || 0) + Number(s[3] || 0) };
  }

  // Энергетический потенциал по возрасту (Matr!BE): цифры кода жизни по кругу, каждые 7 лет, плавный переход
  function energy(lifeDigits, age) {
    if (age < 0) return null;
    const n = lifeDigits.length;
    const e = (k) => (k >= 16 ? 0 : lifeDigits[k % n]);
    if (age === 0) return e(0);
    const k = Math.floor((age - 1) / 7), j = (age - 1) % 7 + 1;
    return e(k) + j * (e(k + 1) - e(k)) / 7;
  }

  // 12-летний цикл (Matr!BG): цифра кода жизни по кругу, одна на каждые 12 лет
  function cycle12(lifeDigits, age) {
    return lifeDigits[Math.floor(age / 12) % lifeDigits.length];
  }

  // Персональное число года (Matr!BJ)
  function personalYear(d, m, year) {
    const dd = d < 10 ? [d] : digitsOf(d);
    const mm = m < 10 ? [m] : digitsOf(m);
    let yr = digitSum(year);
    let yrRed = yr < 10 ? yr : Math.floor(yr / 10) + (yr % 10); // сумма первых двух цифр
    if (yrRed === 10) yrRed = 1;
    const s = dd.reduce((a, b) => a + b, 0) + mm.reduce((a, b) => a + b, 0) + yrRed;
    const r = s < 10 ? s : Math.floor(s / 10) + (s % 10);
    return r === 10 ? 1 : r;
  }

  // Годы судьбоносных событий (Matr!BJ9:BK48)
  function fatefulYears(birthYear) {
    const years = new Set();
    let base = birthYear;
    for (let g = 0; g < 10; g++) {
      let cur = base;
      digitsOf(base).forEach((dig, i) => {
        const next = cur + dig;
        if (i < 3 && g > 0 && next === cur) years.add(next);       // добавили ноль — событие
        if (i > 0 && i < 3 && g === 0 && next === cur) years.add(next);
        cur = next;
      });
      years.add(cur);
      base = cur;
    }
    return years;
  }

  const PERSONAL_YEAR_TEXT = {
    1: "жоспарлау жылы", 2: "қарым-қатынас жылы", 3: "шығармашылық және креативтілік жылы",
    4: "тұрақтылық пен сенімділік жылы", 5: "өзгерістер жылы", 6: "отбасы жылы",
    7: "рухани ізденіс жылы", 8: "адалдықты сынау жылы", 9: "аяқтау жылы",
  };
  const CYCLE_TEXT = {
    0: "уақыты жағынан да, күші жағынан да ең жоғары жамандық",
    1: "уақыты жағынан да, күші жағынан да ең аз жақсылық",
    2: "уақыты жағынан да, күші жағынан да ең аз жамандық",
    3: "күші аз, бірақ едәуір ұзақ жақсылық",
    4: "күші аз, ұзақтығы орташа жамандық",
    5: "күші ең жоғары қысқа мерзімді жақсылық (шок)",
    6: "күші ең жоғары қысқа мерзімді жамандық (шок)",
    7: "әлсіз, бірақ едәуір ұзақ жақсылық (қуаныш)",
    8: "әлсіз, бірақ едәуір ұзақ жамандық",
    9: "уақыты жағынан да, күші жағынан да ең жоғары жақсылық",
  };
  const MOON_TEXT = {
    4: "денсаулыққа қатысты мәселелер, жарақат алу қаупі жоғары",
    7: "тұрмысқа шығу, кармалық неке (7 жыл ауыр қарым-қатынас)",
    13: "қате шешімдер жылы, өте жаман әрі сәтсіз жыл",
    16: "жеке өмірдегі мәселелер, қарым-қатынастағы дағдарыс",
  };
  const SUN_TEXT = {
    0: "нөлдік кезең, апаттар, шығындар, қарым-қатынастың үзілуі мүмкін",
    7: "тұрмысқа шығу, үйлену, отбасы белгісі",
    10: "танымалдық, даңқ, табыс, басқа қалаға көшу, баланың бойға бітуі және дүниеге келуі",
    13: "мүлік, жылжымайтын мүлік сатып алу, өте сәтті жыл",
    16: "жеке өмірдегі жақсы жаққа өзгерістер",
  };
  const RESULT_TEXT = {
    "-1": "аздаған құлдырау", "-2": "жақын адамдармен қарым-қатынасты жоғалту", "-3": "қате шешімдер жылы",
    "-4": "денсаулыққа қауіп", "-5": "мүлікті жоғалту", "-6": "жұмысты жоғалту",
    "-7": "рухани дағдарыс, депрессия", "-8": "ақша жоғалту", "-9": "құлдырау, бірақ нақты оқиғалар әкелмейді",
    "1": "аздаған сәттілік, жақсы жыл", "2": "пайдалы байланыстар, жаңа достар", "3": "сәтті жыл, лотерея",
    "4": "өрлеу, нақты оқиғалар әкелмейді", "5": "жұмыстағы табыс", "6": "мансаптағы жоғары өсу",
    "7": "отбасындағы жанжалдардың шешілуі", "8": "қаржылық істердің жақсаруы", "9": "өрлеу, нақты оқиғалар әкелмейді",
  };

  // refDay/refMonth — день и месяц, на который считается возраст (в Excel — сегодняшняя дата)
  function getTable(day, month, year, startYear, refDay, refMonth) {
    const now = new Date();
    refDay = refDay || now.getDate();
    refMonth = refMonth || now.getMonth() + 1;
    const code = paddedCode(day, month, year);
    const lifeDigits = digitsOf(lifeCode(day, month, year));
    const fateful = fatefulYears(year);
    const beforeBirthday = refMonth < month || (refMonth === month && refDay < day);
    const age0 = startYear - year - (beforeBirthday ? 1 : 0);

    const ages = [0, 1, 2, 3, 4].map((r) => age0 + r);
    const M = ages.map((a) => energy(lifeDigits, a - 1));
    const Mprev = energy(lifeDigits, age0 - 2);
    const Mnext = energy(lifeDigits, ages[4] + 1);
    const round2 = (x) => Math.round(x * 100) / 100;

    return ages.map((age, r) => {
      const y = startYear + r;
      const prev = r === 0 ? Mprev : M[r - 1];
      const next = r === 4 ? Mnext : M[r + 1];
      let trend = null;
      if (prev !== null && next !== null) {
        const diff = round2(next - prev);
        trend = diff > 0 ? 2 : diff < 0 ? -1 : (M[r] > 4 ? 1 : 0);
      }
      const { moon, sun } = moonSun(code, age);
      const result = sun - moon;
      const py = personalYear(day, month, y);
      const isFateful = fateful.has(y);
      const cyc = cycle12(lifeDigits, age);
      return {
        year: y,
        age,
        energyTrend: trend,
        energyValue: M[r],
        personalYear: py,
        personalYearText: py + (PERSONAL_YEAR_TEXT[py] ? " - " + PERSONAL_YEAR_TEXT[py] : ""),
        fateful: isFateful ? "+" : "-",
        cycle: isFateful ? cyc : null,
        cycleText: isFateful ? cyc + " - " + CYCLE_TEXT[cyc] : "",
        moon, sun, result,
        moonText: result <= 0 && MOON_TEXT[moon] ? moon + " - " + MOON_TEXT[moon] : String(moon),
        sunText: result >= 0 && SUN_TEXT[sun] ? sun + " - " + SUN_TEXT[sun] : String(sun),
        resultText: RESULT_TEXT[String(result)] || "",
      };
    });
  }

  const api = { getTable, energy, moonSun, fatefulYears, personalYear, paddedCode };
  if (typeof window !== "undefined") window.MoonSunTable = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
