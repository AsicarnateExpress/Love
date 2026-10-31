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

  /* Photo gallery: built-in photos (memory-01.jpg ...) plus photos added from the page.
     Added photos are saved into your GitHub repo (photos/added), so every device sees them. */
  var PHOTO_COUNT = 17;
  var builtin = [], remote = [], cur = 0;
  var TOKEN_KEY = "monthsary-gh-token";
  var GH = (function () {
    var h = location.hostname, p = location.pathname.split("/")[1] || "";
    if (/\.github\.io$/.test(h) && p) return { owner: h.split(".")[0], repo: p, dir: "photos/added" };
    return { owner: "AsicarnateExpress", repo: "Love", dir: "photos/added" };
  })();

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function all() { return builtin.concat(remote); }
  function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } }
  function setStatus(t) { el("addStatus").textContent = t; }

  // Built-in photos look in the photos folder first, then next to index2.html.
  function setPhoto(img, name) {
    img.onerror = function () { img.onerror = null; img.src = name; };
    img.src = "photos/" + name;
  }
  function paint(img, it) { if (it.url) img.src = it.url; else setPhoto(img, it.name); }

  function api(method, path, body) {
    var headers = { Accept: "application/vnd.github+json" };
    var t = getToken();
    if (t) headers.Authorization = "Bearer " + t;
    if (body) headers["Content-Type"] = "application/json";
    return fetch("https://api.github.com/repos/" + GH.owner + "/" + GH.repo + "/contents/" + path,
      { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined });
  }
  function explain(res) {
    if (res.status === 401 || res.status === 403) { showTokenBox(); return "GitHub did not accept the token. Create a new one and save it again."; }
    if (res.status === 404) { showTokenBox(); return "GitHub can't find the repo " + GH.repo + " with this token. Make sure the token has access to it."; }
    return "GitHub said no (error " + res.status + "). Try again.";
  }

  function loadRemote(cb) {
    fetch("https://api.github.com/repos/" + GH.owner + "/" + GH.repo + "/contents/" + GH.dir, { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (list) {
        remote = (Array.isArray(list) ? list : [])
          .filter(function (f) { return f.type === "file" && /\.(jpe?g|png|webp)$/i.test(f.name); })
          .sort(function (a, b) { return a.name < b.name ? -1 : 1; })
          .map(function (f) { return { url: f.download_url, path: f.path, sha: f.sha }; });
        cb();
      })
      .catch(function () { cb(); });
  }

  function shrink(file, cb) {
    var url = URL.createObjectURL(file), im = new Image();
    im.onload = function () {
      var s = Math.min(1, 1100 / Math.max(im.naturalWidth, im.naturalHeight));
      var c = document.createElement("canvas");
      c.width = Math.round(im.naturalWidth * s); c.height = Math.round(im.naturalHeight * s);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(function (b) { cb(b); }, "image/jpeg", 0.8);
    };
    im.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    im.src = url;
  }
  function toBase64(blob, cb) {
    var fr = new FileReader();
    fr.onload = function () { cb(String(fr.result).split(",")[1]); };
    fr.readAsDataURL(blob);
  }

  function addFiles(files) {
    var list = Array.prototype.slice.call(files).filter(function (f) { return /^image\//.test(f.type); });
    if (!list.length) return;
    var total = list.length, done = 0, failed = false;
    el("addPhotos").disabled = true;
    function finish(msg) {
      el("addPhotos").disabled = false;
      setStatus(msg);
      buildGallery();
    }
    (function next(i) {
      if (i >= total) return finish(done + (done === 1 ? " photo saved." : " photos saved.") + " Everyone sees it after a minute or two.");
      setStatus("Saving photo " + (i + 1) + " of " + total + "...");
      shrink(list[i], function (blob) {
        if (!blob) return next(i + 1);
        toBase64(blob, function (b64) {
          var path = GH.dir + "/" + Date.now() + "-" + (i + 1) + ".jpg";
          api("PUT", path, { message: "Add photo", content: b64 })
            .then(function (res) {
              if (!res.ok) return finish(explain(res));
              return res.json().then(function (d) {
                remote.push({ url: d.content.download_url, path: d.content.path, sha: d.content.sha });
                done++; next(i + 1);
              });
            })
            .catch(function () { finish("No internet connection. Try again."); });
        });
      });
    })(0);
  }

  function removeCurrent() {
    var it = all()[cur];
    if (!it || !it.path) return;
    if (!getToken()) { closePhoto(); showTokenBox(); setStatus("Add your token first to remove photos."); return; }
    setStatus("Removing photo...");
    api("DELETE", it.path, { message: "Remove photo", sha: it.sha })
      .then(function (res) {
        if (!res.ok) { closePhoto(); return setStatus(explain(res)); }
        remote = remote.filter(function (r) { return r !== it; });
        buildGallery();
        setStatus("Photo removed.");
        if (!all().length) return closePhoto();
        cur = Math.min(cur, all().length - 1);
        showPhoto();
      })
      .catch(function () { closePhoto(); setStatus("No internet connection. Try again."); });
  }

  /* Token box (set up once per phone) */
  function showTokenBox() { el("tokenBox").hidden = false; }
  function refreshTokenUI() {
    var has = !!getToken();
    el("forgetToken").hidden = !has;
    if (has) el("tokenBox").hidden = true;
  }

  function buildGallery() {
    var g = el("gallery");
    g.innerHTML = "";
    all().forEach(function (it, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Open photo " + (i + 1));
      var im = document.createElement("img");
      paint(im, it); im.alt = "Memory " + (i + 1); im.loading = "lazy";
      b.appendChild(im);
      b.addEventListener("click", function () { openPhoto(i); });
      g.appendChild(b);
    });
  }
  function resetRemove() { el("lbRemove").dataset.sure = ""; el("lbRemove").textContent = "Remove this photo"; }
  function showPhoto() {
    var it = all()[cur];
    paint(el("lbImg"), it);
    el("lbImg").alt = "Memory " + (cur + 1);
    el("lbCount").textContent = (cur + 1) + " / " + all().length;
    el("lbRemove").hidden = !it.path;
  }
  function openPhoto(i) { cur = i; resetRemove(); showPhoto(); el("lightbox").hidden = false; el("lbClose").focus(); }
  function closePhoto() { el("lightbox").hidden = true; }
  function step(d) { var n = all().length; cur = (cur + d + n) % n; resetRemove(); showPhoto(); }
  function bindLightbox() {
    el("lbClose").addEventListener("click", closePhoto);
    el("lbPrev").addEventListener("click", function () { step(-1); });
    el("lbNext").addEventListener("click", function () { step(1); });
    el("lbRemove").addEventListener("click", function () {
      var b = el("lbRemove");
      if (b.dataset.sure) { resetRemove(); removeCurrent(); }
      else { b.dataset.sure = "1"; b.textContent = "Tap again to remove"; }
    });
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

    el("addPhotos").addEventListener("click", function () {
      if (!getToken()) { showTokenBox(); setStatus("Set up your token first (one time only)."); return; }
      el("photoInput").click();
    });
    el("photoInput").addEventListener("change", function () { addFiles(el("photoInput").files); el("photoInput").value = ""; });
    el("saveToken").addEventListener("click", function () {
      var t = el("tokenInput").value.trim();
      if (!t) return setStatus("Paste your token first.");
      try { localStorage.setItem(TOKEN_KEY, t); } catch (e) { return setStatus("This browser can't save the token."); }
      el("tokenInput").value = "";
      refreshTokenUI();
      setStatus("Token saved on this phone. Tap Add photos.");
    });
    el("forgetToken").addEventListener("click", function () {
      try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
      refreshTokenUI();
      setStatus("Token removed from this phone.");
    });
  }

  load();
  bind();
  render();
  for (var n = 1; n <= PHOTO_COUNT; n++) builtin.push({ name: "memory-" + pad(n) + ".jpg" });
  buildGallery();
  bindLightbox();
  refreshTokenUI();
  loadRemote(buildGallery);

  // Hearts go off on their own when today is a monthsary.
  var t = new Date();
  var td = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  var s = parseDate(state.start);
  if (s && s <= td && fullMonths(s, td) > 0 && addMonths(s, fullMonths(s, td)).getTime() === td.getTime()) {
    setTimeout(burst, 600);
  }
})();
