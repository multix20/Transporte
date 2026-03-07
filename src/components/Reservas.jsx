import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Configuración ─────────────────────────────────────────────────────────
const SUPABASE_URL = "https://pyloifgprupypgkhkqmx.supabase.co";
const SUPABASE_KEY = "sb_publishable_UN__-qAOLiEli5p9xY9ypQ_Qr9wxajL";
const WHATSAPP_NUMBER = "56951569704";
const MAX_PASAJEROS_VAN = 12;
const MIN_PASAJEROS_COMPARTIDO = 10;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const RUTAS = [
  { id: "pucon-aeropuerto",     label: "Pucón → Aeropuerto Temuco",     precio_persona: 15000, precio_van: 120000, emoji: "🏔️", duracion: "~1h 30min", km: "95 km" },
  { id: "aeropuerto-pucon",     label: "Aeropuerto Temuco → Pucón",     precio_persona: 15000, precio_van: 120000, emoji: "✈️", duracion: "~1h 30min", km: "95 km" },
  { id: "villarrica-aeropuerto",label: "Villarrica → Aeropuerto Temuco",precio_persona: 12000, precio_van: 100000, emoji: "🌋", duracion: "~1h 15min", km: "80 km" },
  { id: "aeropuerto-villarrica",label: "Aeropuerto Temuco → Villarrica",precio_persona: 12000, precio_van: 100000, emoji: "🏕️", duracion: "~1h 15min", km: "80 km" },
];

const TRUST_ITEMS = [
  { icon: "⭐", value: "4.9",    label: "Calificación" },
  { icon: "🚐", value: "+3.200", label: "Transfers" },
  { icon: "🔒", value: "100%",   label: "Pago seguro" },
  { icon: "📍", value: "Puntual",label: "Garantizado" },
];

const fmt    = (str) => { if (!str) return ""; const [y,m,d]=str.split("-"); return new Date(y,m-1,d).toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long",year:"numeric"}); };
const precio = (n)   => `$${Math.round(n).toLocaleString("es-CL")}`;
const total  = (ruta,tipo,pax) => !ruta ? 0 : tipo==="van_completa" ? ruta.precio_van : ruta.precio_persona*pax;

export default function Reservas() {
  const [paso,        setPaso]        = useState(1);
  const [rutaId,      setRutaId]      = useState(null);
  const [fecha,       setFecha]       = useState("");
  const [tipoReserva, setTipoReserva] = useState("compartido");
  const [modoPago,    setModoPago]    = useState("total");
  const [form,        setForm]        = useState({ nombre:"", telefono:"", pasajeros:1, direccion:"", notas:"" });
  const [enviando,    setEnviando]    = useState(false);
  const [error,       setError]       = useState("");
  const [terms,       setTerms]       = useState(false);

  const ruta       = RUTAS.find(r => r.id === rutaId);
  const montoTotal = total(ruta, tipoReserva, Number(form.pasajeros));
  const abono      = montoTotal * 0.5;
  const aPagar     = modoPago === "abono" ? abono : montoTotal;
  const hoy        = new Date().toISOString().split("T")[0];

  const handlePagar = async () => {
    if (!form.nombre || !form.telefono) { setError("Completa nombre y teléfono."); return false; }
    if (!terms) { setError("Debes aceptar los términos y condiciones."); return false; }
    setError(""); setEnviando(true);
    try {
      const { error: dbErr } = await supabase.from("reservas").insert([{
        nombre: form.nombre, telefono: form.telefono,
        ruta: ruta.label, fecha, vuelo_numero: "SIN_VUELO",
        pasajeros: Number(form.pasajeros), tipo_reserva: tipoReserva,
        estado: "pendiente_pago",
        notas: `${form.notas || ""} | Pago: ${modoPago==="abono"?"50% abono ("+precio(aPagar)+")":"Completo ("+precio(montoTotal)+")"}`.trim(),
      }]).select().single();
      if (dbErr) throw new Error("Error al guardar reserva");
      const msg = encodeURIComponent(
        `🚐 *Nueva Reserva - Araucanía Viajes*\n\n` +
        `👤 ${form.nombre}\n📱 ${form.telefono}\n` +
        `🗺️ ${ruta.label}\n📅 ${fecha}\n` +
        `👥 ${form.pasajeros} pax · ${tipoReserva==="van_completa"?"Van completa":"Compartido"}\n` +
        `💰 Total: ${precio(montoTotal)}\n` +
        `💳 Paga ahora: ${precio(aPagar)} (${modoPago==="abono"?"50% abono":"pago completo"})\n` +
        `📍 ${form.direccion||"—"}\n📝 ${form.notas||"—"}`
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
      setEnviando(false);
      return true;
    } catch (err) {
      setError(err.message || "Error al procesar. Intenta de nuevo.");
      setEnviando(false);
      return false;
    }
  };

  return (
    <section id="reservas" style={s.section}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing:border-box; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes wa-pulse { 0%{box-shadow:0 0 0 0 rgba(37,211,102,.35)} 70%{box-shadow:0 0 0 9px rgba(37,211,102,0)} 100%{box-shadow:0 0 0 0 rgba(37,211,102,0)} }

        .fade-up { animation:fadeUp .4s cubic-bezier(.4,0,.2,1) both; }

        /* Ruta cards */
        .rcard { transition:all .22s cubic-bezier(.4,0,.2,1); }
        .rcard:hover  { transform:translateY(-2px); border-color:#1a5c38!important; box-shadow:0 6px 18px rgba(26,92,56,.12); }
        .rcard.on     { border-color:#1a5c38!important; background:#f0f9f4!important; box-shadow:0 0 0 3px rgba(26,92,56,.1); }

        /* Tipo/pago chips */
        .gchip { transition:all .2s; }
        .gchip:hover { border-color:#1a5c38!important; }
        .gchip.on-green  { border-color:#1a5c38!important; background:#f0f9f4!important; box-shadow:0 0 0 3px rgba(26,92,56,.09); }
        .gchip.on-gold   { border-color:#a07c18!important; background:#fdf8ec!important; box-shadow:0 0 0 3px rgba(160,124,24,.1); }

        /* Button */
        .gbtn { background:linear-gradient(135deg,#1a5c38 0%,#0f3d25 50%,#1a5c38 100%); background-size:200% auto; transition:all .3s; font-family:'Outfit',sans-serif; }
        .gbtn:hover:not(:disabled) { background-position:right center; transform:translateY(-2px); box-shadow:0 14px 38px rgba(26,92,56,.3); }
        .gbtn:disabled { opacity:.35; cursor:not-allowed; }

        /* Inputs */
        .gin { background:#fff!important; border:1.5px solid #ddd8ce!important; color:#162112!important; font-family:'Outfit',sans-serif; transition:all .2s; }
        .gin::placeholder { color:#c0c8c0!important; }
        .gin:focus { border-color:#1a5c38!important; outline:none; box-shadow:0 0 0 3px rgba(26,92,56,.08); }

        .flow-btn {
          width:100%; display:flex; align-items:center; gap:1rem;
          padding:0.9rem 1.4rem;
          background: linear-gradient(135deg, #e8321e 0%, #c0240e 50%, #e8321e 100%);
          background-size: 200% auto;
          border:none; border-radius:0.85rem; cursor:pointer;
          color:#fff; font-family:'Outfit',sans-serif;
          transition: all 0.3s;
          box-shadow: 0 4px 18px rgba(232,50,30,0.3);
        }
        .flow-btn:hover:not(:disabled) {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(232,50,30,0.4);
        }
        .flow-btn:active:not(:disabled) { transform:translateY(0); }
        .flow-btn:disabled { opacity:0.4; cursor:not-allowed; }
        input[type=number]::-webkit-inner-spin-button { opacity:.4; }
        .wa-badge { animation:wa-pulse 2.5s infinite; }

        @media(max-width:580px){ .g2 { grid-template-columns:1fr!important; } }
      `}</style>

      <div style={s.wrap}>

        {/* ─── HEADER ─── */}
        <div style={s.hdr}>
          <div style={s.eyebrow}><span style={s.dot}/> ARAUCANÍA VIAJES · TRANSFER OFICIAL</div>
          <h2 style={s.titulo}>Reserva tu <em style={{ fontStyle:"italic", color:"#1a5c38" }}>Transfer</em></h2>
          <p style={s.sub}>Pucón · Villarrica · Aeropuerto Temuco ZCO</p>

          {/* Trust */}
          <div style={s.trustBar}>
            {TRUST_ITEMS.map(t => (
              <div key={t.label} style={s.trustItem}>
                <span style={{ fontSize:"1.35rem" }}>{t.icon}</span>
                <div>
                  <div style={s.trustVal}>{t.value}</div>
                  <div style={s.trustLbl}>{t.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Steps */}
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:"0.7rem" }}>
            {["Ruta & Fecha","Datos & Pago"].map((lbl,i) => (
              <React.Fragment key={i}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                  <div style={{ width:"1.9rem", height:"1.9rem", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.8rem", fontWeight:"700", transition:"all .3s",
                    background: paso>i+1?"#1a5c38":paso===i+1?"#1a5c38":"#e2ddd5",
                    color:      paso>=i+1?"#fff":"#9aab9a",
                    boxShadow:  paso===i+1?"0 0 0 4px rgba(26,92,56,.14)":"none",
                    transform:  paso===i+1?"scale(1.08)":"scale(1)",
                  }}>{paso>i+1?"✓":i+1}</div>
                  <span style={{ fontSize:"0.76rem", fontWeight:paso===i+1?"600":"400", color:paso===i+1?"#1a5c38":"#9aab9a", transition:"color .3s" }}>{lbl}</span>
                </div>
                {i<1 && <div style={{ width:"2.5rem", height:"1px", background:paso>1?"#1a5c38":"#e2ddd5", transition:"background .4s" }}/>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ─── CARD ─── */}
        <div style={s.card}>

          {/* ══ PASO 1 ══ */}
          {paso === 1 && (
            <div className="fade-up">
              <Tag>PASO 1 DE 2</Tag>
              <h3 style={s.h3}>¿Cuál es tu ruta?</h3>

              <div className="g2" style={s.g2}>
                {RUTAS.map(r => (
                  <button key={r.id} className={`rcard${rutaId===r.id?" on":""}`}
                    onClick={() => setRutaId(r.id)} style={s.rutaCard}>
                    <span style={{ fontSize:"1.75rem", lineHeight:1 }}>{r.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"0.85rem", fontWeight:"600", color:"#162112", lineHeight:1.35 }}>{r.label}</div>
                      <div style={{ display:"flex", gap:"0.45rem", marginTop:"0.38rem" }}>
                        <span style={s.chip}>🕐 {r.duracion}</span>
                        <span style={s.chip}>📏 {r.km}</span>
                      </div>
                      <div style={{ fontSize:"0.82rem", color:"#1a5c38", fontWeight:"700", marginTop:"0.38rem" }}>
                        Desde {precio(r.precio_persona)}/pax
                      </div>
                    </div>
                    <div style={{ ...s.radio, ...(rutaId===r.id?{borderColor:"#1a5c38"}:{}) }}>
                      {rutaId===r.id && <div style={s.radioDot}/>}
                    </div>
                  </button>
                ))}
              </div>

              {rutaId && (<>
                <div style={{ marginTop:"1.75rem" }} className="fade-up">
                  <Tag>TIPO DE SERVICIO</Tag>
                  <div className="g2" style={{ ...s.g2, gridTemplateColumns:"1fr 1fr", marginTop:"0.6rem" }}>
                    {[
                      { id:"compartido",   emoji:"👥", title:"Compartido",  desc:`Mín. ${MIN_PASAJEROS_COMPARTIDO} pax para confirmar`, p:`${precio(ruta?.precio_persona)}/persona`, badge:"ECONÓMICO", bc:"rgba(26,92,56,.1)",   tc:"#1a5c38" },
                      { id:"van_completa", emoji:"🚐", title:"Van Completa",desc:`Exclusivo hasta ${MAX_PASAJEROS_VAN} personas`,       p:`${precio(ruta?.precio_van)} total`,      badge:"EXCLUSIVO",  bc:"rgba(160,124,24,.1)", tc:"#a07c18" },
                    ].map(t => (
                      <button key={t.id} className={`gchip${tipoReserva===t.id?" on-green":""}`}
                        onClick={() => setTipoReserva(t.id)} style={s.gCard}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.5rem" }}>
                          <span style={{ fontSize:"1.45rem" }}>{t.emoji}</span>
                          <span style={{ fontSize:"0.57rem", fontWeight:"700", letterSpacing:"0.08em", padding:"0.18rem 0.48rem", borderRadius:"99px", background:t.bc, color:t.tc }}>{t.badge}</span>
                        </div>
                        <div style={{ fontWeight:"700", fontSize:"0.88rem", color:"#162112" }}>{t.title}</div>
                        <div style={{ fontSize:"0.72rem", color:"#8a9a8a", marginTop:"0.2rem", lineHeight:1.4 }}>{t.desc}</div>
                        <div style={{ fontSize:"0.84rem", color:"#1a5c38", fontWeight:"700", marginTop:"0.52rem" }}>{t.p}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop:"1.4rem" }} className="fade-up">
                  <label style={s.lbl}>Fecha de viaje</label>
                  <input type="date" min={hoy} value={fecha} onChange={e=>setFecha(e.target.value)} className="gin" style={s.inp}/>
                  {fecha && <p style={{ fontSize:"0.75rem", color:"#1a5c38", marginTop:"0.38rem" }}>📅 {fmt(fecha)}</p>}
                </div>
              </>)}

              <button className="gbtn" disabled={!rutaId||!fecha}
                style={{ ...s.btn, marginTop:"2rem", opacity:rutaId&&fecha?1:0.4 }}
                onClick={() => setPaso(2)}>
                Continuar con mis datos →
              </button>
              <div style={s.garantia}>🛡️ Sin cargo si el viaje compartido no se confirma</div>
            </div>
          )}

          {/* ══ PASO 2 ══ */}
          {paso === 2 && (
            <div className="fade-up">
              <button style={s.btnVolver} onClick={() => setPaso(1)}>← Volver</button>

              {/* ── RESUMEN ── */}
              <div style={s.resBox}>
                <div style={s.resHead}>
                  <span style={{ fontSize:"0.62rem", fontWeight:"700", letterSpacing:"0.1em", color:"#fff" }}>RESUMEN DE RESERVA</span>
                  <span style={{ fontSize:"0.72rem", color:"rgba(255,255,255,.65)" }}>{ruta?.emoji} {ruta?.label}</span>
                </div>
                <div style={s.resBody}>
                  {[
                    ["Fecha",    fmt(fecha)],
                    ["Servicio", tipoReserva==="van_completa"?"🚐 Van Completa":"👥 Compartido"],
                    ["Pax",      `${form.pasajeros} pasajero(s)`],
                  ].map(([k,v]) => (
                    <div key={k} style={s.resFila}>
                      <span style={s.resK}>{k}</span>
                      <span style={s.resV}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={s.resTotalRow}>
                  <span style={{ fontSize:"0.82rem", fontWeight:"600", color:"#4a5e4a" }}>Precio total del viaje</span>
                  <span style={{ fontSize:"1.55rem", fontWeight:"700", color:"#162112", fontFamily:"'Cormorant Garant',serif" }}>{precio(montoTotal)}</span>
                </div>
              </div>

              {/* ── MODO DE PAGO ── */}
              <div style={{ marginTop:"1.6rem" }}>
                <Tag>¿CÓMO QUIERES PAGAR?</Tag>
                <div className="g2" style={{ ...s.g2, gridTemplateColumns:"1fr 1fr", marginTop:"0.65rem" }}>

                  <div className={`gchip${modoPago==="total"?" on-green":""}`}
                    style={s.pagoCard} onClick={() => setModoPago("total")}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.5rem" }}>
                      <span style={{ fontSize:"1.4rem" }}>💳</span>
                      {modoPago==="total" && <span style={{ fontSize:"0.57rem", fontWeight:"700", background:"rgba(26,92,56,.1)", color:"#1a5c38", padding:"0.18rem 0.5rem", borderRadius:"99px", letterSpacing:"0.07em" }}>ELEGIDO</span>}
                    </div>
                    <div style={{ fontWeight:"700", fontSize:"0.88rem", color:"#162112" }}>Pago completo</div>
                    <div style={{ fontSize:"0.71rem", color:"#8a9a8a", marginTop:"0.2rem", lineHeight:1.4 }}>Reserva confirmada de inmediato</div>
                    <div style={{ fontSize:"1.05rem", fontWeight:"700", color:"#1a5c38", marginTop:"0.58rem" }}>{precio(montoTotal)}</div>
                  </div>

                  <div className={`gchip${modoPago==="abono"?" on-gold":""}`}
                    style={s.pagoCard} onClick={() => setModoPago("abono")}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.5rem" }}>
                      <span style={{ fontSize:"1.4rem" }}>🤝</span>
                      <span style={{ fontSize:"0.57rem", fontWeight:"700", background:"rgba(160,124,24,.12)", color:"#a07c18", padding:"0.18rem 0.5rem", borderRadius:"99px", letterSpacing:"0.07em" }}>POPULAR</span>
                    </div>
                    <div style={{ fontWeight:"700", fontSize:"0.88rem", color:"#162112" }}>50% de abono</div>
                    <div style={{ fontSize:"0.71rem", color:"#8a9a8a", marginTop:"0.2rem", lineHeight:1.4 }}>Resto al momento del viaje</div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:"0.4rem", marginTop:"0.58rem" }}>
                      <span style={{ fontSize:"1.05rem", fontWeight:"700", color:"#a07c18" }}>{precio(abono)}</span>
                      <span style={{ fontSize:"0.68rem", color:"#c0c8c0", textDecoration:"line-through" }}>{precio(montoTotal)}</span>
                    </div>
                    {modoPago==="abono" && (
                      <div style={{ fontSize:"0.68rem", color:"#a07c18", marginTop:"0.32rem", fontWeight:"600" }}>
                        Saldo: {precio(abono)} a pagar en el viaje
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── FORMULARIO ── */}
              <div style={{ marginTop:"1.75rem" }}>
                <Tag>DATOS DEL PASAJERO</Tag>
                <div className="g2" style={{ ...s.g2, marginTop:"0.65rem" }}>
                  <div>
                    <label style={s.lbl}>Nombre completo *</label>
                    <input className="gin" style={s.inp} placeholder="Juan Pérez"
                      value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/>
                  </div>
                  <div>
                    <label style={s.lbl}>Teléfono *</label>
                    <input className="gin" style={s.inp} placeholder="+56 9 1234 5678"
                      value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/>
                  </div>
                </div>
                <div className="g2" style={{ ...s.g2, marginTop:"1rem" }}>
                  <div>
                    <label style={s.lbl}>N° de pasajeros</label>
                    <input className="gin" style={s.inp} type="number" min="1"
                      max={tipoReserva==="van_completa"?MAX_PASAJEROS_VAN:MIN_PASAJEROS_COMPARTIDO}
                      value={form.pasajeros} onChange={e=>setForm({...form,pasajeros:e.target.value})}/>
                  </div>
                  <div>
                    <label style={s.lbl}>Dirección de recogida</label>
                    <input className="gin" style={s.inp} placeholder="Hotel o dirección..."
                      value={form.direccion} onChange={e=>setForm({...form,direccion:e.target.value})}/>
                  </div>
                </div>
                <div style={{ marginTop:"1rem" }}>
                  <label style={s.lbl}>Notas (opcional)</label>
                  <textarea className="gin" style={{ ...s.inp, height:"68px", resize:"vertical" }}
                    placeholder="Equipaje especial, silla bebé, mascotas..."
                    value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})}/>
                </div>
              </div>

              {/* Terms */}
              <label style={{ display:"flex", alignItems:"flex-start", gap:"0.7rem", marginTop:"1.25rem", cursor:"pointer" }}>
                <input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}
                  style={{ accentColor:"#1a5c38", width:"16px", height:"16px", flexShrink:0, marginTop:"2px" }}/>
                <span style={{ fontSize:"0.75rem", color:"#6b7c6b", lineHeight:1.55 }}>
                  Acepto los <span style={{ color:"#1a5c38", textDecoration:"underline" }}>términos y condiciones</span>.
                  {" "}Viaje compartido se confirma 24h antes con {MIN_PASAJEROS_COMPARTIDO} pax mínimos. Sin cobro si no se completa.
                  {modoPago==="abono" && " El saldo restante (50%) se abona al momento del viaje."}
                </span>
              </label>

              {error && <div style={s.errBox}><span>⚠️</span> {error}</div>}

              {/* Métodos de pago */}
              <div style={s.payRow}>
                <span style={{ fontSize:"0.68rem", color:"#9aab9a" }}>Pago seguro con</span>
                <div style={{ display:"flex", gap:"0.38rem", flexWrap:"wrap" }}>
                  {["💳 Crédito","💳 Débito","🏦 Transferencia","🔴 RedCompra"].map(c => (
                    <span key={c} style={s.payChip}>{c}</span>
                  ))}
                </div>
              </div>

              {/* Flow payment button */}
              <div style={{ marginTop:"1.25rem" }}>
                <button
                  className="flow-btn"
                  disabled={enviando}
                  style={s.flowBtn}
                  onClick={async () => {
                    const ok = await handlePagar();
                    if (ok) window.open("https://www.flow.cl/btn.php?token=o6f0a50ad75e315233752a57fb02bdba9453e509", "_blank");
                  }}
                >
                  {enviando ? (
                    <span>⏳ Procesando...</span>
                  ) : (
                    <>
                      {/* Flow logo SVG */}
                      <svg width="52" height="22" viewBox="0 0 120 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink:0 }}>
                        <path d="M0 23C0 10.297 10.297 0 23 0h74c12.703 0 23 10.297 23 23s-10.297 23-23 23H23C10.297 46 0 35.703 0 23z" fill="white" fillOpacity="0.15"/>
                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="800" fontFamily="Arial,sans-serif" letterSpacing="-0.5">flow</text>
                      </svg>
                      <div style={{ width:"1px", height:"28px", background:"rgba(255,255,255,0.25)" }}/>
                      <div style={{ textAlign:"left" }}>
                        <div style={{ fontSize:"0.7rem", opacity:0.75, lineHeight:1.1 }}>Pagar ahora</div>
                        <div style={{ fontSize:"1rem", fontWeight:"800", lineHeight:1.2 }}>{precio(aPagar)}</div>
                      </div>
                      {modoPago==="abono" && (
                        <span style={{ marginLeft:"auto", fontSize:"0.63rem", background:"rgba(255,255,255,0.18)", padding:"0.18rem 0.55rem", borderRadius:"99px", fontWeight:"700" }}>
                          50% abono
                        </span>
                      )}
                    </>
                  )}
                </button>
                <p style={{ textAlign:"center", fontSize:"0.67rem", color:"#9aab9a", marginTop:"0.55rem" }}>
                  🔒 Pago 100% seguro · Procesado por Flow.cl · SSL
                </p>
              </div>

              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", justifyContent:"center", marginTop:"1.2rem", textDecoration:"none" }}>
                <span className="wa-badge" style={s.waBadge}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  ¿Dudas? Escríbenos al WhatsApp
                </span>
              </a>
            </div>
          )}
        </div>

        <p style={{ textAlign:"center", fontSize:"0.7rem", color:"#9aab9a", marginTop:"2rem", letterSpacing:"0.03em" }}>
          🌿 Araucanía Viajes · +3.200 transfers realizados en la región desde Temuco
        </p>
      </div>
    </section>
  );
}

// ─── Tiny helper ──────────────────────────────────────────────────────────────
const Tag = ({ children }) => (
  <span style={{ display:"inline-block", fontSize:"0.6rem", fontWeight:"700", letterSpacing:"0.12em",
    color:"#1a5c38", background:"rgba(26,92,56,.07)", borderRadius:"99px",
    padding:"0.2rem 0.7rem", marginBottom:"0.7rem" }}>
    {children}
  </span>
);

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = {
  section: {
    position:"relative", padding:"5rem 1rem 4rem",
    background:"linear-gradient(155deg,#f7f3ec 0%,#eef5ef 55%,#f4f0e8 100%)",
    fontFamily:"'Outfit',sans-serif", overflow:"hidden",
  },
  wrap: { position:"relative", maxWidth:"780px", margin:"0 auto" },
  hdr:  { textAlign:"center", marginBottom:"2.5rem" },

  eyebrow: {
    display:"inline-flex", alignItems:"center", gap:"0.45rem",
    fontSize:"0.63rem", fontWeight:"700", letterSpacing:"0.12em",
    color:"#1a5c38", background:"rgba(26,92,56,.07)",
    border:"1px solid rgba(26,92,56,.15)", padding:"0.3rem 0.95rem",
    borderRadius:"99px", marginBottom:"1rem",
  },
  dot: {
    display:"inline-block", width:"5px", height:"5px",
    borderRadius:"50%", background:"#1a5c38", boxShadow:"0 0 5px rgba(26,92,56,.5)",
  },
  titulo: {
    fontSize:"clamp(1.85rem,5vw,2.9rem)", fontWeight:"700",
    color:"#162112", fontFamily:"'Cormorant Garant',serif",
    marginBottom:"0.4rem", lineHeight:"1.15", letterSpacing:"-0.01em",
  },
  sub: { color:"#6b7c6b", fontSize:"0.92rem", marginBottom:"1.7rem", letterSpacing:"0.04em" },

  trustBar: {
    display:"flex", justifyContent:"center", gap:"1.25rem", flexWrap:"wrap",
    marginBottom:"2rem", padding:"1rem 1.4rem",
    background:"#fff", border:"1px solid #e5dfd4", borderRadius:"1rem",
    boxShadow:"0 2px 10px rgba(22,33,18,.05)",
  },
  trustItem: { display:"flex", alignItems:"center", gap:"0.5rem" },
  trustVal:  { fontWeight:"700", fontSize:"0.95rem", color:"#162112", lineHeight:"1.1" },
  trustLbl:  { fontSize:"0.66rem", color:"#8a9a8a", letterSpacing:"0.03em" },

  // ─── Card principal ───────────────────────────────────────────────────────
  card: {
    background:"#ffffff",
    border:"1px solid #e2dcd2",
    borderRadius:"2rem",
    padding:"clamp(1.5rem,5vw,2.75rem)",
    boxShadow:
      "0 1px 0 rgba(255,255,255,.9) inset," +
      "0 4px 6px rgba(22,33,18,.03)," +
      "0 12px 40px rgba(22,33,18,.07)," +
      "0 40px 80px rgba(22,33,18,.04)",
  },

  h3: {
    fontSize:"1.45rem", fontWeight:"700", color:"#162112",
    fontFamily:"'Cormorant Garant',serif", marginBottom:"1.2rem", lineHeight:"1.2",
  },
  g2: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:"0.78rem" },

  rutaCard: {
    display:"flex", gap:"0.78rem", alignItems:"flex-start",
    padding:"1.05rem", border:"1.5px solid #e2dcd2", borderRadius:"1.1rem",
    cursor:"pointer", background:"#faf7f2", textAlign:"left", color:"inherit", width:"100%",
  },
  chip: {
    fontSize:"0.67rem", color:"#8a9a8a", background:"#ede9e0",
    padding:"0.12rem 0.48rem", borderRadius:"99px",
  },
  radio: {
    width:"17px", height:"17px", borderRadius:"50%", border:"2px solid #cec8be",
    display:"flex", alignItems:"center", justifyContent:"center",
    flexShrink:0, marginTop:"2px", transition:"border .2s",
  },
  radioDot: { width:"7px", height:"7px", borderRadius:"50%", background:"#1a5c38" },

  gCard: {
    padding:"1.05rem", border:"1.5px solid #e2dcd2", borderRadius:"1.1rem",
    cursor:"pointer", background:"#faf7f2", textAlign:"left", color:"inherit", width:"100%",
  },
  pagoCard: {
    padding:"1.05rem", border:"2px solid #e2dcd2", borderRadius:"1.1rem",
    background:"#faf7f2", textAlign:"left", color:"inherit", width:"100%", cursor:"pointer",
  },

  lbl: { display:"block", fontSize:"0.74rem", fontWeight:"600", color:"#4a5e4a", marginBottom:"0.38rem", letterSpacing:"0.03em" },
  inp: { width:"100%", padding:"0.76rem 0.95rem", borderRadius:"0.72rem", fontSize:"0.91rem", boxSizing:"border-box", fontFamily:"'Outfit',sans-serif" },

  // Resumen
  resBox: { border:"1.5px solid #c8ddd0", borderRadius:"1.25rem", overflow:"hidden" },
  resHead: {
    background:"linear-gradient(135deg,#1a5c38,#0f3d25)",
    padding:"0.72rem 1.2rem",
    display:"flex", alignItems:"center", justifyContent:"space-between",
  },
  resBody: { padding:"0.9rem 1.2rem 0.7rem", display:"flex", flexDirection:"column", gap:"0.38rem" },
  resFila: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem" },
  resK:    { fontSize:"0.76rem", color:"#6b7c6b", flexShrink:0 },
  resV:    { fontSize:"0.78rem", color:"#162112", fontWeight:"500", textAlign:"right" },
  resTotalRow: {
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"0.8rem 1.2rem", background:"#f0f9f4", borderTop:"1.5px solid #c8ddd0",
  },

  flowBtn: { /* defined via CSS class .flow-btn */ },
  btn: { width:"100%", padding:"0.95rem 1.4rem", color:"#fff", border:"none", borderRadius:"0.85rem", fontSize:"0.95rem", fontWeight:"700", cursor:"pointer", letterSpacing:"0.015em" },
  btnVolver: { background:"none", border:"none", color:"#9aab9a", cursor:"pointer", fontSize:"0.82rem", marginBottom:"1.2rem", padding:0, fontFamily:"'Outfit',sans-serif" },

  garantia: {
    textAlign:"center", fontSize:"0.72rem", color:"#8a9a8a", marginTop:"0.85rem",
    padding:"0.5rem 0.7rem", background:"#f5f1ea", borderRadius:"0.55rem", border:"1px solid #e5dfd4",
  },

  errBox: {
    padding:"0.82rem 0.95rem", background:"#fef2f2", border:"1px solid #fecaca",
    borderRadius:"0.72rem", color:"#dc2626", fontSize:"0.83rem",
    marginTop:"0.95rem", display:"flex", gap:"0.5rem", alignItems:"center",
  },

  payRow: {
    display:"flex", alignItems:"center", gap:"0.65rem", flexWrap:"wrap",
    paddingTop:"0.95rem", marginTop:"0.95rem", borderTop:"1px solid #ede9e0",
  },
  payChip: {
    fontSize:"0.67rem", padding:"0.18rem 0.52rem", background:"#f5f1ea",
    border:"1px solid #e5dfd4", borderRadius:"99px", color:"#4a5e4a", fontWeight:"500",
  },

  waBadge: {
    display:"flex", alignItems:"center", gap:"0.48rem",
    fontSize:"0.76rem", color:"#2d7a4a",
    background:"rgba(37,211,102,.07)", border:"1px solid rgba(37,211,102,.2)",
    padding:"0.45rem 0.95rem", borderRadius:"99px",
  },
};