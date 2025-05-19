// uiUpdater.js
let messageHistory = [];
let lastTurnForHistory = 1;

// Historique des buts : tableau d'objets {turn, team, playerName, playerIdx}
let goalsHistory = [];

function showMessage(msg) {
  const el = document.getElementById('message');
  el.textContent = msg;
  el.style.display = 'block';
  // Ajout du numéro de tour dans l'historique
  let turnNum = (typeof window.turn !== 'undefined') ? window.turn : lastTurnForHistory;
  lastTurnForHistory = turnNum;
  messageHistory.unshift(`<b>Turn ${turnNum}</b> : ${msg}`);
  if(messageHistory.length > 12) messageHistory.length = 12;
  updateHistory();
  // Détection d'un but marqué (message contient "but" ou "goal")
  if (/\b(but|goal)\b/i.test(msg) && typeof window.lastGoalScorer === 'object' && window.lastGoalScorer) {
    // lastGoalScorer = {team, name, idx}
    goalsHistory.push({
      turn: turnNum,
      team: window.lastGoalScorer.team,
      playerName: window.lastGoalScorer.name,
      playerIdx: window.lastGoalScorer.idx
    });
    // Limiter la taille de l'historique si besoin
    if (goalsHistory.length > 20) goalsHistory.shift();
  }
  if(window.messageTimeout) clearTimeout(window.messageTimeout);
  window.messageTimeout = setTimeout(()=>{el.style.display='none';}, 2200);
}

// Fonction utilitaire pour afficher l'historique des buts (à utiliser dans la console ou pour debug)
window.getGoalsHistory = function() {
  return goalsHistory.map(g => `Tour ${g.turn} : ${g.team==='blue'?'Bleu':'Rouge'} #${g.playerIdx+1} - ${g.playerName}`).join('\n');
}

function updateHistory() {
  const hist = document.getElementById('history');
  if (!messageHistory.length) {
    hist.innerHTML = "<b>History</b><br><i>No events</i>";
  } else {
    hist.innerHTML = "<b>History</b><br>" + messageHistory.map(m=>"<div>"+m+"</div>").join("");
  }
}

function renderTables() {
  const tables = document.getElementById('tables');
  tables.style.position = "relative";
  tables.style.zIndex = "10";
  tables.style.background = "#fff";
  tables.style.maxWidth = "auto";
  tables.style.overflowX = "auto";
  let puckPos = `<div style="margin-bottom:8px;font-size:1.05em;"><b>Puck</b>: ${puck.row},${puck.col} ${puck.possessedBy ? `(${puck.possessedBy.team==='blue'?'Blue':'Red'} ${puck.possessedBy.name})` : '(free)'}</div>`;
  function makeTable(team) {
    let html = `<table border="1">
      <caption style="color:${team==='blue'?'#1976d2':'#d32f2f'};">${team==='blue'?'Blue':'Red'}</caption>
      <tr><th>Name</th><th>Pos</th><th>State</th><th>Breath</th><th>Puck</th><th>Action</th></tr>`;
    for(const u of units.filter(u=>u.team===team)) {
      let planned = u.planned ? u.planned.action : '';
      let to = u.planned && u.planned.to ? `→ ${u.planned.to.row},${u.planned.to.col}` : '';
      html += `<tr>
        <td>${u.name}</td>
        <td>${u.row},${u.col}</td>
        <td>${u.atSurface?'Surface':'Bottom'}</td>
        <td>${u.breath}</td>
        <td>${puck.possessedBy===u?'🟡':''}</td>
        <td>${planned} ${to}</td>
      </tr>`;
    }
    html += '</table>';
    return html;
  }
  // Ajout de l'historique des buts sous le score
  let goalsHtml = '';
  if (goalsHistory.length) {
    goalsHtml = `<div id="goals-history" style="margin:10px 0 18px 0;font-size:1.05em;background:#f7f7e7;border:1px solid #e6c200;border-radius:7px;padding:8px 12px;max-width:420px;">
      <b>Historique des buts</b><br>` +
      goalsHistory.map(g => `Tour ${g.turn} : <span style='color:${g.team==='blue'?'#1976d2':'#d32f2f'}'>${g.team==='blue'?'Bleu':'Rouge'}</span> #${g.playerIdx+1} - ${g.playerName}`).reverse().join('<br>') +
      `</div>`;
  }
  tables.innerHTML = puckPos + goalsHtml + makeTable('blue') + makeTable('red');
}

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('board');
  // Ajoute un affichage de la position sur le panneau de droite lors du survol
  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    // Trouver la tuile la plus proche (centre d'hexagone)
    let minDist = Infinity, tile = null;
    let foundUnit = null;
    for (let r = 1; r <= ROWS; r++) {
      for (let c = 1; c <= COLS; c++) {
        const {x, y} = hexToPixel(r, c);
        const dist = Math.hypot(mx - x, my - y);
        if (dist < minDist && dist < HEX_SIZE) {
          minDist = dist;
          tile = { row: r, col: c, x, y };
        }
      }
    }
    if (tile) {
      // Chercher une unité sur cette tuile
      displayTileInfo(foundUnit, tile);
    } else {
      // Si pas de tuile trouvée, efface l'info
      document.getElementById('tile-info').innerHTML = '';
    }
  });
  canvas.addEventListener('mouseleave', ()=>{
    document.getElementById('tile-info').innerHTML = '';
  });
});

function displayTileInfo(foundUnit, tile) {
  foundUnit = units.find(u => u.row === tile.row && u.col === tile.col);
  // Afficher dans le panneau de droite
  const infoDiv = document.getElementById('tile-info');
  let html = `<b>Position :</b> ${tile.row}, ${tile.col}`;
  if (foundUnit) {
    html += `<br><b>Unité :</b> ${foundUnit.team === 'blue' ? 'Bleu' : 'Rouge'} #${foundUnit.idx + 1} - ${foundUnit.name}`;
    html += `<br><b>Recovery :</b> ${foundUnit.stats.recovery}`;
    html += `<br><b>Max breath :</b> ${foundUnit.stats.maxHold}`;
    html += `<br><b>Swim speed :</b> ${foundUnit.stats.swim}`;
    html += `<br><b>Steal :</b> ${Math.round(foundUnit.stats.steal * 100)}%`;
    html += `<br><b>Flick :</b> ${foundUnit.stats.flick}`;
    html += `<br><b>Turn speed :</b> ${foundUnit.stats.turn}`;
    html += `<br><b>State :</b> ${foundUnit.atSurface ? 'Surface' : 'Bottom'}`;
    html += `<br><b>Breath :</b> ${foundUnit.breath}`;
  } else {
    html += `<br><i>Aucune unité sur cette tuile</i>`;
  }
  // Puck ?
  if (puck.row === tile.row && puck.col === tile.col) {
    html += `<br><b>Puck présent</b>`;
    if (puck.possessedBy) {
      html += ` (tenu par ${puck.possessedBy.team === 'blue' ? 'Bleu' : 'Rouge'} ${puck.possessedBy.name})`;
    }
  }
  infoDiv.innerHTML = html;
}
