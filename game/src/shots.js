// Sizzle & Serve — screenshot scenes. `?shot=<name>&seed=1` puts the kitchen
// into a fixed, readable state so the screenshots are real renders of the
// game's own code: the same update and draw path as play, with the clocks
// frozen so the frame is stable while the picture is taken.
Sizzle.Shots = (function () {
  function dishById(id) {
    for (var i = 0; i < Sizzle.DISHES.length; i++) if (Sizzle.DISHES[i].id === id) return Sizzle.DISHES[i];
    return Sizzle.DISHES[0];
  }

  function ticketFor(G, dishId, left, total) {
    var dish = dishById(dishId);
    return {
      id: 900 + Math.floor(Math.random() * 100),
      dish: dish,
      key: Sizzle.Orders.recipeKey(dish.needs),
      total: total, left: left, flashed: false,
    };
  }

  function plateOf(items) {
    return { kind: 'plate', items: items.map(function (p) { return { item: p[0], state: p[1] }; }) };
  }

  // Every scene starts from a clean shift, then stages its moment.
  function setupShot(G, name) {
    G.demo = true;   // freeze every countdown while the shot is taken
    G.state = 'play';
    if (name === 'cover') {
      // The cover: a full kitchen — three tickets, ingredients on the counters,
      // a dish mid-assembly, a plate ready to serve, the timer running.
      G.elapsed = 46; G.coins = 46; G.combo = 2; G.hearts = 3;
      G.board.served = 3;
      G.board.tickets = [
        ticketFor(G, 'burger', 30, 50),
        ticketFor(G, 'salad', 22, 44),
        ticketFor(G, 'fries', 40, 44),
      ];
      G.surfaces.boards['board-1'] = { item: 'lettuce', state: 'raw', toState: 'chopped', progress: 0.72, total: 1.2 };
      G.surfaces.stoves['stove-1'] = { item: 'patty', state: 'raw', toState: 'cooked', progress: 2.8, total: 4, done: false, burnt: false };
      G.surfaces.stoves['stove-2'] = { item: 'potato', state: 'fried', toState: 'fried', progress: 5, total: 5, done: true, burnt: false };
      G.surfaces.assembly[0] = plateOf([['bun', 'raw'], ['patty', 'cooked']]);
      G.surfaces.assembly[1] = plateOf([['bun', 'raw'], ['patty', 'cooked'], ['lettuce', 'chopped'], ['tomato', 'chopped']]);
      G.player.x = 700; G.player.y = 620; G.player.face = 'up';
      G.player.carry = { kind: 'item', item: 'tomato', state: 'chopped' };
      G.feedback = { text: 'Added to the plate', at: G.elapsed };
    } else if (name === 'assembly') {
      // A burger coming together on the assembly counter.
      G.elapsed = 24; G.coins = 18; G.combo = 1; G.hearts = 3;
      G.board.served = 1;
      G.board.tickets = [ticketFor(G, 'cheeseburger', 34, 50)];
      G.surfaces.boards['board-1'] = { item: 'tomato', state: 'chopped', done: true };
      G.surfaces.assembly[0] = plateOf([['bun', 'raw'], ['patty', 'cooked'], ['cheese', 'raw']]);
      G.player.x = 800; G.player.y = 470; G.player.face = 'up';
      G.player.carry = { kind: 'item', item: 'lettuce', state: 'chopped' };
      G.feedback = { text: 'Added to the plate', at: G.elapsed };
    } else if (name === 'rush') {
      // The service rush: four tickets, one about to expire, stoves full.
      G.elapsed = 132; G.coins = 128; G.combo = 5; G.hearts = 2;
      G.board.served = 9;
      G.board.tickets = [
        ticketFor(G, 'burger', 6, 42),
        ticketFor(G, 'cheeseburger', 18, 44),
        ticketFor(G, 'salad', 26, 40),
        ticketFor(G, 'cheesyfries', 33, 46),
      ];
      G.surfaces.stoves['stove-1'] = { item: 'patty', state: 'cooked', toState: 'cooked', progress: 4, total: 4, done: true, burnt: false };
      G.surfaces.stoves['stove-2'] = { item: 'potato', state: 'raw', toState: 'fried', progress: 3.1, total: 5, done: false, burnt: false };
      G.surfaces.boards['board-2'] = { item: 'onion', state: 'raw', toState: 'chopped', progress: 0.9, total: 1.2 };
      G.surfaces.assembly[0] = plateOf([['lettuce', 'chopped'], ['tomato', 'chopped']]);
      G.player.x = 950; G.player.y = 560; G.player.face = 'left';
      G.player.carry = plateOf([['bun', 'raw'], ['patty', 'cooked'], ['lettuce', 'chopped']]);
      G.feedback = { text: 'Served Garden Salad +$18', at: G.elapsed };
      G.lastPayout = { amount: 18, dish: 'Garden Salad', at: G.elapsed };
    } else if (name === 'end') {
      // The end-of-shift screen.
      G.elapsed = 180; G.coins = 342; G.combo = 0; G.bestCombo = 6; G.hearts = 2;
      G.board.served = 14; G.board.lost = 3;
      G.state = 'end';
    }
  }

  return { setupShot: setupShot };
})();
