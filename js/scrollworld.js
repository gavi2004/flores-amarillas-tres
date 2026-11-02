/* Scrollworld: GSAP + ScrollTrigger dirigen la cámara y la tipografía cinética */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Divide cada título en palabras y letras ---
  var titles = gsap.utils.toArray(".kt");
  titles.forEach(function (el) {
    var text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.textContent = "";
    text.split(/\s+/).forEach(function (word, i, arr) {
      var w = document.createElement("span");
      w.className = "w";
      w.setAttribute("aria-hidden", "true");
      Array.from(word).forEach(function (ch) {
        var c = document.createElement("span");
        c.className = "c";
        c.textContent = ch;
        w.appendChild(c);
      });
      el.appendChild(w);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(" "));
    });
  });

  // --- Línea de tiempo principal ligada al scroll ---
  var tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: ".scroll-space",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: function (self) {
        gsap.set(".progress span", { scaleX: self.progress });
      },
    },
  });

  // Cámara: dolly-in hacia las flores y leve giro, con parallax en el cielo
  tl.fromTo(".camera", { scale: 1, rotation: 0 }, { scale: 1.9, rotation: -2, duration: 10 }, 0)
    .to(".camera", { scale: 1.1, rotation: 1.5, duration: 6 }, 10)
    .to(".camera", { scale: 1.5, rotation: 0, duration: 4 }, 16)
    .fromTo(".night", { yPercent: 0 }, { yPercent: -12, duration: 20 }, 0)
    .to(".night", { filter: "blur(0.1vmin) hue-rotate(-40deg) brightness(1.15)", duration: 20 }, 0)
    .to(".hint", { autoAlpha: 0, duration: 0.6 }, 0.2);

  // Capítulos de texto: cada letra entra con rotación/desplazamiento aleatorio y sale al revés
  var slot = 20 / titles.length;
  titles.forEach(function (el, i) {
    var chars = el.querySelectorAll(".c");
    var t0 = i * slot + 0.4;
    var rnd = gsap.utils.random;
    tl.set(el, { visibility: "visible" }, t0);
    if (reduce) {
      tl.fromTo(chars, { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.02, duration: 0.5 }, t0);
      if (i < titles.length - 1) tl.to(chars, { autoAlpha: 0, duration: 0.5 }, t0 + slot - 1.2);
    } else {
      tl.fromTo(
        chars,
        {
          autoAlpha: 0,
          y: function () { return rnd(60, 160); },
          x: function () { return rnd(-80, 80); },
          rotation: function () { return rnd(-120, 120); },
          scale: function () { return rnd(0.2, 2.2); },
        },
        { autoAlpha: 1, x: 0, y: 0, rotation: 0, scale: 1, ease: "back.out(1.7)", stagger: { each: 0.03, from: "random" }, duration: 1.2 },
        t0
      );
      if (i < titles.length - 1) tl.to(
        chars,
        {
          autoAlpha: 0,
          y: function () { return rnd(-160, -60); },
          x: function () { return rnd(-80, 80); },
          rotation: function () { return rnd(-90, 90); },
          scale: function () { return rnd(0.3, 1.8); },
          ease: "power2.in",
          stagger: { each: 0.02, from: "random" },
          duration: 0.9,
        },
        t0 + slot - 1.6
      );
    }
  });

  // La música arranca con la primera interacción si el navegador bloqueó el autoplay
  var audio = document.querySelector("audio");
  function unlock() {
    if (audio && audio.paused) audio.play().catch(function () {});
    ["scroll", "pointerdown", "keydown", "touchstart"].forEach(function (e) {
      window.removeEventListener(e, unlock);
    });
  }
  ["scroll", "pointerdown", "keydown", "touchstart"].forEach(function (e) {
    window.addEventListener(e, unlock, { passive: true });
  });
})();
