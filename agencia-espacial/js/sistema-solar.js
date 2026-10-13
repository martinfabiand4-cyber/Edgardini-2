/* Sistema solar 3D interactivo — AstraNova Expediciones
   Three.js se carga solo cuando la sección entra en pantalla.
   Todas las texturas se generan por código (canvas): no hay imágenes externas.
   Escala artística: tamaños y distancias están comprimidos. */
(() => {
  "use strict";

  const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js";
  const CONTROLS_URL = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js";

  const $ = (id) => document.getElementById(id);
  const section = $("sistema-solar");
  if (!section) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  /* ---------- Datos (única fuente de verdad) ----------
     radius/orbit/speed/spin están en unidades de escena, no reales.
     dest: destino que vende AstraNova (coincide con el <select id="destino">). */
  const BODIES = [
    { key: "sol", name: "El Sol", kind: "Estrella", radius: 5, orbit: 0, speed: 0, spin: 0.05,
      dist: "—", diam: "1.392.700 km", dest: null, trip: null,
      fact: "Concentra el 99,8 % de la masa de todo el sistema solar.",
      tex: { type: "sun", colors: ["#f59e0b", "#fde68a", "#ea580c"] } },
    { key: "mercurio", name: "Mercurio", kind: "Planeta", radius: 0.6, orbit: 9, speed: 0.9, spin: 0.2,
      dist: "58 M km", diam: "4.879 km", dest: null, trip: null,
      fact: "Un año allí dura solo 88 días terrestres.",
      tex: { type: "rocky", colors: ["#9ca3af", "#6b7280", "#d1d5db"] } },
    { key: "venus", name: "Venus", kind: "Planeta", radius: 1.0, orbit: 13, speed: 0.65, spin: 0.1,
      dist: "108 M km", diam: "12.104 km", dest: null, trip: null,
      fact: "Es el planeta más caliente: unos 465 °C en su superficie.",
      tex: { type: "bands", colors: ["#e7c27d", "#d4a24c", "#f1d9a0"] } },
    { key: "tierra", name: "La Tierra", kind: "Planeta", radius: 1.1, orbit: 18, speed: 0.5, spin: 0.6,
      dist: "150 M km", diam: "12.742 km", dest: null, trip: null,
      fact: "Tu punto de partida: todas las misiones despegan del Puerto Espacial Atacama.",
      tex: { type: "earth", colors: ["#1d4ed8", "#16a34a", "#92400e"] } },
    { key: "luna", name: "La Luna", kind: "Luna", radius: 0.35, orbit: 2.3, speed: 2.2, spin: 0.2, parent: "tierra",
      dist: "384.400 km de la Tierra", diam: "3.474 km", dest: "luna", trip: "5 días",
      fact: "Siempre muestra la misma cara a la Tierra. Aquí está la Base Selene.",
      tex: { type: "rocky", colors: ["#cbd5e1", "#94a3b8", "#e2e8f0"] } },
    { key: "marte", name: "Marte", kind: "Planeta", radius: 0.8, orbit: 23, speed: 0.4, spin: 0.55,
      dist: "228 M km", diam: "6.779 km", dest: "marte", trip: "21 días",
      fact: "Tiene el Monte Olimpo, un volcán de unos 22 km de altura.",
      tex: { type: "rocky", colors: ["#c2410c", "#9a3412", "#fb923c"] } },
    { key: "jupiter", name: "Júpiter", kind: "Planeta", radius: 3, orbit: 33, speed: 0.22, spin: 1.1,
      dist: "778 M km", diam: "139.820 km", dest: null, trip: null,
      fact: "Su Gran Mancha Roja es una tormenta más grande que la Tierra.",
      tex: { type: "bands", colors: ["#d6b48a", "#b8865b", "#efe0c8", "#8b5e3c"] } },
    { key: "saturno", name: "Saturno", kind: "Planeta", radius: 2.5, orbit: 44, speed: 0.16, spin: 1.0, tilt: 0.47, ring: true,
      dist: "1.434 M km", diam: "116.460 km", dest: "saturno", trip: "45 días",
      fact: "Sus anillos abarcan decenas de miles de kilómetros, pero son muy delgados.",
      tex: { type: "bands", colors: ["#e8d3a0", "#d1b27a", "#f5e8c4"] } },
    { key: "urano", name: "Urano", kind: "Planeta", radius: 1.8, orbit: 54, speed: 0.11, spin: 0.7, tilt: 1.7,
      dist: "2.871 M km", diam: "50.724 km", dest: null, trip: null,
      fact: "Gira prácticamente de lado: su eje está inclinado unos 98°.",
      tex: { type: "bands", colors: ["#7dd3fc", "#67e8f9", "#a5f3fc"] } },
    { key: "neptuno", name: "Neptuno", kind: "Planeta", radius: 1.7, orbit: 63, speed: 0.08, spin: 0.7,
      dist: "4.495 M km", diam: "49.244 km", dest: null, trip: null,
      fact: "Tiene los vientos más rápidos del sistema solar: superan los 2.000 km/h.",
      tex: { type: "bands", colors: ["#2563eb", "#1d4ed8", "#60a5fa"] } },
  ];
  const byKey = Object.fromEntries(BODIES.map((b) => [b.key, b]));

  /* ---------- Interfaz (funciona aunque falle el 3D) ---------- */
  const ui = {
    list: $("sys-list"),
    tag: $("sys-tag"),
    name: $("sys-name"),
    dist: $("sys-dist"),
    diam: $("sys-diam"),
    trip: $("sys-trip"),
    fact: $("sys-fact"),
    reservar: $("sys-reservar"),
    pause: $("sys-pause"),
    reset: $("sys-reset"),
    explore: $("sys-explore"),
    hint: $("sys-hint"),
    hover: $("sys-hover"),
    fallback: $("sys-fallback"),
  };

  let selected = null;
  let scene3d = null; // se llena cuando el 3D está listo

  const CHIP =
    "min-h-11 shrink-0 rounded-full border px-4 text-sm text-slate-200 transition-colors " +
    "hover:border-cyan-400 hover:text-cyan-300 aria-pressed:border-cyan-400 aria-pressed:bg-cyan-400 aria-pressed:text-slate-950 " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400";

  BODIES.forEach((b) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.key = b.key;
    btn.setAttribute("aria-pressed", "false");
    btn.className = CHIP + (b.dest ? " border-cyan-400/60" : " border-white/20");
    btn.textContent = b.name.replace(/^(El|La) /, "");
    if (b.dest) btn.title = "Destino de AstraNova";
    btn.addEventListener("click", () => select(b.key));
    li.appendChild(btn);
    ui.list.appendChild(li);
  });

  function renderPanel(b) {
    if (!b) {
      ui.tag.textContent = "Sistema solar";
      ui.name.textContent = "Elige un mundo";
      ui.dist.textContent = "—";
      ui.diam.textContent = "—";
      ui.trip.textContent = "—";
      ui.fact.textContent =
        "Toca un planeta en la escena o elige uno de la lista. Los mundos con halo cian son destinos de AstraNova: la Luna, Marte y Saturno.";
      ui.reservar.classList.add("hidden");
      return;
    }
    ui.tag.textContent = b.dest ? "Destino AstraNova" : b.kind;
    ui.name.textContent = b.name;
    ui.dist.textContent = b.dist;
    ui.diam.textContent = b.diam;
    ui.trip.textContent = b.trip || "Aún sin ruta";
    ui.fact.textContent = b.fact;
    ui.reservar.textContent = "Reservar viaje: " + b.name.replace(/^(El|La) /, "");
    ui.reservar.classList.toggle("hidden", !b.dest);
  }

  function select(key) {
    selected = key ? byKey[key] : null;
    ui.list.querySelectorAll("button").forEach((btn) =>
      btn.setAttribute("aria-pressed", String(!!selected && btn.dataset.key === selected.key))
    );
    renderPanel(selected);
    if (scene3d) scene3d.focus(selected ? selected.key : null);
  }

  ui.reservar.addEventListener("click", () => {
    const sel = $("destino");
    if (sel && selected && selected.dest) sel.value = selected.dest;
  });
  ui.reset.addEventListener("click", () => select(null));
  renderPanel(null);

  /* ---------- Carga diferida de Three.js ---------- */
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("No se pudo cargar " + src));
      document.head.appendChild(s);
    });

  function showFallback() {
    ui.fallback.classList.remove("hidden");
    ui.fallback.classList.add("flex");
    [ui.pause, ui.reset, ui.explore, ui.hint, ui.hover].forEach((el) => el && el.classList.add("hidden"));
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;
    loadScript(THREE_URL)
      .then(() => loadScript(CONTROLS_URL))
      .then(() => {
        scene3d = buildScene(window.THREE);
        if (selected) scene3d.focus(selected.key);
      })
      .catch((err) => {
        console.warn("[sistema-solar]", err);
        showFallback();
      });
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(section);
  } else {
    start();
  }

  /* ---------- Texturas generadas por código ---------- */
  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function blob(g, x, y, rx, ry) {
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    g.fill();
  }

  function makeTexture(THREE, spec, seed) {
    const W = 512, H = 256;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    const r = rng(seed);
    const col = spec.colors;
    const pick = () => col[Math.floor(r() * col.length)];

    if (spec.type === "bands") {
      g.fillStyle = col[0];
      g.fillRect(0, 0, W, H);
      for (let y = 0; y < H; ) {
        const h = 4 + r() * 18;
        g.globalAlpha = 0.55 + r() * 0.45;
        g.fillStyle = pick();
        g.fillRect(0, y, W, h);
        y += h;
      }
      for (let i = 0; i < 260; i++) {
        g.globalAlpha = 0.08 + r() * 0.12;
        g.fillStyle = pick();
        blob(g, r() * W, r() * H, 10 + r() * 40, 1.5 + r() * 4);
      }
    } else if (spec.type === "earth") {
      g.fillStyle = col[0];
      g.fillRect(0, 0, W, H);
      for (let k = 0; k < 9; k++) {
        const cx = r() * W, cy = 50 + r() * 150;
        for (let i = 0; i < 26; i++) {
          g.globalAlpha = 0.9;
          g.fillStyle = r() < 0.75 ? col[1] : col[2];
          blob(g, cx + (r() - 0.5) * 90, cy + (r() - 0.5) * 50, 8 + r() * 22, 6 + r() * 16);
        }
      }
      g.globalAlpha = 0.95;
      g.fillStyle = "#f8fafc";
      g.fillRect(0, 0, W, 14);
      g.fillRect(0, H - 14, W, 14);
      for (let i = 0; i < 70; i++) {
        g.globalAlpha = 0.18 + r() * 0.2;
        blob(g, r() * W, r() * H, 14 + r() * 40, 3 + r() * 7);
      }
    } else if (spec.type === "sun") {
      g.fillStyle = col[0];
      g.fillRect(0, 0, W, H);
      for (let i = 0; i < 500; i++) {
        g.globalAlpha = 0.1 + r() * 0.25;
        g.fillStyle = r() < 0.5 ? col[1] : col[2];
        const rr = 3 + r() * 16;
        blob(g, r() * W, r() * H, rr, rr);
      }
    } else {
      // rocky: manchas y cráteres
      g.fillStyle = col[0];
      g.fillRect(0, 0, W, H);
      for (let i = 0; i < 520; i++) {
        g.globalAlpha = 0.1 + r() * 0.2;
        g.fillStyle = r() < 0.5 ? col[1] : col[2];
        const rr = 2 + r() * 14;
        blob(g, r() * W, r() * H, rr, rr);
      }
      g.globalAlpha = 0.35;
      g.strokeStyle = col[1];
      g.lineWidth = 1.5;
      for (let i = 0; i < 70; i++) {
        g.beginPath();
        g.arc(r() * W, r() * H, 3 + r() * 11, 0, Math.PI * 2);
        g.stroke();
      }
    }
    g.globalAlpha = 1;
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }

  function makeRingTexture(THREE) {
    const S = 256;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d");
    const r = rng(77);
    g.translate(S / 2, S / 2);
    for (let rr = S * 0.29; rr < S / 2; rr += 1) {
      const gap = rr > S * 0.405 && rr < S * 0.42; // división de Cassini
      const a = gap ? 0.05 : 0.35 + r() * 0.5;
      g.strokeStyle = "rgba(232, 211, 160, " + a.toFixed(2) + ")";
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(0, 0, rr, 0, Math.PI * 2);
      g.stroke();
    }
    return new THREE.CanvasTexture(c);
  }

  function makeGlowTexture(THREE, inner, outer) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.35, outer);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  function makeHaloTexture(THREE) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    g.strokeStyle = "#22d3ee";
    g.lineWidth = 5;
    g.setLineDash([14, 8]);
    g.beginPath();
    g.arc(64, 64, 56, 0, Math.PI * 2);
    g.stroke();
    return new THREE.CanvasTexture(c);
  }

  /* ---------- Escena ---------- */
  function buildScene(THREE) {
    const stage = $("sys-stage");
    const canvas = $("sys-canvas");

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setClearColor(0x020617, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2500);

    scene.add(new THREE.AmbientLight(0xffffff, 0.22));
    scene.add(new THREE.PointLight(0xfff1d6, 2.2, 0, 0));

    // Estrellas de fondo
    const starPos = new Float32Array(1800 * 3);
    const rs = rng(5);
    for (let i = 0; i < 1800; i++) {
      const u = rs() * 2 - 1, th = rs() * Math.PI * 2, rad = 700 + rs() * 500;
      const s = Math.sqrt(1 - u * u);
      starPos[i * 3] = rad * s * Math.cos(th);
      starPos[i * 3 + 1] = rad * u;
      starPos[i * 3 + 2] = rad * s * Math.sin(th);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.85 })));

    const haloTex = makeHaloTexture(THREE);
    const objs = {}; // key -> { def, pivot, holder, mesh, halo }
    const meshes = [];
    const orbitMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.45 });

    function orbitLine(radius) {
      const pts = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
      }
      return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), orbitMat);
    }

    BODIES.forEach((def, i) => {
      const tex = makeTexture(THREE, def.tex, 100 + i * 17);
      const geo = new THREE.SphereGeometry(def.radius, 48, 32);
      const mat = def.key === "sol"
        ? new THREE.MeshBasicMaterial({ map: tex })
        : new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.key = def.key;

      const holder = new THREE.Object3D();
      holder.add(mesh);
      holder.position.x = def.orbit;
      if (def.tilt) holder.rotation.z = def.tilt;

      const pivot = new THREE.Object3D();
      pivot.rotation.y = rs() * Math.PI * 2;
      pivot.add(holder);

      if (def.parent) {
        // La Luna orbita alrededor de la Tierra
        const parent = objs[def.parent];
        parent.holder.add(orbitLine(def.orbit));
        parent.holder.add(pivot);
      } else {
        if (def.orbit) scene.add(orbitLine(def.orbit));
        scene.add(pivot);
      }

      if (def.key === "sol") {
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({
          map: makeGlowTexture(THREE, "rgba(255,214,120,1)", "rgba(255,150,40,0.35)"),
          blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
        }));
        glow.scale.set(26, 26, 1);
        holder.add(glow);
      }

      if (def.ring) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(def.radius * 1.35, def.radius * 2.35, 96),
          new THREE.MeshBasicMaterial({ map: makeRingTexture(THREE), transparent: true, side: THREE.DoubleSide, depthWrite: false })
        );
        ring.rotation.x = -Math.PI / 2;
        holder.add(ring);
      }

      let halo = null;
      if (def.dest) {
        halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthTest: false, opacity: 0.85 }));
        const s = def.ring ? def.radius * 6 : Math.max(def.radius * 4.5, 2.2);
        halo.scale.set(s, s, 1);
        halo.renderOrder = 10;
        holder.add(halo);
      }

      objs[def.key] = { def, pivot, holder, mesh, halo };
      meshes.push(mesh);
    });

    /* Controles */
    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 320;
    controls.rotateSpeed = 0.7;

    // Evita que el canvas "atrape" el scroll de la página
    function setExploring(on) {
      if (coarse) {
        controls.enabled = on;
        canvas.classList.toggle("touch-none", on);
        canvas.classList.toggle("touch-pan-y", !on);
        ui.explore.textContent = on ? "Desactivar exploración" : "Activar exploración";
        ui.explore.setAttribute("aria-pressed", String(on));
        ui.hint.textContent = on ? "Un dedo gira · dos dedos acercan" : "Desliza para seguir leyendo la página";
      } else {
        controls.enableZoom = on;
      }
    }
    if (coarse) {
      ui.explore.classList.remove("hidden");
      ui.explore.addEventListener("click", () => setExploring(!controls.enabled));
      setExploring(false);
    } else {
      ui.hint.textContent = "Arrastra para girar · clic y rueda para acercar";
      canvas.addEventListener("pointerdown", () => setExploring(true));
      canvas.addEventListener("pointerleave", () => setExploring(false));
      setExploring(false);
    }

    /* Navegación de cámara */
    const ORIGIN = new THREE.Vector3();
    const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), tmpC = new THREE.Vector3();
    const nav = { mode: "free", t: 0, startTarget: new THREE.Vector3(), startRel: new THREE.Vector3(), endRel: new THREE.Vector3(), key: null };
    const defaultRel = new THREE.Vector3();
    let userMoved = false;

    function computeDefaultRel(aspect) {
      const d = Math.min(Math.max(135 / Math.min(aspect, 1.6), 70), 230);
      defaultRel.set(0, 0.45, 0.89).normalize().multiplyScalar(d);
    }

    function worldPos(key, out) {
      return objs[key].mesh.getWorldPosition(out);
    }

    function focus(key) {
      nav.startTarget.copy(controls.target);
      nav.startRel.copy(camera.position).sub(controls.target);
      nav.t = 0;
      if (key) {
        const def = objs[key].def;
        const dist = Math.max(def.radius * 7, 3.5);
        nav.endRel.copy(nav.startRel).setLength(dist);
        nav.mode = "focus";
        nav.key = key;
      } else {
        nav.endRel.copy(defaultRel);
        nav.mode = "reset";
        nav.key = null;
      }
    }

    controls.addEventListener("start", () => {
      userMoved = true;
      if (nav.mode === "focus") nav.mode = "follow";
      else if (nav.mode === "reset") nav.mode = "free";
    });

    /* Tamaño */
    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      computeDefaultRel(camera.aspect);
      if (!userMoved && nav.mode === "free") {
        controls.target.copy(ORIGIN);
        camera.position.copy(defaultRel);
      }
    }
    resize();
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
    else window.addEventListener("resize", resize);

    /* Selección con el puntero */
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    function pick(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0];
      return hit ? hit.object.userData.key : null;
    }

    let down = null;
    canvas.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    canvas.addEventListener("pointerup", (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const quick = performance.now() - down.t < 600;
      down = null;
      if (moved < 6 && quick) {
        const key = pick(e.clientX, e.clientY);
        if (key) select(key);
      }
    });

    let hoverQueued = false;
    canvas.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" || hoverQueued) return;
      hoverQueued = true;
      requestAnimationFrame(() => {
        hoverQueued = false;
        const key = pick(e.clientX, e.clientY);
        canvas.classList.toggle("cursor-pointer", !!key);
        canvas.classList.toggle("cursor-grab", !key);
        ui.hover.textContent = key ? byKey[key].name : "";
      });
    });

    /* Pausa */
    let paused = reduceMotion;
    function syncPause() {
      ui.pause.textContent = paused ? "Reanudar órbitas" : "Pausar órbitas";
      ui.pause.setAttribute("aria-pressed", String(paused));
    }
    ui.pause.addEventListener("click", () => { paused = !paused; syncPause(); });
    syncPause();

    /* Bucle: solo dibuja cuando la sección está visible */
    let last = 0, raf = 0, onScreen = true;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!paused) {
        BODIES.forEach((def) => {
          const o = objs[def.key];
          o.pivot.rotation.y += def.speed * dt * 0.35;
          o.mesh.rotation.y += def.spin * dt;
        });
      }
      const pulse = reduceMotion ? 0.8 : 0.65 + 0.25 * Math.sin(now / 450);
      BODIES.forEach((def) => {
        const h = objs[def.key].halo;
        if (!h) return;
        h.material.opacity = pulse;
        h.visible = def.key !== nav.key; // el halo estorba cuando la cámara ya está sobre ese mundo
      });

      if (nav.mode === "focus" || nav.mode === "reset") {
        nav.t = Math.min(1, nav.t + dt / (reduceMotion ? 0.01 : 1.2));
        const e = 1 - Math.pow(1 - nav.t, 3);
        const end = nav.mode === "focus" ? worldPos(nav.key, tmpC) : ORIGIN;
        tmpA.lerpVectors(nav.startTarget, end, e);
        tmpB.lerpVectors(nav.startRel, nav.endRel, e);
        controls.target.copy(tmpA);
        camera.position.copy(tmpA).add(tmpB);
        if (nav.t >= 1) nav.mode = nav.mode === "focus" ? "follow" : "free";
      } else if (nav.mode === "follow") {
        worldPos(nav.key, tmpC).sub(controls.target);
        controls.target.add(tmpC);
        camera.position.add(tmpC);
      }

      controls.update();
      renderer.render(scene, camera);
    }
    function run() { if (!raf && onScreen && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    function halt() { cancelAnimationFrame(raf); raf = 0; }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        onScreen = entries.some((e) => e.isIntersecting);
        onScreen ? run() : halt();
      }).observe(stage);
    }
    document.addEventListener("visibilitychange", () => (document.hidden ? halt() : run()));
    canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); halt(); showFallback(); });
    run();

    return { focus };
  }
})();
