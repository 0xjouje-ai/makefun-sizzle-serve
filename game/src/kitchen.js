// Sizzle & Serve — the kitchen itself: station rectangles, collision, and the
// work surfaces (chopping boards, stove burners, assembly counter, pass window).
// Each board/stove holds one job at a time with its own progress; the assembly
// counter holds up to two plates being built.
Sizzle.Kitchen = (function () {
  var stations = Sizzle.STATIONS;

  function stationById(id) {
    for (var i = 0; i < stations.length; i++) if (stations[i].id === id) return stations[i];
    return null;
  }

  function centre(s) { return { x: s.x + s.w / 2, y: s.y + s.h / 2 }; }

  function rectsOverlap(ax, ay, ar, bx, by, bw, bh) {
    return ax + ar > bx && ax - ar < bx + bw && ay + ar > by && ay - ar < by + bh;
  }

  // Fresh mutable state for the work surfaces (called on every new shift).
  function freshSurfaces() {
    return {
      boards: { 'board-1': null, 'board-2': null },   // { item, state, progress, total } | null
      stoves: { 'stove-1': null, 'stove-2': null },   // { item, state, progress, total, done, burnt } | null
      assembly: [null, null],                          // plates sitting on the counter, or null
    };
  }

  return {
    stations: stations,
    stationById: stationById,
    centre: centre,
    freshSurfaces: freshSurfaces,

    // The closest station whose edge is within interaction range of (x, y).
    nearestStation: function (x, y) {
      var best = null, bestD = Sizzle.INTERACT_RANGE + 1;
      for (var i = 0; i < stations.length; i++) {
        var s = stations[i];
        var cx = Math.max(s.x, Math.min(x, s.x + s.w));
        var cy = Math.max(s.y, Math.min(y, s.y + s.h));
        var d = Math.hypot(x - cx, y - cy);
        if (d < bestD) { bestD = d; best = s; }
      }
      return best;
    },

    // True when a circle at (x, y) with radius r would hit a station or a wall.
    // The top bar and the outer frame are walls; the floor between stations is free.
    hitsObstacle: function (x, y, r) {
      if (x - r < 8 || x + r > Sizzle.CANVAS_W - 8) return true;
      if (y - r < Sizzle.TOP_BAR_H + 4 || y + r > Sizzle.CANVAS_H - 8) return true;
      for (var i = 0; i < stations.length; i++) {
        var s = stations[i];
        if (rectsOverlap(x, y, r, s.x, s.y, s.w, s.h)) return true;
      }
      return false;
    },

    // Advance every board and stove job by dt seconds. Chopping finishes into a
    // chopped item; cooking finishes into a cooked/fried item, then burns if the
    // cook leaves it sitting too long after it is done.
    tickSurfaces: function (surfaces, dt, onEvent) {
      var id;
      for (id in surfaces.boards) {
        var b = surfaces.boards[id];
        if (!b || b.done) continue;
        b.progress += dt;
        if (b.progress >= b.total) {
          surfaces.boards[id] = { item: b.item, state: b.toState, done: true };
          onEvent('chopDone', id);
        }
      }
      for (id in surfaces.stoves) {
        var s = surfaces.stoves[id];
        if (!s || s.burnt) continue;
        s.progress += dt;
        if (!s.done && s.progress >= s.total) {
          s.done = true;
          s.state = s.toState;
          onEvent('cookDone', id);
        } else if (s.done && s.progress >= s.total + 6) {
          s.burnt = true;
          s.state = 'burnt';
          onEvent('burnt', id);
        }
      }
    },

    // Is any burner actively cooking right now (for the sizzle loop)?
    anyBurnerCooking: function (surfaces) {
      for (var id in surfaces.stoves) {
        var s = surfaces.stoves[id];
        if (s && !s.done && !s.burnt) return true;
      }
      return false;
    },
  };
})();
