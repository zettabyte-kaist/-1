// UI Controller

let gs = null;
let selectedCardIds = [];

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
  renderLog();
  renderScore();
  renderShop();
  renderActions();
}

function renderHeader() {
  document.getElementById('turn-val').textContent = gs.turn;
  // Show period progress instead of per-turn threshold
  const target = gs.getPeriodThreshold();
  const tv = document.getElementById('threshold-val');
  tv.textContent = `${gs.periodScore}/${target}pt`;
  const rv = document.getElementById('rp-val');
  rv.textContent = gs.researchPoints + 'pt';
  const sv = document.getElementById('score-val');
  sv.textContent = gs.turnScore + 'pt';
  // Color based on whether period is on track
  const turnsLeft = 5 - gs.periodTurn;
  const needed = target - gs.periodScore;
  const onTrack = turnsLeft > 0 ? (needed / turnsLeft <= 80) : gs.periodScore >= target;
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
    if (!isUsed) {
      div.addEventListener('click', () => toggleCard(card.id));
    }
    container.appendChild(div);
  }
  if (gs.hand.length === 0 && gs.phase === 'build') {
    container.innerHTML = '<span style="color:#555;font-size:0.8rem">카드가 없습니다.</span>';
  }
}

function toggleCard(cardId) {
  if (gs.phase !== 'build') return;
  const idx = selectedCardIds.indexOf(cardId);
  if (idx >= 0) {
    selectedCardIds.splice(idx, 1);
  } else {
    selectedCardIds.push(cardId);
  }
  renderBuilder();
  renderHand();
}

function renderBuilder() {
  const preview = document.getElementById('selected-preview');
  const compoundList = document.getElementById('compound-list');
  const hint = document.getElementById('builder-hint');

  // Show selected card chips
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

  // Show formable compounds
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
    const catLabel = getCatLabel(c.category);
    div.innerHTML = `
      <div class="fi-left">
        <span class="comp-name">${c.name}</span>
        <span class="comp-formula">${c.formula}</span>
        <span class="comp-category">${catLabel}</span>
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

function renderLog() {
  const logArea = document.getElementById('log-lines');
  logArea.innerHTML = '';
  for (const line of gs.log) {
    addLogLine(line);
  }
  for (const line of gs.bonusLines) {
    addLogLine(line, 'bonus');
  }
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

  const target = gs.getPeriodThreshold();
  const addLine = (label, value, cls = '') => {
    const div = document.createElement('div');
    div.className = 'score-line';
    div.innerHTML = `<span class="sl-label">${label}</span><span class="sl-value ${cls}">${value}</span>`;
    panel.appendChild(div);
  };

  // Period info always visible
  addLine(`${gs.periodNum}기 목표`, target + 'pt');
  addLine('구간 누적', gs.periodScore + 'pt', gs.periodScore >= target ? 'pass' : '');
  addLine('구간 내 턴', `${gs.periodTurn}/5`);

  if (gs.phase === 'build') {
    const base = gs.formedCompounds.reduce((s, fc) => s + fc.compound.score * fc.count, 0);
    addLine('현재 기본 점수', base + 'pt');
    addLine('보너스', '채점 후 계산');
  } else if (['score','shop','nextturn'].includes(gs.phase)) {
    addLine('이번 턴 득점', gs.turnScore + 'pt');
    if (gs.phase === 'shop') {
      const earned = gs.researchPoints;
      addLine('보유 연구 포인트', gs.researchPoints + 'pt');
    }
  }

  if (gs.interactionsThisTurn.size > 0) {
    const names = [...gs.interactionsThisTurn].map(i => getInteractionName(i)).join(', ');
    addLine('발동 상호작용', gs.interactionsThisTurn.size + '종');
    const div = document.createElement('div');
    div.style.cssText = 'font-size:0.7rem;color:#7ec8e3;padding:4px 0;';
    div.textContent = names;
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
    const canAfford = gs.researchPoints >= item.cost;
    if (!canAfford) div.style.opacity = '0.5';
    div.innerHTML = `
      <div class="fi-left">
        <span class="si-sym grade-${item.element.grade}" style="padding:2px 6px;border-radius:4px">${item.symbol}</span>
        <span class="si-name">${item.element.name}</span>
        <span class="si-num">Z=${item.element.atomicNum} | Grade ${item.element.grade}</span>
      </div>
      <span class="si-cost">${item.cost}pt</span>
    `;
    if (canAfford) {
      div.addEventListener('click', () => {
        const result = gs.buyCard(item.symbol);
        if (result.ok) {
          div.classList.add('bought');
          renderHeader();
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
    const btn = makeBtn('카드 드로우 (8장)', 'btn-primary', () => {
      gs.drawPhase();
      render();
    });
    bar.appendChild(btn);
  } else if (gs.phase === 'build') {
    if (selectedCardIds.length > 0) {
      const btn = makeBtn('선택 해제', 'btn-danger', () => {
        selectedCardIds = [];
        renderBuilder();
        renderHand();
      });
      bar.appendChild(btn);
    }
    const endBtn = makeBtn('합성 완료 → 채점', 'btn-success', () => {
      selectedCardIds = [];
      gs.scorePhase();
      gs.judgePhase();
      render();
    });
    endBtn.disabled = gs.formedCompounds.length === 0;
    bar.appendChild(endBtn);
  } else if (gs.phase === 'nextturn') {
    const remaining = 5 - gs.periodTurn;
    const btn = makeBtn(`다음 턴 (구간 ${remaining}턴 남음)`, 'btn-primary', () => {
      gs.nextTurn();
      gs.drawPhase();
      render();
    });
    bar.appendChild(btn);
  } else if (gs.phase === 'shop') {
    const btn = makeBtn('다음 턴으로 (새 구간 시작)', 'btn-warning', () => {
      gs.nextTurn();
      gs.drawPhase();
      render();
    });
    bar.appendChild(btn);
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
    catalyst: '촉매', synthesis_route: '산업합성루트',
    homologous_series: '동족체시너지',
  };
  return map[key] || key;
}

function showGameOver() {
  document.getElementById('overlay-title').textContent = '게임 오버';
  document.getElementById('overlay-msg').innerHTML =
    `${gs.periodNum}기 ${gs.turn}턴에 탈락했습니다.<br>총 획득한 연구 포인트: ${gs.totalResearchPoints}pt`;
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
