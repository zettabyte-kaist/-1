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
const COMPOUNDS = [
  // === Grade 1: H, C, O only ===
  { id: 'H2O',     name: '물',           formula: 'H₂O',      elements: {H:2, O:1},       category: 'oxide',        score: 10,  grade: 1 },
  { id: 'H2O2',    name: '과산화수소',   formula: 'H₂O₂',     elements: {H:2, O:2},       category: 'oxide',        score: 18,  grade: 1 },
  { id: 'CO',      name: '일산화탄소',   formula: 'CO',        elements: {C:1, O:1},       category: 'oxide',        score: 14,  grade: 1 },
  { id: 'CO2',     name: '이산화탄소',   formula: 'CO₂',      elements: {C:1, O:2},       category: 'oxide',        score: 22,  grade: 1 },
  { id: 'CH4',     name: '메탄',         formula: 'CH₄',      elements: {C:1, H:4},       category: 'hydrocarbon',  score: 10,  grade: 1 },
  { id: 'C2H2',    name: '아세틸렌',     formula: 'C₂H₂',     elements: {C:2, H:2},       category: 'hydrocarbon',  score: 14,  grade: 1 },
  { id: 'C2H4',    name: '에틸렌',       formula: 'C₂H₄',     elements: {C:2, H:4},       category: 'hydrocarbon',  score: 16,  grade: 1 },
  { id: 'C2H6',    name: '에탄',         formula: 'C₂H₆',     elements: {C:2, H:6},       category: 'hydrocarbon',  score: 18,  grade: 1 },
  { id: 'C3H8',    name: '프로판',       formula: 'C₃H₈',     elements: {C:3, H:8},       category: 'hydrocarbon',  score: 26,  grade: 1 },
  { id: 'C6H6',    name: '벤젠',         formula: 'C₆H₆',     elements: {C:6, H:6},       category: 'hydrocarbon',  score: 42,  grade: 1 },
  { id: 'HCHO',    name: '폼알데하이드', formula: 'HCHO',      elements: {C:1, H:2, O:1},  category: 'aldehyde',     score: 16,  grade: 1 },
  { id: 'CH3CHO',  name: '아세트알데하이드', formula: 'CH₃CHO', elements: {C:2, H:4, O:1}, category: 'aldehyde',    score: 24,  grade: 1 },
  { id: 'CH3OH',   name: '메탄올',       formula: 'CH₃OH',    elements: {C:1, H:4, O:1},  category: 'alcohol',      score: 18,  grade: 1 },
  { id: 'C2H5OH',  name: '에탄올',       formula: 'C₂H₅OH',   elements: {C:2, H:6, O:1},  category: 'alcohol',      score: 26,  grade: 1 },
  { id: 'HCOOH',   name: '폼산',         formula: 'HCOOH',    elements: {C:1, H:2, O:2},  category: 'organic_acid', score: 24,  grade: 1 },
  { id: 'CH3COOH', name: '아세트산',     formula: 'CH₃COOH',  elements: {C:2, H:4, O:2},  category: 'organic_acid', score: 32,  grade: 1 },
  { id: 'C6H12O6', name: '포도당',       formula: 'C₆H₁₂O₆',  elements: {C:6, H:12, O:6}, category: 'sugar',        score: 96,  grade: 1 },

  // === Grade 2: N, F, Na, Mg, P, S, Cl, Ca ===
  { id: 'HF',      name: '플루오린화수소', formula: 'HF',      elements: {H:1, F:1},         category: 'acid', score: 10,  grade: 2 },
  { id: 'HCl',     name: '염화수소',     formula: 'HCl',      elements: {H:1, Cl:1},        category: 'acid', score: 18,  grade: 2 },
  { id: 'H2S',     name: '황화수소',     formula: 'H₂S',      elements: {H:2, S:1},         category: 'acid', score: 18,  grade: 2 },
  { id: 'HNO2',    name: '아질산',       formula: 'HNO₂',     elements: {H:1, N:1, O:2},    category: 'acid', score: 24,  grade: 2 },
  { id: 'HNO3',    name: '질산',         formula: 'HNO₃',     elements: {H:1, N:1, O:3},    category: 'acid', score: 32,  grade: 2 },
  { id: 'H2SO4',   name: '황산',         formula: 'H₂SO₄',    elements: {H:2, S:1, O:4},    category: 'acid', score: 50,  grade: 2 },
  { id: 'H3PO4',   name: '인산',         formula: 'H₃PO₄',    elements: {H:3, P:1, O:4},    category: 'acid', score: 50,  grade: 2 },
  { id: 'NH3',     name: '암모니아',     formula: 'NH₃',      elements: {N:1, H:3},         category: 'base', score: 10,  grade: 2 },
  { id: 'NaOH',    name: '수산화나트륨', formula: 'NaOH',     elements: {Na:1, O:1, H:1},   category: 'base', score: 20,  grade: 2 },
  { id: 'MgOH2',   name: '수산화마그네슘', formula: 'Mg(OH)₂', elements: {Mg:1, O:2, H:2},  category: 'base', score: 30,  grade: 2 },
  { id: 'CaOH2',   name: '수산화칼슘',   formula: 'Ca(OH)₂',  elements: {Ca:1, O:2, H:2},   category: 'base', score: 38,  grade: 2 },
  { id: 'MgO',     name: '산화마그네슘', formula: 'MgO',      elements: {Mg:1, O:1},        category: 'oxide', score: 20,  grade: 2 },
  { id: 'CaO',     name: '산화칼슘',     formula: 'CaO',      elements: {Ca:1, O:1},        category: 'oxide', score: 28,  grade: 2 },
  { id: 'NO',      name: '일산화질소',   formula: 'NO',        elements: {N:1, O:1},         category: 'oxide', score: 15,  grade: 2 },
  { id: 'NO2',     name: '이산화질소',   formula: 'NO₂',      elements: {N:1, O:2},         category: 'oxide', score: 23,  grade: 2 },
  { id: 'N2O',     name: '아산화질소',   formula: 'N₂O',      elements: {N:2, O:1},         category: 'oxide', score: 22,  grade: 2 },
  { id: 'SO2',     name: '이산화황',     formula: 'SO₂',      elements: {S:1, O:2},         category: 'oxide', score: 32,  grade: 2 },
  { id: 'SO3',     name: '삼산화황',     formula: 'SO₃',      elements: {S:1, O:3},         category: 'oxide', score: 40,  grade: 2 },
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

  // Esters
  { id: 'CH3COOCH3',  name: '아세트산메틸', formula: 'CH₃COOCH₃',  elements: {C:3, H:6, O:2}, category: 'ester', score: 32, grade: 1 },
  { id: 'CH3COOC2H5', name: '아세트산에틸', formula: 'CH₃COOC₂H₅', elements: {C:4, H:8, O:2}, category: 'ester', score: 40, grade: 1 },
];

// Reaction chains: always active — if both reactants are formed this turn, product auto-synthesized at 0.5× score
const REACTION_CHAINS = [
  { reactants: ['CO2', 'H2O'],    product: 'H2CO3',   label: 'CO₂+H₂O→H₂CO₃' },
  { reactants: ['CO', 'H2O'],     product: 'CO2',     label: 'CO+H₂O→CO₂(수성가스)' },
  { reactants: ['CH3CHO', 'H2O'], product: 'CH3COOH', label: 'CH₃CHO+H₂O→CH₃COOH' },
  { reactants: ['C2H4', 'H2O'],   product: 'C2H5OH',  label: 'C₂H₄+H₂O→C₂H₅OH(수화)' },
  { reactants: ['HCHO', 'H2O'],   product: 'CH3OH',   label: 'HCHO+H₂O→CH₃OH(환원)' },
  { reactants: ['NH3', 'HCl'],    product: 'NH4Cl',   label: 'NH₃+HCl→NH₄Cl' },
  { reactants: ['SO3', 'H2O'],    product: 'H2SO4',   label: 'SO₃+H₂O→H₂SO₄' },
  { reactants: ['CaO', 'H2O'],    product: 'CaOH2',   label: 'CaO+H₂O→Ca(OH)₂' },
  { reactants: ['NO', 'CO2'],     product: 'NO2',     label: 'NO+CO₂→NO₂(산화)' },
  { reactants: ['SO2', 'H2O'],    product: 'H2CO3',   label: 'SO₂+H₂O→H₂SO₃' },
];

// Neutralization pairs: acid + base
const NEUTRALIZATION_PAIRS = [
  { acid: 'HCl',  base: 'NaOH',  salt: 'NaCl'   },
  { acid: 'HCl',  base: 'CaOH2', salt: 'CaCO3'  },
  { acid: 'HNO3', base: 'NH3',   salt: 'NH4NO3' },
  { acid: 'H2SO4',base: 'NaOH',  salt: 'Na2SO4' },
  { acid: 'HCl',  base: 'KOH',   salt: 'KCl'    },
];

// Combustion: organic + CO2 + H2O
const COMBUSTION_RULES = [
  { organic: 'CH4',    co2: 1, h2o: 2, multiplier: 1.5 },
  { organic: 'C2H5OH', co2: 2, h2o: 3, multiplier: 1.5 },
  { organic: 'C6H6',   co2: 6, h2o: 3, multiplier: 2.0 },
  { organic: 'C6H12O6',co2: 6, h2o: 6, multiplier: 1.8 },
  { organic: 'C3H8',   co2: 3, h2o: 4, multiplier: 1.5 },
  { organic: 'CH3OH',  co2: 1, h2o: 2, multiplier: 1.5 },
];

// Catalyst rules
const CATALYST_RULES = [
  { catalyst: 'H2SO4', targets: ['organic_acid','alcohol','aldehyde','ester','hydrocarbon','sugar'], multiplier: 1.3 },
  { catalyst: 'Fe2O3', targets: ['oxide'], multiplier: 1.2 },
  { catalyst: 'MnO2',  targets: ['oxide','acid','base'], multiplier: 1.4 },
  { catalyst: 'Al2O3', targets: ['salt'], multiplier: 1.2 },
];

// Homologous series
const HOMOLOGOUS_SERIES = [
  { name: '알케인',      ids: ['CH4','C2H6','C3H8'],  bonus: 10 },
  { name: '알켄',        ids: ['C2H4','C2H2'],         bonus: 10 },
  { name: '알코올',      ids: ['CH3OH','C2H5OH'],      bonus: 12 },
  { name: '유기산',      ids: ['HCOOH','CH3COOH'],     bonus: 12 },
  { name: '알데하이드',  ids: ['HCHO','CH3CHO'],       bonus: 10 },
];

// 5-turn round thresholds (cumulative score required per round)
const ROUND_THRESHOLDS = [100, 280, 560, 1100, 2000];

// Shop costs by grade (in tokens)
const SHOP_COSTS = { 1: 0, 2: 10, 3: 22, 4: 40, 5: 75 };

// Token reward table
const TOKEN_REWARDS = {
  compound:     { grade1: 2, grade2: 4, grade3: 7, grade4: 12 },
  interaction:  { perInteraction: 3 },
  boardReaction:{ perReaction: 5 },
};

// Unlockable synergy pool — selected by player after each turn
const SYNERGY_POOL = {
  category_synergy: {
    name: '분류 시너지', icon: '📦',
    description: '같은 분류 화합물 2개+ → 각 화합물 보너스pt',
    levels: [
      { bonusTable: { acid:4, base:4, salt:5, oxide:2, hydrocarbon:4, alcohol:5, organic_acid:6, ester:7 } },
      { bonusTable: { acid:8, base:8, salt:10, oxide:5, hydrocarbon:8, alcohol:10, organic_acid:12, ester:15 } },
      { bonusTable: { acid:12, base:12, salt:15, oxide:8, hydrocarbon:12, alcohol:15, organic_acid:18, ester:22 } },
    ],
  },
  neutralization: {
    name: '중화 반응', icon: '⚗️',
    description: '산+염기 쌍 생성 → 각 +보너스pt',
    levels: [{ bonus: 8 }, { bonus: 15 }, { bonus: 25 }],
  },
  combustion: {
    name: '연소 반응', icon: '🔥',
    description: '유기물+CO₂+H₂O 동시 → 유기물 배율',
    levels: [{ multiplierScale: 0.7 }, { multiplierScale: 1.0 }, { multiplierScale: 1.3 }],
  },
  catalyst: {
    name: '촉매', icon: '⚡',
    description: '촉매 화합물 → 대상 분류 배율 (촉매 0.5×)',
    levels: [{ targetScale: 0.7 }, { targetScale: 1.0 }, { targetScale: 1.3 }],
  },
  homologous_series: {
    name: '동족열 시너지', icon: '🧬',
    description: '같은 유기계열 2개+ → 각 보너스pt',
    levels: [{ bonusScale: 0.6 }, { bonusScale: 1.0 }, { bonusScale: 1.8 }],
  },
};

// Board reactions: manually triggered by selecting compounds on the persistent board
const BOARD_REACTIONS = [
  { id: 'board_hcl_naoh',   reactants: ['HCl','NaOH'],   product: 'NaCl',   label: 'HCl + NaOH → NaCl',      tokenBonus: 5 },
  { id: 'board_h2so4_naoh', reactants: ['H2SO4','NaOH'], product: 'Na2SO4', label: 'H₂SO₄ + NaOH → Na₂SO₄',  tokenBonus: 6 },
  { id: 'board_hno3_nh3',   reactants: ['HNO3','NH3'],   product: 'NH4NO3', label: 'HNO₃ + NH₃ → NH₄NO₃',    tokenBonus: 5 },
  { id: 'board_hcl_koh',    reactants: ['HCl','KOH'],    product: 'KCl',    label: 'HCl + KOH → KCl',          tokenBonus: 5 },
  { id: 'board_so3_h2o',    reactants: ['SO3','H2O'],    product: 'H2SO4',  label: 'SO₃ + H₂O → H₂SO₄',       tokenBonus: 6 },
  { id: 'board_cao_h2o',    reactants: ['CaO','H2O'],    product: 'CaOH2',  label: 'CaO + H₂O → Ca(OH)₂',     tokenBonus: 5 },
  { id: 'board_nh3_hcl',    reactants: ['NH3','HCl'],    product: 'NH4Cl',  label: 'NH₃ + HCl → NH₄Cl',       tokenBonus: 5 },
  { id: 'board_co2_h2o',    reactants: ['CO2','H2O'],    product: 'H2CO3',  label: 'CO₂ + H₂O → H₂CO₃',      tokenBonus: 4 },
  { id: 'board_co_h2o',     reactants: ['CO','H2O'],     product: 'CO2',    label: 'CO + H₂O → CO₂',           tokenBonus: 4 },
  { id: 'board_c2h4_h2o',   reactants: ['C2H4','H2O'],  product: 'C2H5OH', label: 'C₂H₄ + H₂O → C₂H₅OH',    tokenBonus: 5 },
  { id: 'board_hcho_h2o',   reactants: ['HCHO','H2O'],  product: 'CH3OH',  label: 'HCHO + H₂O → CH₃OH',      tokenBonus: 4 },
  { id: 'board_no_co2',     reactants: ['NO','CO2'],     product: 'NO2',    label: 'NO + CO₂ → NO₂',           tokenBonus: 4 },
];
