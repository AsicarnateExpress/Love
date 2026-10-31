(function () {
  // Change these defaults to your own details (or use "Make it yours" on the page).
  var DEFAULTS = { n1: "Gabriel", n2: "Rhyza", start: "2025-01-01", msg: "" };

  var NOTES = [
    "Thank you for choosing me again this month. I would choose you in every one after it.",
    "Another month, and you are still my favorite hello and my softest goodnight.",
    "Mahal kita, today and on all the ordinary days in between.",
    "You made a regular month feel like the best one yet. Let's do the next one together.",
    "I don't need a perfect date. I only need you across the table, laughing at my jokes.",
    "Every month with you is a small promise that keeps coming true."
  ];

  var KEY = "monthsary-details";
  var state = {}, noteIdx = 0;

  function load() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    state = {
      n1: saved.n1 || DEFAULTS.n1,
      n2: saved.n2 || DEFAULTS.n2,
      start: saved.start || DEFAULTS.start,
      msg: saved.msg || DEFAULTS.msg
    };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  function parseDate(s) {
    var p = (s || "").split("-");
    if (p.length !== 3) return null;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d) ? null : d;
  }
  function dim(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function addMonths(start, n) {
    var t = start.getMonth() + n;
    var y = start.getFullYear() + Math.floor(t / 12);
    var m = ((t % 12) + 12) % 12;
    return new Date(y, m, Math.min(start.getDate(), dim(y, m)));
  }
  function fullMonths(start, now) {
    var m = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
    while (m > 0 && addMonths(start, m) > now) m--;
    return Math.max(0, m);
  }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function el(id) { return document.getElementById(id); }

  function render() {
    var start = parseDate(state.start) || parseDate(DEFAULTS.start);
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var future = start > today;
    var months = future ? 0 : fullMonths(start, today);
    var next = future ? start : addMonths(start, months + 1);
    var isToday = !future && months > 0 && addMonths(start, months).getTime() === today.getTime();
    var days = future ? 0 : Math.round((today - start) / 864e5);
    var toGo = isToday ? 0 : Math.round((next - today) / 864e5);

    var names = el("names");
    names.innerHTML = "";
    var a = document.createElement("span"); a.textContent = state.n1;
    var amp = document.createElement("span"); amp.className = "amp"; amp.textContent = "&";
    var b = document.createElement("span"); b.textContent = state.n2;
    names.append(a, amp, b);

    el("months").textContent = months;
    el("unit").textContent = months === 1 ? "month" : "months";
    el("days").textContent = days.toLocaleString();
    el("nextDate").textContent = isToday ? "Today" : next.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    el("toGo").textContent = toGo;
    el("banner").hidden = !isToday;

    var startLabel = start.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    var st;
    if (future) st = "Your story starts on " + startLabel + ".";
    else if (isToday) st = "Exactly " + plural(months, "month") + " since " + startLabel + ".";
    else if (months === 0) st = "Your first monthsary is in " + plural(toGo, "day") + ".";
    else st = plural(months, "month") + " and " + plural(Math.round((today - addMonths(start, months)) / 864e5), "day") +
      " together. The next monthsary is in " + plural(toGo, "day") + ".";
    el("status").textContent = st;

    var inYear = months > 0 && months % 12 === 0 ? 12 : months % 12;
    var dots = el("dots");
    dots.innerHTML = "";
    for (var i = 1; i <= 12; i++) {
      var d = document.createElement("span");
      d.className = "dot" + (i <= inYear ? " on" : i === inYear + 1 ? " next" : "");
      dots.appendChild(d);
    }
    var yrs = Math.floor(months / 12);
    el("dotsCap").textContent = (months > 0 && months % 12 === 0 ? "A full year. " : "") +
      (yrs > 0 ? plural(yrs, "year") + " done, " : "") + inYear + " of 12 months toward " +
      (yrs > 0 ? "the next anniversary" : "your first anniversary");

    showNote();
  }

  function showNote() {
    var custom = (state.msg || "").trim();
    el("noteText").textContent = custom || NOTES[noteIdx % NOTES.length];
    el("noteFrom").textContent = custom ? "From " + state.n1 + " to " + state.n2 : "A note for " + state.n2;
    el("another").hidden = !!custom;
  }

  /* Falling hearts */
  var cv = el("fx"), ctx = cv.getContext("2d"), parts = [], raf = 0;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fit() {
    var r = window.devicePixelRatio || 1;
    cv.width = innerWidth * r;
    cv.height = innerHeight * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
  }
  function burst() {
    if (reduce) return;
    fit();
    var col = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#c4285f";
    for (var i = 0; i < 46; i++) {
      parts.push({
        x: innerWidth / 2 + (Math.random() - 0.5) * 80,
        y: innerHeight * 0.62,
        vx: (Math.random() - 0.5) * 7,
        vy: -4 - Math.random() * 7,
        s: 14 + Math.random() * 20,
        r: (Math.random() - 0.5) * 0.6,
        life: 0,
        col: col
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(function (p) { return p.life < 110; });
    parts.forEach(function (p) {
      p.life++; p.vy += 0.16; p.x += p.vx; p.y += p.vy; p.vx *= 0.99;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.life / 110);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r * p.life * 0.05);
      ctx.fillStyle = p.col;
      ctx.font = p.s + "px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("♥", 0, 0);
      ctx.restore();
    });
    raf = parts.length ? requestAnimationFrame(tick) : 0;
    if (!parts.length) ctx.clearRect(0, 0, innerWidth, innerHeight);
  }

  function bind() {
    ["n1", "n2", "start", "msg"].forEach(function (k) {
      el(k).value = state[k];
      el(k).addEventListener("input", function () {
        var v = el(k).value;
        if (k === "start") {
          if (!parseDate(v)) return;
          state[k] = v;
        } else {
          state[k] = v.trim() === "" && (k === "n1" || k === "n2") ? DEFAULTS[k] : v;
        }
        save();
        render();
      });
    });
    el("form").addEventListener("submit", function (e) { e.preventDefault(); });
    el("another").addEventListener("click", function () { noteIdx++; showNote(); });
    el("burst").addEventListener("click", burst);
    addEventListener("resize", function () { if (parts.length) fit(); });
  }

  /* Photo gallery: files are photos/memory-01.jpg ... photos/memory-NN.jpg */
  var PHOTO_COUNT = 17;
  var photos = [], cur = 0;
  for (var n = 1; n <= PHOTO_COUNT; n++) photos.push("photos/memory-" + (n < 10 ? "0" : "") + n + ".jpg");

  function buildGallery() {
    var g = el("gallery");
    photos.forEach(function (src, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Open photo " + (i + 1));
      var im = document.createElement("img");
      im.src = src; im.alt = "Memory " + (i + 1); im.loading = "lazy";
      b.appendChild(im);
      b.addEventListener("click", function () { openPhoto(i); });
      g.appendChild(b);
    });
  }
  function showPhoto() {
    el("lbImg").src = photos[cur];
    el("lbImg").alt = "Memory " + (cur + 1);
    el("lbCount").textContent = (cur + 1) + " / " + photos.length;
  }
  function openPhoto(i) { cur = i; showPhoto(); el("lightbox").hidden = false; el("lbClose").focus(); }
  function closePhoto() { el("lightbox").hidden = true; }
  function step(d) { cur = (cur + d + photos.length) % photos.length; showPhoto(); }
  function bindLightbox() {
    el("lbClose").addEventListener("click", closePhoto);
    el("lbPrev").addEventListener("click", function () { step(-1); });
    el("lbNext").addEventListener("click", function () { step(1); });
    el("lightbox").addEventListener("click", function (e) { if (e.target === el("lightbox")) closePhoto(); });
    document.addEventListener("keydown", function (e) {
      if (el("lightbox").hidden) return;
      if (e.key === "Escape") closePhoto();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
    var x0 = null;
    el("lightbox").addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el("lightbox").addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    });
  }

  load();
  bind();
  render();
  buildGallery();
  bindLightbox();

  // Hearts go off on their own when today is a monthsary.
  var t = new Date();
  var td = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  var s = parseDate(state.start);
  if (s && s <= td && fullMonths(s, td) > 0 && addMonths(s, fullMonths(s, td)).getTime() === td.getTime()) {
    setTimeout(burst, 600);
  }
})();
