/* Landing: tipografía cinética con GSAP (entrada + letras que reaccionan al puntero) */
(function () {
  if (!window.gsap) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var desc = document.querySelector(".kinetic");
  var text = desc.textContent;
  desc.setAttribute("aria-label", text);
  desc.textContent = "";
  Array.from(text).forEach(function (ch) {
    var c = document.createElement("span");
    c.className = "c";
    c.setAttribute("aria-hidden", "true");
    c.textContent = ch;
    desc.appendChild(c);
  });

  var big = gsap.utils.toArray(".greetings > span");
  var small = gsap.utils.toArray(".kinetic .c");
  var btn = document.querySelector(".botones");

  if (!reduce) {
    gsap.timeline()
      .from(big, { y: -200, rotation: () => gsap.utils.random(-60, 60), opacity: 0, scale: 2, duration: 1.1, ease: "elastic.out(1,.5)", stagger: 0.12 })
      .from(small, { opacity: 0, y: 30, rotationX: -90, duration: 0.6, ease: "back.out(2)", stagger: 0.03 }, "-=0.5")
      .from(btn, { scale: 0, opacity: 0, duration: 0.7, ease: "back.out(2.5)" }, "-=0.3");

    // Las letras se apartan del cursor / dedo
    var all = big.concat(small);
    var pos = all.map(function (el) {
      return { el: el, x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" }), y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" }), r: gsap.quickTo(el, "rotation", { duration: 0.6, ease: "power3" }) };
    });
    var R = 140;
    window.addEventListener("pointermove", function (e) {
      pos.forEach(function (p) {
        var b = p.el.getBoundingClientRect();
        var dx = b.left + b.width / 2 - e.clientX;
        var dy = b.top + b.height / 2 - e.clientY;
        var d = Math.hypot(dx, dy);
        if (d < R) {
          var f = (1 - d / R) * 40;
          p.x(dx / (d || 1) * f); p.y(dy / (d || 1) * f); p.r(dx / R * 25);
        } else { p.x(0); p.y(0); p.r(0); }
      });
    });

    // Botón magnético
    var a = btn.querySelector("a");
    window.addEventListener("pointermove", function (e) {
      var b = btn.getBoundingClientRect();
      var dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
      var d = Math.hypot(dx, dy);
      gsap.to(btn, { x: d < 120 ? dx * 0.3 : 0, y: d < 120 ? dy * 0.3 : 0, duration: 0.4, ease: "power3" });
    });
  }

  // Transición al entrar al mundo de scroll
  var link = document.querySelector(".botones a");
  link.addEventListener("click", function (e) {
    if (reduce) return;
    e.preventDefault();
    var href = link.href;
    gsap.to("body > *:not(script)", { opacity: 0, y: -40, duration: 0.5, stagger: 0.05, onComplete: function () { location.href = href; } });
  });
})();
