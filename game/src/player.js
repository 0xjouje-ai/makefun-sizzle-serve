// Sizzle & Serve — the chef: movement, what they carry, and what happens when
// they use a station. The chef carries one thing at a time — a single ingredient
// or one plate — so every dish is a planned route through the kitchen.
Sizzle.Player = (function () {
  function freshPlayer() {
    return {
      x: 640, y: 620,
      carry: null,   // { kind: 'item', item, state } | { kind: 'plate', items: [] } | null
      face: 'up',    // last movement direction, for drawing the chef
      walkPhase: 0,  // animates the chef's bob while walking
    };
  }

  function movePlayer(G, dt) {
    var v = Sizzle.Input.moveVector();
    var p = G.player;
    if (v.x !== 0 || v.y !== 0) {
      if (Math.abs(v.x) > Math.abs(v.y)) p.face = v.x > 0 ? 'right' : 'left';
      else p.face = v.y > 0 ? 'down' : 'up';
      p.walkPhase += dt * 10;
      var step = Sizzle.PLAYER_SPEED * dt;
      var nx = p.x + v.x * step;
      var ny = p.y + v.y * step;
      // Move axis by axis so the chef slides along counters instead of sticking.
      if (!Sizzle.Kitchen.hitsObstacle(nx, p.y, Sizzle.PLAYER_RADIUS)) p.x = nx;
      if (!Sizzle.Kitchen.hitsObstacle(p.x, ny, Sizzle.PLAYER_RADIUS)) p.y = ny;
    }
  }

  // One context action at the nearest station. Returns a short label of what
  // happened, for the floating feedback text ('Picked up Tomato', 'Chopped!'...).
  function interact(G) {
    var p = G.player;
    var s = Sizzle.Kitchen.nearestStation(p.x, p.y);
    if (!s) return null;
    var surf = G.surfaces;

    if (s.kind === 'crate') {
      if (p.carry) return null;
      p.carry = { kind: 'item', item: s.item, state: 'raw' };
      Sizzle.Audio.pickup();
      return 'Picked up ' + Sizzle.ITEMS[s.item].name;
    }

    if (s.kind === 'plates') {
      if (p.carry) return null;
      p.carry = { kind: 'plate', items: [] };
      Sizzle.Audio.pickup();
      return 'Picked up a plate';
    }

    if (s.kind === 'board') {
      var board = surf.boards[s.id];
      if (!board && p.carry && p.carry.kind === 'item') {
        var def = Sizzle.ITEMS[p.carry.item];
        if (def.prep === 'board' && p.carry.state === 'raw') {
          surf.boards[s.id] = { item: p.carry.item, state: 'raw', toState: def.prepState, progress: 0, total: def.cookSeconds };
          p.carry = null;
          Sizzle.Audio.chop();
          return 'Chopping ' + def.name + '...';
        }
        return 'That goes on the stove, not the board';
      }
      if (board && board.done && !p.carry) {
        p.carry = { kind: 'item', item: board.item, state: board.state };
        surf.boards[s.id] = null;
        Sizzle.Audio.pickup();
        return 'Picked up chopped ' + Sizzle.ITEMS[board.item].name;
      }
      return null;
    }

    if (s.kind === 'stove') {
      var stove = surf.stoves[s.id];
      if (!stove && p.carry && p.carry.kind === 'item') {
        var sdef = Sizzle.ITEMS[p.carry.item];
        if (sdef.prep === 'stove' && p.carry.state === 'raw') {
          surf.stoves[s.id] = { item: p.carry.item, state: 'raw', toState: sdef.prepState, progress: 0, total: sdef.cookSeconds, done: false, burnt: false };
          p.carry = null;
          Sizzle.Audio.place();
          return 'Cooking ' + sdef.name + '...';
        }
        return 'That goes on the board, not the stove';
      }
      if (stove && (stove.done || stove.burnt) && !p.carry) {
        p.carry = { kind: 'item', item: stove.item, state: stove.state };
        surf.stoves[s.id] = null;
        Sizzle.Audio.pickup();
        return stove.burnt ? 'Picked up burnt ' + Sizzle.ITEMS[stove.item].name + ' — bin it!' : 'Picked up ' + Sizzle.ITEMS[stove.item].name;
      }
      return null;
    }

    if (s.kind === 'assembly') {
      var slots = surf.assembly;
      if (p.carry && p.carry.kind === 'plate') {
        for (var i = 0; i < slots.length; i++) {
          if (!slots[i]) {
            slots[i] = p.carry;
            p.carry = null;
            Sizzle.Audio.place();
            return 'Plate on the counter';
          }
        }
        return 'Counter is full';
      }
      if (p.carry && p.carry.kind === 'item') {
        for (var j = 0; j < slots.length; j++) {
          var plate = slots[j];
          if (plate && plate.items.length < 5) {
            plate.items.push({ item: p.carry.item, state: p.carry.state });
            p.carry = null;
            Sizzle.Audio.place();
            return 'Added to the plate';
          }
        }
        return 'No plate on the counter';
      }
      if (!p.carry) {
        for (var k = slots.length - 1; k >= 0; k--) {
          if (slots[k]) {
            p.carry = slots[k];
            slots[k] = null;
            Sizzle.Audio.pickup();
            return 'Picked up the plate';
          }
        }
      }
      return null;
    }

    if (s.kind === 'pass') {
      if (p.carry && p.carry.kind === 'plate') {
        var ticket = Sizzle.Orders.matchingTicket(G.board, p.carry.items);
        if (ticket) {
          var payout = Sizzle.Orders.servePayout(ticket, G.combo);
          Sizzle.Orders.removeTicket(G.board, ticket.id);
          G.board.served++;
          G.coins += payout;
          G.combo++;
          G.comboTimer = Sizzle.COMBO_WINDOW_SECONDS;
          G.lastPayout = { amount: payout, dish: ticket.dish.name, at: G.elapsed };
          p.carry = null;
          Sizzle.Audio.serveGood();
          return 'Served ' + ticket.dish.name + ' +$' + payout;
        }
        G.combo = 0;
        Sizzle.Audio.serveBad();
        return 'No ticket wants this plate';
      }
      return null;
    }

    if (s.kind === 'trash') {
      if (p.carry) {
        var what = p.carry.kind === 'plate' ? 'the plate' : Sizzle.ITEMS[p.carry.item].name;
        p.carry = null;
        Sizzle.Audio.place();
        return 'Binned ' + what;
      }
      return null;
    }

    return null;
  }

  return { freshPlayer: freshPlayer, movePlayer: movePlayer, interact: interact };
})();
