// Sizzle & Serve — the game loop: states (menu / play / paused / end), the
// clock, and the wiring between input, player, kitchen and the order board.
// A `?shot=<name>&seed=1` URL stages a frozen screenshot scene instead of the
// menu, so the screenshots are the game itself, not a mock-up.
(function () {
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  Sizzle.Input.attachMouse(canvas);

  // Small seeded RNG so a shot URL is reproducible and play stays varied.
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function freshGame(seed) {
    return {
      state: 'menu',
      elapsed: 0,
      coins: 0,
      hearts: Sizzle.MAX_HEARTS,
      combo: 0,
      comboTimer: 0,
      bestCombo: 0,
      demo: false,
      rng: mulberry32(seed || 1),
      player: Sizzle.Player.freshPlayer(),
      surfaces: Sizzle.Kitchen.freshSurfaces(),
      board: Sizzle.Orders.freshBoard(),
      feedback: null,
      lastPayout: null,
    };
  }

  var params = new URLSearchParams(window.location.search);
  var shotName = params.get('shot');
  var seed = parseInt(params.get('seed') || '1', 10) || 1;
  var G = freshGame(seed);

  // Read-only handle for playtesting in a browser console: window.__sizzle.
  Object.defineProperty(window, '__sizzle', { get: function () { return G; } });

  function startShift() {
    G = freshGame(seed);
    G.state = 'play';
    Sizzle.Audio.unlock();
    Sizzle.Audio.startShift();
  }

  function endShift() {
    G.state = 'end';
    Sizzle.Audio.stopSizzle();
  }

  function update(dt) {
    if (G.state !== 'play') return;
    if (!G.demo) G.elapsed += dt;
    if (G.comboTimer > 0) {
      G.comboTimer -= dt;
      if (G.comboTimer <= 0) G.combo = 0;
    }
    if (G.combo > G.bestCombo) G.bestCombo = G.combo;

    Sizzle.Player.movePlayer(G, dt);

    // Work the surfaces; the callbacks below are the only place sounds fire.
    Sizzle.Kitchen.tickSurfaces(G.surfaces, dt, function (event) {
      if (event === 'chopDone') Sizzle.Audio.chopDone();
      if (event === 'cookDone') Sizzle.Audio.cookDone();
      if (event === 'burnt') Sizzle.Audio.burnt();
    });
    if (Sizzle.Kitchen.anyBurnerCooking(G.surfaces)) Sizzle.Audio.startSizzle();
    else Sizzle.Audio.stopSizzle();

    if (!G.demo) {
      var expired = Sizzle.Orders.tickBoard(G.board, G.elapsed, dt, G.rng);
      expired.forEach(function () {
        G.hearts--;
        G.combo = 0;
        G.feedback = { text: 'Ticket expired!', at: G.elapsed };
        Sizzle.Audio.ticketLost();
      });
      if (G.hearts <= 0 || G.elapsed >= Sizzle.SHIFT_SECONDS) endShift();
    }
  }

  function handleInput() {
    if (Sizzle.Input.wasPressed('KeyM')) {
      var muted = Sizzle.Audio.toggleMute();
      G.feedback = { text: muted ? 'Sound off' : 'Sound on', at: G.elapsed };
    }
    if (G.state === 'menu') {
      if (Sizzle.Input.wasPressed('Enter') || Sizzle.Input.mouseClicked()) startShift();
      return;
    }
    if (G.state === 'end') {
      if (Sizzle.Input.wasPressed('KeyR') || Sizzle.Input.mouseClicked()) startShift();
      return;
    }
    if (Sizzle.Input.wasPressed('KeyP')) {
      G.state = G.state === 'paused' ? 'play' : 'paused';
      return;
    }
    if (Sizzle.Input.wasPressed('KeyR')) { startShift(); return; }
    if (G.state !== 'play') return;
    if (Sizzle.Input.interactPressed() || Sizzle.Input.mouseClicked()) {
      var label = Sizzle.Player.interact(G);
      if (label) G.feedback = { text: label, at: G.elapsed };
    }
  }

  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    handleInput();
    update(dt);
    Sizzle.Render.drawGame(ctx, G);
    Sizzle.Input.endFrame();
    requestAnimationFrame(frame);
  }

  if (shotName) {
    // Screenshot mode: stage the scene and hold it still for the camera.
    Sizzle.Shots.setupShot(G, shotName);
  }
  requestAnimationFrame(frame);
})();
