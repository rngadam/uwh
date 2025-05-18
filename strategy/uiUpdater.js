// uiUpdater.js
let messageHistory = [];

function showMessage(msg) {
  const el = document.getElementById('message');
  el.textContent = msg;
  el.style.display = 'block';
  messageHistory.unshift(msg);
  if(messageHistory.length > 12) messageHistory.length = 12;
  updateHistory();
  if(window.messageTimeout) clearTimeout(window.messageTimeout);
  window.messageTimeout = setTimeout(()=>{el.style.display='none';}, 2200);
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
  tables.style.maxWidth = "320px";
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
  tables.innerHTML = puckPos + makeTable('blue') + makeTable('red');
}

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('board');
  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    let found = null;
    for(const unit of units) {
      const {x, y} = hexToPixel(unit.row, unit.col);
      if(Math.hypot(mx-x, my-y) < 22) { found = unit; break; }
    }
    const hover = document.getElementById('hovercard');
    if(found) {
      hover.style.display = 'block';
      hover.style.left = (e.clientX+16)+'px';
      hover.style.top = (e.clientY-8)+'px';
      hover.innerHTML = `<b>${found.team==='blue'?'Blue':'Red'} #${found.idx+1} - ${found.name}</b><br>
        <b>Recovery:</b> ${found.stats.recovery}<br>
        <b>Max breath:</b> ${found.stats.maxHold}<br>
        <b>Swim speed:</b> ${found.stats.swim}<br>
        <b>Steal:</b> ${Math.round(found.stats.steal*100)}%<br>
        <b>Flick:</b> ${found.stats.flick}<br>
        <b>Turn speed:</b> ${found.stats.turn}<br>
        <b>State:</b> ${found.atSurface?'Surface':'Bottom'}<br>
        <b>Breath:</b> ${found.breath}`;
    } else {
      hover.style.display = 'none';
    }
  });
  canvas.addEventListener('mouseleave', ()=>{
    document.getElementById('hovercard').style.display = 'none';
  });
});
