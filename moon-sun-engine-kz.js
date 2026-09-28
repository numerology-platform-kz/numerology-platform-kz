// ================================================================
// ДВИЖОК РАСЧЁТА: Техника "Луна и Солнце" (прогнозирование) — казахская версия текстов
// ================================================================

function digitSum2(str) { return Number(str[0]) + Number(str[1]); }

function reduceDigit(n) {
  let v = n;
  while (v > 9) v = String(v).split("").reduce((a, c) => a + Number(c), 0);
  return v;
}

const MONTH_DIVISORS = [7, 9, 28, 10, 8, 16, 11, 14, 17, 25, 2, 19]; // Янв..Дек
const MONTH_NAMES = ["Қаңтар","Ақпан","Наурыз","Сәуір","Мамыр","Маусым","Шілде","Тамыз","Қыркүйек","Қазан","Қараша","Желтоқсан"];

function computeLifeCode(day, month, year) {
  return day * month * year;
}

// Годовой расчёт Луна/Солнце для конкретного возраста
function yearlyMoonSun(lifeCode, age) {
  const quotient = Math.floor(lifeCode / age);
  const first4 = String(quotient).slice(0, 4).padStart(4, "0");
  const moon = digitSum2(first4.slice(0, 2));
  const sun = digitSum2(first4.slice(2, 4));
  return { moon, sun, result: sun - moon };
}

// Возраст человека в конкретном календарном году, с учётом того что
// "год" по Луне-Солнцу отсчитывается от дня рождения до дня рождения,
// а не по календарю
function ageForCalendarMonth(birthDay, birthMonth, birthYear, calendarYear, calendarMonthIndex) {
  const turnsAgeThisYear = calendarYear - birthYear;
  // если рассматриваемый месяц ещё до месяца рождения (не включая), человеку ещё "прошлый" возраст
  if (calendarMonthIndex + 1 < birthMonth) return turnsAgeThisYear;
  return turnsAgeThisYear + (calendarMonthIndex + 1 >= birthMonth ? 0 : -1) + (calendarMonthIndex + 1 === birthMonth || calendarMonthIndex + 1 > birthMonth ? 0 : 0);
}
// Упрощённая и корректная версия:
function getAgeAtMonth(birthDay, birthMonth, birthYear, calendarYear, calendarMonthIndex1to12) {
  let age = calendarYear - birthYear;
  if (calendarMonthIndex1to12 < birthMonth) age -= 1;
  return age;
}

function applyDeltaToCode(code6, deltaFn) {
  const digits = String(code6).padStart(6, "0").split("").map(Number);
  const out = digits.map(deltaFn);
  if (out[0] === 0) out[0] = 1;
  if (out[3] === 0) out[3] = 1;
  return Number(out.join(""));
}

function firstModifiedCode(lifeCode, calendarYear) {
  const yearDigit = reduceDigit(String(calendarYear).split("").reduce((a, c) => a + Number(c), 0));
  const digits = String(lifeCode).padStart(6, "0").split("").map(Number);
  const out = digits.map((d) => reduceDigit(d + yearDigit));
  return Number(out.join(""));
}

function monthlyForecast(birthDay, birthMonth, birthYear, calendarYear, monthIndex0to11, lifeCode) {
  const monthNum = monthIndex0to11 + 1;
  const age = getAgeAtMonth(birthDay, birthMonth, birthYear, calendarYear, monthNum);
  const mod1 = firstModifiedCode(lifeCode, calendarYear);
  const yearly = yearlyMoonSun(lifeCode, age);

  let mod2;
  let zeroPeriod = false;
  if (yearly.sun === 0) {
    mod2 = mod1;
    zeroPeriod = true;
  } else if (yearly.result > 0) {
    mod2 = applyDeltaToCode(mod1, (d) => reduceDigit(d + yearly.result));
  } else if (yearly.result < 0) {
    const sub = Math.abs(yearly.result);
    mod2 = applyDeltaToCode(mod1, (d) => (d < sub ? sub - d : d - sub));
  } else {
    mod2 = applyDeltaToCode(mod1, (d) => reduceDigit(d + 1));
  }

  const divisor = MONTH_DIVISORS[monthIndex0to11];
  const quotient = Math.floor(mod2 / divisor);
  const first4 = String(quotient).slice(0, 4).padStart(4, "0");
  const moon = digitSum2(first4.slice(0, 2));
  const sun = digitSum2(first4.slice(2, 4));
  let result = sun - moon;
  if (zeroPeriod) result = -Math.abs(result || 1);

  return { month: MONTH_NAMES[monthIndex0to11], age, yearly, moon, sun, result, zeroPeriod };
}

// ================================================================
// ТЕКСТЫ РАСШИФРОВОК
// ================================================================

const YEARLY_POSITIVE = {
  1: "Аздаған сәттілік, жай ғана жақсы жыл. Әке жағынан тектің күшті қолдауы бар. Бұл жылы рухани өсу қажет.",
  2: "Пайдалы байланыстар, жаңа таныстар, достар. Бәріне күш жетеді — бизнеске алға.",
  3: "Лотереядан ұтыс болуы мүмкін, жақсы сәтті жыл. Түйсігіңіз ең жоғары деңгейде, кез келген өте қиын жағдайды, тіпті өзіңізге қатысты емес жағдайды да шеше аласыз.",
  4: "Пайдалы таныстар, жақсы жұмыс табуға, тәуекелге баруға және бизнес ашуға болады. Денсаулық жақсы, тез қалпына келесіз, ота жасатуға болады.",
  5: "Жұмыстағы табыс. Жеке өмір реттеледі. Жақсы неке және бала дүниеге келуі мүмкін. Шығармашылық арқылы бизнес.",
  6: "Жеке өмірдегі оң өзгерістер, мансаптағы жоғары өсу. Қаржылық өрлеу: ақшаны салуға, бизнес ашуға, көшуге болады.",
  7: "Отбасындағы оң өзгерістер, жанжалдардың шешілуі, отбасындағы жақсы қарым-қатынас, жүктілік болуы мүмкін. Үйлену/тұрмысқа шығу, балалар, ақша.",
  8: "Қаржылық істердің жақсаруы, мұндай жылы декреттен шыққан жақсы — ақша келеді. Жақсы өрлеу, тиімді мәмілелер, тәуекелге барыңыз, бәрі өтеледі. Қызмет бағасын көтеруге болады.",
  9: "Сәттілік логика мен талдау арқылы келеді. Жалақының өсуі, мансап сатысымен көтерілу.",
  10: "Бала дүниеге келуі, тұрмысқа шығу, басқа елге көшу, даңқтың шыңы.",
  11: "Патша жылы. Бәрі сіздің қолыңызда. Тәуекелге барыңыз: мансаптық өсу, бала дүниеге келуі, салтанатты той.",
  12: "Көшу. Барлық істерді жүзеге асыруға сәтті жыл.",
  13: "Жылжымайтын мүлік сатып алуға ақша келеді. Мүмкіндікті жіберіп алмаңыз.",
};
const YEARLY_POSITIVE_MAX = "Сіз шыңдасыз, бәрі сәтті болады. Үлкен тәуекелге баруға болады.";
const YEARLY_POSITIVE_NOTE_11PLUS = "11-ден бастап барлық екі таңбалы сандар шетелге көшу немесе шетелде оқу мүмкіндігін көрсетеді.";

const YEARLY_NEGATIVE = {
  1: "Сот істерінің қаупі, сот шешімі сіздің пайдаңызға болмайды.",
  2: "Жақын адамдармен қарым-қатынасты жоғалту, ұрыс-керіс, жанжалдар. Күштің азаюы, ештеңе істегің келмейді. Ота жасатуға болмайды, өлім қаупі бар. Қызыл түсті киіну керек, жатын бөлменің тұсқағазын қызыл түске бояған жақсы.",
  3: "Қате шешімдер мен алдау жылы. Көшпеңіз және ажыраспаңыз. Түйсік нашар жұмыс істейді, тұрмысқа шығып, үйленудің қажеті жоқ.",
  4: "Денсаулыққа қауіп — әлсіз денсаулық, аурулардың өршуі, жарақат. Ота жасатпаңыз, өлім қаупі бар.",
  5: "Мүлікті жоғалту — сатып алмаңыз, сатпаңыз, ешнәрсеге ақша салмаңыз. Алдау, опасыздық, ерлі-зайыптылар арасындағы сатқындық, күйзеліс салдарынан ажырасу мен ауру қаупі.",
  6: "Жұмысты жоғалту. Қаржылық қор болуы маңызды, жұмыста жанжалдаспаңыз. Жұмыстан кетпеңіз, өйткені жаңасын ұзақ іздейсіз. Адам әлі жұмыстан шықпаса, алдын ала ескерткен дұрыс.",
  7: "Рухани дағдарыс, өзін-өзі қазбалау, құндылықтардың өзгеруі, депрессия, өзін іздеу. Ажырасу/опасыздық.",
  8: "Қаржылық істердің нашарлауы, ақша кетеді — қарызға алмаңыз, бермеңіз, ақша салмаңыз, ақша жоғалту. Ота жасатуға болмайды, өлім қаупі бар.",
  9: "Алдау, сатқындық, ақшаға байланысты мәселелер, жай ғана құлдырау жылы.",
  10: "Абыройдың төгілу қаупі, беделді жоғалту. Жүкті болу қалаусыз — түсік қаупі бар.",
  11: "Күшті бәсекелестік, ақша жоғалту, көшпеңіз.",
};
const YEARLY_NEGATIVE_MAX = "Ірі ақшамен іс жасамаңыз және көшпеңіз. Көшу немесе жылжымайтын мүлік сатып алу кезінде кім бастамашы екенін және бұл кімнің ақшасы екенін (күйеудің бе, әйелдің бе) қарау керек — сол адамның өзі кеңеске келуі тиіс.";

const YEARLY_NEUTRAL = "Бейтарап жыл — Күн мен Ай тең позицияда. Бәрі адамның өзіне байланысты.";

const YEARLY_SPECIAL = {
  sun: {
    0: "Тағдыр белгісі: бұл жылы апаттар, ірі ақша шығындары, қарым-қатынастың үзілуі немесе «күйдіретін» қарым-қатынастар болады. Қарызға ақша алмаңыз. Ауру болса, күрделене түсуі мүмкін. Өте абай болу керек. Сирек кездесетін көрсеткіш.",
    7: "Өте жақсы көрсеткіш. Тұрмысқа шығу, үйлену, жеке өмірдегі оң өзгерістер. Жыл отбасы, бала сүю, бала дүниеге келуі және қарым-қатынас үшін жақсы.",
    10: "Танымалдық, даңқ, табыс. Өте жақсы жыл. Басқа қалаға немесе елге көшу, баланың бойға бітуі және дүниеге келуі. Ғажайыпты күтіп отырмаңыз — жұмыс істеңіз, әрекет етіңіз, жасаңыз. Осы жылы туған балалар көрнекті әрі дарынды болуы мүмкін.",
    13: "Үй, көлік, пәтер, ірі жылжымайтын мүлік сатып алу. Өте сәтті жыл. Егер сатып алу ипотекамен болса, бұл әдетте Күн-13 жылы туралы емес; көбіне бұл толық төлем немесе барлық төлемдер аяқталатын жыл.",
    16: "Жеке өмірдегі оң өзгерістер. Екінші жарыңызбен кездесу, бала дүниеге келуі, бұл жылы жүктілік көп болады.",
  },
  moon: {
    4: "Денсаулыққа қатысты мәселелер, жарақат алу қаупі жоғары, созылмалы аурулар өршуі мүмкін. Тіпті спортпен айналысқанда да абай болу маңызды.",
    7: "Тұрмысқа шығу, осы адаммен кармалық неке. Қарым-қатынас 7 жылға созылуы мүмкін. Серіктеске мұқият қараған жөн. Кармалық неке — көбіне азапты, түсініксіз қарым-қатынас.",
    13: "Жаман жыл. Көп алдау мен жағымсыз жағдайлар күтіледі, қате шешімдер мен ажырасу жылы. Бизнес бастамаған жөн, әсіресе ірі бизнес — ең болмаса тәуекелсіз шағын жоба.",
    16: "Жеке өмірдегі мәселелер, отбасындағы дағдарыс, ажырасу мүмкін. Серіктестер бір-біріне деген көзқарасын қайта қарайды. Сабырлы болу, сын мен ашуды бақылау, серіктеске мейірімді қарау ұсынылады. Ірі қаржы салу қауіпті.",
  }
};

const YEARLY_START_NOTE = "Бұл әдіс бойынша жыл адамның туған күнінен + 13 күннен басталады. Туған күнге дейінгі бір ай мен одан кейінгі бір ай — осал кезең; бұл уақытта сапарлардан аулақ болған жөн.";

const MONTHLY_POSITIVE = {
  1: "Шағын сыйлықтар, сыйақы.",
  2: "Ағзаның энергия қорының артуы, пайдалы таныстар, байланыстар.",
  3: "Нақты оқиғалар әкелмейді, бірақ сәттілік сіздің жағыңызда!",
  4: "Нақты оқиғалар әкелмейді, бірақ сәттілік сіздің жағыңызда!",
  5: "Романтикалық таныстар күтіледі, алыстан туыстар келеді.",
  6: "Жеке қарым-қатынас үшін болашағы бар таныстардың мүмкіндігі жоғары. Романтика, құштарлық.",
  7: "Жеке қарым-қатынас үшін болашағы бар таныстардың мүмкіндігі жоғары. Романтика, құштарлық.",
  8: "Алдыңызда қосымша табыс табуға қолайлы мүмкіндіктер ашылады.",
  9: "Иммунитеттің артуы, пайдалы таныстар.",
  10: "Күтпеген үлкен сәттілік, жағымсыз әсерден күшті қорғаныс.",
  11: "Пайдалы таныстар, табыс сіздің жағыңызда.",
  12: "Пайдалы таныстар, табыс сіздің жағыңызда.",
  13: "Қосымша табыс табу мүмкіндіктері ашылады. Жақындық пен қарым-қатынас үшін ауқатты серіктесті кездестіру мүмкіндігі жоғары.",
  14: "Пайдалы таныстар, табыс сіздің жағыңызда.",
  15: "Қосымша табыс табу мүмкіндіктері ашылады. Жақындық пен қарым-қатынас үшін ауқатты серіктесті кездестіру мүмкіндігі жоғары.",
  16: "Қосымша табыс табу мүмкіндіктері ашылады. Жақындық пен қарым-қатынас үшін ауқатты серіктесті кездестіру мүмкіндігі жоғары.",
  17: "Үлкен өрлеу, сәттілік сіздің жағыңызда, ерекше оқиғалар әкелмейді.",
  18: "Үлкен өрлеу, сәттілік сіздің жағыңызда, ерекше оқиғалар әкелмейді.",
};
const MONTHLY_NEGATIVE = {
  1: "Ұсақ шығындар, өсек, жұмыстағы айла-шарғы. Беделіңізге нұқсан келуі мүмкін.",
  2: "Жанжалдар, ұрыс-керіс, күштің азаюы, жарақат қаупі.",
  3: "Қате шешімдер айы, ұсақ алдаулар, жағымсыз жағдайлар.",
  4: "Денсаулыққа қауіп, жұмыстан шығу, жарақат.",
  5: "Ақаулы электр сымынан өрт шығу қаупі, тамақтан улану, ішек инфекциялары.",
  6: "Ақша жоғалту, жеңіл көлік апаттары, жеке жау пайда болуы. Космограмма жасау ұсынылады.",
  7: "Отбасылық қарым-қатынастағы дағдарыс, әсіресе (ер адам үшін) әйелінің туыстарымен. Балалармен жанжал.",
  8: "Ақша жоғалту, қымбат техниканың бұзылуы, энергетикалық қорғаныстың әлсіреуі.",
  9: "Алдау, сатқындық, өсек және ірі шығындар.",
  10: "Толық сәтсіздік, физикалық және жыныстық әлсіздік.",
  11: "Тұрақсыз эмоционалдық жағдай, депрессия, қарым-қатынастағы мәселелер, әріптестердің қызғанышы.",
  12: "Тұрақсыз эмоционалдық жағдай, депрессия, қарым-қатынастағы мәселелер, әріптестердің қызғанышы.",
  13: "Жарақат қаупі, алдау, ірі шығындар.",
  14: "Жұмыс беделін жоғалту, жұмыстан шығу қаупі, иммунитеттің әлсіреуі.",
  15: "Жарақат қаупі, алдау, ірі шығындар.",
  16: "Жұмыс беделін жоғалту, жұмыстан шығу қаупі, иммунитеттің әлсіреуі.",
  17: "Ірі ақша шығындары.",
  18: "Жұмыс беделін жоғалту, жұмыстан шығу қаупі, иммунитеттің әлсіреуі.",
};

function getYearlyInterpretation(result) {
  if (result === 0) return YEARLY_NEUTRAL;
  if (result > 0) return YEARLY_POSITIVE[result] || YEARLY_POSITIVE_MAX;
  const abs = Math.abs(result);
  return YEARLY_NEGATIVE[abs] || YEARLY_NEGATIVE_MAX;
}
function getYearlySpecialNotes(moon, sun) {
  const notes = [];
  if (YEARLY_SPECIAL.sun[sun]) notes.push("Күн = " + sun + ": " + YEARLY_SPECIAL.sun[sun]);
  if (YEARLY_SPECIAL.moon[moon]) notes.push("Ай = " + moon + ": " + YEARLY_SPECIAL.moon[moon]);
  if (sun >= 11 && sun > moon) notes.push(YEARLY_POSITIVE_NOTE_11PLUS);
  return notes;
}
function getMonthlyInterpretation(result) {
  if (result === 0) return "Бейтарап ай.";
  if (result > 0) return MONTHLY_POSITIVE[result] || MONTHLY_POSITIVE[18];
  const abs = Math.abs(result);
  return MONTHLY_NEGATIVE[abs] || MONTHLY_NEGATIVE[18];
}

// ================================================================
// ПУБЛИЧНЫЙ API
// ================================================================

function moonSunCalculate(day, month, year, name) {
  window._moonSunInput = { day, month, year, name };
}

function get5YearForecast(day, month, year, startYear) {
  const lifeCode = computeLifeCode(day, month, year);
  const rows = [];
  for (let i = 0; i < 5; i++) {
    const calYear = startYear + i;
    const age = calYear - year;
    if (age <= 0) continue;
    const yearly = yearlyMoonSun(lifeCode, age);
    rows.push({
      year: calYear,
      age,
      moon: yearly.moon,
      sun: yearly.sun,
      result: yearly.result,
      interpretation: getYearlyInterpretation(yearly.result),
      specialNotes: getYearlySpecialNotes(yearly.moon, yearly.sun),
    });
  }
  return rows;
}

function get12MonthForecast(day, month, year, calendarYear) {
  const lifeCode = computeLifeCode(day, month, year);
  const rows = [];
  for (let m = 0; m < 12; m++) {
    const r = monthlyForecast(day, month, year, calendarYear, m, lifeCode);
    rows.push({
      month: r.month,
      result: r.result,
      interpretation: getMonthlyInterpretation(r.result),
      zeroPeriod: r.zeroPeriod,
    });
  }
  return rows;
}

function getFullResult(day, month, year, name, startYear) {
  const sy = startYear || new Date().getFullYear();
  return {
    lifeCode: computeLifeCode(day, month, year),
    fiveYear: get5YearForecast(day, month, year, sy),
    months: get12MonthForecast(day, month, year, sy),
    startNote: YEARLY_START_NOTE,
  };
}

window.MoonSunEngine = { calculate: moonSunCalculate, getFullResult, get5YearForecast, get12MonthForecast, computeLifeCode };
