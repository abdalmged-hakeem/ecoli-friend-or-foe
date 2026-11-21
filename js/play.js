/* Hands-on exhibits: build a foe, watch the attack, grow and stain it, cook the burger, and the certificate. Texts: js/i18n.js (.play). */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const P = () => window.I18N[document.documentElement.lang === "ar" ? "ar" : "en"].play;
  const award = (k) => window.evidence && window.evidence.award(k);
  const refreshers = [];
  document.addEventListener("langchange", () => refreshers.forEach((f) => f()));

  /* ================= Exhibit 4: build a foe ================= */
  (() => {
    const stage = $("#buildStage"), out = $("#buildResult");
    const genes = new Set();
    function paint() {
      for (const g of ["tox", "stick", "res"]) stage.classList.toggle(`has-${g}`, genes.has(g));
      stage.classList.toggle("is-foe", genes.has("tox") || genes.has("stick"));
      stage.classList.toggle("is-warn", genes.has("res") && !genes.has("tox") && !genes.has("stick"));
      const t = P().build;
      $$(".gene").forEach((b) => {
        const on = genes.has(b.dataset.gene);
        b.classList.toggle("used", on);
        b.setAttribute("aria-pressed", on);
        b.dataset.added = P().added;
      });
      $("#buildReset").hidden = genes.size === 0;
      let title, cls;
      if (genes.has("tox") && genes.has("stick") && genes.has("res")) { title = t.all; cls = "bad"; }
      else if (genes.has("tox") && genes.has("stick")) { title = t.both; cls = "bad"; }
      else if (genes.has("tox")) { title = t.tox; cls = "bad"; }
      else if (genes.has("stick")) { title = t.stick; cls = "bad"; }
      else if (genes.has("res")) { title = t.res; cls = "warn"; }
      else { title = t.none; cls = "ok"; }
      const lines = [...genes].map((g) => `<li>${t.why[g]}</li>`).join("");
      out.className = `build-result ${cls}`;
      out.innerHTML = `<b>${title[0]}</b><span>${title[1]}</span>${lines ? `<ul>${lines}</ul>` : ""}`;
    }
    function add(g, from) {
      if (genes.has(g)) return;
      genes.add(g);
      if (from && !reduce) {          // a small token flies into the cell
        const a = from.getBoundingClientRect(), b = stage.getBoundingClientRect();
        const tok = from.querySelector("svg").cloneNode(true);
        tok.classList.add("fly");
        tok.style.left = `${a.left}px`; tok.style.top = `${a.top}px`;
        document.body.appendChild(tok);
        const dx = b.left + b.width / 2 - a.left - 20, dy = b.top + b.height / 2 - a.top - 20;
        tok.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.4)`, opacity: .2 }],
          { duration: 600, easing: "cubic-bezier(.3,.7,.4,1)" }).onfinish = () => tok.remove();
        setTimeout(paint, 520);
      } else paint();
      stage.classList.remove("zap"); void stage.offsetWidth; stage.classList.add("zap");
      if (g !== "res") award("build");
    }
    // drag a gene onto the cell, or just tap it
    $$(".gene").forEach((btn) => {
      let ghost = null, x0 = 0, y0 = 0, moved = false, active = false;
      const move = (e) => {
        if (!active) return;
        if (!moved && Math.hypot(e.clientX - x0, e.clientY - y0) > 10) {
          moved = true;
          ghost = btn.querySelector("svg").cloneNode(true); ghost.classList.add("fly", "ghost"); document.body.appendChild(ghost);
        }
        if (ghost) { ghost.style.left = `${e.clientX - 24}px`; ghost.style.top = `${e.clientY - 24}px`; }
        if (moved) stage.classList.toggle("over", inside(e));
      };
      const end = (e) => {
        if (!active) return;
        active = false;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
        stage.classList.remove("over");
        if (ghost) { ghost.remove(); ghost = null; }
        if (e.type === "pointercancel") return;
        if (!moved) add(btn.dataset.gene, btn);
        else if (inside(e)) add(btn.dataset.gene, null);
      };
      btn.addEventListener("pointerdown", (e) => {
        if (genes.has(btn.dataset.gene)) return;
        e.preventDefault();
        x0 = e.clientX; y0 = e.clientY; moved = false; active = true;
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", end);
        window.addEventListener("pointercancel", end);
      });
      btn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); add(btn.dataset.gene, btn); } });
    });
    const inside = (e) => { const r = stage.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom; };
    $("#buildReset").addEventListener("click", () => { genes.clear(); paint(); });
    refreshers.push(paint);
    paint();
  })();

  /* ================= one step player, shared by the attack and the Gram stain ================= */
  // ids: <id>Stage, <id>Card, <id>Dots, <id>Prev, <id>Play, <id>Next. steps() gives [title, text] pairs,
  // cardClass(step) the card's colour, extra(step) html after the text, onStep(step) runs after every paint.
  function stepper(id, { steps, cardClass = () => "", extra = () => "", onStep = () => {} }) {
    const stage = $(`#${id}Stage`), card = $(`#${id}Card`), dots = $(`#${id}Dots`);
    const bPrev = $(`#${id}Prev`), bNext = $(`#${id}Next`), bPlay = $(`#${id}Play`);
    let step = 0, timer = null;
    const N = () => steps().length;
    function paint() {
      const a = P().attack, [t, d] = steps()[step];
      stage.dataset.step = step;
      card.className = `attack-card${cardClass(step)}`;
      card.innerHTML = `<span class="step-n">${a.stepOf(step + 1, N())}</span><h3>${t}</h3><p>${d}</p>${extra(step)}`;
      dots.innerHTML = steps().map((s, i) => `<button type="button" role="tab" aria-selected="${i === step}" aria-label="${s[0]}" data-i="${i}"></button>`).join("");
      bPrev.disabled = step === 0;
      bNext.textContent = step === N() - 1 ? a.again : a.next;
      bPlay.textContent = timer ? a.pause : a.play;
      onStep(step);
    }
    const go = (i) => { step = (i + N()) % N(); paint(); };
    const stop = () => { clearInterval(timer); timer = null; paint(); };
    bNext.addEventListener("click", () => { stop(); go(step + 1); });
    bPrev.addEventListener("click", () => { stop(); go(step - 1); });
    dots.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { stop(); go(+b.dataset.i); } });
    bPlay.addEventListener("click", () => {
      if (timer) return stop();
      if (step === N() - 1) step = -1;
      timer = setInterval(() => { if (step >= N() - 1) return stop(); go(step + 1); }, 3600);
      go(step + 1);
    });
    // stop autoplay when the section scrolls away
    new IntersectionObserver(([e]) => { if (!e.isIntersecting && timer) stop(); }, { threshold: .1 }).observe(stage);
    refreshers.push(paint);
    paint();
    return { go, stop };
  }

  /* ================= Exhibit 5: grow it on a plate ================= */
  (() => {
    const plate = $("#plate"), hours = $("#cultHours"), out = $("#plateCard");
    const pick = (attr, v) => {
      plate.dataset[attr] = v;
      $$(`#plate [data-${attr}]`).forEach((b) => b.setAttribute("aria-pressed", b.dataset[attr] === v));
      paint();
    };
    function paint() {
      const h = +hours.value, c = P().culture, m = plate.dataset.medium, s = plate.dataset.strain;
      plate.style.setProperty("--g", Math.max(0, Math.min(1, (h - 6) / 14)));   // visible from ~8 h, full size by 20 h
      hours.style.setProperty("--p", `${h / 24 * 100}%`);
      $("#plateRead").textContent = c.read(h);
      const key = m === "smac" ? `smac_${s}` : m;
      const [t, d] = h < 8 ? c.early : h < 16 ? c.growing : c[key];
      const caught = h >= 16 && key === "smac_o157";
      out.className = `plate-card${caught ? " caught" : ""}`;
      out.innerHTML = `<b>${t}</b><span>${d}</span>`;
      if (caught) award("culture");
    }
    $$("#plate button[data-medium]").forEach((b) => b.addEventListener("click", () => pick("medium", b.dataset.medium)));
    $$("#plate button[data-strain]").forEach((b) => b.addEventListener("click", () => pick("strain", b.dataset.strain)));
    hours.addEventListener("input", paint);
    refreshers.push(paint);
    paint();
  })();

  /* ================= Exhibit 6: Gram stain ================= */
  (() => {
    const stage = $("#stainStage"), oops = $("#stainOops");
    const err = () => stage.dataset.err === "1";
    let last = 0;
    const steps = () => { const t = P().stain; return t.steps.map((s, i) => (err() && t.wrong[i]) || s); };
    const st = stepper("stain", {
      steps,
      cardClass: (i) => (err() && i >= 3 ? " bad" : !err() && i === 4 ? " ok" : ""),
      extra: (i) => (i === 4 && !err() ? `<a class="go-attack" href="#act5">${P().stain.link}</a>` : ""),
      onStep: (i) => {
        oops.textContent = err() ? P().stain.fix : P().stain.oops;
        if (i === 4 && !err()) award("stain");
        if (i !== last) { last = i; stage.classList.remove("washing"); void stage.offsetWidth; stage.classList.add("washing"); }
      },
    });
    oops.addEventListener("click", () => {
      const was = err();
      stage.dataset.err = was ? "0" : "1";
      st.stop(); st.go(was ? 0 : 3);
    });
  })();

  /* ================= Exhibit 7: under the microscope ================= */
  stepper("attack", {
    steps: () => P().attack.steps,
    cardClass: (i) => (i >= 5 ? " bad" : i === 0 ? " ok" : ""),
    onStep: (i) => { if (i === P().attack.steps.length - 1) award("attack"); },
  });

  /* ================= Order 2: cook the burger ================= */
  (() => {
    const input = $("#cookTemp"), meat = $("#meat"), germs = $$("#germs .germ");
    const STOPS = [[20, [232, 139, 139]], [50, [226, 150, 140]], [65, [190, 130, 110]], [71, [160, 112, 88]], [80, [122, 83, 64]]];
    const mix = (t) => {
      for (let i = 1; i < STOPS.length; i++) {
        const [t1, c1] = STOPS[i - 1], [t2, c2] = STOPS[i];
        if (t <= t2) { const f = (t - t1) / (t2 - t1); return c1.map((v, k) => Math.round(v + (c2[k] - v) * f)); }
      }
      return STOPS[STOPS.length - 1][1];
    };
    function paint() {
      const t = +input.value, c = P().cook;
      meat.setAttribute("fill", `rgb(${mix(t).join(",")})`);
      const life = t < 50 ? 1 : t >= 71 ? 0 : (71 - t) / 21;
      germs.forEach((g, i) => { g.style.opacity = life > i / germs.length ? 1 : 0; });
      $("#cookRead").textContent = `${t} °C`;
      $("#cookRead").classList.toggle("safe", t >= 71);
      const m = $("#cookMsg");
      if (t >= 71) {
        award("cook");
        const all = window.evidence && window.evidence.all();
        m.className = "cook-msg safe"; m.innerHTML = `${c.safe} <a class="go-attack" href="#verdict">${all ? c.toVerdictAll : c.toVerdict}</a>`;
      }
      else if (t >= 50) { m.className = "cook-msg warn"; m.innerHTML = c.warm; }
      else { m.className = "cook-msg"; m.innerHTML = c.raw; }
      input.style.setProperty("--p", `${(t - 20) / 60 * 100}%`);
    }
    input.addEventListener("input", paint);
    refreshers.push(paint);
    paint();
  })();

  /* ================= certificate ================= */
  (() => {
    const btn = $("#certSave"), name = $("#certName");
    try { name.value = localStorage.getItem("certName") || ""; } catch (_) { /* private mode */ }
    name.addEventListener("input", () => { try { localStorage.setItem("certName", name.value); } catch (_) { /* ignore */ } });
    const ph = () => { name.placeholder = P().cert.ph; };
    refreshers.push(ph); ph();
    // draws the certificate onto any 1600 x 1130 canvas: the on-page preview and the saved image are the same picture
    async function draw(cv) {
      const c = P().cert, ar = document.documentElement.lang === "ar";
      const W = 1600, H = 1130;
      const x = cv.getContext("2d");
      const serif = ar ? '"Geeza Pro", "Noto Naskh Arabic", serif' : 'Fraunces, Georgia, serif';
      const sans = ar ? '"Geeza Pro", "Noto Sans Arabic", system-ui, sans-serif' : 'system-ui, -apple-system, sans-serif';
      if (document.fonts) await document.fonts.ready;
      x.clearRect(0, 0, W, H);
      x.fillStyle = "#F2ECDD"; x.fillRect(0, 0, W, H);
      x.strokeStyle = "#1B1A17"; x.lineWidth = 10; x.strokeRect(40, 40, W - 80, H - 80);
      x.lineWidth = 3; x.strokeRect(62, 62, W - 124, H - 124);
      x.textAlign = "center"; x.direction = ar ? "rtl" : "ltr"; x.fillStyle = "#1B1A17";
      x.font = `700 30px ${sans}`; x.fillText(c.court, W / 2, 160);
      x.font = `600 112px ${serif}`; x.fillText(c.title, W / 2, 300);
      x.fillStyle = "#B8892B"; x.fillRect(W / 2 - 160, 340, 320, 6);
      x.fillStyle = "#1B1A17"; x.font = `400 40px ${sans}`; x.fillText(c.certifies, W / 2, 430);
      // the name shrinks until it fits inside the frame, however long it is
      const who = name.value.trim() || c.anon;
      let size = 92;
      const slant = ar ? "" : "italic ";
      do { x.font = `${slant}700 ${size}px ${serif}`; size -= 4; } while (x.measureText(who).width > 1340 && size >= 40);
      x.fillStyle = "#A61B29";
      x.fillText(who, W / 2, 550, 1340);
      x.fillStyle = "#1B1A17"; x.font = `400 38px ${sans}`;
      c.body.forEach((l, i) => x.fillText(l, W / 2, 650 + i * 56, 1340));
      x.font = `600 64px ${serif}`; x.fillText(c.verdict, W / 2, 860, 1340);
      x.font = `${ar ? "" : "italic "}500 34px ${serif}`; x.fillStyle = "#0F6B5C";
      x.fillText(c.thanks, W / 2, 935, 780);           // kept narrow so it never runs under the stamp
      x.font = `400 28px ${sans}`; x.fillStyle = "#6A655A";
      x.fillText(new Date().toLocaleDateString(ar ? "ar" : "en-GB", { year: "numeric", month: "long", day: "numeric" }), W / 2, 1000);
      // the court stamp, drawn from the page's own SVG
      const st = $(".stamp-wrap svg");
      if (st) {
        const s = st.cloneNode(true); s.setAttribute("width", "260"); s.setAttribute("height", "260");
        const W4 = window.I18N[ar ? "ar" : "en"].stamps.cert;
        s.querySelectorAll("text").forEach((n, i) => { n.textContent = W4[i]; });   // the certificate carries the verdict
        s.querySelectorAll("*").forEach((n) => { if (n.getAttribute("stroke")) n.setAttribute("stroke", "#A61B29"); if (n.tagName === "text") { n.setAttribute("fill", "#A61B29"); n.setAttribute("font-family", ar ? "Geeza Pro, Noto Sans Arabic, sans-serif" : "monospace"); n.setAttribute("font-weight", "800"); n.setAttribute("font-size", n.classList.contains("small") ? "6.4" : "9.6"); } });
        const im = new Image();
        await new Promise((ok) => { im.onload = ok; im.onerror = ok; im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(s)); });
        try { x.drawImage(im, W - 380, H - 380, 260, 260); } catch (_) { /* skip stamp */ }
      }
      return cv;
    }
    // the preview appears once all ten pieces are in, and follows the name as it is typed
    const wrap = $("#certPreviewWrap"), preview = $("#certPreview"), saved = $("#certSaved");
    let pt = 0;
    const refreshPreview = () => {
      clearTimeout(pt);
      pt = setTimeout(() => {
        const all = window.evidence && window.evidence.all();
        wrap.hidden = !all;
        if (all) draw(preview);
      }, 120);
    };
    name.addEventListener("input", () => { saved.textContent = ""; savedKind = ""; refreshPreview(); });
    document.addEventListener("evidencechange", refreshPreview);
    refreshers.push(refreshPreview);
    let savedKind = "";
    refreshers.push(() => { if (savedKind) saved.textContent = P().cert[savedKind]; });
    refreshPreview();
    btn.addEventListener("click", async () => {
      const c = P().cert;
      const cv = document.createElement("canvas"); cv.width = 1600; cv.height = 1130;
      await draw(cv);
      const fileName = "e-coli-judge-certificate.png";
      const blob = await new Promise((ok) => cv.toBlob(ok, "image/png"));
      const file = blob && typeof File === "function" ? new File([blob], fileName, { type: "image/png" }) : null;
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: c.shareTitle }); saved.textContent = c.shared; savedKind = "shared"; return; } catch (e) { if (e && e.name === "AbortError") return; }
      }
      const a = document.createElement("a");
      a.download = fileName;
      a.href = blob ? URL.createObjectURL(blob) : cv.toDataURL("image/png");
      document.body.appendChild(a); a.click(); a.remove();
      if (blob) setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      saved.textContent = c.downloaded; savedKind = "downloaded";
    });
  })();
})();
