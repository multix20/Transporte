import React, { useState, useEffect, useRef } from "react";
import supabase from "../lib/supabase";

const WHATSAPP_NUMBER    = "56951569704";
const MAX_PAX_VAN        = 8;
const PAX_COMPARTIDO     = 10;
const MARGEN_COMP        = 1.25;
const RECARGO_IDA_VUELTA = 1.5;

const PRECIO_VAN_BASE = 40000;
const PRECIO_KM_VAN   = 1000;
const PRECIO_MIN_VAN  = 40000;

const paxDesdeVan = (precioVan) =>
  Math.round((precioVan * MARGEN_COMP) / PAX_COMPARTIDO / 500) * 500;

const aplicarRecargo = (monto, esIdaVuelta) =>
  esIdaVuelta ? Math.round(monto * RECARGO_IDA_VUELTA) : monto;

const HORAS_BASE = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2,"0")}:00`);

// ── Hook: sesión y perfil ─────────────────────────────────────────────────────
function useUsuario() {
  const [usuario,  setUsuario]  = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) cargarPerfil(session.user);
      else setCargando(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) cargarPerfil(session.user);
      else { setUsuario(null); setCargando(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const cargarPerfil = (authUser) => {
    const emailAuth = authUser.email || "";
    const meta      = authUser.user_metadata || {};
    let nombre   = meta.full_name || meta.name || emailAuth.split("@")[0];
    let telefono = meta.phone || "";
    if (telefono && !telefono.startsWith("+")) telefono = "+56 " + telefono.trim();
    const iniciales = nombre.split(" ").filter(Boolean).map(p => p[0]).join("").toUpperCase().slice(0,2);
    setUsuario({ nombre, email: emailAuth, telefono, avatar: iniciales });
    setCargando(false);
  };

  return { usuario, cargando };
}

// ── Hook: historial de direcciones ───────────────────────────────────────────
const ADDR_KEY = "llevu_addr_history";
const MAX_ADDR = 6;

function useAddressHistory() {
  const [historial, setHistorial] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ADDR_KEY) || "[]"); }
    catch { return []; }
  });
  const guardar = (lugar) => {
    if (!lugar?.label || lugar.id) return;
    setHistorial(prev => {
      const sin  = prev.filter(h => h.label.toLowerCase() !== lugar.label.toLowerCase());
      const nuevo = [{ ...lugar, count:1, ts:Date.now() }, ...sin].slice(0, MAX_ADDR);
      try { localStorage.setItem(ADDR_KEY, JSON.stringify(nuevo)); } catch {}
      return nuevo;
    });
  };
  const eliminar = (label) => {
    setHistorial(prev => {
      const nuevo = prev.filter(h => h.label !== label);
      try { localStorage.setItem(ADDR_KEY, JSON.stringify(nuevo)); } catch {}
      return nuevo;
    });
  };
  return { historial, guardar, eliminar };
}

const fmt    = (str) => { if (!str) return ""; const [y,m,d]=str.split("-"); return new Date(y,m-1,d).toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"}); };
const precio = (n)   => `$${Math.round(n).toLocaleString("es-CL")}`;
const hoy    = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

// ── Iconos SVG ────────────────────────────────────────────────────────────────
const IcoChevron = ({ dir="right", c="#9a9080", size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: dir==="left"?"rotate(180deg)":dir==="down"?"rotate(90deg)":"none" }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IcoCheck = ({ size=18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcoWA = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const IcoCal = ({ size=15, c="#9a9080" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4 M8 2v4 M3 10h18"/>
  </svg>
);

// ── Tarifas ───────────────────────────────────────────────────────────────────
const ZONAS = [
  { id:"aeropuerto", lat:-38.9258, lng:-72.6372, radio:8  },
  { id:"temuco",     lat:-38.7359, lng:-72.5904, radio:12 },
  { id:"pucon",      lat:-39.2724, lng:-71.9766, radio:10 },
  { id:"villarrica", lat:-39.2833, lng:-72.2333, radio:10 },
  { id:"freire",     lat:-38.9583, lng:-72.6333, radio:8  },
  { id:"gorbea",     lat:-39.0950, lng:-72.6783, radio:8  },
  { id:"victoria",   lat:-38.2317, lng:-72.3317, radio:8  },
  { id:"loncoche",   lat:-39.3667, lng:-72.6333, radio:8  },
  { id:"pitrufquen", lat:-38.9833, lng:-72.6500, radio:8  },
];
const TARIFAS_FIJAS = {
  "temuco-aeropuerto":     { van:40000, persona:paxDesdeVan(40000) },
  "aeropuerto-temuco":     { van:40000, persona:paxDesdeVan(40000) },
  "aeropuerto-pucon":      { van:95000, persona:paxDesdeVan(95000) },
  "pucon-aeropuerto":      { van:95000, persona:paxDesdeVan(95000) },
  "aeropuerto-villarrica": { van:80000, persona:paxDesdeVan(80000) },
  "villarrica-aeropuerto": { van:80000, persona:paxDesdeVan(80000) },
  "pucon-villarrica":      { van:40000, persona:paxDesdeVan(40000) },
  "villarrica-pucon":      { van:40000, persona:paxDesdeVan(40000) },
  "temuco-pucon":          { van:95000, persona:paxDesdeVan(95000) },
  "pucon-temuco":          { van:95000, persona:paxDesdeVan(95000) },
  "temuco-villarrica":     { van:80000, persona:paxDesdeVan(80000) },
  "villarrica-temuco":     { van:80000, persona:paxDesdeVan(80000) },
  "temuco-freire":         { van:45000, persona:paxDesdeVan(45000) },
  "freire-temuco":         { van:45000, persona:paxDesdeVan(45000) },
  "aeropuerto-freire":     { van:50000, persona:paxDesdeVan(50000) },
  "freire-aeropuerto":     { van:50000, persona:paxDesdeVan(50000) },
  "temuco-gorbea":         { van:60000, persona:paxDesdeVan(60000) },
  "gorbea-temuco":         { van:60000, persona:paxDesdeVan(60000) },
  "aeropuerto-gorbea":     { van:65000, persona:paxDesdeVan(65000) },
  "gorbea-aeropuerto":     { van:65000, persona:paxDesdeVan(65000) },
  "temuco-victoria":       { van:90000, persona:paxDesdeVan(90000) },
  "victoria-temuco":       { van:90000, persona:paxDesdeVan(90000) },
  "aeropuerto-victoria":   { van:95000, persona:paxDesdeVan(95000) },
  "victoria-aeropuerto":   { van:95000, persona:paxDesdeVan(95000) },
  "temuco-loncoche":       { van:70000, persona:paxDesdeVan(70000) },
  "loncoche-temuco":       { van:70000, persona:paxDesdeVan(70000) },
  "aeropuerto-loncoche":   { van:75000, persona:paxDesdeVan(75000) },
  "loncoche-aeropuerto":   { van:75000, persona:paxDesdeVan(75000) },
  "temuco-pitrufquen":     { van:40000, persona:paxDesdeVan(40000) },
  "pitrufquen-temuco":     { van:40000, persona:paxDesdeVan(40000) },
  "aeropuerto-panguipulli": { van:110000, persona:paxDesdeVan(110000) },
  "panguipulli-aeropuerto": { van:110000, persona:paxDesdeVan(110000) },
  "aeropuerto-valdivia":    { van:140000, persona:paxDesdeVan(140000) },
  "valdivia-aeropuerto":    { van:140000, persona:paxDesdeVan(140000) },
  "temuco-panguipulli":     { van:110000, persona:paxDesdeVan(110000) },
  "panguipulli-temuco":     { van:110000, persona:paxDesdeVan(110000) },
  "temuco-valdivia":        { van:140000, persona:paxDesdeVan(140000) },
  "valdivia-temuco":        { van:140000, persona:paxDesdeVan(140000) },
  "pucon-panguipulli":      { van:50000,  persona:paxDesdeVan(50000)  },
  "panguipulli-pucon":      { van:50000,  persona:paxDesdeVan(50000)  },
  "aeropuerto-pitrufquen": { van:42000, persona:paxDesdeVan(42000) },
  "pitrufquen-aeropuerto": { van:42000, persona:paxDesdeVan(42000) },
};

function detectarZona(lat, lng) {
  const R = 6371;
  for (const z of ZONAS) {
    const dLat = (lat-z.lat)*Math.PI/180, dLng = (lng-z.lng)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(z.lat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLng/2)**2;
    if (R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)) <= z.radio) return z.id;
  }
  return null;
}

function calcularTarifas(distanciaMetros, origenObj, destinoObj) {
  const km = Math.round(distanciaMetros/1000);
  const idO = origenObj?.id, idD = destinoObj?.id;
  if (idO && idD && TARIFAS_FIJAS[`${idO}-${idD}`]) {
    const f = TARIFAS_FIJAS[`${idO}-${idD}`];
    return { persona:f.persona, van:f.van, km:`${km} km` };
  }
  const zonaO = idO || detectarZona(origenObj?.lat,origenObj?.lng);
  const zonaD = idD || detectarZona(destinoObj?.lat,destinoObj?.lng);
  const key   = zonaO && zonaD ? `${zonaO}-${zonaD}` : null;
  if (key && TARIFAS_FIJAS[key]) {
    const f = TARIFAS_FIJAS[key];
    return { persona:f.persona, van:f.van, km:`${km} km` };
  }
  const van = km<=40 ? PRECIO_VAN_BASE : Math.max(PRECIO_MIN_VAN, Math.round(km*PRECIO_KM_VAN/1000)*1000);
  return { persona:paxDesdeVan(van), van, km:`${km} km` };
}

async function buscarDirecciones(query) {
  if (!query || query.length<3) return [];
  try {
    const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query+", Chile")}&format=json&limit=5&countrycodes=cl&addressdetails=1`,{headers:{"Accept-Language":"es"}});
    const data = await res.json();
    return data.map(r => ({ label:r.display_name.split(",").slice(0,3).join(",").trim(), sub:r.display_name.split(",").slice(3,5).join(",").trim(), lat:parseFloat(r.lat), lng:parseFloat(r.lon) }));
  } catch { return []; }
}

async function obtenerDistancia(origen, destino) {
  try {
    const res  = await fetch(`https://router.project-osrm.org/route/v1/driving/${origen.lng},${origen.lat};${destino.lng},${destino.lat}?overview=false`);
    const data = await res.json();
    if (data.code==="Ok") return data.routes[0].distance;
  } catch {}
  const R=6371000, dLat=(destino.lat-origen.lat)*Math.PI/180, dLng=(destino.lng-origen.lng)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(origen.lat*Math.PI/180)*Math.cos(destino.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))*1.28);
}

const PUNTOS_FRECUENTES = [
  { id:"aeropuerto", label:"Temuco ZCO", sub:"Aeropuerto Araucanía · La Araucanía", lat:-38.9258, lng:-72.6372 },
  { id:"pucon",      label:"Pucón",                 sub:"Pucón, La Araucanía",               lat:-39.2724, lng:-71.9766 },
  { id:"villarrica", label:"Villarrica",             sub:"Villarrica, La Araucanía",          lat:-39.2833, lng:-72.2333 },
  { id:"panguipulli",label:"Panguipulli",            sub:"Panguipulli, Los Ríos",             lat:-39.6417, lng:-72.3333 },
  { id:"valdivia",   label:"Valdivia",               sub:"Valdivia, Los Ríos",                lat:-39.8142, lng:-73.2459 },
  { id:"victoria",   label:"Victoria",               sub:"Victoria, La Araucanía",            lat:-38.2317, lng:-72.3317 },
];

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════
export default function Reservas() {
  const { usuario } = useUsuario();
  const { historial, guardar, eliminar }    = useAddressHistory();

  const [pantalla,  setPantalla]  = useState("inicio");
  const [origen,    setOrigen]    = useState(null);
  const [destino,   setDestino]   = useState(null);

  const origenId  = origen?.id  || "custom";
  const destinoId = destino?.id || "custom";

  const [fechaVan,     setFechaVan]     = useState("");
  const [horaVan,      setHoraVan]      = useState("");
  const [tipoRuta,     setTipoRuta]     = useState("ida");
  const [fechaRegreso, setFechaRegreso] = useState("");
  const [horaRegreso,  setHoraRegreso]  = useState("");
  const [pasajeros,    setPasajeros]    = useState(1);
  const [error,        setError]        = useState("");
  const [calculando,   setCalculando]   = useState(false);
  const [rutaDataDyn,  setRutaDataDyn]  = useState(null);

  // ── Bloqueos desde Supabase ───────────────────────────────────────────────
  const [bloqueos, setBloqueos] = useState([]);

  useEffect(() => {
    supabase.from("bloqueos").select("*").then(({ data }) => setBloqueos(data || []));
  }, []);

  useEffect(() => {
    if (fechaVan || fechaRegreso) {
      supabase.from("bloqueos").select("*").then(({ data }) => setBloqueos(data || []));
    }
  }, [fechaVan, fechaRegreso]);

  const esBloqueadoPorTipo = (fechaStr, tipo) => {
    if (!fechaStr) return false;
    const f = new Date(fechaStr + "T12:00:00");
    return bloqueos.some(b => {
      const afecta = b.aplica_a === "ambos" || b.aplica_a === tipo;
      if (!afecta) return false;
      if (b.tipo === "dia") return b.fecha === fechaStr;
      if (b.tipo === "mes") return b.mes === f.getMonth()+1 && b.anio === f.getFullYear();
      return false;
    });
  };

  // Único servicio disponible: van privada
  const fecha = fechaVan;
  const hora  = horaVan;

  const sinCupoPrivado = esBloqueadoPorTipo(fechaVan, "privado");
  const sinCupoRegreso = esBloqueadoPorTipo(fechaRegreso, "privado");

  const topRef = useRef(null);

  useEffect(() => { setRutaDataDyn(null); }, [origen, destino]);
  useEffect(() => { if (tipoRuta === "ida") { setFechaRegreso(""); setHoraRegreso(""); } }, [tipoRuta]);

  const esIdaVuelta = tipoRuta === "ida_vuelta";

  const rutaKey   = origen?.id && destino?.id ? `${origen.id}-${destino.id}` : null;
  const rutaData  = rutaDataDyn;
  const rutaLabel = origen && destino
    ? `${origen.label} → ${destino.label}`
    : "";

  const precioBaseVan = rutaData?.van || 0;
  const precioVan     = aplicarRecargo(precioBaseVan, esIdaVuelta);

  const montoTotal = rutaData ? precioVan : 0;

  const scroll = () => setTimeout(() => topRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 40);
  const ir     = (p) => { setPantalla(p); scroll(); };

  useEffect(() => {
    if (origen && destino) verTarifas();
  }, [origen, destino]); // eslint-disable-line

  const verTarifas = async () => {
    if (!origen || !destino) return;
    setCalculando(true); setError("");
    try {
      guardar(origen); guardar(destino);
      const metros  = await obtenerDistancia(origen, destino);
      const tarifas = calcularTarifas(metros, origen, destino);
      setRutaDataDyn({ ...tarifas, duracion:`~${Math.round(metros/1000/60)} min` });
    } catch {
      setError("No se pudo calcular la ruta.");
    } finally {
      setCalculando(false);
    }
  };

  // ── Reservar: se cierra por WhatsApp, sin pago online ─────────────────────
  const mensajeWhatsApp = () => {
    const linea = (f, h) => `${fmt(f)}${h ? ` · ${h}` : " · hora a coordinar"}`;
    const quien = usuario
      ? `👤 *${usuario.nombre}*${usuario.telefono ? ` · ${usuario.telefono}` : ""}\n`
      : "";
    return encodeURIComponent(
      `🚐 *Reserva Van Privada — Araucanía Viajes*\n\n` +
      quien +
      `🗺️ ${rutaLabel}\n` +
      `📅 Ida: ${linea(fechaVan, horaVan)}\n` +
      (esIdaVuelta ? `↩️ Regreso: ${linea(fechaRegreso, horaRegreso)}\n` : "") +
      `👥 ${pasajeros} ${pasajeros === 1 ? "pasajero" : "pasajeros"}\n` +
      `🎫 ${esIdaVuelta ? "Ida y vuelta" : "Solo ida"}\n` +
      (rutaData ? `💰 Valor referencial: ${precio(montoTotal)}\n` : "") +
      `\n¿Me confirmas disponibilidad y horario?`
    );
  };

  const abrirWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensajeWhatsApp()}`, "_blank");
  };

  const reservar = () => {
    setError("");
    if (!origen || !destino)  { setError("Elige origen y destino."); return; }
    if (!fechaVan)            { setError("Elige la fecha de ida."); return; }
    if (sinCupoPrivado)       { setError("La Van Privada no está disponible en esa fecha."); return; }
    if (esIdaVuelta && !fechaRegreso) { setError("Elige la fecha de regreso."); return; }
    if (sinCupoRegreso)       { setError("La fecha de regreso no está disponible."); return; }
    abrirWhatsApp();
    ir("ok");
  };

  const reset = () => {
    setPantalla("inicio"); setOrigen(null); setDestino(null);
    setFechaVan(""); setHoraVan(""); setPasajeros(1);
    setTipoRuta("ida"); setFechaRegreso(""); setHoraRegreso("");
    setError(""); scroll();
  };

  // ════════════════════════════════════════════════════════════════════════════
  // PANTALLA: OK — la venta se cierra por WhatsApp
  // ════════════════════════════════════════════════════════════════════════════
  if (pantalla === "ok") return (
    <div ref={topRef} style={S.root}>
      <style>{css}</style>
      <div style={S.okWrap} className="fade-in">

        {/* Header compacto */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, marginBottom:16 }}>
          <div style={{ width:50, height:50, borderRadius:"50%", background:"#16a34a", boxShadow:"0 6px 20px rgba(22,163,74,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <IcoCheck size={24}/>
          </div>
          <div style={{ textAlign:"center" }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.2rem,5vw,1.45rem)", fontWeight:800, color:"#1a1611", marginBottom:2 }}>
              ¡Solicitud enviada!
            </h2>
            <p style={{ fontSize:"0.76rem", color:"#9a9080", lineHeight:1.4 }}>
              Te confirmamos disponibilidad y horario por WhatsApp
            </p>
          </div>
        </div>

        {/* Card compacta */}
        <div style={{ background:"#EDE5D0", border:"1px solid #D4CBB8", borderRadius:16, width:"100%", marginBottom:12, overflow:"hidden" }}>

          {/* Ruta — fila horizontal con subetiquetas */}
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", borderBottom:"1px solid #D4CBB8", background:"#E8E0D0" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:"0.82rem", fontWeight:700, color:"#1a1611", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {origen?.label || ""}
              </div>
              {(origen?.id === "aeropuerto" || (origen?.label || "").toLowerCase().includes("zco")) && (
                <div style={{ fontSize:"0.68rem", color:"#9a9080", marginTop:1 }}>Aeropuerto de Temuco</div>
              )}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a9080" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <div style={{ flex:1, minWidth:0, textAlign:"right" }}>
              <div style={{ fontSize:"0.82rem", fontWeight:700, color:"#1a1611", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {destino?.label || ""}
              </div>
              {(destino?.id === "aeropuerto" || (destino?.label || "").toLowerCase().includes("zco")) && (
                <div style={{ fontSize:"0.68rem", color:"#9a9080", marginTop:1 }}>Aeropuerto de Temuco</div>
              )}
            </div>
          </div>

          {/* Grilla */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
            <div style={{ padding:"10px 16px", borderBottom:"1px solid #D4CBB8", borderRight:"1px solid #D4CBB8" }}>
              <div style={{ fontSize:"0.62rem", color:"#9a9080", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:3 }}>Ida</div>
              <div style={{ fontSize:"0.8rem", fontWeight:700, color:"#1a1611" }}>{fmt(fechaVan)}</div>
              <div style={{ fontSize:"0.78rem", fontWeight:600, color:"#6b5e4e", marginTop:1 }}>{horaVan || "Hora a coordinar"}</div>
            </div>
            <div style={{ padding:"10px 16px", borderBottom:"1px solid #D4CBB8" }}>
              <div style={{ fontSize:"0.62rem", color:"#9a9080", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:3 }}>
                {esIdaVuelta ? "Regreso" : "Servicio"}
              </div>
              {esIdaVuelta ? (<>
                <div style={{ fontSize:"0.8rem", fontWeight:700, color:"#1a1611" }}>{fmt(fechaRegreso)}</div>
                <div style={{ fontSize:"0.78rem", fontWeight:600, color:"#6b5e4e", marginTop:1 }}>{horaRegreso || "Hora a coordinar"}</div>
              </>) : (<>
                <div style={{ fontSize:"0.8rem", fontWeight:700, color:"#1a1611" }}>Van privada</div>
                <div style={{ fontSize:"0.7rem", color:"#6b5e4e", marginTop:3 }}>Exclusivo · {pasajeros} pax</div>
              </>)}
            </div>

            {/* Total referencial */}
            <div style={{ gridColumn:"1/-1", padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:"0.62rem", color:"#9a9080", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:2 }}>
                  Valor referencial
                </div>
                <div style={{ fontSize:"0.68rem", color:"#16a34a", fontWeight:600 }}>✓ Sin pago online</div>
              </div>
              <span style={{ fontSize:"1.45rem", fontWeight:800, color:"#1a1611", letterSpacing:"-0.02em" }}>
                {precio(montoTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* CTA WhatsApp */}
        <button className="btn-wa" onClick={abrirWhatsApp} style={{ marginBottom:6 }}>
          <IcoWA/> Abrir WhatsApp de nuevo
        </button>
        <p style={{ fontSize:"0.68rem", color:"#9a9080", textAlign:"center", marginBottom:10, lineHeight:1.4 }}>
          ¿No se abrió el chat? Toca aquí para reenviar los detalles
        </p>

        <button className="btn-ghost" onClick={reset} style={{ width:"100%", padding:"12px" }}>Nueva reserva</button>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // PANTALLA: INICIO
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div ref={topRef} style={S.root}>
      <style>{css}</style>
      <div style={S.wrap}>

        {/* ── Saludo ── */}
        <div style={S.saludoRow} className="fade-in">
          <div style={{ flex:1, minWidth:0 }}>
            <p style={S.saludoSub}>{usuario ? `Hola, ${usuario.nombre.split(" ")[0]} 👋` : "¿A dónde viajas?"}</p>
            <FrasesRotativas />
            <h2 style={S.saludoTitle}>¿A dónde<br/>vamos hoy?</h2>
          </div>
          {usuario && <div style={S.avatar}>{usuario.avatar}</div>}
        </div>

        {/* ── Inputs de lugar ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, position:"relative", zIndex:50 }} className="fade-in">
          <LugarInput
            placeholder="Punto de partida"
            value={origen}
            onChange={val => { setOrigen(val); setDestino(null); }}
            dotStyle="origen"
            historial={historial}
            onEliminarHistorial={eliminar}
          />
          <div style={S.arrowSep}>
            <button
              style={S.swapBtn}
              onClick={() => { const tmp=origen; setOrigen(destino); setDestino(tmp); }}
              disabled={!origen && !destino}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
            </button>
          </div>
          <LugarInput
            placeholder="¿A dónde vas?"
            value={destino}
            onChange={setDestino}
            dotStyle="destino"
            disabled={!origen}
            historial={historial}
            onEliminarHistorial={eliminar}
          />
        </div>

        {/* ── Ida / Ida y vuelta ── */}
        <div style={S.segmento} className="fade-in">
          {[
            { id:"ida",        label:"Solo ida" },
            { id:"ida_vuelta", label:"Ida y vuelta" },
          ].map(op => (
            <button
              key={op.id}
              onClick={() => setTipoRuta(op.id)}
              className={`seg-opt${tipoRuta===op.id ? " seg-opt-on" : ""}`}
            >
              {op.label}
            </button>
          ))}
        </div>

        {/* ── Tarjeta de servicio (Van Privada) ── */}
        <div style={{ display:"flex", marginTop:8 }} className="fade-in">
          <div
            style={{
              flex:1, padding:"12px 14px", borderRadius:12,
              border: sinCupoPrivado ? "1.5px solid #D4CBB8" : "2px solid #1a1611",
              background: sinCupoPrivado ? "#F5F2EC" : "#1a1611",
              transition:"all .18s",
              display:"flex", flexDirection:"column", gap:10,
              opacity: sinCupoPrivado ? 0.7 : 1,
              position:"relative", overflow:"hidden",
            }}
          >
            {/* Banda "Sin cupo" cuando la fecha está bloqueada */}
            {sinCupoPrivado && (
              <div style={{
                position:"absolute", top:10, right:-20,
                color:"#ef4444",
                fontSize:"0.58rem", fontWeight:800, letterSpacing:"0.08em",
                padding:"2px 28px", transform:"rotate(35deg)",
                textTransform:"uppercase", pointerEvents:"none",
              }}>
                Sin cupo
              </div>
            )}

            <span style={{ fontSize:"0.82rem", fontWeight:700, color: sinCupoPrivado ? "#B8AFA0" : "#F5EDD8", display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ opacity: sinCupoPrivado ? 0.5 : 1 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 01-2-2V7a2 2 0 012-2h11l5 7v5h-2"/>
                  <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
                  <path d="M9 5v7h11"/>
                </svg>
              </span>
              Van Privada
            </span>

            {/* Texto de fecha bloqueada */}
            {sinCupoPrivado && fechaVan && (
              <span style={{ fontSize:"0.72rem", color:"#B8AFA0", fontWeight:500 }}>
                Sin disponibilidad · {new Date(fechaVan+"T12:00:00").toLocaleDateString("es-CL",{day:"numeric",month:"short"})}
              </span>
            )}

            {/* ── Ida ── */}
            <FechaHora
              titulo={esIdaVuelta ? "Ida" : null}
              fecha={fechaVan}
              setFecha={setFechaVan}
              hora={horaVan}
              setHora={setHoraVan}
              min={hoy}
              alerta={!!origen && !!destino && !fechaVan && !sinCupoPrivado}
              apagada={sinCupoPrivado}
            />

            {/* ── Regreso ── */}
            {esIdaVuelta && (
              <FechaHora
                titulo="Regreso"
                fecha={fechaRegreso}
                setFecha={setFechaRegreso}
                hora={horaRegreso}
                setHora={setHoraRegreso}
                min={fechaVan || hoy}
                alerta={!!fechaVan && !fechaRegreso}
                apagada={sinCupoRegreso}
              />
            )}

            {/* Precio + contador de pasajeros */}
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginTop:2 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                {(rutaData || calculando) && (
                  <span style={{ fontSize:"1.1rem", fontWeight:800, lineHeight:1, color:"#F5EDD8" }}>
                    {rutaData ? precio(montoTotal) : "…"}
                  </span>
                )}
                <span style={{ fontSize:"0.72rem", color:"rgba(245,237,216,0.7)" }}>
                  {esIdaVuelta ? "ida y vuelta · " : ""}van completa · hasta {MAX_PAX_VAN} pasajeros
                </span>
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                {/* Botón − */}
                <button
                  onClick={() => setPasajeros(p => Math.max(1, p - 1))}
                  disabled={pasajeros <= 1}
                  style={{
                    width:20, height:20, borderRadius:6,
                    border:"none",
                    background:"transparent",
                    color:"rgba(245,237,216,0.5)",
                    fontSize:"1rem", fontWeight:400, lineHeight:1,
                    cursor: pasajeros <= 1 ? "not-allowed" : "pointer",
                    opacity: pasajeros <= 1 ? 0.3 : 1,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all .15s", flexShrink:0, padding:0,
                  }}
                >−</button>

                {/* Ícono persona + número */}
                <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#F5EDD8"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span style={{ fontSize:"0.85rem", fontWeight:800, lineHeight:1, color:"#F5EDD8", minWidth:12, textAlign:"center" }}>
                    {pasajeros}
                  </span>
                </div>

                {/* Botón + */}
                <button
                  onClick={() => setPasajeros(p => Math.min(MAX_PAX_VAN, p + 1))}
                  disabled={pasajeros >= MAX_PAX_VAN}
                  style={{
                    width:20, height:20, borderRadius:6,
                    border:"none",
                    background:"transparent",
                    color:"rgba(245,237,216,0.5)",
                    fontSize:"1rem", fontWeight:400, lineHeight:1,
                    cursor: pasajeros >= MAX_PAX_VAN ? "not-allowed" : "pointer",
                    opacity: pasajeros >= MAX_PAX_VAN ? 0.3 : 1,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all .15s", flexShrink:0, padding:0,
                  }}
                >+</button>
              </div>
            </div>
          </div>
        </div>
        {/* ── FIN tarjeta ── */}

        {/* ── Botón principal ── */}
        <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:6 }}>
          <button
            className="btn-wa"
            disabled={
              !origen || !destino || !fechaVan || calculando ||
              sinCupoPrivado || sinCupoRegreso ||
              (esIdaVuelta && !fechaRegreso)
            }
            style={{
              opacity: (!origen || !destino || !fechaVan || calculando || sinCupoPrivado || sinCupoRegreso || (esIdaVuelta && !fechaRegreso)) ? 0.45 : 1,
              cursor:  (!origen || !destino || !fechaVan || calculando || sinCupoPrivado || sinCupoRegreso || (esIdaVuelta && !fechaRegreso)) ? "not-allowed" : "pointer",
            }}
            onClick={reservar}
          >
            {calculando
              ? <><span className="btn-spinner" style={{ marginRight:8 }}/> Calculando…</>
              : <><IcoWA/> Reservar por WhatsApp{rutaData ? ` — ${precio(montoTotal)}` : ""}</>
            }
          </button>
          {origen && destino && (
            <p style={{ textAlign:"center", fontSize:"0.70rem", color:"#9a9080", lineHeight:1.5 }}>
              Sin pago online · Confirmamos disponibilidad y horario por WhatsApp
            </p>
          )}
          {error && <div style={S.errBox}>⚠️ {error}</div>}
        </div>

        {/* ── Mensajes de validación ── */}
        {origen && destino && !fechaVan && (
          <p style={{ textAlign:"center", fontSize:"0.72rem", color:"#c0290e", marginTop:6 }}>
            Elige la fecha de ida para continuar
          </p>
        )}
        {esIdaVuelta && fechaVan && !fechaRegreso && (
          <p style={{ textAlign:"center", fontSize:"0.72rem", color:"#c0290e", marginTop:6 }}>
            Elige la fecha de regreso
          </p>
        )}


        {/* ── Destinos ── */}
        <div style={{ marginTop:32 }} className="fade-in">
          <p style={S.sectionLabel}>Destinos</p>
          <div style={{ display:"flex", flexDirection:"column" }}>
            {[
              { o:PUNTOS_FRECUENTES[0], d:PUNTOS_FRECUENTES[1], label:"Temuco ZCO → Pucón",        meta:`~95 km · van privada ${precio(95000)}`,  ico:"plane"    },
              { o:PUNTOS_FRECUENTES[0], d:PUNTOS_FRECUENTES[2], label:"Temuco ZCO → Villarrica",   meta:`~80 km · van privada ${precio(80000)}`,  ico:"plane"    },
              { o:PUNTOS_FRECUENTES[0], d:PUNTOS_FRECUENTES[3], label:"Temuco ZCO → Panguipulli",  meta:`~110 km · van privada ${precio(110000)}`, ico:"plane"  },
              { o:PUNTOS_FRECUENTES[0], d:PUNTOS_FRECUENTES[4], label:"Temuco ZCO → Valdivia",     meta:`~140 km · van privada ${precio(140000)}`, ico:"plane"  },
              { o:PUNTOS_FRECUENTES[0], d:PUNTOS_FRECUENTES[5], label:"Temuco ZCO → Victoria",     meta:`~90 km · van privada ${precio(90000)}`,  ico:"plane"    },
              { o:PUNTOS_FRECUENTES[1], d:PUNTOS_FRECUENTES[0], label:"Pucón → Temuco ZCO",        meta:`~95 km · van privada ${precio(95000)}`,  ico:"mountain" },
              { o:PUNTOS_FRECUENTES[2], d:PUNTOS_FRECUENTES[0], label:"Villarrica → Temuco ZCO",   meta:`~80 km · van privada ${precio(80000)}`,  ico:"city"     },
              { o:PUNTOS_FRECUENTES[3], d:PUNTOS_FRECUENTES[0], label:"Panguipulli → Temuco ZCO",  meta:`~110 km · van privada ${precio(110000)}`, ico:"city"   },
              { o:PUNTOS_FRECUENTES[4], d:PUNTOS_FRECUENTES[0], label:"Valdivia → Temuco ZCO",     meta:`~140 km · van privada ${precio(140000)}`, ico:"city"   },
            ].map((r,i) => (
              <button key={i} className="ruta-row" onClick={() => { setOrigen(r.o); setDestino(r.d); }}>
                <div style={S.rutaIcoSmall}>
                  {r.ico === "plane" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a9080" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                  )}
                  {r.ico === "mountain" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a9080" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 20l6-12 3 5 3-3 6 10H3z"/>
                    </svg>
                  )}
                  {r.ico === "city" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a9080" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18M9 21V7l6-4v18M9 11h6M9 15h6M9 19h6"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex:1, textAlign:"left", minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:"0.88rem", color:"#1a1611" }}>{r.label}</div>
                  <div style={{ fontSize:"0.72rem", color:"#9a9080", marginTop:2 }}>{r.meta}</div>
                </div>
                <IcoChevron/>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── FechaHora (fecha obligatoria + hora opcional, dentro de la tarjeta) ──────
function FechaHora({ titulo, fecha, setFecha, hora, setHora, min, alerta=false, apagada=false }) {
  const colorFecha = apagada ? "#C8BEA8" : alerta ? "#ef4444" : fecha ? "#22c55e" : "#F5EDD8";
  const colorHora  = apagada ? "#C8BEA8" : hora ? "#22c55e" : "#F5EDD8";
  const texto      = apagada ? "#B8AFA0" : "#F5EDD8";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      {titulo && (
        <span style={{ fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:"rgba(245,237,216,0.55)" }}>
          {titulo}
        </span>
      )}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>

        {/* Fecha (obligatoria) */}
        <div style={{ position:"relative", display:"flex", alignItems:"center", gap:5, cursor:"pointer" }}>
          <div className={alerta ? "ico-pulse-red" : ""}>
            <IcoCal size={22} c={colorFecha}/>
          </div>
          <span style={{ fontSize:"0.78rem", fontWeight:700, lineHeight:1, color: fecha ? texto : "rgba(245,237,216,0.55)", pointerEvents:"none" }}>
            {fecha
              ? new Date(fecha + "T12:00:00").toLocaleDateString("es-CL", { day:"numeric", month:"short" })
              : "Elegir fecha"}
          </span>
          <input
            type="date"
            min={min}
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            style={{ position:"absolute", opacity:0, cursor:"pointer", top:0, left:0, width:"100%", height:"100%", fontSize:16 }}
          />
        </div>

        <div style={{ width:1, height:16, background:"rgba(245,237,216,0.3)", flexShrink:0 }}/>

        {/* Hora (opcional — si queda en blanco se coordina por WhatsApp) */}
        <div style={{ position:"relative", display:"flex", alignItems:"center", gap:5, cursor:"pointer" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colorHora}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <span style={{ fontSize:"0.78rem", fontWeight:hora?700:500, lineHeight:1, color: hora ? texto : "rgba(245,237,216,0.55)", pointerEvents:"none" }}>
            {hora || "Hora a coordinar"}
          </span>
          <select
            value={hora}
            onChange={e => setHora(e.target.value)}
            style={{ position:"absolute", opacity:0, cursor:"pointer", top:0, left:0, width:"100%", height:"100%", fontSize:16 }}
          >
            <option value="">Hora a coordinar</option>
            {HORAS_BASE.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

// ── LugarInput ────────────────────────────────────────────────────────────────
const EJEMPLOS_DIRECCIONES = [
  "O'Higgins 310, Villarrica","Urrutia 477, Pucón",
  "Caupolicán 285, Temuco","Freire 250, Villarrica",
  "Colo-Colo 355, Temuco","Lincoyan 542, Pucón",
];

function PlaceholderTicker() {
  const [_idx, _setIdx] = useState(0);
  const [estado, setEstado] = useState("visible");
  useEffect(() => {
    const c = setInterval(() => {
      setEstado("saliendo");
      setTimeout(() => { _setIdx(i => (i+1)%EJEMPLOS_DIRECCIONES.length); setEstado("entrando"); setTimeout(() => setEstado("visible"), 20); }, 300);
    }, 2800);
    return () => clearInterval(c);
  }, []);
  const T = { visible:"translateX(0)", saliendo:"translateX(-120%)", entrando:"translateX(60%)" };
  const O = { visible:1, saliendo:0, entrando:0 };
  return (
    <span style={{ display:"block", overflow:"hidden", flex:1, pointerEvents:"none" }}>
      <span style={{ display:"block", fontSize:"0.9rem", color:"#B8AFA0", fontFamily:"'DM Sans',sans-serif", fontWeight:400, whiteSpace:"nowrap", transform:T[estado], opacity:O[estado], transition:estado==="saliendo"?"transform 0.28s cubic-bezier(.4,0,1,1), opacity 0.22s ease":estado==="visible"?"transform 0.38s cubic-bezier(.2,.8,.3,1), opacity 0.28s ease":"none" }}>
        {EJEMPLOS_DIRECCIONES[_idx]}
      </span>
    </span>
  );
}

function LugarInput({ placeholder, value, onChange, dotStyle, disabled, historial=[], onEliminarHistorial }) {
  const [query, setQuery]           = useState("");
  const [abierto, setAbierto]       = useState(false);
  const [activo, setActivo]         = useState(false);
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando]     = useState(false);
  const [geolocando, setGeolocando] = useState(false);
  const [geoFallback, setGeoFallback] = useState(false);
  const wrapRef = useRef(null), timerRef = useRef(null), inputRef = useRef(null);

  const ubicarme = (silencioso=false) => {
    if (!navigator.geolocation) { if (!silencioso) alert("Tu navegador no soporta geolocalización."); setGeoFallback(true); return; }
    if (location.protocol!=="https:" && location.hostname!=="localhost") { if (!silencioso) alert("La geolocalización precisa requiere conexión segura (https)."); setGeoFallback(true); return; }
    setGeolocando(true);
    navigator.geolocation.getCurrentPosition(
      async ({coords}) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&accept-language=es&zoom=18`);
          const data = await res.json();
          const label = [data.address?.road,data.address?.house_number,data.address?.suburb||data.address?.neighbourhood||data.address?.city_district,data.address?.city||data.address?.town].filter(Boolean).join(", ");
          const labelFinal = label || data.display_name.split(",").slice(0,3).join(",").trim();
          onChange({ label:labelFinal, lat:coords.latitude, lng:coords.longitude }); setQuery(labelFinal); setGeoFallback(false);
        } catch { if (!silencioso) setQuery("No se pudo obtener la dirección"); setGeoFallback(true); }
        finally { setGeolocando(false); }
      },
      () => { setGeolocando(false); setGeoFallback(true); },
      { enableHighAccuracy:true, timeout:8000, maximumAge:0 }
    );
  };

  useEffect(() => { if (dotStyle==="origen" && !value) ubicarme(true); }, []); // eslint-disable-line
  useEffect(() => { if (!activo) setQuery(value ? value.label : ""); }, [value, activo]);
  useEffect(() => {
    const fn = (e) => { if (!wrapRef.current?.contains(e.target)) { setAbierto(false); setActivo(false); } };
    document.addEventListener("mousedown", fn); return () => document.removeEventListener("mousedown", fn);
  }, []);
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (query.length < 3) { setResultados([]); return; }
    timerRef.current = setTimeout(async () => { setBuscando(true); const res = await buscarDirecciones(query); setResultados(res); setBuscando(false); }, 400);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const frecuentes   = PUNTOS_FRECUENTES.filter(p => !query || p.label.toLowerCase().includes(query.toLowerCase()) || p.sub.toLowerCase().includes(query.toLowerCase()));
  const histFiltrado = historial.filter(h => !query || h.label.toLowerCase().includes(query.toLowerCase()));
  const seleccionar  = (punto) => { onChange(punto); setQuery(punto.label.replace(/^[^\w\s]{1,3}\s*/,"").trim()); setAbierto(false); setActivo(false); setResultados([]); };
  const dot = dotStyle==="origen" ? <div style={S.dotOrigen}/> : <div style={S.dotDestino}/>;
  const mostrarDropdown = abierto && (frecuentes.length>0 || resultados.length>0 || histFiltrado.length>0 || buscando || query.length>=3);

  return (
    <div ref={wrapRef} style={{ position:"relative" }}>
      <div style={{ ...S.searchBoxSingle, borderColor:activo?"#1a1611":"#D4CBB8", boxShadow:activo?"0 0 0 2px rgba(26,22,17,.12)":"0 2px 12px rgba(26,22,17,.06)", opacity:disabled?0.5:1 }}>
        <div style={S.searchRow}>
          {dot}
          <div style={{ flex:1, position:"relative", display:"flex", alignItems:"center", overflow:"hidden" }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setAbierto(true); }}
              onFocus={() => { setActivo(true); setAbierto(true); }}
              onBlur={() => setTimeout(() => { if (!wrapRef.current?.contains(document.activeElement)) { setActivo(false); setAbierto(false); } }, 150)}
              placeholder={activo ? placeholder : ""}
              disabled={disabled}
              autoComplete="off"
              style={{ width:"100%", background:"transparent", border:"none", outline:"none", fontSize:"0.95rem", fontFamily:"'DM Sans',sans-serif", fontWeight:value?600:400, color:value?"#1a1611":"#9a9080" }}
            />
            {dotStyle==="origen" && !value && !query && !activo && !geolocando && (
              <div style={{ position:"absolute", left:0, right:0, top:0, bottom:0, display:"flex", alignItems:"center", pointerEvents:"none", overflow:"hidden" }}>
                <PlaceholderTicker/>
              </div>
            )}
            {dotStyle==="origen" && geolocando && !value && (
              <div style={{ position:"absolute", left:0, display:"flex", alignItems:"center", gap:6, pointerEvents:"none" }}>
                <span className="btn-spinner" style={{ width:13, height:13, borderWidth:1.5, borderTopColor:"#9a9080", borderColor:"#D4CBB8" }}/>
                <span style={{ fontSize:"0.82rem", color:"#B8AFA0" }}>Buscando tu ubicación…</span>
              </div>
            )}
          </div>
          {buscando && <span className="btn-spinner" style={{ width:14, height:14, borderWidth:1.5, borderTopColor:"#9a9080", borderColor:"#D4CBB8", flexShrink:0 }}/>}
          {value && !buscando && (
            <button
              onMouseDown={e => { e.preventDefault(); onChange(null); setQuery(""); setResultados([]); }}
              style={{ background:"none", border:"none", cursor:"pointer", width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", color:"#C8BEA8", fontSize:"1.1rem", flexShrink:0 }}
            >×</button>
          )}
          {dotStyle==="origen" && !value && !buscando && (
            <button
              onMouseDown={e => { e.preventDefault(); ubicarme(false); }}
              style={{ background:"none", border:"none", cursor:geolocando?"wait":"pointer", width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", color:geolocando?"#C8BEA8":"#9a9080", flexShrink:0 }}
            >
              {geolocando
                ? <span className="btn-spinner" style={{ width:14, height:14, borderWidth:1.5, borderTopColor:"#9a9080", borderColor:"#D4CBB8" }}/>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                    <circle cx="12" cy="12" r="8" strokeDasharray="2 3"/>
                  </svg>
              }
            </button>
          )}
        </div>
      </div>

      {mostrarDropdown && (
        <div style={S.dropdown}>
          {dotStyle==="origen" && !value && (
            <button className="drop-item" onMouseDown={e => { e.preventDefault(); ubicarme(); setAbierto(false); }} style={{ borderBottom:"1px solid #F0EBE0" }}>
              <div style={{ ...S.dropIcon, background:"#EEF9F0" }}>📍</div>
              <div style={{ flex:1, textAlign:"left" }}>
                <div style={{ fontSize:"0.85rem", fontWeight:600, color:"#1a7a3f" }}>{geolocando ? "Obteniendo ubicación…" : "Usar mi ubicación actual"}</div>
                <div style={{ fontSize:"0.72rem", color:"#9a9080", marginTop:1 }}>GPS del dispositivo</div>
              </div>
            </button>
          )}
          {histFiltrado.length > 0 && (<>
            <div style={S.dropHeader}>Usadas recientemente</div>
            {histFiltrado.map((h,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center" }}>
                <button className="drop-item" style={{ flex:1 }} onMouseDown={() => seleccionar(h)}>
                  <div style={{ ...S.dropIcon, background:"#F0EBE0" }}>🕐</div>
                  <div style={{ flex:1, textAlign:"left", minWidth:0 }}>
                    <div style={{ fontSize:"0.85rem", fontWeight:600, color:"#1a1611", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.label}</div>
                    {h.sub && <div style={{ fontSize:"0.72rem", color:"#9a9080", marginTop:1 }}>{h.sub}</div>}
                  </div>
                </button>
                <button
                  onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onEliminarHistorial?.(h.label); }}
                  style={{ background:"none", border:"none", cursor:"pointer", width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", color:"#C8BEA8", fontSize:"1rem", flexShrink:0 }}
                >×</button>
              </div>
            ))}
          </>)}
          {frecuentes.length > 0 && (<>
            <div style={S.dropHeader}>Rutas frecuentes</div>
            {frecuentes.map(p => (
              <button key={p.id} className="drop-item" onMouseDown={() => seleccionar(p)}>
                <div style={S.dropIcon}>{p.label.slice(0,2)}</div>
                <div style={{ flex:1, textAlign:"left", minWidth:0 }}>
                  <div style={{ fontSize:"0.85rem", fontWeight:600, color:"#1a1611", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.label.replace(/^[^\w\s]{1,3}\s*/,"")}</div>
                  <div style={{ fontSize:"0.72rem", color:"#9a9080", marginTop:1 }}>{p.sub}</div>
                </div>
              </button>
            ))}
          </>)}
          {resultados.length > 0 && (<>
            <div style={S.dropHeader}>Resultados</div>
            {resultados.map((r,i) => (
              <button key={i} className="drop-item" onMouseDown={() => seleccionar(r)}>
                <div style={{ ...S.dropIcon, fontSize:"0.9rem" }}>📍</div>
                <div style={{ flex:1, textAlign:"left", minWidth:0 }}>
                  <div style={{ fontSize:"0.85rem", fontWeight:600, color:"#1a1611", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.label}</div>
                  {r.sub && <div style={{ fontSize:"0.72rem", color:"#9a9080", marginTop:1 }}>{r.sub}</div>}
                </div>
              </button>
            ))}
          </>)}
          {buscando && (
            <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:8, color:"#9a9080", fontSize:"0.8rem" }}>
              <span className="btn-spinner" style={{ width:13, height:13, borderWidth:1.5, borderTopColor:"#9a9080", borderColor:"#D4CBB8" }}/>
              Buscando direcciones…
            </div>
          )}
          {!buscando && query.length>=3 && resultados.length===0 && frecuentes.length===0 && histFiltrado.length===0 && (
            <div style={S.dropAviso}><span>🔍</span><span>Sin resultados para "{query}"</span></div>
          )}
        </div>
      )}
    </div>
  );
}

// ── FrasesRotativas ───────────────────────────────────────────────────────────
const FRASES = [
  { texto:"Una nueva forma de viajar",           emoji:"✨" },
  { texto:"Más económico que un taxi",           emoji:"💸" },
  { texto:"Más cómodo que el bus",               emoji:"😌" },
  { texto:"Más personalizado, siempre",          emoji:"🎯" },
  { texto:"Sin filas. Sin esperas.",             emoji:"⚡" },
  { texto:"Tu ruta, a tu hora",                 emoji:"🕐" },
  { texto:"Paga solo cuando se confirma",        emoji:"🙌" },
  { texto:"De puerta a puerta en la Araucanía",  emoji:"🏔️" },
];
function FrasesRotativas() {
  const [_idx, _setIdx] = useState(0);
  const [estado, setEstado] = useState("visible");
  useEffect(() => {
    const c = setInterval(() => {
      setEstado("saliendo");
      setTimeout(() => { _setIdx(i => (i+1)%FRASES.length); setEstado("entrando"); setTimeout(() => setEstado("visible"), 30); }, 380);
    }, 3200);
    return () => clearInterval(c);
  }, []);
  const frase = FRASES[_idx];
  const tM = { visible:"translateX(0) scale(1)", saliendo:"translateX(-28px) scale(0.94)", entrando:"translateX(22px) scale(0.96)" };
  const oM = { visible:1, saliendo:0, entrando:0 };
  return (
    <div style={{ overflow:"hidden", margin:"8px 0 12px", height:30, display:"flex", alignItems:"center" }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, transform:tM[estado], opacity:oM[estado], transition:estado==="saliendo"?"transform 0.35s cubic-bezier(.4,0,.6,1), opacity 0.28s ease":estado==="visible"?"transform 0.4s cubic-bezier(.2,.8,.4,1), opacity 0.32s ease":"none" }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#1a1611", color:"#F5EDD8", borderRadius:99, padding:"3px 11px 3px 7px", fontSize:"0.78rem", fontWeight:700, whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif" }}>
          <span style={{ fontSize:"0.82rem", lineHeight:1 }}>{frase.emoji}</span>
          {frase.texto}
        </span>
      </div>
    </div>
  );
}

// ── Row helper ────────────────────────────────────────────────────────────────
function Row({ label, val, bold }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.6rem 0", borderBottom:"1px solid #E8E0D0" }}>
      <span style={{ fontSize:"0.82rem", color:"#9a9080" }}>{label}</span>
      <span style={{ fontSize:bold?"1rem":"0.85rem", fontWeight:bold?800:600, color:"#1a1611" }}>{val}</span>
    </div>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  input, select, textarea { font-size: 16px !important; }
  html, body { overflow-x: hidden; max-width: 100%; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .fade-in { animation: fadeIn 0.3s ease both; }
  select { appearance: none; -webkit-appearance: none; }
  select option { background: #EDE5D0; color: #1a1611; }
  .btn-back { width:44px; height:44px; border-radius:50%; border:1.5px solid #D4CBB8; background:#EDE5D0; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .15s; }
  .btn-back:hover { background: #D4CBB8; }
  .btn-confirmar { width:100%; padding:clamp(14px,4vw,17px); background:#1a1611; color:#F5EDD8; border:none; border-radius:14px; font-size:clamp(0.9rem,4vw,1rem); font-weight:800; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .2s; box-shadow:0 4px 20px rgba(26,22,17,.2); letter-spacing:-0.01em; display:flex; align-items:center; justify-content:center; gap:6px; }
  .btn-confirmar:hover:not(:disabled) { background:#2d2820; transform:translateY(-1px); }
  .btn-confirmar:disabled { background:#D4CBB8; color:#9a9080; cursor:not-allowed; box-shadow:none; }
  .btn-wa { width:100%; padding:15px; display:flex; align-items:center; justify-content:center; gap:8px; background:#22c55e; color:#fff; border:none; border-radius:14px; font-size:0.95rem; font-weight:700; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .2s; }
  .btn-wa:hover:not(:disabled) { background: #16a34a; }
  .seg-opt { flex:1; padding:9px 10px; border:none; border-radius:9px; background:transparent; color:#6b5e4e; font-size:0.82rem; font-weight:700; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .18s; }
  .seg-opt:not(.seg-opt-on):hover { color:#1a1611; }
  .seg-opt-on { background:#1a1611; color:#F5EDD8; box-shadow:0 2px 8px rgba(26,22,17,.18); }
  .btn-ghost { width:100%; padding:14px; background:transparent; color:#9a9080; border:1.5px solid #D4CBB8; border-radius:14px; font-size:0.88rem; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .2s; }
  .btn-ghost:hover { border-color:#9a9080; color:#3d3629; }
  .ruta-row { display:flex; align-items:center; gap:14px; padding:14px 4px; width:100%; background:transparent; border:none; border-bottom:1px solid #E8E0D0; cursor:pointer; transition:all .15s; font-family:'DM Sans',sans-serif; }
  .ruta-row:hover { padding-left:10px; padding-right:10px; background:#EDE5D0; border-radius:12px; border-bottom-color:transparent; }
  .ruta-row:last-child { border-bottom:none; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .btn-flow { width:100%; padding:17px; display:flex; align-items:center; justify-content:center; gap:8px; background:#c0290e; color:#fff; border:none; border-radius:14px; font-size:1rem; font-weight:800; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .2s; }
  .btn-flow:hover:not(:disabled) { background:#a5230c; transform:translateY(-1px); }
  .btn-flow:disabled { opacity:0.5; cursor:not-allowed; }
  .btn-mis-reservas { width:100%; padding:13px; margin-top:8px; display:flex; align-items:center; justify-content:center; gap:8px; background:transparent; color:#1a1611; border:1.5px solid #1a1611; border-radius:14px; font-size:0.88rem; font-weight:700; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .2s; }
  .btn-mis-reservas:hover { background:#1a1611; color:#fff; }
  .btn-spinner { width:17px; height:17px; border-radius:50%; border:2px solid rgba(255,255,255,.35); border-top-color:#fff; animation:spin .7s linear infinite; display:inline-block; flex-shrink:0; }
  .drop-item { display:flex; align-items:center; gap:12px; width:100%; padding:10px 16px; background:transparent; border:none; cursor:pointer; transition:background .15s; font-family:'DM Sans',sans-serif; min-height:44px; }
  .drop-item:hover { background:#FAF7F2; }
  @keyframes pulseRed { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.25); opacity:0.6; } }
  @keyframes pulseGreen { 0%,100% { transform:scale(1); } 50% { transform:scale(1.3); } }
  .ico-pulse-red { animation: pulseRed 0.8s ease-in-out infinite; display:inline-flex; }
  .ico-pulse-green { animation: pulseGreen 0.7s ease-in-out infinite; }
`;

const S = {
  root:        { background:"#ffffff", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", overflowX:"hidden" },
  wrap:        { maxWidth:480, width:"100%", margin:"0 auto", padding:"0 clamp(14px,4vw,24px) 80px", boxSizing:"border-box" },
  saludoRow:   { display:"flex", justifyContent:"space-between", alignItems:"flex-start", paddingTop:"clamp(1.25rem,5vw,2.5rem)", paddingBottom:"1.25rem" },
  saludoSub:   { fontSize:"0.85rem", color:"#9a9080", marginBottom:4, fontWeight:500 },
  saludoTitle: { fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.5rem,6vw,2.2rem)", fontWeight:800, color:"#1a1611", lineHeight:1.12 },
  searchBoxSingle: { background:"#EDE5D0", border:"1px solid #D4CBB8", borderRadius:16, boxShadow:"0 2px 12px rgba(26,22,17,.06)", transition:"border-color .2s, box-shadow .2s" },
  arrowSep:    { display:"flex", alignItems:"center", justifyContent:"center", height:22, position:"relative" },
  swapBtn:     { width:44, height:44, borderRadius:"50%", background:"#fff", border:"1.5px solid #D4CBB8", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#9a9080", transition:"all .2s", boxShadow:"0 1px 6px rgba(26,22,17,.08)", zIndex:1 },
  dropdown:    { position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:"#fff", border:"1px solid #E0D8CC", borderRadius:14, boxShadow:"0 8px 32px rgba(26,22,17,.14)", zIndex:9999, overflow:"hidden" },
  dropHeader:  { padding:"8px 16px 4px", fontSize:"0.67rem", fontWeight:700, color:"#C8BEA8", textTransform:"uppercase", letterSpacing:"0.07em" },
  dropIcon:    { width:34, height:34, borderRadius:10, background:"#F0EBE0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0 },
  dropAviso:   { display:"flex", alignItems:"flex-start", gap:8, padding:"10px 16px", margin:"4px 8px 8px", background:"#FDF9F3", border:"1px solid #E8E0D0", borderRadius:10, fontSize:"0.72rem", color:"#9a9080", lineHeight:1.5 },
  searchRow:   { display:"flex", alignItems:"center", gap:10, padding:"10px 14px" },
  dotOrigen:   { width:10, height:10, borderRadius:"50%", border:"2.5px solid #1a1611", flexShrink:0 },
  dotDestino:  { width:10, height:10, borderRadius:2, background:"#1a1611", flexShrink:0 },
  rutaIcoSmall:{ width:38, height:38, borderRadius:10, background:"#E8E0D0", border:"1px solid #D4CBB8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", flexShrink:0 },
  sectionLabel:{ fontSize:"0.72rem", fontWeight:700, color:"#9a9080", letterSpacing:"0.06em", marginBottom:"0.6rem" },
  avatar:      { width:42, height:42, borderRadius:"50%", background:"#1a1611", color:"#F5EDD8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.8rem", fontWeight:800, flexShrink:0 },
  errBox:      { padding:"0.8rem 1rem", background:"rgba(192,41,14,0.08)", border:"1px solid rgba(192,41,14,0.2)", borderRadius:10, color:"#c0290e", fontSize:"0.82rem", marginBottom:"0.75rem" },
  okWrap:      { maxWidth:480, width:"100%", margin:"0 auto", padding:"clamp(1rem,4vw,1.8rem) clamp(14px,4vw,24px) 60px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", boxSizing:"border-box" },
  segmento:    { display:"flex", gap:4, background:"#EDE5D0", border:"1px solid #D4CBB8", borderRadius:12, padding:4, marginTop:12 },
};