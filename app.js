(() => {
  const S = window.SITE || {};
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const celular = matchMedia("(max-width: 760px)").matches;

  /* ── Portada: el video arranca solo y los textos entran sincronizados ── */
  const cine = document.querySelector(".cine");
  const video = cine && cine.querySelector(".cine-video");
  if (cine && video) {
    const itens = [...cine.querySelectorAll(".entra")];
    const mostrarTodo = () => { itens.forEach((el) => el.classList.add("ativo")); cine.classList.add("fim"); };
    const sincronizar = () => {
      const t = video.currentTime;
      itens.forEach((el) => el.classList.toggle("ativo", t >= parseFloat(el.dataset.t || 0)));
      if (!video.paused && !video.ended) requestAnimationFrame(sincronizar);
    };
    video.src = celular ? video.dataset.movil : video.dataset.desktop;
    if (reduzir) {
      video.poster = "assets/video/apertura-final.webp";
      mostrarTodo();
    } else {
      video.addEventListener("play", () => { cine.classList.remove("fim"); requestAnimationFrame(sincronizar); });
      video.addEventListener("ended", mostrarTodo);
      const p = video.play();
      if (p) p.catch(mostrarTodo); // si el navegador bloquea el autoplay, se ve todo igual
      setTimeout(() => { if (video.paused && !video.ended && video.currentTime === 0) mostrarTodo(); }, 2500);
    }
    const repetir = cine.querySelector(".cine-repetir");
    repetir && repetir.addEventListener("click", () => {
      itens.forEach((el) => el.classList.remove("ativo"));
      video.currentTime = 0; video.play().catch(mostrarTodo);
    });
  }

  /* ── Parallax suave en las artes ──────────────────────────────────────── */
  const artes = reduzir ? [] : [...document.querySelectorAll(".arte")];
  if (artes.length) {
    const mover = () => {
      for (const a of artes) {
        const r = a.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        a.style.transform = `translate3d(0, ${(c * -60).toFixed(1)}px, 0) scale(1.08)`;
      }
    };
    addEventListener("scroll", () => requestAnimationFrame(mover), { passive: true });
    mover();
  }

  /* ── Encabezado, revelar, año ─────────────────────────────────────────── */
  const topo = document.querySelector(".topo");
  const whats = document.querySelector(".whats");
  const aoRolar = () => {
    topo && topo.classList.toggle("rolou", scrollY > 40);
    whats && whats.classList.toggle("visivel", scrollY > innerHeight * 0.6);
  };
  addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll(".revelar").forEach((el) => io.observe(el));
  document.querySelectorAll("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ── Video real: se reproduce solo cuando está en pantalla ────────────── */
  document.querySelectorAll(".video-real video").forEach((v) => {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { v.preload = "auto"; v.play().catch(() => {}); }
      else v.pause();
    }, { threshold: 0.3 }).observe(v);
  });

  /* ── WhatsApp: cada botón con su mensaje ──────────────────────────────── */
  if (S.whatsapp) {
    const num = String(S.whatsapp.numero || "").replace(/\D/g, "");
    const msgs = S.whatsapp.mensagens || {};
    document.querySelectorAll("[data-wa]").forEach((a) => {
      const txt = msgs[a.dataset.wa] || S.whatsapp.mensagem || "";
      a.href = `https://wa.me/${num}?text=${encodeURIComponent(txt)}`;
    });
  }
})();
