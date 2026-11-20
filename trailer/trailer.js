/* Trailer playback: scale the 1920x1080 stage to the window, run the scenes on a loop. */
(() => {
  "use strict";
  const stage = document.getElementById("stage");
  const bar = document.querySelector("#bar i");
  const hint = document.getElementById("hint");
  const scenes = [...document.querySelectorAll(".scene")];
  const DUR = scenes.map((s) => +s.dataset.dur || 6000);
  const TOTAL = DUR.reduce((a, b) => a + b, 0);

  const fit = () => stage.style.setProperty("--s", Math.min(innerWidth / 1920, innerHeight / 1080).toFixed(4));
  addEventListener("resize", fit);
  fit();

  let i = -1, t0 = 0, paused = false, pausedAt = 0, raf = 0;

  // the microscope scene walks through its 8 stages while it is on screen
  const scope = document.getElementById("scope");
  const SCOPE_SCENE = scenes.findIndex((s) => s.classList.contains("s-attack"));
  const STAGES = 8;
  let scopeTimer = 0;
  function runScope(on) {
    clearInterval(scopeTimer);
    if (!on) return;
    let step = 0;
    scope.dataset.step = 0;
    const every = (DUR[SCOPE_SCENE] - 700) / STAGES;
    scopeTimer = setInterval(() => {
      step = (step + 1) % STAGES;
      scope.dataset.step = step;
    }, every);
  }

  function show(n) {
    i = n % scenes.length;
    scenes.forEach((s, k) => s.classList.toggle("on", k === i));
    runScope(i === SCOPE_SCENE);
    t0 = performance.now();
  }
  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (paused) return;
    const el = now - t0;
    bar.style.width = `${Math.min(100, (el / DUR[i]) * 100)}%`;
    if (el >= DUR[i]) show(i + 1);
  }
  show(0);
  raf = requestAnimationFrame(tick);
  setTimeout(() => hint.classList.add("gone"), 6000);

  addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === "f") { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
    else if (e.code === "Space") {
      e.preventDefault();
      paused = !paused;
      if (paused) pausedAt = performance.now(); else t0 += performance.now() - pausedAt;
    } else if (k === "arrowright") show(i + 1);
    else if (k === "arrowleft") show(i - 1 + scenes.length);
    hint.classList.add("gone");
  });
  console.log(`trailer: ${scenes.length} scenes, ${(TOTAL / 1000).toFixed(1)}s loop`);
})();
