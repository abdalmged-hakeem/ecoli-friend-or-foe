/* The People v. E. coli: interactions. No libraries, no tracking. Texts come from js/i18n.js. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  let lang = root.lang === "ar" ? "ar" : "en";
  const T = () => window.I18N[lang];
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch (_) { /* private mode */ } };
  let refreshMenu = () => {};
  const load = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };

  /* ---------- evidence: 8 badges, kept on this phone only ---------- */
  const EVI = ["zoom", "sim", "parts", "sides", "build", "judge", "attack", "cook"];
  const evidence = (() => {
    let got = [];
    try { got = JSON.parse(load("evidence") || "[]").filter((k) => EVI.includes(k)); } catch (_) { got = []; }
    let toastTimer = 0;
    function paint() {
      $("#eviCount").textContent = got.length;
      const L = T().evi;
      $("#eviGrid").innerHTML = EVI.map((k, i) => `<li class="${got.includes(k) ? "got" : ""}"><span class="ei" aria-hidden="true">${L.icons[i]}</span>`
        + `<b>${L.names[i]}</b><small>${got.includes(k) ? L.done : L.todo}</small></li>`).join("");
      $("#certSave").disabled = got.length < EVI.length;
      $("#certNote").textContent = got.length < EVI.length ? L.left(EVI.length - got.length) : L.ready;
      $("#eviPill").classList.toggle("full", got.length === EVI.length);
    }
    function award(k) {
      if (got.includes(k)) return;
      got.push(k); store("evidence", JSON.stringify(got)); paint();
      const t = $("#toast"), L = T().evi, i = EVI.indexOf(k);
      t.innerHTML = `<span aria-hidden="true">${L.icons[i]}</span> ${L.toast(L.names[i], got.length)}`;
      t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
      if (navigator.vibrate) { try { navigator.vibrate(30); } catch (_) { /* ignore */ } }
      const pill = $("#eviPill"); pill.classList.remove("pop"); void pill.offsetWidth; pill.classList.add("pop");
      refreshMenu();
    }
    return { award, paint, all: () => got.length === EVI.length, has: (k) => got.includes(k) };
  })();
  window.evidence = evidence;

  /* ---------- run animations only while a section is on screen ---------- */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      e.target.classList.toggle("inview", e.isIntersecting);
      for (const s of $$("svg", e.target)) {
        if (s.pauseAnimations) e.isIntersecting && !reduce ? s.unpauseAnimations() : s.pauseAnimations();
      }
      if (e.target.id === "twenty" && !e.isIntersecting) sim.stop();
    }
  }, { threshold: 0.12 });
  $$(".sec").forEach((s) => io.observe(s));

  /* ---------- 2. zoom ---------- */
  const zoom = $(".zoom");
  const setZoom = (lvl) => {
    zoom.dataset.level = lvl;
    const z = T().zoom;
    $(".sb-label", zoom).textContent = z[lvl][0];
    $("#zoomCap").innerHTML = z[lvl][1];
    $("#zoomOut").disabled = lvl === 0;
    $("#zoomIn").disabled = lvl === z.length - 1;
    if (lvl === z.length - 1) evidence.award("zoom");
  };
  $("#zoomIn").addEventListener("click", () => setZoom(Math.min(+zoom.dataset.level + 1, 2)));
  $("#zoomOut").addEventListener("click", () => setZoom(Math.max(+zoom.dataset.level - 1, 0)));

  /* ---------- 3. twenty-minute simulator ---------- */
  const sim = (() => {
    const cv = $("#simCanvas"), ctx = cv.getContext("2d");
    const MAX_GEN = 30, MAX_DRAW = 1024, STEP_MS = 900;
    let gen = 0, timer = null, t0 = 0, raf = 0;
    const fmtTime = (g) => { const m = g * 20; return T().time(Math.floor(m / 60), String(m % 60).padStart(2, "0")); };
    const fmtCount = (n) => n.toLocaleString("en") + (n >= 1e9 ? T().billion(Math.round(n / 1e9)) : "");

    function rod(x, y, w, h, a, fill) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      const r = h / 2;
      ctx.beginPath(); ctx.moveTo(-w / 2 + r, -r); ctx.lineTo(w / 2 - r, -r); ctx.arc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(-w / 2 + r, r); ctx.arc(-w / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = Math.max(1, h * .12); ctx.strokeStyle = "#1B1A17"; ctx.stroke();
      ctx.restore();
    }
    function draw(g, p = 1) {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      const n = Math.min(2 ** g, MAX_DRAW);
      const cols = Math.ceil(Math.sqrt(n * W / H)), rows = Math.ceil(n / cols);
      const cw = W / cols, ch = H / rows;
      const len = Math.min(cw * .78, ch * 1.6), wid = len * .38;
      let seed = 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < n; i++) {
        const c = i % cols, r = Math.floor(i / cols);
        const a = (rnd() - .5) * .8;
        const fresh = i >= n / 2 && 2 ** g <= MAX_DRAW;
        const s = fresh ? p : 1;
        rod(c * cw + cw / 2, r * ch + ch / 2, len * (.55 + .45 * s), wid, a, fresh && p < 1 ? "#E9F6F1" : "#BFE3D6");
      }
      if (2 ** g > MAX_DRAW) {
        ctx.fillStyle = "rgba(27,26,23,.78)"; ctx.fillRect(0, H / 2 - 34, W, 68);
        ctx.fillStyle = "#fff"; ctx.font = `700 26px ${lang === "ar" ? "system-ui, sans-serif" : "Fraunces, Georgia, serif"}`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(T().tooMany, W / 2, H / 2);
      }
    }
    function show(g, animate) {
      gen = g;
      if (g >= 15) evidence.award("sim");
      $("#simTime").textContent = fmtTime(g);
      $("#simCount").textContent = fmtCount(2 ** g);
      cancelAnimationFrame(raf);
      if (!animate || reduce) return draw(g);
      t0 = performance.now();
      const tick = (t) => { const p = Math.min(1, (t - t0) / 450); draw(g, p); if (p < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    }
    const label = () => { $("#simStart").textContent = timer ? T().pause : gen >= MAX_GEN ? T().done : T().start; };
    function stop() { clearInterval(timer); timer = null; label(); }
    function start() {
      if (timer) return stop();
      if (gen >= MAX_GEN) show(0, false);
      timer = setInterval(() => { if (gen >= MAX_GEN) return stop(); show(gen + 1, true); }, STEP_MS);
      label();
    }
    $("#simStart").addEventListener("click", start);
    $("#simReset").addEventListener("click", () => { stop(); show(0, false); label(); });
    $$(".jump .chip").forEach((b) => b.addEventListener("click", () => { stop(); show(+b.dataset.h * 3, true); }));
    if (document.fonts) document.fonts.ready.then(() => show(gen, false));
    return { stop, refresh: () => { show(gen, false); label(); } };
  })();

  /* ---------- 4. anatomy hotspots ---------- */
  const card = $("#partCard");
  let part = null;
  const showPart = (flash) => {
    const [t, d] = part ? T().parts[part] : T().partDefault;
    card.innerHTML = `<h3>${t}</h3><p>${d}</p>`;
    if (flash) { card.classList.remove("flash"); void card.offsetWidth; card.classList.add("flash"); }
  };
  const seen = new Set();
  const pick = (el) => {
    part = el.dataset.part;
    seen.add(part);
    if (seen.size === $$(".hot").length) evidence.award("parts");
    $$(".hot").forEach((h) => h.classList.toggle("on", h === el));
    showPart(true);
  };
  $$(".hot").forEach((h) => {
    h.addEventListener("click", () => pick(h));
    h.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(h); } });
  });

  /* ---------- 5. friend / foe switch ---------- */
  const setSide = (side) => {
    document.body.dataset.side = side;
    $("#tabFriend").setAttribute("aria-selected", side === "friend");
    $("#tabFoe").setAttribute("aria-selected", side === "foe");
    $("#panelFriend").hidden = side !== "friend";
    $("#panelFoe").hidden = side !== "foe";
    $('meta[name="theme-color"]').content = side === "foe" ? "#F6DDD7" : "#F2ECDD";
    if (side === "foe") evidence.award("sides");
  };
  $$(".switch button").forEach((b) => b.addEventListener("click", () => setSide(b.dataset.side)));

  /* ---------- 6. you are the judge ---------- */
  const deck = $("#deck"), fb = $("#feedback"), bNext = $("#bNext"), bG = $("#bGuilty"), bI = $("#bInnocent");
  const DATA = $("#cardData").content.children;
  let idx = 0, score = 0, current = null, voted = false, lastDir = "left", lastRight = false, finished = false;
  const tag = (d) => (lang === "ar" ? d.dataset.tagAr : d.dataset.tag);
  const why = (d) => (lang === "ar" ? d.dataset.whyAr : d.dataset.why);

  function paintCard() {
    const d = DATA[idx];
    $(".no", current).textContent = T().strainOf(idx + 1, DATA.length);
    $(".tag", current).textContent = tag(d);
    if (!voted) return;
    const truth = d.dataset.guilty === "1";
    $(".stampv", current).textContent = truth ? T().guilty : T().innocent;
    fb.innerHTML = `<b class="${lastRight ? "ok" : "no"}">${lastRight ? T().correct : T().overruled}</b> ${why(d)}`;
    bNext.textContent = idx === DATA.length - 1 ? T().seeScore : T().next;
  }
  function deal() {
    deck.innerHTML = "";
    if (idx >= DATA.length) return finish();
    const d = DATA[idx];
    const el = document.createElement("article");
    el.className = "jcard";
    el.innerHTML = `<p class="no"></p><h3 dir="ltr">${d.dataset.name}</h3><p class="tag"></p>
      <div class="pic">${$(".n", d).innerHTML}</div><span class="stampv"></span>`;
    deck.appendChild(el);
    current = el; voted = false;
    fb.innerHTML = "&nbsp;";
    bNext.hidden = true; bG.disabled = bI.disabled = false;
    paintCard();
    drag(el);
  }
  function vote(guilty) {
    if (voted) return;
    voted = true;
    const d = DATA[idx], truth = d.dataset.guilty === "1";
    lastRight = guilty === truth;
    if (lastRight) score++;
    lastDir = guilty ? "left" : "right";
    current.style.transform = "";
    current.classList.add("judged", truth ? "is-guilty" : "is-innocent");
    $(".pic", current).innerHTML = $(".c", d).innerHTML;
    bG.disabled = bI.disabled = true;
    bNext.hidden = false;
    paintCard();
    bNext.focus({ preventScroll: true });
  }
  function next() {
    current.classList.add(lastDir === "left" ? "out-left" : "out-right");
    idx++;
    setTimeout(deal, reduce ? 0 : 320);
  }
  function paintResult() {
    $("#score").textContent = `${score} / ${DATA.length}`;
    const r = T().ranks;
    const rank = score === 8 ? r[0] : score >= 6 ? r[1] : score >= 4 ? r[2] : r[3];
    $("#scoreLine").textContent = `${rank} ${T().remember}`;
  }
  function finish() {
    finished = true;
    $(".verdict-btns").hidden = true; deck.hidden = true; bNext.hidden = true; fb.innerHTML = "";
    $("#result").hidden = false;
    paintResult();
    evidence.award("judge");
  }
  function drag(el) {
    let x0 = null, dx = 0;
    el.addEventListener("pointerdown", (e) => { if (voted) return; x0 = e.clientX; dx = 0; el.setPointerCapture(e.pointerId); el.style.transition = "none"; });
    el.addEventListener("pointermove", (e) => { if (x0 === null) return; dx = e.clientX - x0; el.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`; });
    const end = () => {
      if (x0 === null) return;
      x0 = null; el.style.transition = "";
      if (Math.abs(dx) > 80) vote(dx < 0); else el.style.transform = "";
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }
  bG.addEventListener("click", () => vote(true));
  bI.addEventListener("click", () => vote(false));
  bNext.addEventListener("click", next);
  $("#bAgain").addEventListener("click", () => {
    idx = 0; score = 0; finished = false;
    deck.hidden = false; $("#result").hidden = true; $(".verdict-btns").hidden = false; deal();
  });
  $("#bShare").addEventListener("click", async () => {
    const text = T().shareText(score);
    try {
      if (navigator.share) await navigator.share({ title: T().shareTitle, text, url: location.href });
      else { await navigator.clipboard.writeText(`${text} ${location.href}`); $("#bShare").textContent = T().copied; }
    } catch (_) { /* user cancelled */ }
  });

  /* ---------- language switch ---------- */
  function applyLang() {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    const page = window.I18N.ar.page;
    for (const el of $$("[data-i18n]")) {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      const k = el.dataset.i18n;
      el.innerHTML = lang === "ar" && page[k] ? page[k] : el.dataset.en;
    }
    document.title = T().docTitle;
    setZoom(+zoom.dataset.level);
    showPart(false);
    sim.refresh();
    if (finished) paintResult(); else if (current) paintCard();
    evidence.paint();
    refreshMenu();
    document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
  }
  $("#langBtn").addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    store("lang", lang);
    applyLang();
  });

  deal();

  /* ---------- gentle one-shot reveals as sections come into view ---------- */
  if (!reduce) {
    const SEL = ".sec > .kicker, .sec > h2, .sec > p, .pcard, .labsteps article, .gene, .evi-grid li, .sim, .zoom, .anat-wrap, .build-stage, .attack-stage, .cert-form, .deck";
    // anything inside a panel that starts hidden is skipped: it has its own entrance
    const els = $$(SEL).filter((el) => !el.closest(".side-panel"));
    const byParent = new Map();
    for (const el of els) {
      el.classList.add("reveal");
      const sibs = byParent.get(el.parentElement) || [];
      sibs.push(el);
      byParent.set(el.parentElement, sibs);
    }
    for (const sibs of byParent.values()) sibs.forEach((el, i) => el.style.setProperty("--rd", `${Math.min(i, 6) * 55}ms`));
    const ro = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("in");
        ro.unobserve(e.target);
        setTimeout(() => e.target.classList.add("done"), 1200);
      }
    }, { threshold: 0.06, rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => ro.observe(el));
    // safety net: never leave anything invisible
    setTimeout(() => els.forEach((el) => el.classList.add("in")), 6000);
  }

  /* ---------- progress bar, exhibits menu, back to the top ---------- */
  const SEC_BADGE = { size: "zoom", twenty: "sim", inside: "parts", hearing: "sides", build: "build", judge: "judge", attack: "attack", safe: "cook" };
  const menuBtn = $("#menuBtn"), menuPanel = $("#menuPanel"), menuList = $("#menuList"), toTop = $("#toTop"), progFill = $("#prog i");

  function buildMenu() {
    menuList.innerHTML = $$("main .sec[id], footer.sec").map((s) => {
      const h = s.querySelector("h2");
      if (!h) return "";
      const k = SEC_BADGE[s.id];
      const done = k && evidence.has(k);
      const id = s.id || "credits";
      if (!s.id) s.id = "credits";
      return `<li><a href="#${id}"${done ? ' class="done"' : ""}><span class="tick" aria-hidden="true">${done ? "✓" : ""}</span>${h.textContent.trim()}</a></li>`;
    }).join("") + `<li><a class="ext" href="trailer/"><span class="tick" aria-hidden="true"></span>${T().watchMenu}</a></li>`;
  }
  const closeMenu = () => { menuPanel.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); };
  menuBtn.addEventListener("click", () => {
    if (menuPanel.hidden) { buildMenu(); menuPanel.hidden = false; menuBtn.setAttribute("aria-expanded", "true"); }
    else closeMenu();
  });
  menuList.addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });
  document.addEventListener("click", (e) => {
    if (!menuPanel.hidden && !menuPanel.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const y = scrollY;
      progFill.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      toTop.classList.toggle("show", y > innerHeight * 1.2);
      ticking = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
  refreshMenu = () => { if (!menuPanel.hidden) buildMenu(); };

  applyLang();
})();
