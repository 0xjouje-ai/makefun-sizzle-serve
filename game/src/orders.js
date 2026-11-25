// Sizzle & Serve — the order board: tickets arrive, count down, and pay out.
// A ticket is one dish with a lifetime; serving the exact plate it asks for
// earns its price plus a speed bonus, multiplied by the current combo.
Sizzle.Orders = (function () {
  var nextTicketId = 1;

  function pickDish(rng) {
    var dishes = Sizzle.DISHES;
    return dishes[Math.floor(rng() * dishes.length)];
  }

  // A ticket's recipe as a sorted key, so plates and tickets compare by content.
  function recipeKey(needs) {
    return needs.map(function (n) { return n.item + ':' + n.state; }).sort().join('+');
  }

  function plateKey(items) {
    return items.map(function (it) { return it.item + ':' + it.state; }).sort().join('+');
  }

  return {
    recipeKey: recipeKey,
    plateKey: plateKey,

    freshBoard: function () {
      return { tickets: [], spawnIn: 1.5, served: 0, lost: 0 };
    },

    spawnTicket: function (board, elapsedSeconds, rng) {
      if (board.tickets.length >= Sizzle.MAX_TICKETS) return null;
      var dish = pickDish(rng);
      var ticket = {
        id: nextTicketId++,
        dish: dish,
        key: recipeKey(dish.needs),
        total: Sizzle.ticketLifetimeAt(elapsedSeconds),
        left: Sizzle.ticketLifetimeAt(elapsedSeconds),
        flashed: false,
      };
      board.tickets.push(ticket);
      return ticket;
    },

    // Advance spawns and countdowns. Returns 'expired' ticket ids that ran out.
    tickBoard: function (board, elapsedSeconds, dt, rng) {
      var expired = [];
      board.spawnIn -= dt;
      if (board.spawnIn <= 0) {
        if (this.spawnTicket(board, elapsedSeconds, rng)) Sizzle.Audio.ticketNew();
        board.spawnIn = Sizzle.spawnGapAt(elapsedSeconds);
      }
      for (var i = board.tickets.length - 1; i >= 0; i--) {
        var t = board.tickets[i];
        t.left -= dt;
        if (t.left <= 10 && !t.flashed) { t.flashed = true; Sizzle.Audio.tick(); }
        if (t.left <= 0) {
          expired.push(t.id);
          board.tickets.splice(i, 1);
          board.lost++;
        }
      }
      return expired;
    },

    // Find the ticket a plate completes, if any. Exact recipe match only.
    matchingTicket: function (board, plateItems) {
      var key = plateKey(plateItems);
      for (var i = 0; i < board.tickets.length; i++) {
        if (board.tickets[i].key === key) return board.tickets[i];
      }
      return null;
    },

    removeTicket: function (board, id) {
      for (var i = 0; i < board.tickets.length; i++) {
        if (board.tickets[i].id === id) { board.tickets.splice(i, 1); return; }
      }
    },

    // Coins for a served ticket: dish price + speed bonus, times the combo.
    // The speed bonus is worth up to 8 coins for a ticket served with most of
    // its time left, so a fast kitchen earns visibly more than a slow one.
    servePayout: function (ticket, combo) {
      var speedBonus = Math.round(8 * Math.max(0, ticket.left / ticket.total));
      var mult = Math.min(2, 1 + 0.1 * combo);
      return Math.round((ticket.dish.price + speedBonus) * mult);
    },
  };
})();
