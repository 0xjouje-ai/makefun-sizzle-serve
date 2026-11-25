// Sizzle & Serve — everything the player sees, drawn with canvas shapes only.
// No image files: every ingredient, counter and ticket is vector art, so the
// game has nothing to load and its look is entirely its own.
Sizzle.Render = (function () {
  var C = Sizzle.COLORS;

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function text(ctx, s, x, y, size, color, align, weight) {
    ctx.fillStyle = color || C.ink;
    ctx.font = (weight || 'bold') + ' ' + size + 'px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  }

  // One ingredient, drawn at (x, y) with radius r. The state changes the art:
  // raw is the whole food, chopped is cut pieces, cooked/fried is the finished
  // form, burnt is charcoal. These little pictures are also the ticket icons.
  function drawItem(ctx, item, state, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    if (item === 'bun') {
      ctx.fillStyle = '#e8b96a';
      ctx.beginPath(); ctx.arc(0, 2, r, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d9a24f';
      ctx.fillRect(-r, 0, r * 2, r * 0.35);
      ctx.fillStyle = '#fff2cf';
      [[-r * 0.4, -r * 0.45], [0, -r * 0.6], [r * 0.4, -r * 0.45]].forEach(function (p) {
        ctx.beginPath(); ctx.arc(p[0], p[1], r * 0.12, 0, Math.PI * 2); ctx.fill();
      });
    } else if (item === 'patty') {
      ctx.fillStyle = state === 'burnt' ? '#222' : (state === 'cooked' ? '#6b4226' : '#8a5a3b');
      rr(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.4); ctx.fill();
      if (state === 'cooked') {
        ctx.strokeStyle = '#4a2c17'; ctx.lineWidth = 2;
        [-0.5, 0, 0.5].forEach(function (o) {
          ctx.beginPath(); ctx.moveTo(o * r, -r * 0.4); ctx.lineTo(o * r, r * 0.4); ctx.stroke();
        });
      }
    } else if (item === 'lettuce') {
      ctx.fillStyle = '#5da271';
      if (state === 'chopped') {
        for (var i = 0; i < 3; i++) {
          ctx.save(); ctx.rotate((i - 1) * 0.5);
          ctx.fillRect(-r * 0.9, -r * 0.25 + i * r * 0.3, r * 1.8, r * 0.28);
          ctx.restore();
        }
      } else {
        ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#3f7d55'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, -r * 0.5); ctx.lineTo(0, r * 0.5); ctx.stroke();
      }
    } else if (item === 'tomato') {
      ctx.fillStyle = '#e4572e';
      if (state === 'chopped') {
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.15, r * 0.25, r * 0.55, 0, Math.PI); ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3f7d55';
        ctx.beginPath(); ctx.moveTo(0, -r * 0.9); ctx.lineTo(-r * 0.3, -r * 0.4); ctx.lineTo(r * 0.3, -r * 0.4); ctx.closePath(); ctx.fill();
      }
    } else if (item === 'onion') {
      if (state === 'chopped') {
        ctx.strokeStyle = '#c9a7eb'; ctx.lineWidth = 3;
        [0.4, 0.7, 1].forEach(function (k) { ctx.beginPath(); ctx.arc(0, 0, r * k, 0, Math.PI * 2); ctx.stroke(); });
      } else {
        ctx.fillStyle = '#efe6f7';
        ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#b48ede'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#7fb069';
        ctx.fillRect(-2, -r - 4, 4, 8);
      }
    } else if (item === 'potato') {
      if (state === 'fried') {
        ctx.fillStyle = '#d4242c';
        ctx.beginPath(); ctx.moveTo(-r, -r * 0.2); ctx.lineTo(r, -r * 0.2); ctx.lineTo(r * 0.8, r); ctx.lineTo(-r * 0.8, r); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f2c14e';
        for (var j = -1; j <= 1; j++) ctx.fillRect(j * r * 0.55 - r * 0.18, -r * 1.1, r * 0.36, r * 1.1);
      } else {
        ctx.fillStyle = '#d9a441';
        ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.75, 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#b9832f';
        [[-0.3, -0.2], [0.25, 0.15], [0, -0.35]].forEach(function (p) {
          ctx.beginPath(); ctx.arc(p[0] * r, p[1] * r, r * 0.1, 0, Math.PI * 2); ctx.fill();
        });
      }
    } else if (item === 'cheese') {
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath(); ctx.moveTo(-r, r * 0.6); ctx.lineTo(r, r * 0.6); ctx.lineTo(0, -r * 0.8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e0a800';
      [[-0.3, 0.2], [0.25, 0.1]].forEach(function (p) {
        ctx.beginPath(); ctx.arc(p[0] * r, p[1] * r, r * 0.12, 0, Math.PI * 2); ctx.fill();
      });
    }
    ctx.restore();
  }

  function drawPlate(ctx, items, x, y, r, ready) {
    ctx.save();
    ctx.translate(x, y);
    if (ready) {
      ctx.strokeStyle = '#2fbf5f'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, r + 7, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.82, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9c2b4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.72, r * 0.58, 0, 0, Math.PI * 2); ctx.stroke();
    items.forEach(function (it, i) {
      var off = (i - (items.length - 1) / 2) * r * 0.42;
      drawItem(ctx, it.item, it.state, off, -2 - i * 2, r * 0.42);
    });
    ctx.restore();
  }

  function drawProgressRing(ctx, x, y, r, frac, color) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function stationLabel(ctx, s, label, sub) {
    text(ctx, label, s.x + s.w / 2, s.y + s.h - 12, 12, '#fff', 'center');
    if (sub) text(ctx, sub, s.x + s.w / 2, s.y + 14, 11, '#ffe9c4', 'center');
  }

  function drawStations(ctx, G) {
    var surf = G.surfaces;
    Sizzle.Kitchen.stations.forEach(function (s) {
      var cx = s.x + s.w / 2, cy = s.y + s.h / 2;
      if (s.kind === 'crate') {
        ctx.fillStyle = C.wood; rr(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
        ctx.fillStyle = C.woodDark; ctx.fillRect(s.x + 6, s.y + 6, s.w - 12, 4);
        drawItem(ctx, s.item, 'raw', cx, cy - 4, 17);
        text(ctx, Sizzle.ITEMS[s.item].name, cx, s.y + s.h - 10, 12, '#fff', 'center');
      } else if (s.kind === 'plates') {
        ctx.fillStyle = C.steel; rr(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
        for (var i = 0; i < 4; i++) {
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.ellipse(cx, cy + 12 - i * 7, 34, 9, 0, 0, Math.PI * 2); ctx.fill();
        }
        text(ctx, 'Plates', cx, s.y + s.h - 10, 12, '#5a5148', 'center');
      } else if (s.kind === 'board') {
        ctx.fillStyle = '#d9b380'; rr(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
        ctx.strokeStyle = '#a87c4f'; ctx.lineWidth = 2; rr(ctx, s.x + 5, s.y + 5, s.w - 10, s.h - 10, 6); ctx.stroke();
        var b = surf.boards[s.id];
        if (b && !b.done) {
          drawItem(ctx, b.item, 'raw', cx, cy - 6, 18);
          drawProgressRing(ctx, cx, cy - 6, 26, b.progress / b.total, '#2fbf5f');
          text(ctx, 'CHOPPING', cx, s.y + s.h - 10, 11, '#7a5a2e', 'center');
        } else if (b && b.done) {
          drawItem(ctx, b.item, b.state, cx, cy - 6, 18);
          text(ctx, 'READY', cx, s.y + s.h - 10, 11, '#2f7d4f', 'center');
        } else {
          text(ctx, 'CHOP', cx, cy - 2, 15, '#8a6a3f', 'center');
        }
      } else if (s.kind === 'stove') {
        ctx.fillStyle = '#3c3f45'; rr(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
        ctx.fillStyle = '#22252a';
        ctx.beginPath(); ctx.arc(cx, cy - 4, 30, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#555a63'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, cy - 4, 22, 0, Math.PI * 2); ctx.stroke();
        var st = surf.stoves[s.id];
        if (st) {
          if (st.burnt) {
            drawItem(ctx, st.item, 'burnt', cx, cy - 4, 18);
            text(ctx, 'BURNT!', cx, s.y + s.h - 10, 11, '#ff6b4a', 'center');
          } else if (st.done) {
            drawItem(ctx, st.item, st.state, cx, cy - 4, 18);
            drawProgressRing(ctx, cx, cy - 4, 26, 1 - Math.max(0, (st.progress - st.total) / 6), '#f2b705');
            text(ctx, 'READY', cx, s.y + s.h - 10, 11, '#ffd23f', 'center');
          } else {
            drawItem(ctx, st.item, 'raw', cx, cy - 4, 18);
            drawProgressRing(ctx, cx, cy - 4, 26, st.progress / st.total, '#ff8c42');
            text(ctx, 'COOKING', cx, s.y + s.h - 10, 11, '#ffb27a', 'center');
          }
        } else {
          text(ctx, 'STOVE', cx, cy - 2, 15, '#8b9098', 'center');
        }
      } else if (s.kind === 'assembly') {
        ctx.fillStyle = C.steel; rr(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
        ctx.fillStyle = C.steelDark; ctx.fillRect(s.x + 8, s.y + 8, s.w - 16, 4);
        text(ctx, 'ASSEMBLY', cx, s.y + 16, 12, '#5a5148', 'center');
        surf.assembly.forEach(function (plate, i) {
          var px = s.x + 75 + i * 150, py = s.y + 62;
          if (plate) {
            var ready = !!Sizzle.Orders.matchingTicket(G.board, plate.items);
            drawPlate(ctx, plate.items, px, py, 34, ready);
            if (ready) text(ctx, 'READY!', px, s.y + s.h - 8, 12, '#1d7a3d', 'center');
          } else {
            ctx.strokeStyle = '#a9a294'; ctx.setLineDash([5, 5]); ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(px, py, 34, 27, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      } else if (s.kind === 'trash') {
        ctx.fillStyle = '#4a4f57'; rr(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
        ctx.fillStyle = '#33373d';
        rr(ctx, s.x + 22, s.y + 14, s.w - 44, s.h - 26, 6); ctx.fill();
        text(ctx, 'TRASH', cx, s.y + s.h - 10, 12, '#cfd3d8', 'center');
      } else if (s.kind === 'pass') {
        var anyReady = surf.assembly.some(function (pl) { return pl && Sizzle.Orders.matchingTicket(G.board, pl.items); });
        ctx.fillStyle = anyReady ? '#ffe9a8' : '#e8dcc0'; rr(ctx, s.x, s.y, s.w, s.h, 10); ctx.fill();
        ctx.strokeStyle = '#b09a6a'; ctx.lineWidth = 3; rr(ctx, s.x + 4, s.y + 4, s.w - 8, s.h - 8, 8); ctx.stroke();
        text(ctx, 'SERVE HERE', cx, s.y + 20, 14, '#7a5a2e', 'center');
        ctx.fillStyle = '#c9a227';
        ctx.beginPath(); ctx.arc(cx - 40, cy + 12, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8a6d1f'; ctx.fillRect(cx - 42, cy + 22, 4, 8);
        text(ctx, anyReady ? 'A plate is ready!' : 'Bring a finished plate', cx + 22, cy + 14, 13, '#5a4a28', 'center');
      }
    });
  }

  function drawPlayer(ctx, G) {
    var p = G.player;
    var bob = (Math.abs(Sizzle.Input.moveVector().x) + Math.abs(Sizzle.Input.moveVector().y)) > 0
      ? Math.sin(p.walkPhase) * 2 : 0;
    ctx.save();
    ctx.translate(p.x, p.y + bob);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(0, 20, 22, 8, 0, 0, Math.PI * 2); ctx.fill();
    // body (apron)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, 6, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e4572e';
    ctx.fillRect(-20, 2, 40, 8);
    // head + toque
    ctx.fillStyle = '#f2c79b';
    ctx.beginPath(); ctx.arc(0, -16, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(-7, -26, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, -26, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -29, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-13, -28, 26, 6);
    // face
    ctx.fillStyle = '#3a2a1a';
    var look = p.face === 'left' ? -3 : (p.face === 'right' ? 3 : 0);
    ctx.beginPath(); ctx.arc(-4 + look, -16, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4 + look, -16, 1.8, 0, Math.PI * 2); ctx.fill();
    // carried thing, held high
    if (p.carry) {
      if (p.carry.kind === 'plate') drawPlate(ctx, p.carry.items, 0, -52, 22, false);
      else drawItem(ctx, p.carry.item, p.carry.state, 0, -52, 16);
    }
    ctx.restore();
  }

  function drawTopBar(ctx, G) {
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(0, 0, Sizzle.CANVAS_W, Sizzle.TOP_BAR_H);
    ctx.fillStyle = '#2b2118';
    ctx.fillRect(0, Sizzle.TOP_BAR_H - 6, Sizzle.CANVAS_W, 6);
    // coins + hearts
    text(ctx, '$ ' + G.coins, 24, 34, 26, '#ffd23f', 'left');
    for (var h = 0; h < Sizzle.MAX_HEARTS; h++) {
      ctx.fillStyle = h < G.hearts ? '#ff5a5a' : 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.arc(28 + h * 30, 72, 11, 0, Math.PI * 2); ctx.fill();
    }
    text(ctx, 'dishes ' + G.board.served, 24, 92, 13, '#cbb59a', 'left');
    // tickets
    G.board.tickets.forEach(function (t, i) {
      var x = 250 + i * 208, y = 8, w = 200, h = 88;
      var frac = Math.max(0, t.left / t.total);
      var urgent = t.left <= 10;
      ctx.fillStyle = urgent && Math.floor(G.elapsed * 4) % 2 === 0 ? '#ffe1d6' : C.ticket;
      rr(ctx, x, y, w, h, 8); ctx.fill();
      ctx.strokeStyle = urgent ? '#e4572e' : C.ticketEdge; ctx.lineWidth = 2;
      rr(ctx, x, y, w, h, 8); ctx.stroke();
      text(ctx, t.dish.name, x + 12, y + 16, 14, C.ink, 'left');
      t.dish.needs.forEach(function (n, j) {
        drawItem(ctx, n.item, n.state, x + 24 + j * 34, y + 44, 12);
      });
      ctx.fillStyle = '#d9c48a'; ctx.fillRect(x + 10, y + h - 16, w - 20, 8);
      ctx.fillStyle = frac > 0.5 ? '#5da271' : (frac > 0.25 ? '#f2b705' : '#e4572e');
      ctx.fillRect(x + 10, y + h - 16, (w - 20) * frac, 8);
      text(ctx, Math.ceil(t.left) + 's', x + w - 12, y + h - 12, 12, urgent ? '#e4572e' : '#7a6a4a', 'right');
    });
    // shift timer + combo
    var remain = Math.max(0, Sizzle.SHIFT_SECONDS - G.elapsed);
    var mm = Math.floor(remain / 60), ss = Math.floor(remain % 60);
    text(ctx, mm + ':' + (ss < 10 ? '0' : '') + ss, 1240, 34, 28, remain <= 30 ? '#ff8c6a' : '#fff6e5', 'right');
    text(ctx, 'SHIFT', 1240, 58, 12, '#cbb59a', 'right');
    if (G.combo >= 2) {
      ctx.fillStyle = '#f2b705';
      rr(ctx, 1140, 70, 112, 26, 13); ctx.fill();
      text(ctx, 'COMBO x' + G.combo, 1196, 83, 14, '#3a2a1a', 'center');
    }
  }

  function drawFeedback(ctx, G) {
    if (!G.feedback) return;
    var age = G.elapsed - G.feedback.at;
    if (age > 1.8) { G.feedback = null; return; }
    ctx.save();
    ctx.globalAlpha = 1 - age / 1.8;
    ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff6e5';
    ctx.strokeText(G.feedback.text, G.player.x, G.player.y - 78);
    text(ctx, G.feedback.text, G.player.x, G.player.y - 78, 15, '#3a2a1a', 'center');
    ctx.restore();
  }

  function drawFloor(ctx) {
    ctx.fillStyle = C.floor;
    ctx.fillRect(0, Sizzle.TOP_BAR_H, Sizzle.CANVAS_W, Sizzle.CANVAS_H - Sizzle.TOP_BAR_H);
    ctx.fillStyle = C.floorTile;
    for (var y = Sizzle.TOP_BAR_H + 32; y < Sizzle.CANVAS_H; y += 64) {
      for (var x = 32; x < Sizzle.CANVAS_W; x += 64) {
        if (((x + y) / 64) % 2 === 0) ctx.fillRect(x, y, 60, 60);
      }
    }
    ctx.fillStyle = C.wall;
    ctx.fillRect(0, Sizzle.TOP_BAR_H, Sizzle.CANVAS_W, 8);
  }

  function overlay(ctx, title, lines, foot, accent) {
    ctx.fillStyle = 'rgba(43,33,24,0.72)';
    ctx.fillRect(0, 0, Sizzle.CANVAS_W, Sizzle.CANVAS_H);
    ctx.fillStyle = '#fff6e5';
    rr(ctx, 340, 170, 600, 440, 16); ctx.fill();
    ctx.strokeStyle = accent || '#e4572e'; ctx.lineWidth = 4;
    rr(ctx, 340, 170, 600, 440, 16); ctx.stroke();
    text(ctx, title, 640, 230, 44, '#e4572e', 'center');
    lines.forEach(function (ln, i) {
      text(ctx, ln, 640, 300 + i * 34, 18, '#3a2a1a', 'center', i === 0 ? 'bold' : 'normal');
    });
    if (foot) text(ctx, foot, 640, 560, 16, '#8a6a3f', 'center');
  }

  return {
    drawItem: drawItem,
    drawPlate: drawPlate,

    drawGame: function (ctx, G) {
      drawFloor(ctx);
      drawStations(ctx, G);
      drawPlayer(ctx, G);
      drawTopBar(ctx, G);
      drawFeedback(ctx, G);
      if (G.state === 'menu') {
        overlay(ctx, 'SIZZLE & SERVE', [
          'The dinner rush is on. Take orders, chop, fry and plate',
          'dishes, then serve them at the pass before tickets run out.',
          '',
          'Move: WASD / Arrows    Interact: E or Space',
          'Chop on the boards, cook on the stoves,',
          'build plates on the assembly counter.',
        ], 'Click or press Enter to start your shift', '#e4572e');
      } else if (G.state === 'paused') {
        overlay(ctx, 'PAUSED', ['Take a breath, chef.', '', 'P to resume    R to restart'], null, '#5da271');
      } else if (G.state === 'end') {
        var acc = G.board.served + G.board.lost > 0
          ? Math.round(100 * G.board.served / (G.board.served + G.board.lost)) : 100;
        overlay(ctx, 'SHIFT OVER!', [
          'Score: $' + G.coins + '   ·   Dishes served: ' + G.board.served,
          'Best combo: x' + G.bestCombo + '   ·   Accuracy: ' + acc + '%',
          'Tickets lost: ' + G.board.lost,
          '',
          G.hearts <= 0 ? 'The kitchen lost its cool — too many tickets expired.' : 'The rush is done. The regulars are happy.',
        ], 'Press R or click to play another shift', '#5da271');
      }
      if (G.lastPayout && G.elapsed - G.lastPayout.at < 2) {
        text(ctx, '+$' + G.lastPayout.amount + '  ' + G.lastPayout.dish, 640, 150, 26, '#1d7a3d', 'center');
      }
    },
  };
})();
