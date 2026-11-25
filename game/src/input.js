// Sizzle & Serve — keyboard and mouse input. The game keeps one shared input
// object: held keys for movement, edge-triggered presses for actions, and the
// mouse position for menu buttons and click-to-interact.
Sizzle.Input = (function () {
  var keys = {};
  var pressed = {};   // keys pressed since the last frame was consumed
  var mouse = { x: 0, y: 0, clicked: false, down: false };

  var MOVE_KEYS = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
  };

  function keyName(e) { return e.code || e.key; }

  window.addEventListener('keydown', function (e) {
    var k = keyName(e);
    if (MOVE_KEYS[k] || k === 'Space' || k === 'ArrowUp' || k === 'ArrowDown') e.preventDefault();
    if (!keys[k]) pressed[k] = true;   // edge: only the first keydown counts
    keys[k] = true;
  });
  window.addEventListener('keyup', function (e) { keys[keyName(e)] = false; });
  window.addEventListener('blur', function () { keys = {}; pressed = {}; });

  function attachMouse(canvas) {
    function updatePos(e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
      mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    }
    canvas.addEventListener('mousemove', updatePos);
    canvas.addEventListener('mousedown', function (e) { updatePos(e); mouse.down = true; });
    canvas.addEventListener('mouseup', function (e) { updatePos(e); mouse.down = false; mouse.clicked = true; });
  }

  return {
    attachMouse: attachMouse,

    // -1/0/1 movement axes from the currently held keys.
    moveVector: function () {
      var x = 0, y = 0;
      if (keys.ArrowLeft || keys.KeyA) x -= 1;
      if (keys.ArrowRight || keys.KeyD) x += 1;
      if (keys.ArrowUp || keys.KeyW) y -= 1;
      if (keys.ArrowDown || keys.KeyS) y += 1;
      if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
      return { x: x, y: y };
    },

    // True once for the frame in which the key went down.
    wasPressed: function (code) {
      if (pressed[code]) { pressed[code] = false; return true; }
      return false;
    },
    interactPressed: function () {
      return this.wasPressed('KeyE') || this.wasPressed('Space');
    },
    mouseClicked: function () {
      if (mouse.clicked) { mouse.clicked = false; return true; }
      return false;
    },
    mousePos: function () { return { x: mouse.x, y: mouse.y }; },

    // Drop edge presses at the end of each frame so a press never fires twice.
    endFrame: function () { pressed = {}; },
  };
})();
