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

  // --- Nouvelle logique de planification et de résolution d'un tour ---
  function isOccupied(row, col, atSurface) {
    return units.some(u => u.row === row && u.col === col && u.atSurface === atSurface);
  }

  function findClosestFreeTile(row, col, atSurface) {
    // Recherche en spirale autour de (row,col) la première tuile libre à la surface
    let visited = new Set();
    let queue = [{row, col, dist:0}];
    while (queue.length) {
      let {row: r, col: c, dist} = queue.shift();
      let key = r+','+c;
      if (r < 1 || r > ROWS || c < 1 || c > COLS || visited.has(key)) continue;
      visited.add(key);
      if (!isOccupied(r, c, atSurface)) return {row: r, col: c};
      // Ajouter les voisins
      queue.push({row: r+1, col: c, dist: dist+1});
      queue.push({row: r-1, col: c, dist: dist+1});
      queue.push({row: r, col: c+1, dist: dist+1});
      queue.push({row: r, col: c-1, dist: dist+1});
      queue.push({row: r+1, col: c+1, dist: dist+1});
      queue.push({row: r-1, col: c-1, dist: dist+1});
      queue.push({row: r+1, col: c-1, dist: dist+1});
      queue.push({row: r-1, col: c+1, dist: dist+1});
    }
    // Si tout est occupé, rester sur place
    return {row, col};
  }

  function nextTurn() {
    // Pour chaque unité, planifier l'action
    for (const u of units) {
      // Si le joueur tient le puck, il avance vers le but adverse
      if (puck.possessedBy === u) {
        let targetRow = u.row + (u.team === 'blue' ? 1 : -1);
        u.planned = { action: 'move', to: { row: Math.max(1, Math.min(25, targetRow)), col: u.col }, dir: u.facing };
        continue;
      }

      // Si le joueur est sous l'eau
      if (!u.atSurface) {
        // S'il n'a plus de souffle, il doit remonter
        if (u.breath === 0) {
          // Chercher la case la plus proche à la surface non occupée
          let surfTile = findClosestFreeTile(u.row, u.col, true);
          u.planned = { action: 'surface', to: surfTile, dir: u.facing };
        } else {
          // Sinon, il se rapproche du puck
          let dr = puck.row > u.row ? 1 : (puck.row < u.row ? -1 : 0);
          let dc = puck.col > u.col ? 1 : (puck.col < u.col ? -1 : 0);
          let nextRow = u.row + dr, nextCol = u.col + dc;
          // Ne pas aller sur une case déjà occupée au fond
          if (!isOccupied(nextRow, nextCol, false)) {
            u.planned = { action: 'move', to: { row: nextRow, col: nextCol }, dir: u.facing };
          } else {
            u.planned = { action: 'wait', to: { row: u.row, col: u.col }, dir: u.facing };
          }
        }
        continue;
      }

      // Si le joueur est à la surface et n'a pas récupéré tout son souffle
      if (u.atSurface && u.breath < u.stats.maxHold) {
        // Il doit se déplacer à la surface pour se positionner intelligemment
        // On le fait se rapprocher du puck, mais aussi rester groupé selon sa formation initiale
        // On prend la position initiale comme "formation"
        let formation = (u.team === 'blue' ? bluePositions : redPositions)[u.idx];
        // On fait une moyenne pondérée entre la position du puck et la formation
        let targetRow = Math.round(0.6 * puck.row + 0.4 * formation.row);
        let targetCol = Math.round(0.6 * puck.col + 0.4 * formation.col);
        // Aller vers la case cible la plus proche à la surface non occupée
        let dr = targetRow > u.row ? 1 : (targetRow < u.row ? -1 : 0);
        let dc = targetCol > u.col ? 1 : (targetCol < u.col ? -1 : 0);
        let nextRow = u.row + dr, nextCol = u.col + dc;
        if (!isOccupied(nextRow, nextCol, true)) {
          u.planned = { action: 'move', to: { row: nextRow, col: nextCol }, dir: u.facing };
        } else {
          // Si la case est occupée, rester sur place
          u.planned = { action: 'wait', to: { row: u.row, col: u.col }, dir: u.facing };
        }
        continue;
      }

      // Si le joueur est à la surface et a récupéré tout son souffle, il peut plonger
      if (u.atSurface && u.breath >= u.stats.maxHold) {
        u.planned = { action: 'dive', to: { row: u.row, col: u.col }, dir: u.facing };
        continue;
      }

      // Par défaut, attendre
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

    // --- Application des actions, en respectant les contraintes d'empilement ---
    // On prépare des maps pour vérifier les occupations
    let surfaceMap = {};
    let bottomMap = {};
    for (const u of units) {
      // Gestion des mouvements
      if (u.planned.action === 'move') {
        // Vérifier qu'on ne va pas empiler deux joueurs sur la même case/plan
        let key = `${u.planned.to.row},${u.planned.to.col},${u.atSurface}`;
        if (u.atSurface) {
          if (!surfaceMap[key]) {
            u.row = u.planned.to.row;
            u.col = u.planned.to.col;
            surfaceMap[key] = true;
          } // sinon, ne pas bouger
        } else {
          if (!bottomMap[key]) {
            u.row = u.planned.to.row;
            u.col = u.planned.to.col;
            bottomMap[key] = true;
          }
        }
      }
      if (u.planned.action === 'dive') {
        u.atSurface = false;
      }
      if (u.planned.action === 'surface') {
        // Trouver la case cible la plus proche à la surface non occupée
        let surfTile = findClosestFreeTile(u.row, u.col, true);
        // Si la case cible est différente, on y va
        if (!isOccupied(surfTile.row, surfTile.col, true)) {
          u.row = surfTile.row;
          u.col = surfTile.col;
        }
        u.atSurface = true;
      }
      // Gestion du souffle
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
  }

  document.getElementById('next-btn').onclick = nextTurn;

});
