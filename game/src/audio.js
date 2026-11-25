// Sizzle & Serve — all sound is synthesised with WebAudio, no audio files.
// Every effect is a tiny oscillator/noise recipe, so the game loads nothing over
// the network and stays silent until the player first interacts (browser rule).
Sizzle.Audio = (function () {
  var ctx = null;
  var muted = false;
  var sizzleNodes = null;

  function ensureContext() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    var c = ensureContext();
    if (!c) return;
    var t = c.currentTime;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function noiseBurst(dur, vol, filterFreq) {
    if (muted) return;
    var c = ensureContext();
    if (!c) return;
    var t = c.currentTime;
    var len = Math.max(1, Math.floor(c.sampleRate * dur));
    var buf = c.createBuffer(1, len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = c.createBufferSource();
    src.buffer = buf;
    var f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = filterFreq || 1800;
    var g = c.createGain();
    g.gain.setValueAtTime(vol || 0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(c.destination);
    src.start(t);
  }

  return {
    // Call from the first user gesture so later sounds are allowed to play.
    unlock: function () { ensureContext(); },
    toggleMute: function () {
      muted = !muted;
      if (muted) this.stopSizzle();
      return muted;
    },
    isMuted: function () { return muted; },

    pickup: function () { tone(520, 0.07, 'triangle', 0.10, 760); },
    place: function () { tone(220, 0.09, 'sine', 0.14, 160); noiseBurst(0.05, 0.06, 900); },
    chop: function () { noiseBurst(0.06, 0.20, 2400); tone(140, 0.06, 'square', 0.08, 90); },
    chopDone: function () { tone(660, 0.08, 'triangle', 0.12); tone(880, 0.10, 'triangle', 0.12); },
    cookDone: function () { tone(740, 0.12, 'sine', 0.14); tone(988, 0.18, 'sine', 0.14); },
    serveGood: function () {
      tone(523, 0.10, 'triangle', 0.14);
      setTimeout(function () { tone(659, 0.10, 'triangle', 0.14); }, 90);
      setTimeout(function () { tone(784, 0.22, 'triangle', 0.16); }, 180);
    },
    serveBad: function () { tone(180, 0.22, 'sawtooth', 0.10, 120); },
    ticketNew: function () { tone(880, 0.07, 'sine', 0.10, 1174); },
    ticketLost: function () { tone(392, 0.25, 'sine', 0.12, 262); },
    burnt: function () { tone(220, 0.30, 'sawtooth', 0.08, 110); },
    tick: function () { tone(1200, 0.04, 'square', 0.05); },
    startShift: function () {
      tone(523, 0.10, 'triangle', 0.14);
      setTimeout(function () { tone(784, 0.16, 'triangle', 0.14); }, 110);
    },

    // A soft looping fry hiss while any burner is cooking; start/stop as needed.
    startSizzle: function () {
      if (muted || sizzleNodes) return;
      var c = ensureContext();
      if (!c) return;
      var len = c.sampleRate;
      var buf = c.createBuffer(1, len, c.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      var src = c.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      var f = c.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 3800;
      var g = c.createGain();
      g.gain.value = 0.018;
      src.connect(f).connect(g).connect(c.destination);
      src.start();
      sizzleNodes = { src: src, gain: g };
    },
    stopSizzle: function () {
      if (!sizzleNodes) return;
      try { sizzleNodes.src.stop(); } catch (e) { /* already stopped */ }
      sizzleNodes = null;
    },
  };
})();
