// Sizzle & Serve — shared constants: dishes, ingredients, colours, kitchen layout.
// Every other file reads from the single game object `G` built in main.js; this file
// only holds data, no behaviour, so the recipes and the room stay easy to tune.
window.Sizzle = window.Sizzle || {};

Sizzle.CANVAS_W = 1280;
Sizzle.CANVAS_H = 800;
Sizzle.TOP_BAR_H = 104;          // order board strip at the top of the screen
Sizzle.PLAYER_SPEED = 265;       // px per second
Sizzle.PLAYER_RADIUS = 24;
Sizzle.INTERACT_RANGE = 78;      // px from a station's edge to use it
Sizzle.SHIFT_SECONDS = 180;      // one full shift
Sizzle.MAX_HEARTS = 3;
Sizzle.MAX_TICKETS = 4;
Sizzle.COMBO_WINDOW_SECONDS = 25;

// Ingredient catalogue. `prep` names the station that prepares it and the state it
// becomes; null means the ingredient is used as it comes from its crate.
Sizzle.ITEMS = {
  bun:     { name: 'Bun',     color: '#e8b96a', prep: null,    prepState: null,    cookSeconds: 0 },
  patty:   { name: 'Patty',   color: '#8a5a3b', prep: 'stove', prepState: 'cooked', cookSeconds: 4 },
  lettuce: { name: 'Lettuce', color: '#5da271', prep: 'board', prepState: 'chopped', cookSeconds: 1.2 },
  tomato:  { name: 'Tomato',  color: '#e4572e', prep: 'board', prepState: 'chopped', cookSeconds: 1.2 },
  onion:   { name: 'Onion',   color: '#c9a7eb', prep: 'board', prepState: 'chopped', cookSeconds: 1.2 },
  potato:  { name: 'Potato',  color: '#f2c14e', prep: 'stove', prepState: 'fried',   cookSeconds: 5 },
  cheese:  { name: 'Cheese',  color: '#ffd23f', prep: null,    prepState: null,    cookSeconds: 0 },
};

// A dish is a multiset of { item, state } pairs. `state` is 'raw' for unprepared
// ingredients and the prepState above for prepared ones.
Sizzle.DISHES = [
  { id: 'burger', name: 'Classic Burger', price: 12,
    needs: [{ item: 'bun', state: 'raw' }, { item: 'patty', state: 'cooked' },
            { item: 'lettuce', state: 'chopped' }, { item: 'tomato', state: 'chopped' }] },
  { id: 'cheeseburger', name: 'Cheese Burger', price: 14,
    needs: [{ item: 'bun', state: 'raw' }, { item: 'patty', state: 'cooked' },
            { item: 'cheese', state: 'raw' }, { item: 'lettuce', state: 'chopped' }] },
  { id: 'salad', name: 'Garden Salad', price: 10,
    needs: [{ item: 'lettuce', state: 'chopped' }, { item: 'tomato', state: 'chopped' },
            { item: 'onion', state: 'chopped' }] },
  { id: 'fries', name: 'Golden Fries', price: 8,
    needs: [{ item: 'potato', state: 'fried' }] },
  { id: 'cheesyfries', name: 'Cheesy Fries', price: 11,
    needs: [{ item: 'potato', state: 'fried' }, { item: 'cheese', state: 'raw' }] },
];

// Kitchen floor plan. Every station is a rectangle the player walks around; the
// interaction point is its centre. Crates sit along the left wall, the work
// stations fill the middle, the pass window waits at the top right.
Sizzle.STATIONS = [
  // ingredient crates (left wall, top to bottom)
  { id: 'crate-bun',     kind: 'crate', item: 'bun',     x: 16,  y: 124, w: 116, h: 66 },
  { id: 'crate-patty',   kind: 'crate', item: 'patty',   x: 16,  y: 198, w: 116, h: 66 },
  { id: 'crate-lettuce', kind: 'crate', item: 'lettuce', x: 16,  y: 272, w: 116, h: 66 },
  { id: 'crate-tomato',  kind: 'crate', item: 'tomato',  x: 16,  y: 346, w: 116, h: 66 },
  { id: 'crate-onion',   kind: 'crate', item: 'onion',   x: 16,  y: 420, w: 116, h: 66 },
  { id: 'crate-potato',  kind: 'crate', item: 'potato',  x: 16,  y: 494, w: 116, h: 66 },
  { id: 'crate-cheese',  kind: 'crate', item: 'cheese',  x: 16,  y: 568, w: 116, h: 66 },
  // plate stack (bottom left)
  { id: 'plates', kind: 'plates', x: 16, y: 652, w: 116, h: 66 },
  // chopping boards (middle left)
  { id: 'board-1', kind: 'board', x: 300, y: 280, w: 150, h: 92 },
  { id: 'board-2', kind: 'board', x: 300, y: 440, w: 150, h: 92 },
  // stoves (middle)
  { id: 'stove-1', kind: 'stove', x: 520, y: 280, w: 150, h: 92 },
  { id: 'stove-2', kind: 'stove', x: 520, y: 440, w: 150, h: 92 },
  // assembly counter (middle right, two plate slots)
  { id: 'assembly', kind: 'assembly', x: 760, y: 300, w: 300, h: 110 },
  // trash bin (bottom right)
  { id: 'trash', kind: 'trash', x: 1148, y: 652, w: 116, h: 66 },
  // serving pass window (top right, under the order board)
  { id: 'pass', kind: 'pass', x: 980, y: 116, w: 284, h: 74 },
];

Sizzle.COLORS = {
  floor: '#f3e2c7',
  floorTile: '#ecd9b8',
  wall: '#8a5a3b',
  wood: '#b07a45',
  woodDark: '#8f6234',
  steel: '#c8ccd2',
  steelDark: '#9aa0a8',
  ticket: '#fff8e0',
  ticketEdge: '#d9c48a',
  red: '#e4572e',
  green: '#5da271',
  gold: '#f2b705',
  ink: '#3a2a1a',
  cream: '#fff6e5',
};

// Ticket pacing: spawn gap and ticket lifetime shrink as the shift goes on.
Sizzle.spawnGapAt = function (elapsedSeconds) {
  return Math.max(8, 13 - elapsedSeconds / 30);
};
Sizzle.ticketLifetimeAt = function (elapsedSeconds) {
  return Math.max(38, 50 - elapsedSeconds / 15);
};
