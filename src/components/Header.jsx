import React, { useState, useEffect } from 'react';

// ── Logo animado T → MUEVO ───────────────────────────────────────────────
function LogoAnimado({ size = "hdr" }) {
  const [fase, setFase] = useState("solo");

  useEffect(() => {
    let t;
    const ciclo = () => {
      t = setTimeout(() => {
        setFase("entrando");
        t = setTimeout(() => {
          setFase("completo");
          t = setTimeout(() => {
            setFase("saliendo");
            t = setTimeout(() => {
              setFase("solo");
              ciclo();
            }, 350);
          }, 1800);
        }, 400);
      }, 2200);
    };
    ciclo();
    return () => clearTimeout(t);
  }, []);

  const isHdr    = size === "hdr";
  const fontSize = isHdr ? 20 : 17;
  const markSize = isHdr ? 34 : 30;
  const markFont = isHdr ? 13 : 11;

  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <span className="hdr__logo-mark" style={{ width:markSize, height:markSize, fontSize:markFont }}>T</span>
      <span style={{
        display:"flex", alignItems:"center",
        fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize,
        color:"#fff", letterSpacing:"-0.5px", lineHeight:1, overflow:"hidden",
      }}>
        <span style={{
          display:"inline-block",
          transform: (fase === "solo" || fase === "saliendo") ? "translateX(60px)" : "translateX(0)",
          opacity:   (fase === "solo" || fase === "saliendo") ? 0 : 1,
          transition: fase === "entrando"
            ? "transform 0.38s cubic-bezier(.2,.8,.3,1), opacity 0.28s ease"
            : fase === "saliendo"
            ? "transform 0.3s cubic-bezier(.4,0,1,1), opacity 0.22s ease"
            : "none",
          color:"#c8f000",
          willChange:"transform, opacity",
        }}>MUEVO</span>
      </span>
    </div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // soloDesktop: enlaces que se ocultan en móvil para no apretar la barra
  const navLinks = [
    { href: '#reservas',  label: 'Reservar',  soloDesktop: true },
    { href: '#servicios', label: 'Servicios' },
    { href: '#ventajas',  label: 'Ventajas'  },
    { href: '#contacto',  label: 'Contacto'  },
  ];

  const irArriba = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <style>{CSS}</style>

      <header className={`hdr ${scrolled ? 'hdr--scrolled' : ''}`}>
        <div className="hdr__inner">

          <a href="#reservas" className="hdr__logo" aria-label="TMUEVO" onClick={irArriba}>
            <LogoAnimado size="hdr" />
          </a>

          <nav className="hdr__nav">
            {navLinks.map(({ href, label, soloDesktop }) => (
              <a
                key={href}
                href={href}
                className={`hdr__nav-link${soloDesktop ? ' hdr__nav-link--desktop' : ''}`}
              >
                {label}
              </a>
            ))}
          </nav>

        </div>
      </header>
    </>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .hdr{position:fixed;top:0;left:0;right:0;z-index:200;background:#000;border-bottom:1px solid transparent;transition:border-color .3s,background .3s;font-family:'DM Sans',sans-serif}
  .hdr--scrolled{border-bottom-color:#1a1a1a;background:rgba(0,0,0,.96);backdrop-filter:blur(10px)}
  .hdr__inner{max-width:1100px;margin:0 auto;padding:0 1.25rem;height:64px;display:flex;align-items:center;justify-content:space-between;gap:1rem}

  .hdr__logo{display:flex;align-items:center;gap:6px;text-decoration:none;flex-shrink:0;transition:opacity .2s}
  .hdr__logo:hover{opacity:.85}
  .hdr__logo-mark{width:34px;height:34px;border-radius:8px;background:#fff;color:#000;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:13px;letter-spacing:-0.5px;flex-shrink:0}

  .hdr__nav{display:flex;align-items:center;justify-content:flex-end;gap:.1rem;flex:1;margin-left:1rem}
  .hdr__nav-link{padding:6px 9px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:500;color:#bbb;transition:all .18s;white-space:nowrap}
  .hdr__nav-link:hover{color:#fff;background:#111}
  .hdr__nav-link--desktop{display:none}
  @media(min-width:768px){
    .hdr__nav{gap:.25rem;margin-left:2rem}
    .hdr__nav-link{padding:6px 14px;font-size:15px}
    .hdr__nav-link--desktop{display:inline-block}
  }

  @media(min-width:768px){
  }

  @keyframes fadeDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}

  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes modalUp{from{opacity:0;transform:translate(-50%,-48%) scale(.97)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}

  @keyframes spin{to{transform:rotate(360deg)}}
`;