// Element definitions
const ELEMENTS = {
  H:  { name: '수소',      atomicNum: 1,  grade: 1 },
  C:  { name: '탄소',      atomicNum: 6,  grade: 1 },
  O:  { name: '산소',      atomicNum: 8,  grade: 1 },
  N:  { name: '질소',      atomicNum: 7,  grade: 2 },
  F:  { name: '불소',      atomicNum: 9,  grade: 2 },
  Na: { name: '나트륨',    atomicNum: 11, grade: 2 },
  Mg: { name: '마그네슘',  atomicNum: 12, grade: 2 },
  P:  { name: '인',        atomicNum: 15, grade: 2 },
  S:  { name: '황',        atomicNum: 16, grade: 2 },
  Cl: { name: '염소',      atomicNum: 17, grade: 2 },
  Ca: { name: '칼슘',      atomicNum: 20, grade: 2 },
  Al: { name: '알루미늄',  atomicNum: 13, grade: 3 },
  Si: { name: '규소',      atomicNum: 14, grade: 3 },
  K:  { name: '칼륨',      atomicNum: 19, grade: 3 },
  Mn: { name: '망간',      atomicNum: 25, grade: 3 },
  Fe: { name: '철',        atomicNum: 26, grade: 3 },
  Cu: { name: '구리',      atomicNum: 29, grade: 3 },
  Zn: { name: '아연',      atomicNum: 30, grade: 3 },
  Br: { name: '브로민',    atomicNum: 35, grade: 3 },
  I:  { name: '요오드',    atomicNum: 53, grade: 3 },
  Ag: { name: '은',        atomicNum: 47, grade: 4 },
  Ba: { name: '바륨',      atomicNum: 56, grade: 4 },
  Pt: { name: '백금',      atomicNum: 78, grade: 4 },
  Au: { name: '금',        atomicNum: 79, grade: 4 },
  Hg: { name: '수은',      atomicNum: 80, grade: 4 },
  Pb: { name: '납',        atomicNum: 82, grade: 4 },
};

// Compound database
// elements: { symbol: count }
// category: 'oxide' | 'acid' | 'base' | 'salt' | 'hydrocarbon' | 'alcohol' | 'organic_acid' | 'aldehyde' | 'ester' | 'sugar' | 'oxidizer'
const COMPOUNDS = [
  // === Grade 1: H, C, O only ===
  // Inorganic
  { id: 'H2O',     name: '물',           formula: 'H₂O',      elements: {H:2, O:1},       category: 'oxide',        score: 10,  grade: 1 },
  { id: 'H2O2',    name: '과산화수소',   formula: 'H₂O₂',     elements: {H:2, O:2},       category: 'oxide',        score: 18,  grade: 1 },
  { id: 'CO',      name: '일산화탄소',   formula: 'CO',        elements: {C:1, O:1},       category: 'oxide',        score: 14,  grade: 1 },
  { id: 'CO2',     name: '이산화탄소',   formula: 'CO₂',      elements: {C:1, O:2},       category: 'oxide',        score: 22,  grade: 1 },
  // Hydrocarbons
  { id: 'CH4',     name: '메탄',         formula: 'CH₄',      elements: {C:1, H:4},       category: 'hydrocarbon',  score: 10,  grade: 1 },
  { id: 'C2H2',    name: '아세틸렌',     formula: 'C₂H₂',     elements: {C:2, H:2},       category: 'hydrocarbon',  score: 14,  grade: 1 },
  { id: 'C2H4',    name: '에틸렌',       formula: 'C₂H₄',     elements: {C:2, H:4},       category: 'hydrocarbon',  score: 16,  grade: 1 },
  { id: 'C2H6',    name: '에탄',         formula: 'C₂H₆',     elements: {C:2, H:6},       category: 'hydrocarbon',  score: 18,  grade: 1 },
  { id: 'C3H8',    name: '프로판',       formula: 'C₃H₈',     elements: {C:3, H:8},       category: 'hydrocarbon',  score: 26,  grade: 1 },
  { id: 'C6H6',    name: '벤젠',         formula: 'C₆H₆',     elements: {C:6, H:6},       category: 'hydrocarbon',  score: 42,  grade: 1 },
  // Organic oxygen compounds
  { id: 'HCHO',    name: '폼알데하이드', formula: 'HCHO',      elements: {C:1, H:2, O:1},  category: 'aldehyde',     score: 16,  grade: 1 },
  { id: 'CH3CHO',  name: '아세트알데하이드', formula: 'CH₃CHO', elements: {C:2, H:4, O:1}, category: 'aldehyde',    score: 24,  grade: 1 },
  { id: 'CH3OH',   name: '메탄올',       formula: 'CH₃OH',    elements: {C:1, H:4, O:1},  category: 'alcohol',      score: 18,  grade: 1 },
  { id: 'C2H5OH',  name: '에탄올',       formula: 'C₂H₅OH',   elements: {C:2, H:6, O:1},  category: 'alcohol',      score: 26,  grade: 1 },
  { id: 'HCOOH',   name: '폼산',         formula: 'HCOOH',    elements: {C:1, H:2, O:2},  category: 'organic_acid', score: 24,  grade: 1 },
  { id: 'CH3COOH', name: '아세트산',     formula: 'CH₃COOH',  elements: {C:2, H:4, O:2},  category: 'organic_acid', score: 32,  grade: 1 },
  { id: 'C6H12O6', name: '포도당',       formula: 'C₆H₁₂O₆',  elements: {C:6, H:12, O:6}, category: 'sugar',        score: 96,  grade: 1 },

  // === Grade 2: N, F, Na, Mg, P, S, Cl, Ca ===
  // Inorganic acids
  { id: 'HF',      name: '플루오린화수소', formula: 'HF',      elements: {H:1, F:1},         category: 'acid', score: 10,  grade: 2 },
  { id: 'HCl',     name: '염화수소',     formula: 'HCl',      elements: {H:1, Cl:1},        category: 'acid', score: 18,  grade: 2 },
  { id: 'H2S',     name: '황화수소',     formula: 'H₂S',      elements: {H:2, S:1},         category: 'acid', score: 18,  grade: 2 },
  { id: 'HNO2',    name: '아질산',       formula: 'HNO₂',     elements: {H:1, N:1, O:2},    category: 'acid', score: 24,  grade: 2 },
  { id: 'HNO3',    name: '질산',         formula: 'HNO₃',     elements: {H:1, N:1, O:3},    category: 'acid', score: 32,  grade: 2 },
  { id: 'H2SO4',   name: '황산',         formula: 'H₂SO₄',    elements: {H:2, S:1, O:4},    category: 'acid', score: 50,  grade: 2 },
  { id: 'H3PO4',   name: '인산',         formula: 'H₃PO₄',    elements: {H:3, P:1, O:4},    category: 'acid', score: 50,  grade: 2 },
  // Bases
  { id: 'NH3',     name: '암모니아',     formula: 'NH₃',      elements: {N:1, H:3},         category: 'base', score: 10,  grade: 2 },
  { id: 'NaOH',    name: '수산화나트륨', formula: 'NaOH',     elements: {Na:1, O:1, H:1},   category: 'base', score: 20,  grade: 2 },
  { id: 'MgOH2',   name: '수산화마그네슘', formula: 'Mg(OH)₂', elements: {Mg:1, O:2, H:2},  category: 'base', score: 30,  grade: 2 },
  { id: 'CaOH2',   name: '수산화칼슘',   formula: 'Ca(OH)₂',  elements: {Ca:1, O:2, H:2},   category: 'base', score: 38,  grade: 2 },
  // Oxides
  { id: 'MgO',     name: '산화마그네슘', formula: 'MgO',      elements: {Mg:1, O:1},        category: 'oxide', score: 20,  grade: 2 },
  { id: 'CaO',     name: '산화칼슘',     formula: 'CaO',      elements: {Ca:1, O:1},        category: 'oxide', score: 28,  grade: 2 },
  { id: 'NO',      name: '일산화질소',   formula: 'NO',        elements: {N:1, O:1},         category: 'oxide', score: 15,  grade: 2 },
  { id: 'NO2',     name: '이산화질소',   formula: 'NO₂',      elements: {N:1, O:2},         category: 'oxide', score: 23,  grade: 2 },
  { id: 'N2O',     name: '아산화질소',   formula: 'N₂O',      elements: {N:2, O:1},         category: 'oxide', score: 22,  grade: 2 },
  { id: 'SO2',     name: '이산화황',     formula: 'SO₂',      elements: {S:1, O:2},         category: 'oxide', score: 32,  grade: 2 },
  { id: 'SO3',     name: '삼산화황',     formula: 'SO₃',      elements: {S:1, O:3},         category: 'oxide', score: 40,  grade: 2 },
  // Salts
  { id: 'NaCl',    name: '염화나트륨',   formula: 'NaCl',     elements: {Na:1, Cl:1},       category: 'salt', score: 28,  grade: 2 },
  { id: 'MgCl2',   name: '염화마그네슘', formula: 'MgCl₂',    elements: {Mg:1, Cl:2},       category: 'salt', score: 46,  grade: 2 },
  { id: 'NH4Cl',   name: '염화암모늄',   formula: 'NH₄Cl',    elements: {N:1, H:4, Cl:1},   category: 'salt', score: 28,  grade: 2 },
  { id: 'NH4NO3',  name: '질산암모늄',   formula: 'NH₄NO₃',   elements: {N:2, H:4, O:3},    category: 'salt', score: 42,  grade: 2 },
  { id: 'NaHCO3',  name: '탄산수소나트륨', formula: 'NaHCO₃', elements: {Na:1, H:1, C:1, O:3}, category: 'salt', score: 42, grade: 2 },
  { id: 'Na2CO3',  name: '탄산나트륨',   formula: 'Na₂CO₃',   elements: {Na:2, C:1, O:3},   category: 'salt', score: 52,  grade: 2 },
  { id: 'CaCO3',   name: '탄산칼슘',     formula: 'CaCO₃',    elements: {Ca:1, C:1, O:3},   category: 'salt', score: 50,  grade: 2 },
  { id: 'Na2SO4',  name: '황산나트륨',   formula: 'Na₂SO₄',   elements: {Na:2, S:1, O:4},   category: 'salt', score: 70,  grade: 2 },
  { id: 'CaSO4',   name: '황산칼슘',     formula: 'CaSO₄',    elements: {Ca:1, S:1, O:4},   category: 'salt', score: 68,  grade: 2 },
  { id: 'CaNO32',  name: '질산칼슘',     formula: 'Ca(NO₃)₂', elements: {Ca:1, N:2, O:6},   category: 'salt', score: 82,  grade: 2 },
  // Other
  { id: 'H2CO3',   name: '탄산',         formula: 'H₂CO₃',    elements: {H:2, C:1, O:3},    category: 'acid', score: 30,  grade: 2 },

  // === Grade 3: Al, Si, K, Mn, Fe, Cu, Zn, Br, I ===
  { id: 'SiO2',    name: '이산화규소',   formula: 'SiO₂',     elements: {Si:1, O:2},        category: 'oxide', score: 30, grade: 3 },
  { id: 'Al2O3',   name: '산화알루미늄', formula: 'Al₂O₃',    elements: {Al:2, O:3},        category: 'oxide', score: 50, grade: 3 },
  { id: 'AlOH3',   name: '수산화알루미늄', formula: 'Al(OH)₃', elements: {Al:1, O:3, H:3},  category: 'base',  score: 40, grade: 3 },
  { id: 'AlCl3',   name: '염화알루미늄', formula: 'AlCl₃',    elements: {Al:1, Cl:3},       category: 'salt',  score: 64, grade: 3 },
  { id: 'KOH',     name: '수산화칼륨',   formula: 'KOH',      elements: {K:1, O:1, H:1},    category: 'base',  score: 28, grade: 3 },
  { id: 'KCl',     name: '염화칼륨',     formula: 'KCl',      elements: {K:1, Cl:1},        category: 'salt',  score: 36, grade: 3 },
  { id: 'KI',      name: '아이오딘화칼륨', formula: 'KI',      elements: {K:1, I:1},         category: 'salt',  score: 72, grade: 3 },
  { id: 'KMnO4',   name: '과망가니즈산칼륨', formula: 'KMnO₄', elements: {K:1, Mn:1, O:4},  category: 'oxidizer', score: 76, grade: 3 },
  { id: 'MnO2',    name: '이산화망간',   formula: 'MnO₂',     elements: {Mn:1, O:2},        category: 'oxide', score: 41, grade: 3 },
  { id: 'Fe2O3',   name: '산화철(III)',  formula: 'Fe₂O₃',    elements: {Fe:2, O:3},        category: 'oxide', score: 76, grade: 3 },
  { id: 'Fe3O4',   name: '사산화삼철',   formula: 'Fe₃O₄',    elements: {Fe:3, O:4},        category: 'oxide', score: 110, grade: 3 },
  { id: 'FeCl2',   name: '염화철(II)',   formula: 'FeCl₂',    elements: {Fe:1, Cl:2},       category: 'salt',  score: 60, grade: 3 },
  { id: 'FeCl3',   name: '염화철(III)',  formula: 'FeCl₃',    elements: {Fe:1, Cl:3},       category: 'salt',  score: 77, grade: 3 },
  { id: 'CuO',     name: '산화구리(II)', formula: 'CuO',      elements: {Cu:1, O:1},        category: 'oxide', score: 37, grade: 3 },
  { id: 'CuSO4',   name: '황산구리(II)', formula: 'CuSO₄',    elements: {Cu:1, S:1, O:4},   category: 'salt',  score: 77, grade: 3 },
  { id: 'ZnO',     name: '산화아연',     formula: 'ZnO',      elements: {Zn:1, O:1},        category: 'oxide', score: 38, grade: 3 },
  { id: 'ZnSO4',   name: '황산아연',     formula: 'ZnSO₄',    elements: {Zn:1, S:1, O:4},   category: 'salt',  score: 78, grade: 3 },
  { id: 'HBr',     name: '브로민화수소', formula: 'HBr',      elements: {H:1, Br:1},        category: 'acid',  score: 36, grade: 3 },
  { id: 'HI',      name: '아이오딘화수소', formula: 'HI',      elements: {H:1, I:1},         category: 'acid',  score: 54, grade: 3 },

  // === Grade 4: Ag, Ba, Pt, Au, Hg, Pb ===
  { id: 'BaO',     name: '산화바륨',     formula: 'BaO',      elements: {Ba:1, O:1},        category: 'oxide', score: 64,  grade: 4 },
  { id: 'BaCl2',   name: '염화바륨',     formula: 'BaCl₂',    elements: {Ba:1, Cl:2},       category: 'salt',  score: 90,  grade: 4 },
  { id: 'BaSO4',   name: '황산바륨',     formula: 'BaSO₄',    elements: {Ba:1, S:1, O:4},   category: 'salt',  score: 104, grade: 4 },
  { id: 'AgNO3',   name: '질산은',       formula: 'AgNO₃',    elements: {Ag:1, N:1, O:3},   category: 'salt',  score: 78,  grade: 4 },
  { id: 'AgCl',    name: '염화은',       formula: 'AgCl',     elements: {Ag:1, Cl:1},       category: 'salt',  score: 64,  grade: 4 },
  { id: 'Ag2O',    name: '산화은',       formula: 'Ag₂O',     elements: {Ag:2, O:1},        category: 'oxide', score: 102, grade: 4 },
  { id: 'HgO',     name: '산화수은(II)', formula: 'HgO',      elements: {Hg:1, O:1},        category: 'oxide', score: 88,  grade: 4 },
  { id: 'HgCl2',   name: '염화수은(II)', formula: 'HgCl₂',    elements: {Hg:1, Cl:2},       category: 'salt',  score: 114, grade: 4 },
  { id: 'PbO',     name: '산화납(II)',   formula: 'PbO',      elements: {Pb:1, O:1},        category: 'oxide', score: 90,  grade: 4 },
  { id: 'PbSO4',   name: '황산납(II)',   formula: 'PbSO₄',    elements: {Pb:1, S:1, O:4},   category: 'salt',  score: 130, grade: 4 },
  { id: 'PbCl2',   name: '염화납(II)',   formula: 'PbCl₂',    elements: {Pb:1, Cl:2},       category: 'salt',  score: 116, grade: 4 },
  { id: 'AuCl3',   name: '염화금(III)',  formula: 'AuCl₃',    elements: {Au:1, Cl:3},       category: 'salt',  score: 130, grade: 4 },

  // Esters (formed via esterification or directly)
  { id: 'CH3COOCH3', name: '아세트산메틸', formula: 'CH₃COOCH₃', elements: {C:3, H:6, O:2}, category: 'ester', score: 32, grade: 1 },
  { id: 'CH3COOC2H5', name: '아세트산에틸', formula: 'CH₃COOC₂H₅', elements: {C:4, H:8, O:2}, category: 'ester', score: 40, grade: 1 },
];

// Reaction chain: if both A and B are formed this turn, product C is auto-synthesized at 0.5x score
const REACTION_CHAINS = [
  { reactants: ['CO2', 'H2O'],   product: 'H2CO3', label: 'CO₂+H₂O→H₂CO₃' },
  { reactants: ['NH3', 'HCl'],   product: 'NH4Cl', label: 'NH₃+HCl→NH₄Cl' },
  { reactants: ['SO3', 'H2O'],   product: 'H2SO4', label: 'SO₃+H₂O→H₂SO₄' },
  { reactants: ['CaO', 'H2O'],   product: 'CaOH2', label: 'CaO+H₂O→Ca(OH)₂' },
  { reactants: ['NO', 'CO2'],    product: 'NO2',   label: 'NO+CO₂→NO₂(산화)' },
  { reactants: ['SO2', 'H2O'],   product: 'H2CO3', label: 'SO₂+H₂O→H₂SO₃(간소화)' },
];

// Neutralization pairs: acid+base → salt+water
const NEUTRALIZATION_PAIRS = [
  { acid: 'HCl',  base: 'NaOH',  salt: 'NaCl'  },
  { acid: 'HCl',  base: 'CaOH2', salt: 'CaCO3' },
  { acid: 'HNO3', base: 'NH3',   salt: 'NH4NO3' },
  { acid: 'H2SO4',base: 'NaOH',  salt: 'Na2SO4' },
  { acid: 'HCl',  base: 'KOH',   salt: 'KCl'   },
];

// Combustion: organic + CO2 + H2O required
const COMBUSTION_RULES = [
  { organic: 'CH4',    co2: 1, h2o: 2, multiplier: 1.5 },
  { organic: 'C2H5OH', co2: 2, h2o: 3, multiplier: 1.5 },
  { organic: 'C6H6',   co2: 6, h2o: 3, multiplier: 2.0 },
  { organic: 'C6H12O6',co2: 6, h2o: 6, multiplier: 1.8 },
  { organic: 'C3H8',   co2: 3, h2o: 4, multiplier: 1.5 },
  { organic: 'CH3OH',  co2: 1, h2o: 2, multiplier: 1.5 },
];

// Catalysts
const CATALYST_RULES = [
  { catalyst: 'H2SO4', targets: ['organic_acid','alcohol','aldehyde','ester','hydrocarbon','sugar'], multiplier: 1.3 },
  { catalyst: 'Fe2O3', targets: ['oxide'], multiplier: 1.2 },
  { catalyst: 'MnO2',  targets: ['oxide','acid','base'], multiplier: 1.4 },
  { catalyst: 'Al2O3', targets: ['salt'], multiplier: 1.2 },
];

// Industrial synthesis routes
const SYNTHESIS_ROUTES = [
  { name: '하버-보슈법', requires: ['NH3'], elementCards: ['N'], bonus: 50 },
  { name: '접촉법',      requires: ['SO2','SO3','H2SO4'], bonus: 60 },
  { name: '오스트발트법', requires: ['NH3','NO','NO2','HNO3'], bonus: 60 },
  { name: '솔베이법',    requires: ['NaHCO3','Na2CO3'], bonus: 70 },
  { name: '석회 제조',   requires: ['CaCO3','CaO','CaOH2'], bonus: 40 },
];

// Threshold schedule
const THRESHOLDS = [30, 55, 85, 125, 175, 240];

// Shop costs by grade
const SHOP_COSTS = { 1: 0, 2: 20, 3: 45, 4: 85, 5: 150 };
