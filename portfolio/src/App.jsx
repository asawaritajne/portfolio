import { useState, useEffect, useRef } from "react";
import asawariPhoto from "./asawari.jpeg";

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
function useReveal(t = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); o.unobserve(el); }
    }, { threshold: t });
    o.observe(el);
    return () => o.disconnect();
  }, [t]);
  return [ref, v];
}
function Reveal({ children, delay = 0, style = {}, from = "bottom" }) {
  const [ref, v] = useReveal();
  const init = from === "left" ? "translateX(-40px)" : from === "right" ? "translateX(40px)" : "translateY(40px)";
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "none" : init,
      transition: `opacity .8s cubic-bezier(.22,1,.36,1) ${delay}s, transform .8s cubic-bezier(.22,1,.36,1) ${delay}s`,
      ...style
    }}>{children}</div>
  );
}

/* ══════════════════════════════════════════
   PARTICLE CANVAS BACKGROUND
══════════════════════════════════════════ */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth, H = window.innerHeight;
    let animId;
    canvas.width = W; canvas.height = H;
    const resize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener("resize", resize);
    const N = 80;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.4,
      hue: Math.random() > 0.6 ? 38 : 280,
    }));
    let mx = W / 2, my = H / 2;
    const onMove = e => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", onMove);
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx + (mx - W / 2) * 0.00012;
        p.y += p.vy + (my - H / 2) * 0.00012;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,70%,0.55)`;
        ctx.fill();
      });
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(232,168,56,${0.13 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.7 }} />;
}

/* ══════════════════════════════════════════
   GRAIN OVERLAY
══════════════════════════════════════════ */
function GrainOverlay() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
      opacity: 0.35
    }} />
  );
}

/* ══════════════════════════════════════════
   ORBS
══════════════════════════════════════════ */
function Orbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {[
        { w: 600, h: 600, top: "-10%", left: "-8%", color: "232,168,56", anim: "orbA 22s ease-in-out infinite alternate", opacity: 0.06 },
        { w: 500, h: 500, top: "40%", right: "-5%", color: "192,110,245", anim: "orbB 26s ease-in-out infinite alternate", opacity: 0.055 },
        { w: 350, h: 350, bottom: "5%", left: "25%", color: "107,221,255", anim: "orbC 30s ease-in-out infinite alternate", opacity: 0.04 },
        { w: 280, h: 280, top: "20%", left: "55%", color: "192,110,245", anim: "orbD 18s ease-in-out infinite alternate", opacity: 0.04 },
      ].map((o, i) => (
        <div key={i} style={{
          position: "absolute",
          width: o.w, height: o.h, borderRadius: "50%",
          background: `rgba(${o.color},1)`,
          filter: "blur(120px)",
          top: o.top, left: o.left, right: o.right, bottom: o.bottom,
          opacity: o.opacity, animation: o.anim,
        }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════ */
function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = e => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", move);
    const hoverIn = () => setHovering(true);
    const hoverOut = () => setHovering(false);
    const els = document.querySelectorAll("a,button,[data-hover]");
    els.forEach(el => { el.addEventListener("mouseenter", hoverIn); el.addEventListener("mouseleave", hoverOut); });
    let id;
    function animate() {
      if (dotRef.current) {
        dotRef.current.style.left = pos.current.x + "px";
        dotRef.current.style.top = pos.current.y + "px";
      }
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x + "px";
        ringRef.current.style.top = ring.current.y + "px";
      }
      id = requestAnimationFrame(animate);
    }
    animate();
    return () => { cancelAnimationFrame(id); window.removeEventListener("mousemove", move); };
  }, []);

  return (
    <>
      <div ref={dotRef} style={{
        position: "fixed", width: 6, height: 6, borderRadius: "50%",
        background: "#e8a838", zIndex: 9999, pointerEvents: "none",
        transform: "translate(-50%,-50%)",
      }} />
      <div ref={ringRef} style={{
        position: "fixed", zIndex: 9998, pointerEvents: "none",
        transform: "translate(-50%,-50%)",
        width: hovering ? 50 : 32, height: hovering ? 50 : 32,
        borderRadius: "50%",
        border: `1.5px solid ${hovering ? "#e8a838" : "rgba(232,168,56,0.5)"}`,
        transition: "width 0.3s, height 0.3s, border-color 0.3s",
      }} />
    </>
  );
}

/* ══════════════════════════════════════════
   TYPEWRITER  (removed "UI Craftsperson")
══════════════════════════════════════════ */
function Typewriter({ words }) {
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  const [show, setShow] = useState("");

  useEffect(() => {
    const word = words[wi];
    const timeout = setTimeout(() => {
      if (!del) {
        setShow(word.slice(0, ci + 1));
        if (ci + 1 === word.length) setTimeout(() => setDel(true), 1800);
        else setCi(c => c + 1);
      } else {
        setShow(word.slice(0, ci - 1));
        if (ci - 1 === 0) { setDel(false); setWi(w => (w + 1) % words.length); setCi(0); }
        else setCi(c => c - 1);
      }
    }, del ? 60 : 90);
    return () => clearTimeout(timeout);
  }, [ci, del, wi, words]);

  return (
    <span style={{ color: "#e8a838", fontFamily: "'JetBrains Mono',monospace" }}>
      {show}
      <span style={{ animation: "blink 1s step-end infinite", borderRight: "2px solid #e8a838", marginLeft: 2 }} />
    </span>
  );
}

/* ══════════════════════════════════════════
   ACCORDION
══════════════════════════════════════════ */
function Accordion({ header, children, accentColor = "#e8a838" }) {
  const [open, setOpen] = useState(false);
  const inner = useRef(null);
  const [h, setH] = useState(0);
  useEffect(() => { if (inner.current) setH(inner.current.scrollHeight); });
  return (
    <div style={{
      background: "rgba(255,255,255,.022)",
      border: `1px solid ${open ? accentColor + "44" : "rgba(255,255,255,.06)"}`,
      borderRadius: 18, marginBottom: 14,
      transition: "all .35s cubic-bezier(.22,1,.36,1)",
      overflow: "hidden",
      boxShadow: open ? `0 8px 40px ${accentColor}18` : "none",
    }}
      onMouseEnter={e => { if (!open) { e.currentTarget.style.borderColor = accentColor + "33"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
      onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = "rgba(255,255,255,.06)"; e.currentTarget.style.transform = "translateY(0)"; } }}
    >
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", background: "none", border: "none",
        color: "#e0e0e0", padding: "20px 24px",
        display: "flex", alignItems: "center", cursor: "pointer",
        fontFamily: "'Outfit',sans-serif", fontSize: 15, textAlign: "left",
      }}>
        <div style={{ flex: 1 }}>{header}</div>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: open ? accentColor : "rgba(255,255,255,.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .35s cubic-bezier(.22,1,.36,1)",
          flexShrink: 0, marginLeft: 12,
        }}>
          <span style={{
            fontSize: 14, color: open ? "#0a0a0f" : accentColor,
            transition: "transform .35s", transform: open ? "rotate(180deg)" : "rotate(0)",
            display: "block", lineHeight: 1,
          }}>▾</span>
        </div>
      </button>
      <div style={{ maxHeight: open ? h + 28 : 0, overflow: "hidden", transition: "max-height .5s cubic-bezier(.22,1,.36,1)" }}>
        <div ref={inner} style={{ padding: "0 24px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SECTION TITLE
══════════════════════════════════════════ */
function ST({ children, sub }) {
  const [ref, v] = useReveal();
  return (
    <div ref={ref} style={{ textAlign: "center", marginBottom: 56 }}>
      {sub && (
        <p style={{
          fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
          color: "#c06ef5", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10,
          opacity: v ? 1 : 0, transform: v ? "none" : "translateY(10px)",
          transition: "opacity .6s .1s, transform .6s .1s",
        }}>{sub}</p>
      )}
      <h2 style={{
        fontFamily: "'DM Serif Display',serif",
        fontSize: "clamp(30px,4.5vw,52px)",
        color: "#fff", marginBottom: 18, lineHeight: 1.1,
        opacity: v ? 1 : 0, transform: v ? "none" : "translateY(20px)",
        transition: "opacity .7s .2s, transform .7s .2s",
      }}>{children}</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{
          height: 3, borderRadius: 2,
          background: "linear-gradient(90deg,#e8a838,#c06ef5,#6bddff)",
          width: v ? 80 : 0, transition: "width 1s cubic-bezier(.22,1,.36,1) .4s",
        }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   GLITCH TEXT
══════════════════════════════════════════ */
function GlitchText({ text, style = {} }) {
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <span style={{ position: "absolute", top: 0, left: 0, color: "#c06ef5", animation: "glitch1 4s infinite", clipPath: "polygon(0 20%, 100% 20%, 100% 40%, 0 40%)", opacity: 0.7 }}>{text}</span>
      <span style={{ position: "absolute", top: 0, left: 0, color: "#6bddff", animation: "glitch2 4s infinite", clipPath: "polygon(0 60%, 100% 60%, 100% 80%, 0 80%)", opacity: 0.7 }}>{text}</span>
      <span>{text}</span>
    </span>
  );
}

/* ══════════════════════════════════════════
   FLOATING CODE SNIPPETS
══════════════════════════════════════════ */
function FloatingCode() {
  const snippets = [
    "const dev = new Engineer();",
    "git commit -m '✨ magic'",
    "npm run build",
    "SELECT * FROM skills;",
    "<Component />",
    "async/await ✓",
    "border-radius: 50%;",
    "flex: 1 1 auto;",
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {snippets.map((s, i) => (
        <div key={i} style={{
          position: "absolute",
          fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
          color: i % 2 === 0 ? "rgba(232,168,56,0.12)" : "rgba(192,110,245,0.10)",
          top: `${8 + i * 11}%`,
          left: i % 2 === 0 ? `${62 + (i % 3) * 8}%` : `${(i % 3) * 6}%`,
          animation: `floatCode ${14 + i * 2}s ease-in-out infinite alternate`,
          animationDelay: `${i * 1.1}s`,
          whiteSpace: "nowrap",
          transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
        }}>{s}</div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   NAV
══════════════════════════════════════════ */
const LINKS = ["About", "Skills", "Experience", "Projects", "Education", "Contact"];
function Nav() {
  const [sc, setSc] = useState(false);
  const [mob, setMob] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState("");
  useEffect(() => {
    const fn = () => setSc(window.scrollY > 50);
    const mr = () => setIsMobile(window.innerWidth <= 768);
    mr(); window.addEventListener("scroll", fn, { passive: true }); window.addEventListener("resize", mr);
    return () => { window.removeEventListener("scroll", fn); window.removeEventListener("resize", mr); };
  }, []);
  const go = id => { document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" }); setMob(false); setActive(id); };
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      transition: "all .35s",
      backdropFilter: sc ? "blur(24px) saturate(180%)" : "blur(10px)",
      WebkitBackdropFilter: sc ? "blur(24px) saturate(180%)" : "blur(10px)",
      background: sc ? "rgba(10,10,15,.88)" : "transparent",
      borderBottom: sc ? "1px solid rgba(255,255,255,.06)" : "none",
    }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>
          AT
          <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#e8a838", marginLeft: 1, marginBottom: 8, animation: "pulseDot 2s ease-in-out infinite" }} />
        </span>
        {!isMobile && (
          <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,.04)", padding: "6px 8px", borderRadius: 50, border: "1px solid rgba(255,255,255,.06)" }}>
            {LINKS.map(l => (
              <button key={l} onClick={() => go(l)} style={{
                background: active === l ? "rgba(232,168,56,.15)" : "none",
                border: active === l ? "1px solid rgba(232,168,56,.3)" : "1px solid transparent",
                color: active === l ? "#e8a838" : "#888",
                fontFamily: "'Outfit',sans-serif", fontSize: 13.5, fontWeight: 500,
                cursor: "pointer", padding: "7px 16px", borderRadius: 50,
                transition: "all .25s", letterSpacing: .4,
              }}
                onMouseEnter={e => { if (active !== l) { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,.06)"; } }}
                onMouseLeave={e => { if (active !== l) { e.currentTarget.style.color = "#888"; e.currentTarget.style.background = "none"; } }}
              >{l}</button>
            ))}
          </div>
        )}
        {isMobile && <button onClick={() => setMob(!mob)} style={{ background: "none", border: "none", color: "#e8a838", fontSize: 24, cursor: "pointer" }}>{mob ? "✕" : "☰"}</button>}
      </div>
      {mob && isMobile && (
        <div style={{ padding: "8px 28px 24px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
          {LINKS.map(l => (
            <button key={l} onClick={() => go(l)} style={{ display: "block", width: "100%", background: "none", border: "none", color: "#ccc", fontFamily: "'Outfit',sans-serif", fontSize: 16, textAlign: "left", padding: "14px 0", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,.04)" }}>{l}</button>
          ))}
        </div>
      )}
    </nav>
  );
}

/* ══════════════════════════════════════════
   HERO  — with real photo above name
══════════════════════════════════════════ */
function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const m = () => setIsMobile(window.innerWidth <= 768);
    m(); window.addEventListener("resize", m); return () => window.removeEventListener("resize", m);
  }, []);

  /* Photo element reused on both layouts */
  const PhotoAvatar = ({ size = 160 }) => (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* outer glow ring */}
      <div style={{
        position: "absolute", inset: -3, borderRadius: "50%",
        background: "conic-gradient(from 0deg, #e8a838, #c06ef5, #6bddff, #e8a838)",
        animation: "spinCW 6s linear infinite",
        zIndex: 0,
      }} />
      {/* white gap */}
      <div style={{ position: "absolute", inset: 2, borderRadius: "50%", background: "#0a0a0f", zIndex: 1 }} />
      {/* photo */}
      <img
        src={asawariPhoto}
        alt="Asawari Tajne"
        style={{
          position: "absolute", inset: 5, borderRadius: "50%",
          width: `calc(100% - 10px)`, height: `calc(100% - 10px)`,
          objectFit: "cover", objectPosition: "center top",
          zIndex: 2,
        }}
      />
    </div>
  );

  return (
    <section id="about" style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <FloatingCode />
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(232,168,56,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,168,56,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
      }} />

      <div style={{
        maxWidth: 1140, margin: "0 auto",
        padding: isMobile ? "110px 20px 60px" : "150px 28px 100px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 60, flexWrap: "wrap",
        flexDirection: isMobile ? "column" : "row",
        position: "relative", zIndex: 2,
      }}>

        {/* ── MOBILE: photo above name ── */}
        {isMobile && (
          <Reveal>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <PhotoAvatar size={140} />
            </div>
          </Reveal>
        )}

        {/* Text side */}
        <div style={{ flex: "1 1 500px", minWidth: 280, textAlign: isMobile ? "center" : "left" }}>
          <Reveal>
            <p style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
              color: "#c06ef5", letterSpacing: 3, textTransform: "uppercase", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 10, justifyContent: isMobile ? "center" : "flex-start",
            }}>
              <span style={{ display: "inline-block", width: 30, height: 1, background: "#c06ef5" }} />
              Hello, I'm
              <span style={{ display: "inline-block", width: 30, height: 1, background: "#c06ef5" }} />
            </p>
          </Reveal>

          <Reveal delay={.1}>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(42px,6.5vw,78px)", color: "#fff", lineHeight: 1.05, marginBottom: 4 }}>
              <GlitchText text="Asawari" />
            </h1>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(42px,6.5vw,78px)", color: "#fff", lineHeight: 1.05, marginBottom: 20 }}>
              Tajne
            </h1>
          </Reveal>

          <Reveal delay={.2}>
            <div style={{ marginBottom: 28, fontSize: "clamp(15px,2vw,19px)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: .5 }}>
              <span style={{ color: "#555" }}>{">"} </span>
              {/* "UI Craftsperson" removed */}
              <Typewriter words={["Full-Stack Engineer", "React Developer", "Node.js Builder"]} />
            </div>
          </Reveal>

          <Reveal delay={.3}>
            <p style={{ fontSize: 15.5, lineHeight: 1.85, color: "#888", maxWidth: 520, marginBottom: 40, marginLeft: isMobile ? "auto" : 0, marginRight: isMobile ? "auto" : 0 }}>
              Full-Stack Software Engineer with 2+ years at Tech Mahindra building web applications and RESTful APIs using{" "}
              <span style={{ color: "#e8a838" }}>React</span>,{" "}
              <span style={{ color: "#e8a838" }}>Node.js</span>, and{" "}
              <span style={{ color: "#e8a838" }}>PostgreSQL</span> — shipping production features for AT&amp;T.
            </p>
          </Reveal>

          <Reveal delay={.4}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
              <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                style={{ padding: "15px 32px", background: "linear-gradient(135deg,#e8a838,#d4922e)", color: "#0a0a0f", fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700, border: "none", borderRadius: 50, cursor: "pointer", transition: "all .3s", boxShadow: "0 4px 24px rgba(232,168,56,.3)", letterSpacing: .5 }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.03)"; e.currentTarget.style.boxShadow = "0 10px 40px rgba(232,168,56,.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(232,168,56,.3)"; }}
              >Get In Touch ↗</button>
              <button onClick={() => document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" })}
                style={{ padding: "15px 32px", background: "transparent", color: "#bbb", fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 500, border: "1px solid rgba(255,255,255,.15)", borderRadius: 50, cursor: "pointer", transition: "all .3s", letterSpacing: .5 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#c06ef5"; e.currentTarget.style.color = "#c06ef5"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(192,110,245,.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "#bbb"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >View My Work</button>
            </div>
          </Reveal>

          <Reveal delay={.55}>
            <div style={{ display: "flex", gap: 32, marginTop: 52, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
              {[["2+", "Years Exp."], ["5+", "Projects"], ["3.66", "GPA"]].map(([n, l]) => (
                <div key={l} style={{ textAlign: isMobile ? "center" : "left" }}>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 32, color: "#e8a838", lineHeight: 1 }}>{n}</div>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: "#555", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ── DESKTOP: orbit avatar with real photo ── */}
        {!isMobile && (
          <Reveal delay={.25}>
            <div style={{ position: "relative", flexShrink: 0, width: 320, height: 320 }}>
              {/* Orbit rings */}
              {[280, 240, 200].map((s, i) => (
                <div key={i} style={{
                  position: "absolute", top: "50%", left: "50%",
                  width: s, height: s, marginTop: -s / 2, marginLeft: -s / 2,
                  borderRadius: "50%",
                  border: `1px solid rgba(232,168,56,${0.15 - i * 0.04})`,
                  animation: `${i % 2 === 0 ? "spinCW" : "spinCCW"} ${20 + i * 8}s linear infinite`,
                }} />
              ))}
              {/* Orbit dots */}
              {[
                { sz: 290, a: 0, color: "#e8a838" },
                { sz: 245, a: 120, color: "#c06ef5" },
                { sz: 200, a: 240, color: "#6bddff" },
              ].map((d, i) => (
                <div key={i} style={{
                  position: "absolute", width: 8, height: 8, borderRadius: "50%", background: d.color,
                  top: `calc(50% - 4px + ${Math.sin(d.a * Math.PI / 180) * d.sz / 2}px)`,
                  left: `calc(50% - 4px + ${Math.cos(d.a * Math.PI / 180) * d.sz / 2}px)`,
                  boxShadow: `0 0 10px ${d.color}`,
                }} />
              ))}

              {/* Center photo */}
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                width: 168, height: 168, marginTop: -84, marginLeft: -84,
                borderRadius: "50%", overflow: "hidden", zIndex: 5,
              }}>
                {/* spinning gradient border */}
                <div style={{
                  position: "absolute", inset: -3, borderRadius: "50%",
                  background: "conic-gradient(from 0deg,#e8a838,#c06ef5,#6bddff,#e8a838)",
                  animation: "spinCW 5s linear infinite",
                }} />
                <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "#0a0a0f" }} />
                <img
                  src={asawariPhoto}
                  alt="Asawari Tajne"
                  style={{
                    position: "absolute", inset: 6, borderRadius: "50%",
                    width: "calc(100% - 12px)", height: "calc(100% - 12px)",
                    objectFit: "cover", objectPosition: "center top",
                  }}
                />
              </div>

              {/* Glow behind photo */}
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                width: 200, height: 200, marginTop: -100, marginLeft: -100,
                borderRadius: "50%", background: "rgba(232,168,56,.1)",
                filter: "blur(40px)", animation: "pulse 3s ease-in-out infinite",
                zIndex: 4,
              }} />
            </div>
          </Reveal>
        )}
      </div>

      {/* Scroll indicator */}
      <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 2 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#444", letterSpacing: 2 }}>SCROLL</span>
        <div style={{ width: 1, height: 40, background: "linear-gradient(#e8a838, transparent)", animation: "scrollLine 2s ease-in-out infinite" }} />
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   SKILLS  — "Languages" → "Programming Languages"
══════════════════════════════════════════ */
const SKILLS = [
  { cat: "Programming Languages", icon: "{ }", items: ["JavaScript (ES6+)", "TypeScript", "Python", "Java", "SQL", "C", "C++"], color: "#e8a838" },
  { cat: "Frontend", icon: "◧", items: ["React", "Angular", "Vue.js", "HTML5", "CSS3", "Tailwind CSS"], color: "#c06ef5" },
  { cat: "Backend", icon: "⟡", items: ["Node.js", "Express.js", "RESTful APIs", "Middleware"], color: "#6bddff" },
  { cat: "Databases", icon: "⊞", items: ["PostgreSQL", "MySQL", "Neon"], color: "#e8a838" },
  { cat: "Auth / Cloud", icon: "◈", items: ["Clerk", "Cloudinary"], color: "#c06ef5" },
  { cat: "Tools", icon: "⚙", items: ["Git", "GitHub", "CI/CD", "Vercel", "Axios", "Inngest", "Vite"], color: "#6bddff" },
];

function SkillPill({ item, color }) {
  const [ref, v] = useReveal();
  return (
    <span ref={ref} style={{
      fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
      padding: "6px 14px", borderRadius: 8,
      background: v ? `${color}12` : "transparent",
      color: v ? color : "transparent",
      border: `1px solid ${v ? color + "25" : "transparent"}`,
      transition: "all .4s cubic-bezier(.22,1,.36,1)",
      display: "inline-block",
    }}>{item}</span>
  );
}

function Skills() {
  return (
    <section id="skills" style={{ maxWidth: 1140, margin: "0 auto", padding: "100px 28px" }}>
      <ST sub="Technologies I work with">Tech Stack</ST>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
        {SKILLS.map((s, i) => (
          <Reveal key={s.cat} delay={i * .07}>
            <Accordion accentColor={s.color} header={
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}15`, border: `1px solid ${s.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 16, color: s.color, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 15, color: "#e0e0e0" }}>{s.cat}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#555", marginTop: 2 }}>{s.items.length} skills</div>
                </div>
              </div>
            }>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 4 }}>
                {s.items.map(t => <SkillPill key={t} item={t} color={s.color} />)}
              </div>
            </Accordion>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   EXPERIENCE
══════════════════════════════════════════ */
const EXP = [
  {
    title: "Software Engineer", co: "Tech Mahindra", client: "AT&T",
    date: "Feb 2022 – Mar 2023", loc: "Nagpur, India", color: "#e8a838",
    b: [
      "Built the Demand Helper Ticket feature for AT&T technicians using React functional components and Hooks to enable real-time ticket creation, editing, and tracking — improving workflow efficiency by 20%.",
      "Developed reusable React UI components and implemented controlled forms with client-side validation, reducing form submission errors by 15%.",
      "Implemented authentication and role-based access control using protected routes and a custom useAuth hook, reducing unauthorized modifications by 20%.",
    ],
  },
  {
    title: "Associate Software Engineer", co: "Tech Mahindra", client: "AT&T",
    date: "Mar 2021 – Feb 2022", loc: "Nagpur, India", color: "#c06ef5",
    b: [
      "Engineered RESTful APIs using Node.js and Express.js for ticket creation, updates, and status management — improving system response stability by 12%.",
      "Enhanced MySQL queries and refined backend CRUD operations, reducing record retrieval time by 15%.",
      "Used a GitHub-based CI/CD workflow to manage feature branches, pull requests, and merge conflict resolution.",
    ],
  },
  {
    title: "Software Engineering Intern", co: "Maxgen Technologies", client: null,
    date: "Nov 2019 – May 2020", loc: "Pune, India", color: "#6bddff",
    b: [
      "Developed Angular UI components using data binding, component lifecycle methods, and responsive layout design.",
      "Implemented form validation and conditional rendering for real-time user feedback across devices.",
      "Performed code debugging and troubleshooting for UI rendering issues, improving frontend reliability.",
    ],
  },
];

function TimelineDot({ color }) {
  return (
    <div style={{ position: "relative", flexShrink: 0, marginTop: 4 }}>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: color, boxShadow: `0 0 0 4px ${color}22, 0 0 20px ${color}55`, animation: "pulse 2.5s ease-in-out infinite" }} />
    </div>
  );
}

function Experience() {
  return (
    <section id="experience" style={{ maxWidth: 1140, margin: "0 auto", padding: "100px 28px" }}>
      <ST sub="Where I've built things that matter">Experience</ST>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 1, background: "linear-gradient(#e8a838,#c06ef5,#6bddff)", opacity: 0.3 }} />
        {EXP.map((e, i) => (
          <Reveal key={i} delay={i * .1} from="left">
            <div style={{ display: "flex", gap: 28, marginBottom: 16, position: "relative" }}>
              <TimelineDot color={e.color} />
              <div style={{ flex: 1 }}>
                <Accordion accentColor={e.color} header={
                  <div>
                    <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 19, color: "#fff", marginBottom: 6 }}>{e.title}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", fontSize: 13, fontFamily: "'Outfit',sans-serif" }}>
                      <span style={{ color: e.color, fontWeight: 600 }}>{e.co}</span>
                      {e.client && <span style={{ color: "#555" }}>→ Client: <span style={{ color: "#777" }}>{e.client}</span></span>}
                      <span style={{ color: "#444" }}>·</span>
                      <span style={{ color: "#666" }}>{e.date}</span>
                      <span style={{ color: "#444" }}>·</span>
                      <span style={{ color: "#555" }}>{e.loc}</span>
                    </div>
                  </div>
                }>
                  <ul style={{ listStyle: "none", padding: 0, marginTop: 4 }}>
                    {e.b.map((x, j) => (
                      <li key={j} style={{ position: "relative", paddingLeft: 22, marginBottom: 14, fontSize: 14, lineHeight: 1.8, color: "#888", fontFamily: "'Outfit',sans-serif" }}>
                        <span style={{ position: "absolute", left: 0, top: 9, width: 7, height: 7, borderRadius: "50%", background: `linear-gradient(135deg,${e.color},${e.color}88)`, boxShadow: `0 0 6px ${e.color}44` }} />
                        {x}
                      </li>
                    ))}
                  </ul>
                </Accordion>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   PROJECTS
══════════════════════════════════════════ */
const PROJ = [
  {
    name: "Project Management Application",
    stack: ["React", "Express.js", "Neon PostgreSQL", "Clerk", "Inngest", "Vercel"],
    url: "https://project-mgt-vert.vercel.app", color: "#e8a838", emoji: "📋",
    b: [
      "Built a React and Express.js project management application to manage tasks, team roles, and organization-level access control with Clerk authentication.",
      "Designed RESTful APIs and structured a relational database schema in Neon PostgreSQL with deployment on Vercel and background task scheduling using Inngest.",
    ],
  },
  {
    name: "AI SaaS Platform",
    stack: ["React", "Axios", "Cloudinary", "Clerk", "Neon PostgreSQL"],
    url: "https://quick-ai-sandy-gamma.vercel.app", color: "#c06ef5", emoji: "🤖",
    b: [
      "Built a React SaaS platform for blog generation, image creation, background removal, resume analysis, and object editing with Clerk authentication.",
      "Designed backend API routes for service integration using Axios and managed media storage with Cloudinary and relational data in Neon PostgreSQL.",
    ],
  },
];

function Projects() {
  return (
    <section id="projects" style={{ maxWidth: 1140, margin: "0 auto", padding: "100px 28px" }}>
      <ST sub="Side projects I've shipped">Projects</ST>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px,1fr))", gap: 24, alignItems: "stretch" }}>
        {PROJ.map((p, i) => (
          <Reveal key={i} delay={i * .1} style={{ height: "100%", display: "flex" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "rgba(255,255,255,.022)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 22, overflow: "hidden", transition: "all .4s cubic-bezier(.22,1,.36,1)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + "44"; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 20px 60px ${p.color}15`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.06)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ height: 5, background: `linear-gradient(90deg,${p.color},${p.color}66,transparent)` }} />
              <div style={{ padding: "28px 28px 0" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: `${p.color}15`, border: `1px solid ${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{p.emoji}</div>
                  <div>
                    <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: "#fff", lineHeight: 1.2, marginBottom: 8 }}>{p.name}</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {p.stack.map(t => (
                        <span key={t} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, padding: "3px 10px", borderRadius: 20, background: `${p.color}10`, color: p.color, border: `1px solid ${p.color}20` }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "0 28px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 20, flex: 1 }}>
                  {p.b.map((x, j) => (
                    <li key={j} style={{ position: "relative", paddingLeft: 18, marginBottom: 12, fontSize: 14, lineHeight: 1.8, color: "#888", fontFamily: "'Outfit',sans-serif" }}>
                      <span style={{ position: "absolute", left: 0, top: 9, width: 6, height: 6, borderRadius: "50%", background: p.color, opacity: 0.7 }} />
                      {x}
                    </li>
                  ))}
                </ul>
                <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", border: `1px solid ${p.color}55`, borderRadius: 50, fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 600, color: p.color, transition: "all .3s", cursor: "pointer", background: `${p.color}00`, alignSelf: "flex-start" }}
                  onMouseEnter={e => { e.currentTarget.style.background = p.color; e.currentTarget.style.color = "#0a0a0f"; e.currentTarget.style.boxShadow = `0 4px 20px ${p.color}44`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${p.color}00`; e.currentTarget.style.color = p.color; e.currentTarget.style.boxShadow = "none"; }}
                >Live Demo ↗</a>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   EDUCATION
══════════════════════════════════════════ */
const EDU = [
  { deg: "M.S. Information Technology Management", sch: "The University of Texas at Dallas", loc: "Richardson, TX", date: "Expected May 2026", gpa: "3.66", award: "Program Excellence Scholarship Award — April 2024", color: "#e8a838", emoji: "🎓" },
  { deg: "B.E. Information Technology", sch: "G.H. Raisoni College of Engineering", loc: "Nagpur, India", date: "May 2020", gpa: "3.13", award: null, color: "#c06ef5", emoji: "📚" },
];

function Education() {
  return (
    <section id="education" style={{ maxWidth: 1140, margin: "0 auto", padding: "100px 28px" }}>
      <ST sub="My academic journey">Education</ST>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 24, alignItems: "stretch" }}>
        {EDU.map((e, i) => (
          <Reveal key={i} delay={i * .14} style={{ height: "100%", display: "flex" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", background: "rgba(255,255,255,.022)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 22, overflow: "hidden", transition: "all .4s" }}
              onMouseEnter={ev => { ev.currentTarget.style.transform = "translateY(-6px)"; ev.currentTarget.style.borderColor = e.color + "44"; ev.currentTarget.style.boxShadow = `0 20px 60px ${e.color}15`; }}
              onMouseLeave={ev => { ev.currentTarget.style.transform = "none"; ev.currentTarget.style.borderColor = "rgba(255,255,255,.06)"; ev.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ height: 4, background: `linear-gradient(90deg,${e.color},${e.color}44)` }} />
              <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `${e.color}08`, filter: "blur(30px)", pointerEvents: "none" }} />
              <div style={{ padding: "28px 30px 32px" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{e.emoji}</div>
                <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 19, color: "#fff", marginBottom: 8, lineHeight: 1.3 }}>{e.deg}</h3>
                <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15, color: "#ccc", marginBottom: 4 }}>{e.sch}</p>
                <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#555", marginBottom: 16 }}>{e.loc} · {e.date}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: e.award ? 14 : 0 }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#666" }}>GPA</span>
                  <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.06)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${(parseFloat(e.gpa) / 4) * 100}%`, height: "100%", background: `linear-gradient(90deg,${e.color},${e.color}88)`, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: e.color, fontWeight: 600 }}>{e.gpa}</span>
                </div>
                {e.award && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 14, padding: "10px 14px", background: `${e.color}08`, border: `1px solid ${e.color}20`, borderRadius: 10, fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#c06ef5", lineHeight: 1.5 }}>
                    <span>🏆</span><span>{e.award}</span>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   CONTACT
══════════════════════════════════════════ */
const CON = [
  { label: "Email", val: "tajneasawari@gmail.com", href: "mailto:tajneasawari@gmail.com", icon: "✉", color: "#e8a838" },
  { label: "Phone", val: "469.350.6541", href: "tel:4693506541", icon: "☎", color: "#c06ef5" },
  { label: "LinkedIn", val: "linkedin.com/in/asawaritajne", href: "https://linkedin.com/in/asawaritajne", icon: "in", color: "#6bddff" },
  { label: "GitHub", val: "github.com/asawaritajne", href: "https://github.com/asawaritajne", icon: "</>", color: "#e8a838" },
];

function Contact() {
  return (
    <section id="contact" style={{ maxWidth: 1140, margin: "0 auto", padding: "100px 28px 60px" }}>
      <ST sub="Let's connect">Get In Touch</ST>
      <Reveal delay={.1}>
        <p style={{ textAlign: "center", fontFamily: "'Outfit',sans-serif", fontSize: 16, color: "#666", maxWidth: 480, margin: "0 auto 52px", lineHeight: 1.8 }}>
          Open to new opportunities, collaborations, or just a good conversation about code.
        </p>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, maxWidth: 900, margin: "0 auto" }}>
        {CON.map((c, i) => (
          <Reveal key={i} delay={i * .08} style={{ height: "100%", display: "flex" }}>
            <a href={c.href} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "32px 16px", background: "rgba(255,255,255,.022)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 20, transition: "all .35s cubic-bezier(.22,1,.36,1)", cursor: "pointer", textDecoration: "none", minWidth: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = c.color + "55"; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 16px 50px ${c.color}18`; e.currentTarget.style.background = `${c.color}06`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.06)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "rgba(255,255,255,.022)"; }}
            >
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, color: c.color, width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14, background: `${c.color}12`, border: `1px solid ${c.color}25`, boxShadow: `0 0 20px ${c.color}18`, flexShrink: 0 }}>{c.icon}</span>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>{c.label}</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#555", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%", paddingInline: 4 }}>{c.val}</span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   GLOBAL CSS
══════════════════════════════════════════ */
function Styles() {
  useEffect(() => {
    const id = "at-portfolio-v3-css";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: #0a0a0f; color: #e0e0e0; font-family: 'Outfit', sans-serif; overflow-x: hidden; cursor: none; }
      a { text-decoration: none; color: inherit; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: #0a0a0f; }
      ::-webkit-scrollbar-thumb { background: #1a1a24; border-radius: 3px; }
      @keyframes orbA { from { transform: translate(0,0) scale(1); } to { transform: translate(40px,50px) scale(1.1); } }
      @keyframes orbB { from { transform: translate(0,0) scale(1); } to { transform: translate(-50px,-35px) scale(1.15); } }
      @keyframes orbC { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,-40px) scale(1.08); } }
      @keyframes orbD { from { transform: translate(0,0) scale(1); } to { transform: translate(-20px,30px) scale(1.12); } }
      @keyframes spinCW { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes spinCCW { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
      @keyframes pulse { 0%,100% { opacity:0.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.08); } }
      @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.6); } }
      @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
      @keyframes scrollLine { 0% { transform:scaleY(0); transform-origin:top; } 50% { transform:scaleY(1); transform-origin:top; } 51% { transform:scaleY(1); transform-origin:bottom; } 100% { transform:scaleY(0); transform-origin:bottom; } }
      @keyframes floatCode { from { transform:translateY(0px) rotate(-2deg); opacity:0.8; } to { transform:translateY(-20px) rotate(2deg); opacity:0.4; } }
      @keyframes glitch1 { 0%,85%,100% { transform:translate(0,0); opacity:0; } 86% { transform:translate(-3px,1px); opacity:0.7; } 88% { transform:translate(3px,-1px); opacity:0.7; } 90% { transform:translate(0,0); opacity:0; } }
      @keyframes glitch2 { 0%,90%,100% { transform:translate(0,0); opacity:0; } 91% { transform:translate(3px,2px); opacity:0.7; } 93% { transform:translate(-3px,-2px); opacity:0.7; } 95% { transform:translate(0,0); opacity:0; } }
    `;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);
  return null;
}

/* ══════════════════════════════════════════
   APP
══════════════════════════════════════════ */
export default function App() {
  return (
    <>
      <Styles />
      <ParticleCanvas />
      <GrainOverlay />
      <Orbs />
      <Cursor />
      <Nav />
      <main style={{ position: "relative", zIndex: 2 }}>
        <Hero />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
      <footer style={{ textAlign: "center", padding: "32px 28px 48px", borderTop: "1px solid rgba(255,255,255,.04)", position: "relative", zIndex: 2 }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#2a2a35", marginBottom: 8 }}>✦ ✦ ✦</div>
        <p style={{ color: "#333", fontSize: 13, fontFamily: "'Outfit',sans-serif" }}>© {new Date().getFullYear()} Asawari Tajne · Crafted with care</p>
      </footer>
    </>
  );
}
