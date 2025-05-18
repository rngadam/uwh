// gameState.js
const ROWS = 25, COLS = 15;
const HEX_SIZE = 22;
const HEX_H = Math.sqrt(3) * HEX_SIZE;
const BOARD_OFFSET_X = 40, BOARD_OFFSET_Y = 30;

const TEAM_BLUE = 'blue';
const TEAM_RED = 'red';
const unitAcronyms = ['LF', 'CF', 'RF', 'LB', 'CB', 'RB'];
const CENTER = { y: 13, x: 8 };

const bluePositions = [
  { name: "LB", row: 1, col: 6 },
  { name: "LF", row: 1, col: 7 },
  { name: "CF", row: 1, col: 8 },
  { name: "RF", row: 1, col: 9 },
  { name: "RB", row: 1, col: 10 },
  { name: "CB", row: 1, col: 11 }
];
const redPositions = [
  { name: "LB", row: 25, col: 11 },
  { name: "LF", row: 25, col: 10 },
  { name: "CF", row: 25, col: 8 },
  { name: "RF", row: 25, col: 7 },
  { name: "RB", row: 25, col: 6 },
  { name: "CB", row: 25, col: 5 }
];

// État global du jeu
let units;
let puck;
let score;
let turn;
