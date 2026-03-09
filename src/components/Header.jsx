import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, MapPin, LogIn, UserPlus } from 'lucide-react';

/**
 * Header — estilo Uber
 * Marca: LLEVU  (llevo + mapudungún = "te llevo")
 *
 * Estados:
 *  - guest  → "Inicia sesión"  + pill "Regístrate"  + ≡
 *  - logged → pill "Juan ▾"                          + ≡
 *
 * Responsive:
 *  - móvil  → solo logo + acciones + hamburger
 *  - desktop → logo + nav links + acciones + hamburger oculto
 */

export default function Header({ user = null }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const navLinks = [
    { href: '#inicio',    label: 'Inicio'    },
    { href: '#servicios', label: 'Servicios' },
    { href: '#ventajas',  label: 'Ventajas'  },
    { href: '#reservas',  label: 'Reservar'  },
  ];

  const drawerItems = [
    { href: '#inicio',    label: 'Inicio',    desc: 'Bienvenida'        },
    { href: '#servicios', label: 'Servicios', desc: 'Lo que ofrecemos'  },
    { href: '#ventajas',  label: 'Ventajas',  desc: 'Por qué elegirnos' },
    { href: '#reservas',  label: 'Reservar',  desc: 'Elige tu viaje'    },
    { href: '#contacto',  label: 'Contacto',  desc: 'Escríbenos'        },
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* ── BAR ── */}
      <header className={`hdr ${scrolled ? 'hdr--scrolled' : ''}`}>
        <div className="hdr__inner">

          {/* Logo */}
          <a href="#inicio" className="hdr__logo" aria-label="LLEVU - Inicio">
            <span className="hdr__logo-mark">LL</span>
            <span className="hdr__logo-name">LLEVU</span>
          </a>

          {/* Desktop nav */}
          <nav className="hdr__nav" aria-label="Navegación principal">
            {navLinks.map(({ href, label }) => (
              <a key={href} href={href} className="hdr__nav-link">{label}</a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hdr__actions">
            {user ? (
              /* Logged in */
              <button className="hdr__user-pill">
                <span>{user.name ?? 'Mi cuenta'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            ) : (
              /* Guest */
              <>
                <a href="#login" className="hdr__signin">Inicia sesión</a>
                <a href="#register" className="hdr__register">Regístrate</a>
              </>
            )}

            {/* Hamburger — móvil only */}
            <button
              className="hdr__hamburger"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={drawerOpen}
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </header>

      {/* ── DRAWER OVERLAY ── */}
      <div
        className={`drawer-overlay ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* ── DRAWER ── */}
      <aside
        className={`drawer ${drawerOpen ? 'open' : ''}`}
        aria-label="Menú de navegación"
        role="dialog"
        aria-modal="true"
      >
        {/* Header del drawer */}
        <div className="drawer__header">
          <div className="drawer__logo">
            <span className="drawer__logo-mark">LL</span>
            <span className="drawer__logo-name">LLEVU</span>
          </div>
          <button
            className="drawer__close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Si hay usuario */}
        {user && (
          <div className="drawer__user">
            <div className="drawer__user-avatar">{(user.name ?? 'U')[0]}</div>
            <div>
              <div className="drawer__user-name">{user.name}</div>
              <div className="drawer__user-email">{user.email ?? ''}</div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="drawer__nav">
          {drawerItems.map(({ href, label, desc }, i) => (
            <a
              key={href}
              href={href}
              className="drawer__item"
              style={{ animationDelay: `${i * 0.06 + 0.04}s` }}
              onClick={() => setDrawerOpen(false)}
            >
              <div>
                <div className="drawer__item-label">{label}</div>
                <div className="drawer__item-desc">{desc}</div>
              </div>
              <ChevronRight size={15} className="drawer__item-arrow" />
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="drawer__footer">
          {!user ? (
            <div className="drawer__auth-btns">
              <a href="#login"    className="drawer__btn-ghost" onClick={() => setDrawerOpen(false)}>
                <LogIn size={15}/> Inicia sesión
              </a>
              <a href="#register" className="drawer__btn-solid" onClick={() => setDrawerOpen(false)}>
                <UserPlus size={15}/> Regístrate
              </a>
            </div>
          ) : (
            <button className="drawer__btn-ghost drawer__btn-ghost--full">
              Cerrar sesión
            </button>
          )}
          <div className="drawer__location">
            <MapPin size={11} />
            <span>Región de La Araucanía, Chile</span>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ── Hamburger SVG ────────────────────────────────────────────────────────── */
const HamburgerIcon = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
    <rect x="0" y="0"  width="20" height="2" rx="1" fill="currentColor"/>
    <rect x="4" y="6"  width="16" height="2" rx="1" fill="currentColor"/>
    <rect x="2" y="12" width="18" height="2" rx="1" fill="currentColor"/>
  </svg>
);

/* ── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  /* ── Reset ── */
  .hdr *, .drawer *, .drawer-overlay { box-sizing: border-box; }

  /* ═══════════════════════════════════════
     HEADER BAR
  ═══════════════════════════════════════ */
  .hdr {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    background: #000;
    border-bottom: 1px solid transparent;
    transition: border-color 0.3s, background 0.3s;
    font-family: 'DM Sans', sans-serif;
  }
  .hdr--scrolled {
    border-bottom-color: #1a1a1a;
    background: rgba(0,0,0,0.96);
    backdrop-filter: blur(10px);
  }

  .hdr__inner {
    max-width: 1100px; margin: 0 auto;
    padding: 0 1.25rem;
    height: 64px;
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  }

  /* ── Logo ── */
  .hdr__logo {
    display: flex; align-items: center; gap: 6px;
    text-decoration: none; flex-shrink: 0;
    transition: opacity .2s;
  }
  .hdr__logo:hover { opacity: .85; }

  .hdr__logo-mark {
    width: 34px; height: 34px; border-radius: 8px;
    background: #fff; color: #000;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 13px;
    letter-spacing: -0.5px; flex-shrink: 0;
  }
  .hdr__logo-name {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;
    color: #fff; letter-spacing: -0.5px; line-height: 1;
  }

  /* ── Desktop nav ── */
  .hdr__nav {
    display: none; align-items: center; gap: 0.25rem; flex: 1; margin-left: 2rem;
  }
  @media (min-width: 768px) { .hdr__nav { display: flex; } }

  .hdr__nav-link {
    padding: 6px 14px; border-radius: 8px;
    text-decoration: none; font-size: 15px; font-weight: 500; color: #bbb;
    transition: all .18s;
  }
  .hdr__nav-link:hover { color: #fff; background: #111; }

  /* ── Actions ── */
  .hdr__actions {
    display: flex; align-items: center; gap: 4px; flex-shrink: 0;
  }

  .hdr__signin {
    padding: 8px 14px; border-radius: 8px;
    text-decoration: none; font-size: 15px; font-weight: 500; color: #fff;
    transition: background .18s; white-space: nowrap;
  }
  .hdr__signin:hover { background: #111; }

  .hdr__register {
    padding: 8px 16px; border-radius: 99px;
    border: 1.5px solid #fff;
    text-decoration: none; font-size: 15px; font-weight: 600; color: #fff;
    transition: all .18s; white-space: nowrap;
  }
  .hdr__register:hover { background: #fff; color: #000; }

  .hdr__user-pill {
    display: flex; align-items: center; gap: 7px;
    padding: 8px 16px; border-radius: 99px;
    border: 1.5px solid #333; background: transparent;
    font-size: 15px; font-weight: 600; color: #fff;
    cursor: pointer; transition: all .18s;
    font-family: 'DM Sans', sans-serif;
  }
  .hdr__user-pill:hover { border-color: #fff; background: #111; }

  /* Hamburger — only mobile */
  .hdr__hamburger {
    display: flex; align-items: center; justify-content: center;
    width: 40px; height: 40px; border-radius: 8px;
    background: transparent; border: none; color: #fff;
    cursor: pointer; transition: background .18s;
    margin-left: 6px;
  }
  .hdr__hamburger:hover { background: #1a1a1a; }
  @media (min-width: 768px) { .hdr__hamburger { display: none; } }

  /* ═══════════════════════════════════════
     OVERLAY
  ═══════════════════════════════════════ */
  .drawer-overlay {
    position: fixed; inset: 0; z-index: 300;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    opacity: 0; pointer-events: none;
    transition: opacity .3s ease;
  }
  .drawer-overlay.open { opacity: 1; pointer-events: all; }

  /* ═══════════════════════════════════════
     DRAWER
  ═══════════════════════════════════════ */
  .drawer {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: min(300px, 82vw); z-index: 400;
    background: #050505;
    border-left: 1px solid #1a1a1a;
    transform: translateX(100%);
    transition: transform .38s cubic-bezier(.4,0,.2,1);
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif;
  }
  .drawer.open { transform: translateX(0); }

  /* Decorative glow */
  .drawer::after {
    content: '';
    position: absolute; top: -40px; left: -40px;
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Drawer header */
  .drawer__header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.1rem 1.25rem;
    border-bottom: 1px solid #141414;
  }
  .drawer__logo {
    display: flex; align-items: center; gap: 6px; text-decoration: none;
  }
  .drawer__logo-mark {
    width: 30px; height: 30px; border-radius: 7px;
    background: #fff; color: #000;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 11px;
  }
  .drawer__logo-name {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 17px;
    color: #fff; letter-spacing: -0.3px;
  }
  .drawer__close {
    width: 34px; height: 34px; border-radius: 8px;
    border: 1px solid #222; background: transparent; color: #888;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all .2s;
  }
  .drawer__close:hover { border-color: #444; color: #fff; }

  /* User badge */
  .drawer__user {
    display: flex; align-items: center; gap: 12px;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #141414;
    background: #0a0a0a;
  }
  .drawer__user-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: #fff; color: #000;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px;
    flex-shrink: 0;
  }
  .drawer__user-name  { font-size: 15px; font-weight: 600; color: #fff; }
  .drawer__user-email { font-size: 12px; color: #555; margin-top: 2px; }

  /* Nav items */
  .drawer__nav {
    flex: 1; padding: 0.75rem 0.75rem;
    display: flex; flex-direction: column; overflow-y: auto;
  }
  .drawer__item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.85rem 0.85rem; border-radius: 12px;
    text-decoration: none; transition: background .18s;
    opacity: 0;
    animation: drawerSlide 0.35s ease both;
  }
  .drawer__item:hover { background: #111; }
  .drawer__item:hover .drawer__item-arrow { transform: translateX(3px); color: #fff; }

  .drawer__item-label { font-size: 16px; font-weight: 600; color: #fff; }
  .drawer__item-desc  { font-size: 11px; color: #444; margin-top: 1px; }
  .drawer__item-arrow { color: #333; transition: all .18s; flex-shrink: 0; }

  @keyframes drawerSlide {
    from { opacity: 0; transform: translateX(16px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* Footer */
  .drawer__footer {
    padding: 1rem 1.25rem;
    border-top: 1px solid #141414;
  }
  .drawer__auth-btns {
    display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;
  }
  .drawer__btn-ghost {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 13px;
    background: transparent; border: 1.5px solid #222; border-radius: 10px;
    color: #bbb; font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    text-decoration: none; transition: all .2s;
  }
  .drawer__btn-ghost:hover { border-color: #555; color: #fff; }
  .drawer__btn-ghost--full { width: 100%; }

  .drawer__btn-solid {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 13px;
    background: #fff; border: none; border-radius: 10px;
    color: #000; font-size: 14px; font-weight: 700;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    text-decoration: none; transition: all .2s;
  }
  .drawer__btn-solid:hover { background: #e8e8e8; }

  .drawer__location {
    display: flex; align-items: center; gap: 5px;
    justify-content: center; margin-top: 10px;
    color: #333; font-size: 11px; letter-spacing: 0.3px;
  }
  .drawer__location span { color: #333; }
`;