// gameLogic.js
let canvas, ctx;

function render() {
  drawBoard();
  drawPuck();
  for(const unit of units) drawPlanned(unit);
  drawAllUnits();
  renderTables();
}

function initGame() {
  units = getInitialUnits();
  puck = { row: 13, col: 8, possessedBy: null };
  score = { blue: 0, red: 0 };
  turn = 1;
  canvas = document.getElementById('board');
  ctx = canvas.getContext('2d');
  updateHistory();
  render();
}

document.addEventListener('DOMContentLoaded', function() {
  initGame();

  document.getElementById('next-btn').onclick = function() {
    for (const u of units) {
      if (puck.possessedBy === u) {
        let targetRow = u.row + (u.team === 'blue' ? 1 : -1);
        u.planned = { action: 'move', to: { row: Math.max(1, Math.min(25, targetRow)), col: u.col }, dir: u.facing };
        continue;
      }
      if (!u.atSurface) {
        let dr = puck.row > u.row ? 1 : (puck.row < u.row ? -1 : 0);
        let dc = puck.col > u.col ? 1 : (puck.col < u.col ? -1 : 0);
        u.planned = { action: 'move', to: { row: u.row + dr, col: u.col + dc }, dir: u.facing };
        continue;
      }
      if (u.atSurface && u.breath < u.stats.maxHold) {
        u.planned = { action: 'wait', to: { row: u.row, col: u.col }, dir: u.facing };
        continue;
      }
      if (u.atSurface && u.breath >= u.stats.maxHold) {
        u.planned = { action: 'dive', to: { row: u.row, col: u.col }, dir: u.facing };
        continue;
      }
      u.planned = { action: 'wait', to: { row: u.row, col: u.col }, dir: u.facing };
    }

    const plannedPositions = {};
    for (const u of units) {
      const key = `${u.planned.to.row},${u.planned.to.col},${u.atSurface}`;
      if (!plannedPositions[key]) {
        plannedPositions[key] = u;
      } else {
        if (Math.random() < 0.5) {
          plannedPositions[key] = u;
        }
        u.planned = { action: 'wait', to: { row: u.row, col: u.col }, dir: u.facing };
      }
    }

    for (const u of units) {
      if (u.planned.action === 'move') {
        u.row = u.planned.to.row;
        u.col = u.planned.to.col;
      }
      if (u.planned.action === 'dive') {
        u.atSurface = false;
      }
      if (u.planned.action === 'surface') {
        u.atSurface = true;
      }
      if (u.atSurface) {
        u.breath = Math.min(u.breath + 1, u.stats.maxHold);
      } else {
        u.breath = Math.max(u.breath - 1, 0);
        if (u.breath === 0) u.atSurface = true;
      }
    }

    let prevPossessor = puck.possessedBy;
    let poss = units.find(u => u.row === puck.row && u.col === puck.col && !u.atSurface);
    if (poss && (!prevPossessor || prevPossessor !== poss)) {
      showMessage(`${poss.team === 'blue' ? 'Blue' : 'Red'} ${poss.name} picks up the puck`);
      puck.possessedBy = poss;
    }
    if (puck.possessedBy && puck.possessedBy.atSurface) {
      showMessage(`${puck.possessedBy.team === 'blue' ? 'Blue' : 'Red'} ${puck.possessedBy.name} surfaces, puck is free`);
      puck.possessedBy = null;
    }
    if (puck.possessedBy) {
      puck.row = puck.possessedBy.row;
      puck.col = puck.possessedBy.col;
    }
    if (puck.row === 1 && puck.col >= 7 && puck.col <= 9) {
      score.blue++;
      showMessage("Goal for Blue!");
      units = getInitialUnits();
      puck = { row: 13, col: 8, possessedBy: null };
    } else if (puck.row === 25 && puck.col >= 7 && puck.col <= 9) {
      score.red++;
      showMessage("Goal for Red!");
      units = getInitialUnits();
      puck = { row: 13, col: 8, possessedBy: null };
    }

    turn++;
    document.getElementById('score-blue').textContent = score.blue;
    document.getElementById('score-red').textContent = score.red;
    document.getElementById('turn-num').textContent = turn;
    render();
  };
});
