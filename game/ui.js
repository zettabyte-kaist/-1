// UI Controller

let gs = null;
let selectedCardIds = [];
let selectedBoardIds = [];  // compound IDs selected on the board

function init() {
  gs = new GameState();
  gs.drawPhase();
  render();
}

function render() {
  renderHeader();
  renderHand();
  renderBuilder();
  renderFormed();
  renderBoard();
  renderLog();
  renderScore();
  renderShop();
  renderSynergyPick();
  renderActions();
}

function renderHeader() {
  document.getElementById('turn-val').textContent = gs.turn;
  const target = gs.getRoundThreshold();
  document.getElementById('threshold-val').textContent = `${gs.roundScore}/${target}pt`;
  document.getElementById('token-val').textContent = gs.tokens + '🪙';
  const sv = document.getElementById('score-val');
  sv.textContent = gs.turnScore + 'pt';
  const turnsLeft = 5 - gs.roundTurn;
  const needed = target - gs.roundScore;
  const onTrack = turnsLeft > 0 ? (needed / turnsLeft <= 80) : gs.roundScore >= target;
  sv.className = 'stat-value ' + (onTrack ? 'ok' : 'danger');
}

function renderHand() {
  const container = document.getElementById('hand-cards');
  container.innerHTML = '';
  for (const card of gs.hand) {
    const el = ELEMENTS[card.symbol];
    const div = document.createElement('div');
    const isUsed = gs.usedElementIds.has(card.id);
    const isSelected = selectedCardIds.includes(card.id);
    div.className = `element-card grade-${el.grade}${isUsed ? ' used' : ''}${isSelected ? ' selected' : ''}`;
    div.innerHTML = `
      <span class="card-symbol">${card.symbol}</span>
      <span class="card-name">${el.name}</span>
      <span class="card-num">${el.atomicNum}</span>
    `;
    if (!isUsed) div.addEventListener('click', () => toggleCard(card.id));
    container.appendChild(div);
  }
  if (gs.hand.length === 0 && gs.phase === 'build') {
    container.innerHTML = '<span style="color:#555;font-size:0.8rem">카드가 없습니다.</span>';
  }
}

function toggleCard(cardId) {
  if (gs.phase !== 'build') return;
  const idx = selectedCardIds.indexOf(cardId);
  if (idx >= 0) selectedCardIds.splice(idx, 1);
  else selectedCardIds.push(cardId);
  renderBuilder();
  renderHand();
}

function renderBuilder() {
  const preview = document.getElementById('selected-preview');
  const compoundList = document.getElementById('compound-list');
  const hint = document.getElementById('builder-hint');

  preview.innerHTML = '';
  const symCount = {};
  for (const id of selectedCardIds) {
    const card = gs.hand.find(c => c.id === id);
    if (card) symCount[card.symbol] = (symCount[card.symbol] || 0) + 1;
  }
  if (selectedCardIds.length === 0) {
    preview.innerHTML = '<span style="color:#444;font-size:0.75rem">카드를 선택하세요</span>';
  }
  for (const [sym, cnt] of Object.entries(symCount)) {
    const chip = document.createElement('span');
    chip.className = 'selected-chip';
    chip.textContent = cnt > 1 ? `${sym}×${cnt}` : sym;
    preview.appendChild(chip);
  }

  compoundList.innerHTML = '';
  if (selectedCardIds.length === 0) {
    hint.textContent = '카드를 선택하면 만들 수 있는 화합물이 표시됩니다.';
    return;
  }

  const total = Object.values(symCount).reduce((a, b) => a + b, 0);
  const available = COMPOUNDS.filter(c => {
    const needed = Object.values(c.elements).reduce((a, b) => a + b, 0);
    if (needed !== total) return false;
    for (const [sym, cnt] of Object.entries(c.elements)) {
      if ((symCount[sym] || 0) < cnt) return false;
    }
    return true;
  });

  if (available.length === 0) {
    hint.textContent = '선택한 카드로 만들 수 있는 화합물이 없습니다.';
    return;
  }
  hint.textContent = '아래 화합물 중 하나를 클릭해 합성하세요.';

  for (const c of available) {
    const div = document.createElement('div');
    div.className = 'compound-option';
    div.innerHTML = `
      <div class="fi-left">
        <span class="comp-name">${c.name}</span>
        <span class="comp-formula">${c.formula}</span>
        <span class="comp-category">${getCatLabel(c.category)}</span>
      </div>
      <span class="comp-score">${c.score}pt</span>
    `;
    div.addEventListener('click', () => formCompound(c.id));
    compoundList.appendChild(div);
  }
}

function formCompound(compoundId) {
  if (gs.phase !== 'build') return;
  const result = gs.formCompound(selectedCardIds, compoundId);
  if (!result.ok) {
    addLogLine('❌ ' + result.msg, 'error');
    return;
  }
  selectedCardIds = [];
  renderLog();
  renderHand();
  renderBuilder();
  renderFormed();
  renderBoard();
  renderActions();
}

function renderFormed() {
  const list = document.getElementById('formed-list');
  list.innerHTML = '';
  if (gs.formedCompounds.length === 0) {
    list.innerHTML = '<span style="color:#555;font-size:0.8rem">아직 합성한 화합물이 없습니다.</span>';
    return;
  }
  for (const fc of gs.formedCompounds) {
    const div = document.createElement('div');
    div.className = 'formed-item';
    div.innerHTML = `
      <div class="fi-left">
        <span class="fi-name">${fc.compound.name}</span>
        <span class="fi-formula">${fc.compound.formula}</span>
        ${fc.count > 1 ? `<span style="color:#f0d060;font-size:0.75rem">×${fc.count}</span>` : ''}
      </div>
      <span class="fi-score">${fc.compound.score * fc.count}pt</span>
    `;
    list.appendChild(div);
  }
}

function renderBoard() {
  const boardList = document.getElementById('board-list');
  const boardHint = document.getElementById('board-hint');
  const reactionList = document.getElementById('board-reaction-list');

  boardList.innerHTML = '';
  reactionList.innerHTML = '';

  if (gs.boardCompounds.length === 0) {
    boardList.innerHTML = '<span style="color:#555;font-size:0.8rem">보드가 비어있습니다.</span>';
    boardHint.textContent = '';
    return;
  }

  const inInteract = gs.phase === 'interact';

  for (const bc of gs.boardCompounds) {
    const div = document.createElement('div');
    const isSelected = selectedBoardIds.includes(bc.compound.id);
    div.className = 'board-item' + (isSelected ? ' selected' : '') + (inInteract ? ' clickable' : '');
    div.innerHTML = `
      <div class="fi-left">
        <span class="fi-name">${bc.compound.name}</span>
        <span class="fi-formula">${bc.compound.formula}</span>
        ${bc.count > 1 ? `<span style="color:#6bff8a;font-size:0.75rem">×${bc.count}</span>` : ''}
      </div>
      <span class="fi-score" style="color:#6bff8a">${bc.compound.score}pt</span>
    `;
    if (inInteract) {
      div.addEventListener('click', () => toggleBoardItem(bc.compound.id));
    }
    boardList.appendChild(div);
  }

  if (!inInteract) {
    boardHint.textContent = '채점 후 반응 단계에서 보드 화합물을 선택할 수 있습니다.';
    return;
  }

  if (selectedBoardIds.length === 0) {
    boardHint.textContent = '반응시킬 화합물 2개를 선택하세요.';
    return;
  }

  const validReactions = gs.getValidBoardReactions(selectedBoardIds);
  if (validReactions.length === 0) {
    boardHint.textContent = '선택한 조합으로 가능한 반응이 없습니다.';
    return;
  }

  boardHint.textContent = '아래 반응 중 하나를 클릭하세요.';
  for (const r of validReactions) {
    const div = document.createElement('div');
    div.className = 'reaction-option';
    div.innerHTML = `
      <span>${r.label}</span>
      <span style="color:#6bff8a">+${TOKEN_REWARDS.boardReaction.perReaction + r.tokenBonus}🪙</span>
    `;
    div.addEventListener('click', () => {
      const result = gs.executeBoardReaction(r.id);
      if (result.ok) {
        selectedBoardIds = [];
        renderHeader();
        renderBoard();
        renderLog();
      }
    });
    reactionList.appendChild(div);
  }
}

function toggleBoardItem(compoundId) {
  if (gs.phase !== 'interact') return;
  const idx = selectedBoardIds.indexOf(compoundId);
  if (idx >= 0) selectedBoardIds.splice(idx, 1);
  else selectedBoardIds.push(compoundId);
  renderBoard();
}

function renderSynergyPick() {
  const overlay = document.getElementById('synergy-overlay');
  if (gs.phase !== 'synergy_pick') {
    overlay.classList.remove('visible');
    return;
  }
  overlay.classList.add('visible');

  const optionsEl = document.getElementById('synergy-options');
  optionsEl.innerHTML = '';

  for (const key of gs.synergyPickOptions) {
    const synergy = SYNERGY_POOL[key];
    const current = gs.unlockedSynergies[key];
    const currentLevel = current ? current.level : 0;
    const isMaxed = currentLevel >= 3;

    const card = document.createElement('div');
    card.className = 'synergy-card' + (isMaxed ? ' maxed' : '');

    const levelDots = [1, 2, 3].map(l =>
      `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;margin:0 2px;background:${l <= currentLevel ? '#7ec8e3' : '#2a2a4a'}"></span>`
    ).join('');

    card.innerHTML = `
      <div style="font-size:1.8rem">${synergy.icon}</div>
      <div style="font-weight:bold;margin:6px 0;font-size:0.9rem">${synergy.name}</div>
      <div style="margin-bottom:8px">${levelDots}</div>
      <div style="font-size:0.7rem;color:#aaa;margin-bottom:8px">${synergy.description}</div>
      <div style="font-size:0.75rem;color:${isMaxed ? '#f0d060' : '#6bff8a'}">
        ${isMaxed ? '최대 레벨 (선택 시 +5🪙)' : currentLevel === 0 ? '해금 (Lv1)' : `Lv${currentLevel} → Lv${currentLevel + 1}`}
      </div>
    `;
    card.addEventListener('click', () => {
      gs.pickSynergy(key);
      render();
    });
    optionsEl.appendChild(card);
  }
}

function renderLog() {
  const logArea = document.getElementById('log-lines');
  logArea.innerHTML = '';
  for (const line of gs.log) addLogLine(line);
  for (const line of gs.bonusLines) addLogLine(line, 'bonus');
  logArea.scrollTop = logArea.scrollHeight;
}

function addLogLine(text, cls = '') {
  const logArea = document.getElementById('log-lines');
  const div = document.createElement('div');
  div.className = 'log-line ' + cls;
  div.textContent = text;
  logArea.appendChild(div);
  logArea.scrollTop = logArea.scrollHeight;
}

function renderScore() {
  const panel = document.getElementById('score-lines');
  panel.innerHTML = '';

  const target = gs.getRoundThreshold();
  const addLine = (label, value, cls = '') => {
    const div = document.createElement('div');
    div.className = 'score-line';
    div.innerHTML = `<span class="sl-label">${label}</span><span class="sl-value ${cls}">${value}</span>`;
    panel.appendChild(div);
  };

  addLine(`${gs.roundNum}라운드 목표`, target + 'pt');
  addLine('라운드 누적', gs.roundScore + 'pt', gs.roundScore >= target ? 'pass' : '');
  addLine('라운드 내 턴', `${gs.roundTurn}/5`);

  if (gs.phase === 'build' || gs.phase === 'interact') {
    const base = gs.formedCompounds.reduce((s, fc) => s + fc.compound.score * fc.count, 0);
    addLine('이번 턴 기본 점수', base + 'pt');
  }
  if (['interact', 'synergy_pick', 'shop'].includes(gs.phase)) {
    addLine('이번 턴 득점', gs.turnScore + 'pt');
    addLine('보유 토큰', gs.tokens + '🪙');
  }

  // Unlocked synergies
  const unlockedKeys = Object.keys(gs.unlockedSynergies);
  if (unlockedKeys.length > 0) {
    const names = unlockedKeys.map(k => {
      const lv = gs.unlockedSynergies[k].level;
      return `${SYNERGY_POOL[k].icon}${SYNERGY_POOL[k].name} Lv${lv}`;
    }).join(', ');
    const div = document.createElement('div');
    div.style.cssText = 'font-size:0.7rem;color:#7ec8e3;padding:4px 0;border-top:1px solid #2a2a4a;margin-top:4px';
    div.textContent = '해금: ' + names;
    panel.appendChild(div);
  }

  if (gs.interactionsThisTurn.size > 0) {
    addLine('발동 상호작용', gs.interactionsThisTurn.size + '종');
    const div = document.createElement('div');
    div.style.cssText = 'font-size:0.7rem;color:#7ec8e3;padding:4px 0;';
    div.textContent = [...gs.interactionsThisTurn].map(i => getInteractionName(i)).join(', ');
    panel.appendChild(div);
  }
}

function renderShop() {
  const shopArea = document.getElementById('shop-area');
  const shopCards = document.getElementById('shop-cards');
  shopCards.innerHTML = '';

  if (gs.phase !== 'shop') {
    shopArea.classList.remove('visible');
    return;
  }
  shopArea.classList.add('visible');

  if (gs.shopCards.length === 0) {
    shopCards.innerHTML = '<span style="color:#555;font-size:0.8rem">상점이 비었습니다.</span>';
    return;
  }

  for (const item of gs.shopCards) {
    const div = document.createElement('div');
    div.className = 'shop-item';
    const canAfford = gs.tokens >= item.cost;
    if (!canAfford) div.style.opacity = '0.5';
    div.innerHTML = `
      <div class="fi-left">
        <span class="si-sym grade-${item.element.grade}" style="padding:2px 6px;border-radius:4px">${item.symbol}</span>
        <span class="si-name">${item.element.name}</span>
        <span class="si-num">Z=${item.element.atomicNum} | Grade ${item.element.grade}</span>
      </div>
      <span class="si-cost">${item.cost}🪙</span>
    `;
    if (canAfford) {
      div.addEventListener('click', () => {
        const result = gs.buyCard(item.symbol);
        if (result.ok) {
          div.classList.add('bought');
          renderHeader();
          renderScore();
          renderLog();
        }
      });
    }
    shopCards.appendChild(div);
  }
}

function renderActions() {
  const bar = document.getElementById('action-bar');
  bar.innerHTML = '';

  if (gs.phase === 'draw') {
    bar.appendChild(makeBtn('카드 드로우 (8장)', 'btn-primary', () => {
      gs.drawPhase();
      render();
    }));
  } else if (gs.phase === 'build') {
    if (selectedCardIds.length > 0) {
      bar.appendChild(makeBtn('선택 해제', 'btn-danger', () => {
        selectedCardIds = [];
        renderBuilder();
        renderHand();
      }));
    }
    const endBtn = makeBtn('합성 완료 → 채점', 'btn-success', () => {
      selectedCardIds = [];
      gs.scorePhase();
      render();
    });
    endBtn.disabled = gs.formedCompounds.length === 0;
    bar.appendChild(endBtn);
  } else if (gs.phase === 'interact') {
    if (selectedBoardIds.length > 0) {
      bar.appendChild(makeBtn('보드 선택 해제', 'btn-danger', () => {
        selectedBoardIds = [];
        renderBoard();
      }));
    }
    bar.appendChild(makeBtn('반응 완료 (다음 단계)', 'btn-success', () => {
      selectedBoardIds = [];
      gs.judgePhase();
      render();
    }));
  } else if (gs.phase === 'shop') {
    bar.appendChild(makeBtn('다음 턴', 'btn-warning', () => {
      gs.nextTurn();
      gs.drawPhase();
      render();
    }));
  } else if (gs.phase === 'gameover') {
    showGameOver();
  }
}

function makeBtn(label, cls, onClick) {
  const btn = document.createElement('button');
  btn.className = cls;
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

function getCatLabel(cat) {
  const map = {
    oxide: '산화물', acid: '산', base: '염기', salt: '염',
    hydrocarbon: '탄화수소', alcohol: '알코올', organic_acid: '유기산',
    aldehyde: '알데하이드', ester: '에스터', sugar: '당류', oxidizer: '산화제',
  };
  return map[cat] || cat;
}

function getInteractionName(key) {
  const map = {
    category_synergy: '분류시너지', neutralization: '중화반응',
    reaction_chain: '반응연계', combustion: '연소반응',
    catalyst: '촉매', homologous_series: '동족열시너지',
  };
  return map[key] || key;
}

function showGameOver() {
  document.getElementById('overlay-title').textContent = '게임 오버';
  document.getElementById('overlay-msg').innerHTML =
    `${gs.roundNum}라운드 ${gs.turn}턴에 탈락했습니다.<br>총 획득한 토큰: ${gs.totalTokensEarned}🪙`;
  document.getElementById('overlay-btn').textContent = '다시 시작';
  document.getElementById('overlay-btn').onclick = () => {
    document.getElementById('phase-overlay').classList.remove('visible');
    init();
  };
  const box = document.querySelector('.overlay-box');
  box.classList.add('gameover');
  box.classList.remove('success');
  document.getElementById('phase-overlay').classList.add('visible');
}

window.addEventListener('DOMContentLoaded', init);
