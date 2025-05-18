// boardManager.js
function hexToPixel(row, col) {
  const x = BOARD_OFFSET_X + col * HEX_H + (row%2 ? HEX_H/2 : 0);
  const y = BOARD_OFFSET_Y + row * (HEX_SIZE * 1.5);
  return {x, y};
}

function drawHex(x, y, color, fill=true, alpha=0.13) {
  ctx.save();
  ctx.beginPath();
  for(let i=0;i<6;i++) {
    const angle = Math.PI/3 * i - Math.PI/6;
    const px = x + HEX_SIZE * Math.cos(angle);
    const py = y + HEX_SIZE * Math.sin(angle);
    if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
  }
  ctx.closePath();
  if(fill) {
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = '#bbb';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawBoard() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let r=1;r<=ROWS;r++) for(let c=1;c<=COLS;c++) {
    if (r === 1 && c >= 7 && c <= 9) {
      drawHex(...Object.values(hexToPixel(r,c)), '#1976d2', true, 0.55);
      ctx.save();
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#1976d2';
      ctx.beginPath();
      for(let i=0;i<6;i++) {
        const angle = Math.PI/3 * i - Math.PI/6;
        const px = hexToPixel(r,c).x + HEX_SIZE * Math.cos(angle);
        const py = hexToPixel(r,c).y + HEX_SIZE * Math.sin(angle);
        if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    } else if (r === 25 && c >= 7 && c <= 9) {
      drawHex(...Object.values(hexToPixel(r,c)), '#d32f2f', true, 0.55);
      ctx.save();
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#d32f2f';
      ctx.beginPath();
      for(let i=0;i<6;i++) {
        const angle = Math.PI/3 * i - Math.PI/6;
        const px = hexToPixel(r,c).x + HEX_SIZE * Math.cos(angle);
        const py = hexToPixel(r,c).y + HEX_SIZE * Math.sin(angle);
        if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    } else {
      drawHex(...Object.values(hexToPixel(r,c)), '#1976d2');
    }
  }
}

function drawPuck() {
  const {x, y} = hexToPixel(puck.row, puck.col);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, 2*Math.PI);
  ctx.fillStyle = '#ffeb3b';
  ctx.shadowColor = '#bfa600';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.restore();
}

function drawUnit(unit) {
  const {x, y} = hexToPixel(unit.row, unit.col);
  ctx.save();
  let color, border;
  if(unit.team==='blue') {
    color = unit.atSurface ? '#1976d2' : '#90caf9';
    border = '#0d47a1';
  } else {
    color = unit.atSurface ? '#d32f2f' : '#ffcdd2';
    border = '#b71c1c';
  }
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, 2*Math.PI);
  ctx.fillStyle = color;
  ctx.globalAlpha = unit.atSurface ? 1 : 0.7;
  ctx.shadowColor = unit.atSurface ? '#222' : '#fff';
  ctx.shadowBlur = unit.atSurface ? 8 : 0;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 3;
  ctx.strokeStyle = border;
  ctx.stroke();
  if(puck.possessedBy === unit) {
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, 2*Math.PI);
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const angle = Math.PI/3 * unit.facing - Math.PI/2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 24*Math.cos(angle-0.18), y + 24*Math.sin(angle-0.18));
  ctx.lineTo(x + 24*Math.cos(angle+0.18), y + 24*Math.sin(angle+0.18));
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.font = 'bold 13px Arial';
  ctx.fillStyle = '#222';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(unit.name, x, y-2);
  ctx.font = '11px Arial';
  ctx.fillStyle = '#444';
  ctx.fillText(unit.breath, x, y+13);
  ctx.restore();
}

function drawAllUnits() {
  for(const unit of units.filter(u=>u.atSurface)) drawUnit(unit);
  for(const unit of units.filter(u=>!u.atSurface)) drawUnit(unit);
}

function drawPlanned(unit) {
  const {x, y} = hexToPixel(unit.row, unit.col);
  let tx, ty, color;
  if(unit.planned.action==='move') {
    ({x:tx, y:ty} = hexToPixel(unit.planned.to.row, unit.planned.to.col));
    color = '#43a047';
  } else if(unit.planned.action==='flick') {
    ({x:tx, y:ty} = hexToPixel(unit.planned.to.row, unit.planned.to.col));
    color = '#fbc02d';
  } else if(unit.planned.action==='rotate') {
    const angle = Math.PI/3 * unit.planned.dir - Math.PI/2;
    tx = x + 36*Math.cos(angle);
    ty = y + 36*Math.sin(angle);
    color = '#8e24aa';
  } else if(unit.planned.action==='steal') {
    ({x:tx, y:ty} = hexToPixel(unit.planned.to.row, unit.planned.to.col));
    color = '#c62828';
  } else return;
  let dx = tx - x, dy = ty - y;
  let dist = Math.sqrt(dx*dx + dy*dy);
  let startX = x + (dx/dist)*20;
  let startY = y + (dy/dist)*20;
  drawArrow(startX, startY, tx, ty, color);
}

function drawArrow(x1, y1, x2, y2, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const angle = Math.atan2(y2-y1, x2-x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2-12*Math.cos(angle-0.4), y2-12*Math.sin(angle-0.4));
  ctx.lineTo(x2-12*Math.cos(angle+0.4), y2-12*Math.sin(angle+0.4));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}
