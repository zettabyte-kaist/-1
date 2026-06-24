// Game Engine

class GameState {
  constructor() {
    this.turn = 1;
    this.tokens = 0;
    this.totalTokensEarned = 0;
    this.tokensThisTurn = 0;
    this.deck = this.buildInitialDeck();
    this.hand = [];
    this.discard = [];
    this.formedCompounds = [];   // current turn only
    this.boardCompounds = [];    // persists across turns within a round
    this.usedElementIds = new Set();
    this.turnScore = 0;
    this.log = [];
    this.gameOver = false;
    this.phase = 'draw';
    this.shopCards = [];
    this.interactionsThisTurn = new Set();
    this.bonusLines = [];
    // Round tracking (5 turns per round)
    this.roundScore = 0;   // cumulative score within current round
    this.roundTurn = 0;    // turns completed in current round (0-4)
    this.roundNum = 1;     // which round we're in (1-based)
    // Synergy system
    this.unlockedSynergies = {};   // { key: { level: 1|2|3 } }
    this.synergyPickOptions = [];  // 3 keys shown to player after each turn
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

  getRoundThreshold() {
    const idx = Math.min(this.roundNum - 1, ROUND_THRESHOLDS.length - 1);
    if (this.roundNum <= ROUND_THRESHOLDS.length) return ROUND_THRESHOLDS[idx];
    let t = ROUND_THRESHOLDS[ROUND_THRESHOLDS.length - 1];
    for (let i = ROUND_THRESHOLDS.length; i < this.roundNum; i++) t = Math.round(t * 2.0);
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
    this.tokensThisTurn = 0;
    this.interactionsThisTurn = new Set();
    this.bonusLines = [];
    this.log = [];
    this.phase = 'build';
    // boardCompounds intentionally NOT cleared here — persists across turns
  }

  formCompound(cardIds, compoundId) {
    const compound = COMPOUNDS.find(c => c.id === compoundId);
    if (!compound) return { ok: false, msg: '알 수 없는 화합물' };

    for (const id of cardIds) {
      if (this.usedElementIds.has(id)) return { ok: false, msg: '이미 사용된 카드' };
    }

    const selectedCards = this.hand.filter(c => cardIds.includes(c.id));
    const symbolCount = {};
    for (const card of selectedCards) {
      symbolCount[card.symbol] = (symbolCount[card.symbol] || 0) + 1;
    }

    for (const [sym, needed] of Object.entries(compound.elements)) {
      if ((symbolCount[sym] || 0) < needed) {
        return { ok: false, msg: `${sym} 부족 (필요: ${needed})` };
      }
    }
    const totalNeeded = Object.values(compound.elements).reduce((a, b) => a + b, 0);
    if (cardIds.length !== totalNeeded) {
      return { ok: false, msg: `카드 수 불일치 (필요: ${totalNeeded}장)` };
    }

    for (const id of cardIds) this.usedElementIds.add(id);

    // Add to formedCompounds (current turn)
    const existing = this.formedCompounds.find(fc => fc.compound.id === compoundId);
    if (existing) {
      existing.count++;
    } else {
      this.formedCompounds.push({ compound, count: 1 });
    }

    // Add to boardCompounds (persistent)
    const boardExisting = this.boardCompounds.find(bc => bc.compound.id === compoundId);
    if (boardExisting) {
      boardExisting.count++;
    } else {
      this.boardCompounds.push({ compound, count: 1 });
    }

    this.log.push(`✅ ${compound.name} (${compound.formula}) 합성! 기본 ${compound.score}점`);
    return { ok: true };
  }

  getValidBoardReactions(selectedCompoundIds) {
    const selectedCounts = {};
    for (const id of selectedCompoundIds) {
      selectedCounts[id] = (selectedCounts[id] || 0) + 1;
    }
    const boardCounts = {};
    for (const bc of this.boardCompounds) {
      boardCounts[bc.compound.id] = bc.count;
    }
    return BOARD_REACTIONS.filter(r => {
      const needed = {};
      for (const reactant of r.reactants) {
        needed[reactant] = (needed[reactant] || 0) + 1;
      }
      // Must exactly match selection
      if (Object.keys(needed).length !== Object.keys(selectedCounts).length) return false;
      for (const [id, count] of Object.entries(needed)) {
        if ((selectedCounts[id] || 0) !== count) return false;
        if ((boardCounts[id] || 0) < count) return false;
      }
      return true;
    });
  }

  executeBoardReaction(reactionId) {
    const reaction = BOARD_REACTIONS.find(r => r.id === reactionId);
    if (!reaction) return { ok: false, msg: '알 수 없는 반응' };

    const needed = {};
    for (const reactant of reaction.reactants) {
      needed[reactant] = (needed[reactant] || 0) + 1;
    }
    for (const [id, count] of Object.entries(needed)) {
      const bc = this.boardCompounds.find(b => b.compound.id === id);
      if (!bc || bc.count < count) return { ok: false, msg: `${id} 부족` };
    }

    // Consume reactants
    for (const [id, count] of Object.entries(needed)) {
      const bc = this.boardCompounds.find(b => b.compound.id === id);
      bc.count -= count;
    }
    this.boardCompounds = this.boardCompounds.filter(b => b.count > 0);

    // Add product
    const productCompound = COMPOUNDS.find(c => c.id === reaction.product);
    if (productCompound) {
      const existing = this.boardCompounds.find(b => b.compound.id === reaction.product);
      if (existing) {
        existing.count++;
      } else {
        this.boardCompounds.push({ compound: productCompound, count: 1 });
      }
    }

    const tokenGain = TOKEN_REWARDS.boardReaction.perReaction + reaction.tokenBonus;
    this.tokens += tokenGain;
    this.totalTokensEarned += tokenGain;
    this.tokensThisTurn += tokenGain;
    this.log.push(`⚗️ 보드 반응: ${reaction.label} +${tokenGain}🪙`);
    return { ok: true, product: productCompound };
  }

  scorePhase() {
    if (this.formedCompounds.length === 0) {
      this.turnScore = 0;
      this.phase = 'interact';
      return;
    }

    const formed = this.formedCompounds;
    const compoundMap = {};
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
    const allCategories = formed.flatMap(fc => Array(fc.count).fill(fc.compound.category));

    // ── Category Synergy (unlockable) ──
    if (this.unlockedSynergies.category_synergy) {
      const level = this.unlockedSynergies.category_synergy.level;
      const bonusTable = SYNERGY_POOL.category_synergy.levels[level - 1].bonusTable;
      const catCounts = {};
      for (const cat of allCategories) catCounts[cat] = (catCounts[cat] || 0) + 1;
      for (const [cat, bonus] of Object.entries(bonusTable)) {
        if ((catCounts[cat] || 0) >= 2) {
          this.interactionsThisTurn.add('category_synergy');
          const affected = formed.filter(fc => fc.compound.category === cat);
          for (const fc of affected) {
            const b = bonus * fc.count;
            compoundMap[fc.compound.id].bonusScore += b;
            this.bonusLines.push(`📦 분류 시너지 Lv${level} [${cat}]: ${fc.compound.name} +${b}pt`);
          }
        }
      }
    }

    // ── Neutralization (unlockable) ──
    if (this.unlockedSynergies.neutralization) {
      const level = this.unlockedSynergies.neutralization.level;
      const bonus = SYNERGY_POOL.neutralization.levels[level - 1].bonus;
      for (const pair of NEUTRALIZATION_PAIRS) {
        if (allIds.has(pair.acid) && allIds.has(pair.base)) {
          this.interactionsThisTurn.add('neutralization');
          compoundMap[pair.acid].bonusScore += bonus;
          compoundMap[pair.base].bonusScore += bonus;
          this.bonusLines.push(`⚗️ 중화 반응 Lv${level}: ${compoundMap[pair.acid].compound.name}+${compoundMap[pair.base].compound.name} 각 +${bonus}pt`);
        }
      }
    }

    // ── Reaction Chain (always active) ──
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

    // ── Combustion (unlockable) ──
    if (this.unlockedSynergies.combustion) {
      const level = this.unlockedSynergies.combustion.level;
      const scale = SYNERGY_POOL.combustion.levels[level - 1].multiplierScale;
      const co2Count = (compoundMap['CO2']?.count || 0);
      const h2oCount = (compoundMap['H2O']?.count || 0);
      for (const rule of COMBUSTION_RULES) {
        if (allIds.has(rule.organic) && co2Count >= rule.co2 && h2oCount >= rule.h2o) {
          this.interactionsThisTurn.add('combustion');
          const entry = compoundMap[rule.organic];
          const adjustedMult = 1 + (rule.multiplier - 1) * scale;
          entry.multiplier *= adjustedMult;
          this.bonusLines.push(`🔥 연소 반응 Lv${level}: ${entry.compound.name} ×${adjustedMult.toFixed(2)}`);
        }
      }
    }

    // ── Catalyst (unlockable) ──
    if (this.unlockedSynergies.catalyst) {
      const level = this.unlockedSynergies.catalyst.level;
      const targetScale = SYNERGY_POOL.catalyst.levels[level - 1].targetScale;
      for (const rule of CATALYST_RULES) {
        if (allIds.has(rule.catalyst)) {
          this.interactionsThisTurn.add('catalyst');
          const catalystEntry = compoundMap[rule.catalyst];
          catalystEntry.multiplier *= 0.5;
          for (const entry of Object.values(compoundMap)) {
            if (entry.compound.id !== rule.catalyst && rule.targets.includes(entry.compound.category)) {
              const adjustedMult = 1 + (rule.multiplier - 1) * targetScale;
              entry.multiplier *= adjustedMult;
              this.bonusLines.push(`⚡ 촉매 Lv${level} [${catalystEntry.compound.name}→${entry.compound.name}] ×${adjustedMult.toFixed(2)}`);
            }
          }
        }
      }
    }

    // ── Homologous Series (unlockable) ──
    if (this.unlockedSynergies.homologous_series) {
      const level = this.unlockedSynergies.homologous_series.level;
      const bonusScale = SYNERGY_POOL.homologous_series.levels[level - 1].bonusScale;
      for (const series of HOMOLOGOUS_SERIES) {
        const matches = series.ids.filter(id => allIds.has(id));
        if (matches.length >= 2) {
          this.interactionsThisTurn.add('homologous_series');
          const mult = matches.length >= 3 ? 2 : 1;
          for (const id of matches) {
            const b = Math.round(series.bonus * mult * bonusScale * (compoundMap[id]?.count || 1));
            if (compoundMap[id]) compoundMap[id].bonusScore += b;
            this.bonusLines.push(`🧬 동족열 Lv${level} [${series.name}]: ${COMPOUNDS.find(c => c.id === id)?.name} +${b}pt`);
          }
        }
      }
    }

    // ── Combo Multiplier (always active) ──
    const comboCount = this.interactionsThisTurn.size;
    const COMBO_MULT = [1.0, 1.0, 1.2, 1.5, 1.8, 2.5];
    const comboMult = COMBO_MULT[Math.min(comboCount, COMBO_MULT.length - 1)];
    if (comboCount >= 2) {
      this.bonusLines.push(`✨ 콤보 배율 (${comboCount}종): ×${comboMult}`);
    }

    // Sum all scores
    let total = 0;
    for (const entry of Object.values(compoundMap)) {
      total += Math.round((entry.baseScore + entry.bonusScore) * entry.multiplier);
    }
    this.turnScore = Math.round(total * comboMult);

    // Award tokens for compounds and interactions
    let compoundTokens = 0;
    for (const fc of formed) {
      const gradeKey = `grade${fc.compound.grade}`;
      compoundTokens += (TOKEN_REWARDS.compound[gradeKey] || 0) * fc.count;
    }
    const interactionTokens = this.interactionsThisTurn.size * TOKEN_REWARDS.interaction.perInteraction;
    const totalTokenGain = compoundTokens + interactionTokens;
    if (totalTokenGain > 0) {
      this.tokens += totalTokenGain;
      this.totalTokensEarned += totalTokenGain;
      this.tokensThisTurn += totalTokenGain;
      this.bonusLines.push(`🪙 +${totalTokenGain} 토큰 (화합물 ${compoundTokens} + 상호작용 ${interactionTokens})`);
    }

    // Discard all hand cards
    for (const card of this.hand) this.discard.push(card);

    this.phase = 'interact';
  }

  judgePhase() {
    this.roundScore += this.turnScore;
    this.roundTurn++;

    if (this.roundTurn === 5) {
      const target = this.getRoundThreshold();
      if (this.roundScore >= target) {
        const excess = this.roundScore - target;
        const bonusTokens = Math.floor(excess * 0.1);
        this.tokens += bonusTokens;
        this.totalTokensEarned += bonusTokens;
        this.log.push(`🎉 ${this.roundNum}라운드 통과! 누적 ${this.roundScore}pt / 목표 ${target}pt`);
        if (bonusTokens > 0) this.log.push(`💰 초과 득점 보너스: +${bonusTokens}🪙`);
        this.roundNum++;
        this.roundScore = 0;
        this.roundTurn = 0;
        this.boardCompounds = [];
      } else {
        this.log.push(`💀 ${this.roundNum}라운드 실패. 누적 ${this.roundScore}pt / 목표 ${target}pt`);
        this.gameOver = true;
        this.phase = 'gameover';
        return;
      }
    } else {
      const target = this.getRoundThreshold();
      const remaining = 5 - this.roundTurn;
      this.log.push(`📈 이번 턴 ${this.turnScore}pt → 라운드 누적 ${this.roundScore}pt (목표 ${target}pt, 남은 턴 ${remaining})`);
    }

    this._generateSynergyOptions();
    this.phase = 'synergy_pick';
  }

  _generateSynergyOptions() {
    const keys = Object.keys(SYNERGY_POOL);
    this.synergyPickOptions = shuffle([...keys]).slice(0, 3);
  }

  pickSynergy(key) {
    const synergy = SYNERGY_POOL[key];
    if (!synergy) return;

    if (!this.unlockedSynergies[key]) {
      this.unlockedSynergies[key] = { level: 1 };
      this.log.push(`🔓 ${synergy.name} 해금! (Lv1)`);
    } else if (this.unlockedSynergies[key].level < 3) {
      this.unlockedSynergies[key].level++;
      this.log.push(`⬆️ ${synergy.name} 업그레이드! (Lv${this.unlockedSynergies[key].level})`);
    } else {
      this.tokens += 5;
      this.totalTokensEarned += 5;
      this.log.push(`✨ ${synergy.name} 이미 최대 레벨! +5🪙`);
    }

    this.generateShop();
    this.phase = 'shop';
  }

  generateShop() {
    const maxGrade = this.roundNum >= 3 ? 4 : this.roundNum >= 2 ? 3 : 2;
    const pool = Object.entries(ELEMENTS)
      .filter(([, el]) => el.grade >= 2 && el.grade <= maxGrade)
      .map(([sym]) => sym);
    this.shopCards = shuffle([...pool]).slice(0, 3).map(sym => ({
      symbol: sym,
      element: ELEMENTS[sym],
      cost: SHOP_COSTS[ELEMENTS[sym].grade],
    }));
  }

  buyCard(symbol) {
    const shopItem = this.shopCards.find(c => c.symbol === symbol);
    if (!shopItem) return { ok: false, msg: '상점에 없는 원소' };
    if (this.tokens < shopItem.cost) return { ok: false, msg: '토큰 부족' };
    this.tokens -= shopItem.cost;
    this.discard.push({ id: Date.now() + Math.random(), symbol });
    this.log.push(`🛒 ${ELEMENTS[symbol].name}(${symbol}) 획득!`);
    this.shopCards = this.shopCards.filter(c => c.symbol !== symbol);
    return { ok: true };
  }

  nextTurn() {
    this.turn++;
    this.hand = [];
    this.phase = 'draw';
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
