// unitManager.js
function randomStat(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomProb(min, max) { return Math.round((Math.random() * (max - min) + min) * 10) / 10; }
function randomTurnSpeed() { return [1/3, 2/3, 1][Math.floor(Math.random()*3)]; }

function genUnit(team, idx, row, col, facing) {
  return {
    team, idx, name: unitAcronyms[idx],
    row, col, facing,
    atSurface: true,
    stats: {
      recovery: randomStat(1,5),
      maxHold: randomStat(15,25),
      swim: randomStat(1,3),
      steal: randomProb(0.1,0.8),
      flick: randomStat(1,3),
      turn: randomTurnSpeed()
    },
    breath: undefined,
    planned: { action: 'move', to: {row, col}, dir: facing }
  };
}

function getInitialUnits() {
  const blue = bluePositions.map((p, i) => genUnit('blue', i, p.row, p.col, 3));
  const red = redPositions.map((p, i) => genUnit('red', i, p.row, p.col, 0));
  [...blue, ...red].forEach(u => u.breath = u.stats.maxHold);
  return blue.concat(red);
}
