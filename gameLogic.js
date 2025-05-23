// gameLogic.js
let canvas, ctx;
let autoplayInterval = null;
let autoplayDelay = 1000; // ms, par défaut 1s

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

  // --- Autoplay ---
  function toggleAutoplay() {
    const btn = document.getElementById('next-btn');
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
      btn.textContent = 'Next round';
    } else {
      autoplayInterval = setInterval(() => {
        nextTurn();
      }, autoplayDelay);
      btn.textContent = 'Pause';
    }
  }

  // Slider de vitesse
  const speedSlider = document.getElementById('speed-slider');
  const speedLabel = document.getElementById('speed-label');
  function updateSpeedLabel(val) {
    speedLabel.textContent = (val/10).toFixed(1) + 's';
  }
  if (speedSlider) {
    updateSpeedLabel(speedSlider.value);
    speedSlider.addEventListener('input', function() {
      autoplayDelay = Number(speedSlider.value) * 100;
      updateSpeedLabel(speedSlider.value);
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => { nextTurn(); }, autoplayDelay);
      }
    });
  }

  // --- Nouvelle logique de planification et de résolution d'un tour ---
  function isOccupied(row, col, atSurface) {
    return units.some(u => u.row === row && u.col === col && u.atSurface === atSurface);
  }

  function findClosestFreeTile(row, col, atSurface, facingDir = null) {
    // Recherche en spirale autour de (row,col) la première tuile libre à la surface
    // facingDir: 0=haut, 1=haut droite, 2=droite, 3=bas, 4=bas gauche, 5=gauche
    const DIRS = [
      {dr: -1, dc: 0},   // 0: haut
      {dr: -1, dc: 1},   // 1: haut droite
      {dr: 0, dc: 1},    // 2: droite
      {dr: 1, dc: 0},    // 3: bas
      {dr: 1, dc: -1},   // 4: bas gauche
      {dr: 0, dc: -1},   // 5: gauche
    ];
    let visited = new Set();
    let queue = [{row, col, dist:0}];
    while (queue.length) {
      // Prioriser les directions selon facingDir lors de l'expansion
      let {row: r, col: c, dist} = queue.shift();
      let key = r+','+c;
      if (r < 1 || r > ROWS || c < 1 || c > COLS || visited.has(key)) continue;
      visited.add(key);
      if (!isOccupied(r, c, atSurface)) return {row: r, col: c};
      // Générer les voisins, en priorisant la direction de facingDir
      let neighbors = [];
      // Utiliser facingDir si fourni, sinon null
      let dirToUse = typeof facingDir === "number" ? facingDir : null;
      if (dirToUse !== null && dirToUse >= 0 && dirToUse < DIRS.length) {
        neighbors.push(DIRS[dirToUse]);
        for (let i = 0; i < DIRS.length; i++) {
          if (i !== dirToUse) neighbors.push(DIRS[i]);
        }
      } else {
        neighbors = DIRS.slice();
      }
      for (const d of neighbors) {
        queue.push({row: r + d.dr, col: c + d.dc, dist: dist + 1});
      }
      // Ajouter aussi les diagonales secondaires pour la spirale complète
      queue.push({row: r+1, col: c+1, dist: dist+1});
      queue.push({row: r-1, col: c-1, dist: dist+1});
      queue.push({row: r+1, col: c-1, dist: dist+1});
      queue.push({row: r-1, col: c+1, dist: dist+1});
    }
    // Si tout est occupé, rester sur place
    return {row, col};
  }

  // Utiliser getNeighbors pour le pathfinding et la planification des mouvements
  function pathTo(u, target, plannedTiles) {
    let queue = [[u.row, u.col, []]], seen = {};
    while(queue.length) {
      let [y, x, path] = queue.shift();
      let key = y + "," + x;
      if(seen[key]) continue;
      seen[key] = 1;
      if(y === target.row && x === target.col) return [ {y: u.row, x: u.col}, ...path ];
      for(const nb of getNeighbors(y, x)) {
        if(nb.row < 1 || nb.row > ROWS || nb.col < 1 || nb.col > COLS) continue;
        if(units.some(unit => unit.row === nb.row && unit.col === nb.col && unit.atSurface === u.atSurface)) continue;
        if(plannedTiles && plannedTiles[nb.row + "," + nb.col]) continue;
        queue.push([nb.row, nb.col, [...path, {y: nb.row, x: nb.col}]]);
      }
    }
    return [ {y: u.row, x: u.col} ];
  }

  // Utiliser getNeighbors pour la planification de mouvement direct
  function planMoveToward(u, targetRow, targetCol) {
    let best = {row: u.row, col: u.col};
    let minDist = Math.abs(u.row - targetRow) + Math.abs(u.col - targetCol);
    for(const nb of getNeighbors(u.row, u.col)) {
      if(nb.row < 1 || nb.row > ROWS || nb.col < 1 || nb.col > COLS) continue;
      if(units.some(unit => unit.row === nb.row && unit.col === nb.col && unit.atSurface === u.atSurface)) continue;
      let dist = Math.abs(nb.row - targetRow) + Math.abs(nb.col - targetCol);
      if(dist < minDist) {
        minDist = dist;
        best = nb;
      }
    }
    return best;
  }

  function nextTurn() {
    // Pour chaque unité, planifier l'action
    for (const u of units) {
      // --- IA du porteur du puck ---
      if (puck.possessedBy === u) {
        // 1. Privilégier la passe à un coéquipier au fond (flick en diagonale)
        let flickDirs = [
          {dr: 1, dc: 1}, {dr: 1, dc: -1}, {dr: -1, dc: 1}, {dr: -1, dc: -1}
        ];
        let teammates = units.filter(m => m.team === u.team && m !== u && !m.atSurface);
        let flicked = false;
        for (const dir of flickDirs) {
          for (let dist = 1; dist <= u.stats.flick; dist++) {
            let tr = u.row + dir.dr * dist, tc = u.col + dir.dc * dist;
            if (tr < 1 || tr > 25 || tc < 1 || tc > 15) continue;
            let mate = teammates.find(m => m.row === tr && m.col === tc);
            if (mate) {
              u.planned = { action: 'flick', to: { row: tr, col: tc }, dir: u.facing };
              flicked = true;
              break;
            }
          }
          if (flicked) break;
        }
        if (flicked) continue;

        // 2. Mouvement : si aucun adversaire entre le porteur et le but, priorité à avancer vers le but
        const directions = [
          {dr: 0, dc: 1},   // droite
          {dr: 0, dc: -1},  // gauche
          {dr: 1, dc: 1},   // bas droite
          {dr: 1, dc: -1},  // bas gauche
          {dr: -1, dc: 1},  // haut droite
          {dr: -1, dc: -1}  // haut gauche
        ];
        let foundMove = false;
        // Détermination du but adverse
        let goalRow = (u.team === 'blue') ? 25 : 1;
        let goalCols = [7,8,9];
        // Chercher la colonne de but la plus proche
        let bestGoalCol = goalCols.reduce((best, c) => (Math.abs(u.col - c) < Math.abs(u.col - best) ? c : best), goalCols[0]);
        // Calcul du chemin en ligne droite (DDA)
        let steps = Math.abs(goalRow - u.row);
        let dr = (goalRow > u.row) ? 1 : -1;
        let dc = (bestGoalCol > u.col) ? 1 : (bestGoalCol < u.col ? -1 : 0);
        let pathClear = true;
        let r = u.row, c = u.col;
        for (let i = 1; i <= steps; i++) {
          r += dr;
          c += dc;
          if (r < 1 || r > 25 || c < 1 || c > 15) { pathClear = false; break; }
          // Interdire d'entrer dans sa propre zone de but
          if ((u.team === 'blue' && r === 1 && c >= 7 && c <= 9) || (u.team === 'red' && r === 25 && c >= 7 && c <= 9)) {
            pathClear = false; break;
          }
          // Adversaire sur le chemin ?
          if (units.some(op => op.team !== u.team && op.row === r && op.col === c && !op.atSurface)) {
            pathClear = false; break;
          }
        }
        // Vérifier souffle suffisant pour atteindre le but
        let breathNeeded = steps; // 1 case = 1 souffle
        let canReach = (u.breath >= breathNeeded);
        if (pathClear && canReach) {
          // Avancer d'une case vers le but (ligne droite)
          let nr = u.row + dr, nc = u.col + dc;
          if (nr >= 1 && nr <= 25 && nc >= 1 && nc <= 15 &&
              !((u.team === 'blue' && nr === 1 && nc >= 7 && nc <= 9) ||
                (u.team === 'red' && nr === 25 && nc >= 7 && nc <= 9))) {
            let hasOpponent = units.some(op => op.team !== u.team && op.row === nr && op.col === nc && !op.atSurface);
            let occupied = units.some(op => op.row === nr && op.col === nc && op.atSurface === u.atSurface);
            if (!hasOpponent && !occupied) {
              u.planned = { action: 'move', to: { row: nr, col: nc }, dir: u.facing };
              u.lastMoveDir = null;
              u.prevRow = u.row;
              u.prevCol = u.col;
              foundMove = true;
            }
          }
        }
        if (!foundMove) {
          // Sinon, comportement habituel (direction préférée)
          if (typeof u.lastMoveDir !== 'number') u.lastMoveDir = null;
          let moveDirs;
          if (u.lastMoveDir !== null && u.lastMoveDir >= 0 && u.lastMoveDir < directions.length) {
            moveDirs = [u.lastMoveDir, ...directions.map((_,i)=>i).filter(i=>i!==u.lastMoveDir)];
          } else {
            moveDirs = directions.map((_,i)=>i);
          }
          for (const dirIdx of moveDirs) {
            const dir = directions[dirIdx];
            let nr = u.row + dir.dr, nc = u.col + dir.dc;
            if (nr < 1 || nr > 25 || nc < 1 || nc > 15) continue;
            // Interdire d'entrer dans sa propre zone de but
            if (
              (u.team === 'blue' && nr === 1 && nc >= 7 && nc <= 9) ||
              (u.team === 'red' && nr === 25 && nc >= 7 && nc <= 9)
            ) {
              continue;
            }
            // Pas d'adversaire sur la case
            let hasOpponent = units.some(op => op.team !== u.team && op.row !== nr && op.col !== nc && !op.atSurface);
            let occupied = units.some(op => op.row === nr && op.col === nc && op.atSurface === u.atSurface);
            // On évite de revenir sur la case précédente
            if (u.prevRow === nr && u.prevCol === nc) continue;
            if (!hasOpponent && !occupied) {
              u.planned = { action: 'move', to: { row: nr, col: nc }, dir: u.facing };
              u.lastMoveDir = dirIdx;
              u.prevRow = u.row;
              u.prevCol = u.col;
              foundMove = true;
              break;
            }
          }
        }
        if (foundMove) continue;

        // 3. Si un adversaire est devant, tourner et passer derrière
        let facingDir = u.facing;
        let front = [
          {dr: -1, dc: 0}, // 0: haut
          {dr: -1, dc: 1}, // 1: haut droite
          {dr: 0, dc: 1},  // 2: droite
          {dr: 1, dc: 0},  // 3: bas
          {dr: 1, dc: -1}, // 4: bas gauche
          {dr: 0, dc: -1}  // 5: gauche
        ][facingDir];
        let fr = u.row + front.dr, fc = u.col + front.dc;
        let oppInFront = units.some(op => op.team !== u.team && op.row === fr && op.col === fc && !op.atSurface);
        if (oppInFront) {
          // Cherche un coéquipier derrière
          let backDir = (facingDir + 3) % 6;
          let back = [
            {dr: -1, dc: 0}, {dr: -1, dc: 1}, {dr: 0, dc: 1}, {dr: 1, dc: 0}, {dr: 1, dc: -1}, {dr: 0, dc: -1}
          ][backDir];
          let br = u.row + back.dr, bc = u.col + back.dc;
          let mate = teammates.find(m => m.row === br && m.col === bc);
          if (mate) {
            u.planned = { action: 'rotate', to: { row: u.row, col: u.col }, dir: backDir };
            u.planned = { action: 'flick', to: { row: br, col: bc }, dir: backDir };
            continue;
          } else {
            u.planned = { action: 'rotate', to: { row: u.row, col: u.col }, dir: backDir };
            continue;
          }
        }

        // 4. Sinon, avancer vers le but adverse
        let targetRow = u.row + (u.team === 'blue' ? 1 : -1);
        let nextRow = Math.max(1, Math.min(25, targetRow));
        let nextCol = u.col;
        // Interdire d'entrer dans sa propre zone de but
        if (
          (u.team === 'blue' && nextRow === 1 && nextCol >= 7 && nextCol <= 9) ||
          (u.team === 'red' && nextRow === 25 && nextCol >= 7 && nextCol <= 9)
        ) {
          // Attendre sur place
          u.planned = { action: 'wait', to: { row: u.row, col: u.col }, dir: u.facing };
        } else {
          u.planned = { action: 'move', to: { row: nextRow, col: nextCol }, dir: u.facing };
          u.lastMoveDir = null;
          u.prevRow = u.row;
          u.prevCol = u.col;
        }
        continue;
      }

      // Si le joueur est sous l'eau
      if (!u.atSurface) {
        // S'il n'a plus de souffle, il doit remonter
        if (u.breath === 0) {
          // Chercher la case la plus proche à la surface non occupée
            let surfTile = findClosestFreeTile(u.row, u.col, true, u.facing);
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
    // --- Résolution des passes (flicks) avant les mouvements ---
    for (const u of units) {
      if (u.planned.action === 'flick') {
        // Trouver le destinataire sur la case cible
        let mate = units.find(m => m.team === u.team && m.row === u.planned.to.row && m.col === u.planned.to.col && !m.atSurface);
        if (mate && puck.possessedBy === u) {
          puck.possessedBy = mate;
          showMessage(`${u.team === 'blue' ? 'Blue' : 'Red'} ${u.name} passes the puck to ${mate.name}`);
        }
      }
    }

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
        let surfTile = findClosestFreeTile(u.row, u.col, u.facing);
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
      score.red++;
      // Trouver le buteur (porteur du puck juste avant le but)
      let scorer = puck.possessedBy;
      if (scorer && scorer.team === 'red') {
        window.lastGoalScorer = { team: scorer.team, name: scorer.name, idx: scorer.idx };
      } else {
        window.lastGoalScorer = null;
      }
      showMessage("Goal for Red!");
      units = getInitialUnits();
      puck = { row: 13, col: 8, possessedBy: null };
    } else if (puck.row === 25 && puck.col >= 7 && puck.col <= 9) {
      score.blue++;
      // Trouver le buteur (porteur du puck juste avant le but)
      let scorer = puck.possessedBy;
      if (scorer && scorer.team === 'blue') {
        window.lastGoalScorer = { team: scorer.team, name: scorer.name, idx: scorer.idx };
      } else {
        window.lastGoalScorer = null;
      }
      showMessage("Goal for Blue!");
      units = getInitialUnits();
      puck = { row: 13, col: 8, possessedBy: null };
    }

    turn++;
    window.turn = turn;
    document.getElementById('score-blue').textContent = score.blue;
    document.getElementById('score-red').textContent = score.red;
    document.getElementById('turn-num').textContent = turn;
    render();
  }

  const nextBtn = document.getElementById('next-btn');
  nextBtn.onclick = function() {
    if (autoplayInterval) {
      toggleAutoplay();
    } else {
      nextTurn();
    }
  };

  // Double-clic ou clic droit sur le bouton = toggle autoplay
  nextBtn.addEventListener('contextmenu', function(e) { e.preventDefault(); toggleAutoplay(); });
  nextBtn.addEventListener('dblclick', function(e) { e.preventDefault(); toggleAutoplay(); });

  // Espace = next ou toggle autoplay
  document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
      if (autoplayInterval) {
        toggleAutoplay();
      } else {
        nextTurn();
      }
      e.preventDefault();
    }
  });

});
// Remplacer toutes les références à hexToPixel par tileToPixel dans ce fichier
// Remplacer toutes les références à drawHex par drawSquare dans ce fichier
