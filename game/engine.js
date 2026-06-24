// Game Engine

class GameState {
  constructor() {
    this.turn = 1;
    this.researchPoints = 0;
    this.totalResearchPoints = 0;
    this.deck = this.buildInitialDeck();
    this.hand = [];
    this.discard = [];
    this.formedCompounds = [];
    this.usedElementIds = new Set();
    this.turnScore = 0;
    this.log = [];
    this.gameOver = false;
    this.phase = 'draw';
    this.shopCards = [];
    this.interactionsThisTurn = new Set();
    this.bonusLines = [];
    // 5-turn period tracking
    this.periodScore = 0;   // cumulative score within current period
    this.periodTurn = 0;    // turns completed in current period (0-4)
    this.periodNum = 1;     // which period we're in (1-based)
  }

  buildInitialDeck() {
    const cards = [];
    let id = 0;
    const add = (sym, count) => {
      for (let i = 0; i < count; i++) cards.push({ id: id++, symbol: sym });
    };
    add('H', 5);
    add('C', 4);
    add('O', 3);
    return shuffle(cards);
  }

  getThreshold() {
    if (this.turn <= THRESHOLDS.length) return THRESHOLDS[this.turn - 1];
    let t = THRESHOLDS[THRESHOLDS.length - 1];
    for (let i = THRESHOLDS.length; i < this.turn; i++) t = Math.round(t * 1.4);
    return t;
  }

  getPeriodThreshold() {
    const idx = Math.min(this.periodNum - 1, PERIOD_THRESHOLDS.length - 1);
    if (this.periodNum <= PERIOD_THRESHOLDS.length) return PERIOD_THRESHOLDS[idx];
    let t = PERIOD_THRESHOLDS[PERIOD_THRESHOLDS.length - 1];
    for (let i = PERIOD_THRESHOLDS.length; i < this.periodNum; i++) t = Math.round(t * 2.0);
    return t;
  }

  drawPhase() {
    if (this.deck.length < 8) {
      this.deck = shuffle([...this.deck, ...this.discard]);
      this.discard = [];
    }
    this.hand = this.deck.splice(0, 8);
    this.formedCompounds = [];
    this.usedElementIds = new Set();
    this.turnScore = 0;
    this.interactionsThisTurn = new Set();
    this.bonusLines = [];
    this.log = [];
    this.phase = 'build';
  }

  // Try to form a compound from selected card ids
  formCompound(cardIds, compoundId) {
    const compound = COMPOUNDS.find(c => c.id === compoundId);
    if (!compound) return { ok: false, msg: '알 수 없는 화합물' };

    // Check no card already used
    for (const id of cardIds) {
      if (this.usedElementIds.has(id)) return { ok: false, msg: '이미 사용된 카드' };
    }

    // Count symbols from selected cards
    const selectedCards = this.hand.filter(c => cardIds.includes(c.id));
    const symbolCount = {};
    for (const card of selectedCards) {
      symbolCount[card.symbol] = (symbolCount[card.symbol] || 0) + 1;
    }

    // Validate against compound requirements
    for (const [sym, needed] of Object.entries(compound.elements)) {
      if ((symbolCount[sym] || 0) < needed) {
        return { ok: false, msg: `${sym} 부족 (필요: ${needed})` };
      }
    }
    // Check no extra cards
    const totalNeeded = Object.values(compound.elements).reduce((a, b) => a + b, 0);
    if (cardIds.length !== totalNeeded) {
      return { ok: false, msg: `카드 수 불일치 (필요: ${totalNeeded}장)` };
    }

    // Mark cards as used
    for (const id of cardIds) this.usedElementIds.add(id);

    // Add to formed compounds
    const existing = this.formedCompounds.find(fc => fc.compound.id === compoundId);
    if (existing) {
      existing.count++;
    } else {
      this.formedCompounds.push({ compound, count: 1 });
    }

    this.log.push(`✅ ${compound.name} (${compound.formula}) 합성! 기본 ${compound.score}점`);
    return { ok: true };
  }

  // Calculate final score for the turn
  scorePhase() {
    if (this.formedCompounds.length === 0) {
      this.turnScore = 0;
      this.phase = 'score';
      return;
    }

    const formed = this.formedCompounds;
    const compoundMap = {}; // id -> {compound, count, score, bonuses}
    for (const fc of formed) {
      compoundMap[fc.compound.id] = {
        compound: fc.compound,
        count: fc.count,
        baseScore: fc.compound.score * fc.count,
        bonusScore: 0,
        multiplier: 1.0,
      };
    }

    const allIds = new Set(formed.map(fc => fc.compound.id));
    const allCategories = formed.flatMap(fc =>
      Array(fc.count).fill(fc.compound.category)
    );

    // ── 7-2 Category Synergy ──
    const catCounts = {};
    for (const cat of allCategories) catCounts[cat] = (catCounts[cat] || 0) + 1;
    const CAT_BONUS = {
      acid: [2, 8], base: [2, 8], salt: [2, 10],
      oxide: [3, 5], hydrocarbon: [2, 8], alcohol: [2, 10],
      organic_acid: [2, 12], ester: [2, 15],
    };
    for (const [cat, [minCount, bonus]] of Object.entries(CAT_BONUS)) {
      if ((catCounts[cat] || 0) >= minCount) {
        this.interactionsThisTurn.add('category_synergy');
        const affected = formed.filter(fc => fc.compound.category === cat);
        for (const fc of affected) {
          const b = bonus * fc.count;
          compoundMap[fc.compound.id].bonusScore += b;
          this.bonusLines.push(`📦 분류 시너지 [${cat}]: ${fc.compound.name} +${b}pt`);
        }
      }
    }

    // ── 7-3 Neutralization ──
    for (const pair of NEUTRALIZATION_PAIRS) {
      if (allIds.has(pair.acid) && allIds.has(pair.base)) {
        this.interactionsThisTurn.add('neutralization');
        const acidEntry = compoundMap[pair.acid];
        const baseEntry = compoundMap[pair.base];
        acidEntry.bonusScore += 15;
        baseEntry.bonusScore += 15;
        this.bonusLines.push(`⚗️ 중화 반응: ${acidEntry.compound.name}+${baseEntry.compound.name} 각 +15pt`);
      }
    }

    // ── 7-1 Reaction Chain ──
    for (const chain of REACTION_CHAINS) {
      if (chain.reactants.every(r => allIds.has(r))) {
        const product = COMPOUNDS.find(c => c.id === chain.product);
        if (product && !allIds.has(product.id)) {
          this.interactionsThisTurn.add('reaction_chain');
          const chainScore = Math.round(product.score * 0.5);
          if (!compoundMap[product.id]) {
            compoundMap[product.id] = { compound: product, count: 0, baseScore: 0, bonusScore: chainScore, multiplier: 1.0 };
          } else {
            compoundMap[product.id].bonusScore += chainScore;
          }
          this.bonusLines.push(`🔗 반응 연계 [${chain.label}]: +${chainScore}pt`);
        }
      }
    }

    // ── 7-7 Combustion ──
    const co2Count = (compoundMap['CO2']?.count || 0);
    const h2oCount = (compoundMap['H2O']?.count || 0);
    for (const rule of COMBUSTION_RULES) {
      if (allIds.has(rule.organic) && co2Count >= rule.co2 && h2oCount >= rule.h2o) {
        this.interactionsThisTurn.add('combustion');
        const entry = compoundMap[rule.organic];
        const oldBase = entry.baseScore;
        entry.multiplier *= rule.multiplier;
        this.bonusLines.push(`🔥 연소 반응: ${entry.compound.name} ×${rule.multiplier}`);
      }
    }

    // ── 7-4 Catalyst ──
    for (const rule of CATALYST_RULES) {
      if (allIds.has(rule.catalyst)) {
        this.interactionsThisTurn.add('catalyst');
        const catalystEntry = compoundMap[rule.catalyst];
        // Catalyst itself at 0.5x
        catalystEntry.multiplier *= 0.5;
        // Boost targets
        for (const entry of Object.values(compoundMap)) {
          if (entry.compound.id !== rule.catalyst && rule.targets.includes(entry.compound.category)) {
            entry.multiplier *= rule.multiplier;
            this.bonusLines.push(`⚡ 촉매 [${compoundMap[rule.catalyst].compound.name}→${entry.compound.name}] ×${rule.multiplier}`);
          }
        }
      }
    }

    // ── 7-11 Homologous Series Synergy ──
    for (const series of HOMOLOGOUS_SERIES) {
      const matches = series.ids.filter(id => allIds.has(id));
      if (matches.length >= 2) {
        this.interactionsThisTurn.add('homologous_series');
        const mult = matches.length >= 3 ? 2 : 1;
        for (const id of matches) {
          const b = series.bonus * mult * (compoundMap[id]?.count || 1);
          if (compoundMap[id]) compoundMap[id].bonusScore += b;
          this.bonusLines.push(`🧬 동족체 [${series.name}]: ${COMPOUNDS.find(c=>c.id===id)?.name} +${b}pt`);
        }
      }
    }

    // ── 7-12 Industrial Synthesis Routes ──
    for (const route of SYNTHESIS_ROUTES) {
      const reqs = route.requires;
      if (reqs.every(r => allIds.has(r))) {
        this.interactionsThisTurn.add('synthesis_route');
        this.bonusLines.push(`🏭 산업 합성 루트 [${route.name}]: +${route.bonus}pt`);
        // Add bonus as flat
        const firstEntry = Object.values(compoundMap)[0];
        firstEntry.bonusScore += route.bonus;
      }
    }

    // ── 7-13 Combo Multiplier ──
    const comboCount = this.interactionsThisTurn.size;
    const COMBO_MULT = [1.0, 1.0, 1.2, 1.5, 1.8, 2.5];
    const comboMult = COMBO_MULT[Math.min(comboCount, COMBO_MULT.length - 1)];
    // update interaction display name

    if (comboCount >= 2) {
      this.bonusLines.push(`✨ 콤보 배율 (${comboCount}종): ×${comboMult}`);
    }

    // Sum all scores
    let total = 0;
    for (const entry of Object.values(compoundMap)) {
      const s = Math.round((entry.baseScore + entry.bonusScore) * entry.multiplier);
      total += s;
    }
    this.turnScore = Math.round(total * comboMult);

    // Discard used cards
    for (const card of this.hand) {
      if (this.usedElementIds.has(card.id)) {
        this.discard.push(card);
      }
    }
    // Unused cards also discarded
    for (const card of this.hand) {
      if (!this.usedElementIds.has(card.id)) {
        this.discard.push(card);
      }
    }

    this.phase = 'score';
  }

  judgePhase() {
    this.periodScore += this.turnScore;
    this.periodTurn++;

    const isEndOfPeriod = this.periodTurn === 5;

    if (isEndOfPeriod) {
      const target = this.getPeriodThreshold();
      if (this.periodScore >= target) {
        const earned = this.periodScore - target;
        this.researchPoints += earned;
        this.totalResearchPoints += earned;
        this.log.push(`🎉 ${this.periodNum}기 통과! 누적 ${this.periodScore}pt / 목표 ${target}pt`);
        this.log.push(`💰 +${earned} 연구 포인트 획득`);
        this.periodNum++;
        this.periodScore = 0;
        this.periodTurn = 0;
        this.generateShop();
        this.phase = 'shop';
      } else {
        this.log.push(`💀 ${this.periodNum}기 실패. 누적 ${this.periodScore}pt / 목표 ${target}pt`);
        this.gameOver = true;
        this.phase = 'gameover';
      }
    } else {
      const target = this.getPeriodThreshold();
      const remaining = 5 - this.periodTurn;
      this.log.push(`📈 이번 턴 ${this.turnScore}pt → 구간 누적 ${this.periodScore}pt (목표 ${target}pt, 남은 턴 ${remaining})`);
      this.phase = 'nextturn';
    }
  }

  generateShop() {
    // Determine available grades
    const maxGrade = this.turn >= 10 ? 4 : this.turn >= 5 ? 3 : 2;
    const pool = Object.entries(ELEMENTS)
      .filter(([sym, el]) => el.grade >= 2 && el.grade <= maxGrade)
      .map(([sym]) => sym);
    // Pick 4 random
    const shuffled = shuffle([...pool]);
    this.shopCards = shuffled.slice(0, 4).map(sym => ({
      symbol: sym,
      element: ELEMENTS[sym],
      cost: SHOP_COSTS[ELEMENTS[sym].grade],
    }));
  }

  buyCard(symbol) {
    const shopItem = this.shopCards.find(c => c.symbol === symbol);
    if (!shopItem) return { ok: false, msg: '상점에 없는 원소' };
    if (this.researchPoints < shopItem.cost) return { ok: false, msg: '연구 포인트 부족' };
    this.researchPoints -= shopItem.cost;
    // Add to discard pile
    const newId = Date.now() + Math.random();
    this.discard.push({ id: newId, symbol });
    this.log.push(`🛒 ${ELEMENTS[symbol].name}(${symbol}) 획득!`);
    // Remove from shop
    this.shopCards = this.shopCards.filter(c => c.symbol !== symbol);
    return { ok: true };
  }

  nextTurn() {
    this.turn++;
    this.hand = [];
    this.phase = 'draw';
  }

  // Get all valid compounds formable from a given multiset of symbols
  getFormableCompounds(symbolCounts) {
    return COMPOUNDS.filter(c => {
      for (const [sym, needed] of Object.entries(c.elements)) {
        if ((symbolCounts[sym] || 0) < needed) return false;
      }
      const total = Object.values(c.elements).reduce((a, b) => a + b, 0);
      const available = Object.values(symbolCounts).reduce((a, b) => a + b, 0);
      return total <= available;
    });
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
