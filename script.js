/* ==========================================================================
   Classic Night · Tenggara Marine — presentation script
   ========================================================================== */

/* --------------------------------------------------------------------------
   SLIDES + CAPTIONS
   Edit captions here. Each caption should add to the slide,
   not repeat what is already written on it.
   -------------------------------------------------------------------------- */
const SLIDES = [
  {
    src: "assets/carousel/01.png",
    alt: "Slide 1. A classic Riva Aquarama alone on Lake Como beneath wooded hills. Text: Tenggara Marine, Classic Night, Lake Como 13.09.26.",
    caption:
      "Lake Como, September 13. An afternoon on the water, followed by Classic Night at Acquadolce."
  },
  {
    src: "assets/carousel/02.png",
    alt: "Slide 2. Two photos: a lakeside village seen from the bow of an Aquarama, and a drone view of an Aquarama with guests on the sun pad. Text: From Indonesia to Lake Como. Tenggara Marine welcomed Ferrari Owners Club Indonesia for an afternoon on the water with Riva.",
    caption:
      "Around 40 guests from Ferrari Owners Club Indonesia joined us in Lake Como, beginning the afternoon on the water before the evening’s Classic Night."
  },
  {
    src: "assets/carousel/03.png",
    alt: "Slide 3. An Aquarama at the helm, seen from above at three-quarter angle, varnished mahogany and lime upholstery. Text: Riva Aquarama. A name inspired by Cinerama. A silhouette that became an icon.",
    caption:
      "Designed by Carlo Riva and launched in 1962, the Aquarama became one of Riva’s most recognisable creations. More than six decades later, it remains remarkably difficult to mistake for anything else."
  },
  {
    src: "assets/carousel/04.png",
    alt: "Slide 4. Drone view straight down onto a whole Aquarama on dark green water. Text: A piece of Riva history. Among the Aquaramas on the lake: the first of 203 produced. Mahogany. Chrome. An unmistakable silhouette.",
    // Deliberately does not repeat the client-supplied "first of 203 produced" claim.
    caption:
      "Varnished mahogany, chrome detailing and that unmistakable wraparound windscreen. On an Aquarama, the details are as recognisable as the silhouette itself."
  },
  {
    src: "assets/carousel/05.png",
    alt: "Slide 5. Drone view of an Aquarama at speed, white wake on dark water. Text: From road to water. For Ferrari Owners Club Indonesia, Italian performance took to a different element.",
    caption:
      "A change of machinery, but not necessarily of language. For a group accustomed to Ferrari, the Aquarama offered another perspective on Italian design and performance."
  },
  {
    src: "assets/carousel/06.png",
    alt: "Slide 6. The terrace at Acquadolce at dusk, lanterns on the balustrade, Lake Como and a pink sky beyond. Text: Tenggara Marine, Classic Night. The Aquaramas arrived at Acquadolce as the evening began.",
    caption:
      "Back at Acquadolce, the pace changed. The boats arrived as daylight faded over the lake, before dinner, music and the evening’s conversations began."
  },
  {
    src: "assets/carousel/07.png",
    alt: "Slide 7. Lake Como after sunset with the Tenggara Marine logo over the water. Text: Lake Como 13.09.26.",
    caption:
      "Lake Como, seen from the water and into the evening. Thank you to Ferrari Owners Club Indonesia for joining Tenggara Marine for Classic Night."
  }
];

/* TikTok photo posts carry one caption for the whole post (no per-slide captions). */
const TIKTOK_CAPTION =
  "Lake Como, September 13. An afternoon on the water, followed by Classic Night at Acquadolce.";

/* Reel caption, shown in the Instagram and TikTok previews of the Reel. */
const REEL_CAPTION =
  "From the road to the water.\nAn afternoon on Lake Como with Ferrari Owners Club Indonesia and Riva, leading into Tenggara Marine Classic Night at Acquadolce.";

/* -------------------------------------------------------------------------- */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = (n) => String(n).padStart(2, "0");
  const total = SLIDES.length;
  let current = 0;
  const instances = [];

  /* ---------- Carousel ---------- */

  class Carousel {
    constructor(root, { overlay = false } = {}) {
      this.root = root;
      const ig = overlay;
      this.viewport = root.querySelector(".carousel-viewport");
      this.track = root.querySelector("[data-track]");
      // controls may live next to (not inside) the carousel root
      const scope = ig ? root.closest(".post, .tt-post") : root.closest(".stage-media");
      this.dotsEl = scope.querySelector("[data-dots]");
      this.countEl = scope.querySelector("[data-count]");
      this.prevBtn = scope.querySelector("[data-prev]");
      this.nextBtn = scope.querySelector("[data-next]");
      this.captionEl = (ig ? scope : root.closest(".stage")).querySelector("[data-caption]");  // null in TikTok view
      this.index = 0;
      this.build();
      this.bind();
    }

    build() {
      SLIDES.forEach((s, i) => {
        const li = document.createElement("li");
        li.setAttribute("role", "group");
        li.setAttribute("aria-roledescription", "slide");
        li.setAttribute("aria-label", `${i + 1} of ${total}`);
        const img = document.createElement("img");
        img.alt = s.alt;
        img.width = 1080;
        img.height = 1350;
        img.draggable = false;
        img.decoding = "async";
        // first slide loads immediately; the rest after the page has loaded
        if (i === 0) img.src = s.src; else img.dataset.src = s.src;
        li.appendChild(img);
        this.track.appendChild(li);

        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", `Slide ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        this.dotsEl.appendChild(dot);
      });
      this.dots = [...this.dotsEl.children];
    }

    loadAll() {
      this.track.querySelectorAll("img[data-src]").forEach((img) => {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
      });
    }

    bind() {
      this.prevBtn && this.prevBtn.addEventListener("click", () => goTo(current - 1));
      this.nextBtn && this.nextBtn.addEventListener("click", () => goTo(current + 1));

      this.root.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); goTo(current + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); goTo(current - 1); }
      });

      // Mouse drag + touch swipe (pointer events)
      let startX = 0, startY = 0, dx = 0, t0 = 0, active = false, locked = null;
      const vp = this.viewport;

      vp.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        active = true; locked = null; dx = 0;
        startX = e.clientX; startY = e.clientY; t0 = performance.now();
      });

      vp.addEventListener("pointermove", (e) => {
        if (!active) return;
        const mx = e.clientX - startX, my = e.clientY - startY;
        if (locked === null && (Math.abs(mx) > 6 || Math.abs(my) > 6)) {
          locked = Math.abs(mx) > Math.abs(my) ? "x" : "y";
          if (locked === "x") {
            vp.setPointerCapture(e.pointerId);
            vp.classList.add("is-dragging");
            this.track.classList.add("no-anim");
          }
        }
        if (locked !== "x") { if (locked === "y") active = false; return; }
        dx = mx;
        const atEdge = (current === 0 && dx > 0) || (current === total - 1 && dx < 0);
        const offset = atEdge ? dx * 0.3 : dx;
        this.track.style.transform = `translate3d(calc(${-current * 100}% + ${offset}px),0,0)`;
      });

      const end = () => {
        if (!active) return;
        active = false;
        vp.classList.remove("is-dragging");
        this.track.classList.remove("no-anim");
        if (locked !== "x") return;
        const w = vp.clientWidth;
        const v = Math.abs(dx) / Math.max(1, performance.now() - t0);
        if (Math.abs(dx) > w * 0.18 || (v > 0.45 && Math.abs(dx) > 24)) goTo(current + (dx < 0 ? 1 : -1));
        else this.render(false);
      };
      vp.addEventListener("pointerup", end);
      vp.addEventListener("pointercancel", end);
      vp.addEventListener("lostpointercapture", end);
    }

    render(animateCaption = true) {
      const i = current;
      this.track.style.transform = `translate3d(${-i * 100}%,0,0)`;
      [...this.track.children].forEach((li, n) => li.setAttribute("aria-hidden", n === i ? "false" : "true"));
      this.dots.forEach((d, n) => d.setAttribute("aria-selected", n === i ? "true" : "false"));
      if (this.countEl) this.countEl.textContent = `${pad(i + 1)} / ${pad(total)}`;
      if (this.prevBtn) this.prevBtn.disabled = i === 0;
      if (this.nextBtn) this.nextBtn.disabled = i === total - 1;

      const text = SLIDES[i].caption;
      if (this.captionEl && this.captionEl.textContent !== text) {
        if (!animateCaption || reduceMotion || !this.captionEl.textContent) {
          this.captionEl.textContent = text;
        } else {
          this.captionEl.classList.add("is-fading");
          clearTimeout(this._t);
          this._t = setTimeout(() => {
            this.captionEl.textContent = text;
            this.captionEl.classList.remove("is-fading");
          }, 200);
        }
      }
    }

    jump() {
      this.track.classList.add("no-anim");
      this.render(false);
      void this.track.offsetWidth;
      this.track.classList.remove("no-anim");
    }
  }

  function goTo(i) {
    const next = Math.max(0, Math.min(total - 1, i));
    const changed = next !== current;
    current = next;
    instances.forEach((c) => c.render(changed));
  }

  const mainEl = document.querySelector('[data-carousel="main"]');
  const main = new Carousel(mainEl);
  const igc = new Carousel(document.querySelector('[data-carousel="ig"]'), { overlay: true });
  const ttc = new Carousel(document.querySelector('[data-carousel="tt"]'), { overlay: true });
  instances.push(main, igc, ttc);
  instances.forEach((c) => c.render(false));
  document.querySelector("[data-tt-caption]").textContent = TIKTOK_CAPTION;
  document.querySelectorAll("[data-reel-caption]").forEach((el) => { el.textContent = REEL_CAPTION; });

  // Snap frames to whole pixels so neighbouring slides never bleed in at the edge
  const snapFrames = () => {
    const els = document.querySelectorAll(".carousel-viewport, .stage-media");
    els.forEach((el) => { el.style.width = ""; });
    els.forEach((el) => {
      const w = el.getBoundingClientRect().width;
      if (w) el.style.width = Math.floor(w) + "px";
    });
  };
  snapFrames();
  let rT;
  window.addEventListener("resize", () => { cancelAnimationFrame(rT); rT = requestAnimationFrame(snapFrames); });

  const loadRest = () => instances.forEach((c) => c.loadAll());
  if (document.readyState === "complete") loadRest();
  else window.addEventListener("load", loadRest);

  /* ---------- Instagram + TikTok views ---------- */

  const page = document.getElementById("page");
  const VIEWS = {
    instagram: { el: document.getElementById("instagram"), carousel: igc },
    tiktok: { el: document.getElementById("tiktok"), carousel: ttc }
  };
  let active = null;       // name of the open view ("instagram" | "tiktok"), or null
  let content = "carousel"; // what the open view shows ("carousel" | "reel")
  let lastFocus = null;

  const hashFor = (name, what) => "#" + name + (what === "reel" ? "-reel" : "");
  const parseHash = (hash) => {
    const m = /^#(instagram|tiktok)(-reel)?$/.exec(hash);
    return m ? { name: m[1], content: m[2] ? "reel" : "carousel" } : null;
  };
  const pauseAll = () => document.querySelectorAll("video").forEach((v) => v.pause());

  function showView(name, { what, push = true, instant = false, moveFocus = false } = {}) {
    what = what || (active ? content : "carousel");
    if (active === name && content === what) return;
    const view = VIEWS[name];
    const switching = active !== null;

    pauseAll();
    if (switching && active !== name) {
      const prev = VIEWS[active].el;
      prev.classList.remove("is-open");
      prev.hidden = true;
    } else if (!switching) {
      lastFocus = document.activeElement;
      document.body.classList.add("ig-open");
      page.setAttribute("aria-hidden", "true");
      page.inert = true;
    }

    active = name;
    content = what;
    view.el.querySelectorAll("article[data-content]").forEach((art) => { art.hidden = art.dataset.content !== what; });
    view.el.hidden = false;
    snapFrames();
    view.carousel.jump();

    if (instant || switching) {
      view.el.classList.add("no-fade", "is-open");
      requestAnimationFrame(() => requestAnimationFrame(() => view.el.classList.remove("no-fade")));
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => view.el.classList.add("is-open")));
    }

    if (what === "reel") {
      const v = view.el.querySelector('article[data-content="reel"] video');
      if (v && !instant) v.play().catch(() => {});
    }

    const target = hashFor(name, what);
    if (push && location.hash !== target) {
      if (switching) history.replaceState(history.state, "", target);
      else history.pushState({ view: name }, "", target);
    }

    // Move focus only for keyboard users, so no focus ring appears for mouse/touch
    if (moveFocus) {
      const focusTarget = switching
        ? view.el.querySelector(`.view-switch [data-open-view="${name}"]`)
        : view.el.querySelector("[data-close-view]");
      setTimeout(() => focusTarget && focusTarget.focus({ preventScroll: true }), 30);
    }
  }

  function closeView({ fromPop = false } = {}) {
    if (!active) return;
    const el = VIEWS[active].el;
    active = null;
    pauseAll();
    el.classList.remove("is-open");
    document.body.classList.remove("ig-open");
    page.removeAttribute("aria-hidden");
    page.inert = false;
    main.jump();
    setTimeout(() => { if (!el.classList.contains("is-open")) el.hidden = true; }, reduceMotion ? 0 : 350);

    if (!fromPop && parseHash(location.hash)) {
      if (history.state && history.state.view) history.back();
      else history.replaceState(null, "", location.pathname + location.search);
    }
    if (lastFocus && lastFocus.focus && lastFocus !== document.body && lastFocus.matches(":focus-visible")) {
      lastFocus.focus({ preventScroll: true });
    }
  }

  document.querySelectorAll("[data-open-view]").forEach((b) =>
    b.addEventListener("click", (e) => {
      // Buttons outside the previews say what to show; the Instagram/TikTok switch keeps the current content
      const inSwitch = !!b.closest(".view-switch");
      const what = inSwitch ? content : (b.dataset.content || "carousel");
      showView(b.dataset.openView, { what, moveFocus: e.detail === 0 });
    })
  );
  document.querySelectorAll("[data-close-view]").forEach((b) => b.addEventListener("click", () => closeView()));

  Object.values(VIEWS).forEach(({ el }) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.preventDefault(); closeView(); return; }
      if (e.key === "Tab") {
        const f = [...el.querySelectorAll('button:not([disabled]), [tabindex="0"]')].filter((n) => n.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  });

  window.addEventListener("popstate", () => {
    const h = parseHash(location.hash);
    if (h) showView(h.name, { what: h.content, push: false });
    else closeView({ fromPop: true });
  });

  // Arrow keys: drive the open view, or the main carousel when it is on screen
  document.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return;
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (["INPUT", "TEXTAREA", "VIDEO", "SELECT"].includes(tag)) return;
    if (active && content === "reel") return;
    if (!active) {
      const r = mainEl.getBoundingClientRect();
      const visible = r.top < window.innerHeight * 0.75 && r.bottom > window.innerHeight * 0.25;
      if (!visible) return;
    }
    e.preventDefault();
    goTo(current + (e.key === "ArrowRight" ? 1 : -1));
  });

  // The page opens on the project. Direct links open a preview:
  // #instagram, #tiktok (carousel) · #instagram-reel, #tiktok-reel (Reel)
  {
    const h = parseHash(location.hash);
    if (h) showView(h.name, { what: h.content, push: false, instant: true });
  }

  /* ---------- Reel source ---------- */
  // Play the supplied file untouched where the browser supports HEVC;
  // fall back to an H.264 playback copy elsewhere (e.g. Firefox).
  document.querySelectorAll("[data-reel]").forEach((video) => {
    if (video.canPlayType('video/mp4; codecs="hvc1"') !== "probably") return;
    const source = video.querySelector("source");
    let fellBack = false;
    const fallback = () => {
      if (fellBack) return;
      fellBack = true;
      source.src = "assets/video/classic-night-reel-web.mp4";
      source.type = "video/mp4";
      video.load();
    };
    source.addEventListener("error", fallback);
    video.addEventListener("error", fallback);
    source.src = "assets/video/classic-night-reel.mp4";
    source.type = 'video/mp4; codecs="hvc1"';
    video.load();
  });
})();
