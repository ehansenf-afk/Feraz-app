import { db, upsert, remove, useCollection } from "./firebase.js";

import { useState, useEffect, useRef, useCallback } from "react";



// ─── PALETA FERAZ ──────────────────────────────────────────────
const C = {
  musgo:      "#4A5D23",
  musgoClaro: "#5E7A2C",
  terracota:  "#C16748",
  crema:      "#F2E8D5",
  noche:      "#2C2638",
  neutral:    "#E8DCC8",
  gris:       "#666666",
  blanco:     "#FFFFFF",
};

// ─── DATOS SEMILLA ──────────────────────────────────────────────
const seedRecetas = [
  { id:"r1", nombre:"Noche Serena", tipo:"Bruma", volumen:"50ml", intencion:"Relajación total antes de dormir", ingredientes:[{id:"i1",nombre:"Alcohol de Cereal",cantidad:45,unidad:"ml"},{id:"i6",nombre:"Aceite Esencial Jazmín",cantidad:2,unidad:"ml"}], notas:"Rociar sobre ropa de cama y almohadas." },
  { id:"r2", nombre:"Refugio de Invierno", tipo:"Bruma", volumen:"50ml", intencion:"Aroma cálido y especiado", ingredientes:[{id:"i1",nombre:"Alcohol de Cereal",cantidad:46,unidad:"ml"},{id:"i4",nombre:"Mezcla Moroccan Especias",cantidad:4,unidad:"ml"}], notas:"Rociar en ambiente del hogar." },
  { id:"r3", nombre:"Jardín de Agua", tipo:"Bruma", volumen:"50ml", intencion:"Purificar el ambiente", ingredientes:[{id:"i1",nombre:"Alcohol de Cereal",cantidad:44,unidad:"ml"},{id:"i8",nombre:"Aceite Esencial Tangerina",cantidad:2,unidad:"ml"},{id:"i10",nombre:"Aceite Esencial Bergamota",cantidad:2,unidad:"ml"}], notas:"Agitar antes de usar." },
  { id:"r4", nombre:"Paz Interior", tipo:"Bruma", volumen:"50ml", intencion:"Meditación y yoga", ingredientes:[{id:"i1",nombre:"Alcohol de Cereal",cantidad:44,unidad:"ml"},{id:"i6",nombre:"Aceite Esencial Jazmín",cantidad:2,unidad:"ml"},{id:"i7",nombre:"Aceite Esencial Rosa",cantidad:2,unidad:"ml"}], notas:"Rociar alrededor del espacio de meditación." },
  { id:"r5", nombre:"Sueño del Bosque", tipo:"Roll-on", volumen:"10ml", intencion:"Sueño reparador y profundo", ingredientes:[{id:"i2",nombre:"Aceite de Almendras",cantidad:8,unidad:"ml"},{id:"i5",nombre:"Mezcla Olor a Bosque",cantidad:2,unidad:"ml"}], notas:"Aplicar en muñecas, sienes o detrás de orejas." },
];
const seedIngredientes = [
  { id:"i1", nombre:"Alcohol de Cereal", stock:500, unidad:"ml", minimo:100, costo:8500, categoria:"Base" },
  { id:"i2", nombre:"Aceite de Almendras", stock:200, unidad:"ml", minimo:50, costo:6200, categoria:"Base" },
  { id:"i3", nombre:"Mezcla Flores Místicas", stock:30, unidad:"ml", minimo:10, costo:12000, categoria:"Mezcla" },
  { id:"i4", nombre:"Mezcla Moroccan Especias", stock:25, unidad:"ml", minimo:10, costo:11500, categoria:"Mezcla" },
  { id:"i5", nombre:"Mezcla Olor a Bosque", stock:20, unidad:"ml", minimo:10, costo:13000, categoria:"Mezcla" },
  { id:"i6", nombre:"Aceite Esencial Jazmín", stock:15, unidad:"ml", minimo:5, costo:18000, categoria:"Esencial" },
  { id:"i7", nombre:"Aceite Esencial Rosa", stock:10, unidad:"ml", minimo:5, costo:22000, categoria:"Esencial" },
  { id:"i8", nombre:"Aceite Esencial Tangerina", stock:20, unidad:"ml", minimo:5, costo:9500, categoria:"Esencial" },
  { id:"i9", nombre:"Aceite Esencial Cedrón", stock:18, unidad:"ml", minimo:5, costo:10500, categoria:"Esencial" },
  { id:"i10", nombre:"Aceite Esencial Bergamota", stock:12, unidad:"ml", minimo:5, costo:14000, categoria:"Esencial" },
];
const seedProductos = [
  { id:"p1", nombre:"Noche Serena", tipo:"Bruma", stock:5, precio:9900, costo:2800 },
  { id:"p2", nombre:"Refugio de Invierno", tipo:"Bruma", stock:3, precio:9900, costo:2600 },
  { id:"p3", nombre:"Jardín de Agua", tipo:"Bruma", stock:8, precio:9900, costo:3100 },
  { id:"p4", nombre:"Paz Interior", tipo:"Bruma", stock:2, precio:9900, costo:3400 },
  { id:"p5", nombre:"Sueño del Bosque", tipo:"Roll-on", stock:6, precio:7900, costo:1800 },
];
const seedPedidos = [
  { id:"PED-0001", tipodoc:"Pedido", numero:1, cliente:"Valentina M.", fecha:"2026-05-20", items:[{producto:"Noche Serena",qty:2,precio:9900}], total:19800, estado:"Entregado" },
  { id:"PED-0002", tipodoc:"Pedido", numero:2, cliente:"Camila R.", fecha:"2026-05-25", items:[{producto:"Jardín de Agua",qty:1,precio:9900}], total:9900, estado:"Pendiente" },
  { id:"COT-0001", tipodoc:"Cotización", numero:1, cliente:"Isabel F.", fecha:"2026-05-28", items:[{producto:"Refugio de Invierno",qty:1,precio:9900}], total:9900, estado:"Pendiente" },
];
const seedClientes = [
  { id:"c1", nombre:"Valentina Morales", email:"vale@gmail.com", telefono:"+56 9 8765 4321", compras:3, totalGastado:67800, notas:"Le encantan las brumas nocturnas" },
  { id:"c2", nombre:"Camila Rojas", email:"cami@gmail.com", telefono:"+56 9 7654 3210", compras:2, totalGastado:51400, notas:"Interesada en roll-ons" },
  { id:"c3", nombre:"Isabel Fuentes", email:"isa@gmail.com", telefono:"+56 9 6543 2109", compras:1, totalGastado:9900, notas:"Primera compra" },
];
const seedEventos = [
  { id:"e1", fecha:"2026-05-28", cliente:"Valentina Morales", tipo:"Entrega", nota:"Entregar pedido Noche Serena" },
  { id:"e2", fecha:"2026-05-30", cliente:"Camila Rojas", tipo:"Llamar", nota:"Confirmar pedido pendiente" },
  { id:"e3", fecha:"2026-06-02", cliente:"Isabel Fuentes", tipo:"Cobrar", nota:"Cobro pendiente $9.900" },
];

// ─── ÍCONOS ─────────────────────────────────────────────────────
const Icon = ({ name, size=20, color="currentColor" }) => {
  const p = {
    menu:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>,
    home:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>,
    flask:       <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6m-6 0v6l-4 8a1 1 0 00.9 1.5h12.2A1 1 0 0019 17l-4-8V3"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6"/></>,
    box:         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>,
    tag:         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>,
    cart:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>,
    calculator:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>,
    users:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>,
    package:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>,
    plus:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>,
    x:           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>,
    edit:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>,
    leaf:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3s1 5-1 8-3 4-3 8c0 3.314 2.686 6 6 6 2 0 4-1 5-3 2-3 2-6 1-9C12 9 9 6 5 3z"/>,
    warning:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>,
    check:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>,
    chevronRight:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>,
    chevronLeft: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>,
    calendar:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>,
    upload:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>,
    trash:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>,
    sync:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={{flexShrink:0}}>{p[name]}</svg>;
};

// ─── COMPONENTES BASE ────────────────────────────────────────────
const Badge = ({ children, color=C.musgo }) => (
  <span style={{ background:color+"22", color, border:`1px solid ${color}44`, borderRadius:20, padding:"2px 10px", fontSize:11, fontFamily:"Georgia", letterSpacing:1, whiteSpace:"nowrap" }}>{children}</span>
);
const Card = ({ children, style={} }) => (
  <div style={{ background:C.blanco, borderRadius:14, padding:20, marginBottom:14, boxShadow:"0 2px 8px rgba(44,38,56,0.07)", border:`1px solid ${C.neutral}`, ...style }}>{children}</div>
);
const Btn = ({ children, onClick, color=C.musgo, small=false, outline=false, style={}, disabled=false }) => (
  <button onClick={onClick} disabled={disabled} style={{ background:outline?"transparent":color, color:outline?color:C.crema, border:`1.5px solid ${color}`, borderRadius:10, padding:small?"5px 13px":"9px 20px", fontSize:small?12:14, fontFamily:"Georgia", cursor:disabled?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:6, letterSpacing:.5, opacity:disabled?.5:1, transition:"all .2s", ...style }}>{children}</button>
);
const Sel = ({ label, value, onChange, children }) => (
  <div style={{ marginBottom:12 }}>
    {label && <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:4, textTransform:"uppercase" }}>{label}</div>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{ width:"100%", border:`1.5px solid ${C.neutral}`, borderRadius:8, padding:"9px 12px", fontFamily:"Georgia", fontSize:14, color:C.noche, background:C.crema+"55", boxSizing:"border-box" }}>{children}</select>
  </div>
);
const Input = ({ label, value, onChange, type="text", placeholder="", style={} }) => (
  <div style={{ marginBottom:12 }}>
    {label && <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:4, textTransform:"uppercase" }}>{label}</div>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ width:"100%", boxSizing:"border-box", border:`1.5px solid ${C.neutral}`, borderRadius:8, padding:"9px 12px", fontFamily:"Georgia", fontSize:14, color:C.noche, background:C.crema+"55", outline:"none", ...style }}/>
  </div>
);
const Modal = ({ open, onClose, title, children, wide=false }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,38,56,0.5)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.blanco, borderRadius:18, width:"100%", maxWidth:wide?600:480, maxHeight:"88vh", overflowY:"auto", boxShadow:"0 8px 40px rgba(44,38,56,0.28)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 22px 14px", borderBottom:`1px solid ${C.neutral}`, position:"sticky", top:0, background:C.blanco, zIndex:1 }}>
          <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:18, color:C.noche }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.gris, padding:4 }}><Icon name="x" size={20}/></button>
        </div>
        <div style={{ padding:"18px 22px 22px" }}>{children}</div>
      </div>
    </div>
  );
};
const SectionTitle = ({ icon, title, action, syncing }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <Icon name={icon} size={20} color={C.musgo}/>
      <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:22, color:C.noche }}>{title}</span>
      {syncing && <Icon name="sync" size={14} color={C.gris}/>}
    </div>
    {action}
  </div>
);
const NumBtn = ({ onClick, label }) => (
  <button onClick={onClick} style={{ background:C.neutral, border:"none", borderRadius:8, width:34, height:34, cursor:"pointer", fontSize:20, color:C.noche, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{label}</button>
);

// ─── SELECTOR TIPO DOCUMENTO ─────────────────────────────────────
const SelectorDocumento = ({ tipo, numero, onTipo, onNumero }) => {
  const prefijo = tipo==="Cotización" ? "COT" : "PED";
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:6, textTransform:"uppercase" }}>Tipo de documento</div>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {["Pedido","Cotización"].map(t=>(
          <button key={t} onClick={()=>onTipo(t)} style={{ flex:1, padding:"10px 0", borderRadius:10, border:`2px solid ${tipo===t?C.musgo:C.neutral}`, background:tipo===t?C.musgo:C.blanco, color:tipo===t?C.crema:C.gris, fontFamily:"Georgia", fontSize:13, cursor:"pointer", transition:"all .2s", letterSpacing:.5 }}>
            {t==="Pedido"?"🛒 Pedido":"📋 Cotización"}
          </button>
        ))}
      </div>
      <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:6, textTransform:"uppercase" }}>Número de {tipo}</div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <NumBtn onClick={()=>onNumero(Math.max(1,numero-1))} label="−"/>
        <div style={{ flex:1, textAlign:"center", fontFamily:"Palatino Linotype, Palatino, serif", fontSize:26, color:C.musgo, background:C.crema, borderRadius:10, padding:"9px 0", border:`1.5px solid ${C.neutral}` }}>
          {prefijo}-{String(numero).padStart(4,"0")}
        </div>
        <NumBtn onClick={()=>onNumero(numero+1)} label="+"/>
      </div>
      <div style={{ fontSize:10, color:C.gris, fontFamily:"Georgia", marginTop:5, textAlign:"center", fontStyle:"italic" }}>Número correlativo · ajusta con los botones si es necesario</div>
    </div>
  );
};

// ─── TIPOS EVENTO ───────────────────────────────────────────────
const TIPOS_EVENTO = ["Entrega","Visita","Cobrar","Llamar","Otra"];
const TIPO_COLOR = { Entrega:C.musgo, Visita:"#7B6FA0", Cobrar:C.terracota, Llamar:"#C1A048", Otra:C.gris };

// ─── INICIO ─────────────────────────────────────────────────────
const Inicio = ({ productos, pedidos, ingredientes, clientes, eventos, onSaveEvento, onDeleteEvento }) => {
  const hoy = new Date();
  const [filtroVentas, setFiltroVentas] = useState("mes");
  const [rangoDesde, setRangoDesde] = useState("");
  const [rangoHasta, setRangoHasta] = useState("");
  const [mesCalendario, setMesCalendario] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [modalEvento, setModalEvento] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [formEvento, setFormEvento] = useState({ fecha:"", cliente:"", tipo:"Entrega", nota:"" });

  const filtrarPedidos = () => {
    const ahora = new Date();
    return pedidos.filter(p => {
      const f = new Date(p.fecha);
      if (filtroVentas==="dia") return f.toDateString()===ahora.toDateString();
      if (filtroVentas==="semana") { const d=new Date(ahora); d.setDate(d.getDate()-7); return f>=d; }
      if (filtroVentas==="mes") return f.getMonth()===ahora.getMonth() && f.getFullYear()===ahora.getFullYear();
      if (filtroVentas==="rango" && rangoDesde && rangoHasta) return f>=new Date(rangoDesde) && f<=new Date(rangoHasta+"T23:59:59");
      return true;
    });
  };
  const pedidosFiltrados = filtrarPedidos();
  const ventasFiltradas = pedidosFiltrados.reduce((s,p)=>s+p.total,0);
  const stockBajo = ingredientes.filter(i=>i.stock<=i.minimo);
  const pendientes = pedidos.filter(p=>p.estado==="Pendiente");

  const year = mesCalendario.getFullYear();
  const month = mesCalendario.getMonth();
  const primerDia = new Date(year, month, 1).getDay();
  const diasMes = new Date(year, month+1, 0).getDate();
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const dias = ["D","L","M","M","J","V","S"];

  const eventosDelDia = (d) => {
    const fechaStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return eventos.filter(e=>e.fecha===fechaStr);
  };
  const abrirDia = (d) => {
    const fechaStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    setDiaSeleccionado({ d, fechaStr, eventos:eventosDelDia(d) });
  };
  const guardarEvento = async () => {
    if (!formEvento.cliente || !formEvento.fecha) return;
    const id = "ev_"+Date.now();
    await onSaveEvento({ ...formEvento, id });
    setModalEvento(false);
    setFormEvento({ fecha:"", cliente:"", tipo:"Entrega", nota:"" });
  };

  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${C.musgo},${C.musgoClaro})`, borderRadius:16, padding:"22px 22px 26px", marginBottom:18, color:C.crema }}>
        <div style={{ fontFamily:"Georgia", fontSize:10, letterSpacing:3, opacity:.7, textTransform:"uppercase", marginBottom:4 }}>Bienvenida</div>
        <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:26, marginBottom:3 }}>Feraz</div>
        <div style={{ fontFamily:"Georgia", fontSize:12, opacity:.8 }}>Aromaterapia · Colección Raíces de Otoño</div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:8, opacity:.7 }}>
          <Icon name="sync" size={12} color={C.crema}/>
          <span style={{ fontFamily:"Georgia", fontSize:10, letterSpacing:1 }}>SINCRONIZADO · FIREBASE</span>
        </div>
      </div>

      <Card>
        <div style={{ fontFamily:"Georgia", fontSize:11, color:C.gris, letterSpacing:1, marginBottom:10, textTransform:"uppercase" }}>Ventas</div>
        <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
          {["dia","semana","mes","rango"].map(f=>(
            <button key={f} onClick={()=>setFiltroVentas(f)} style={{ background:filtroVentas===f?C.musgo:C.neutral, color:filtroVentas===f?C.crema:C.noche, border:"none", borderRadius:20, padding:"5px 14px", fontFamily:"Georgia", fontSize:12, cursor:"pointer" }}>
              {f==="dia"?"Hoy":f==="semana"?"Semana":f==="mes"?"Este mes":"Rango"}
            </button>
          ))}
        </div>
        {filtroVentas==="rango" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            <Input label="Desde" type="date" value={rangoDesde} onChange={setRangoDesde}/>
            <Input label="Hasta" type="date" value={rangoHasta} onChange={setRangoHasta}/>
          </div>
        )}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div style={{ background:C.crema, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:11, fontFamily:"Georgia", color:C.gris }}>Total ventas</div>
            <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:22, color:C.musgo }}>${ventasFiltradas.toLocaleString("es-CL")}</div>
          </div>
          <div style={{ background:C.crema, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:11, fontFamily:"Georgia", color:C.gris }}>Pedidos</div>
            <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:22, color:C.musgo }}>{pedidosFiltrados.length}</div>
          </div>
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        {[
          { label:"Pendientes", value:pendientes.length, color:C.terracota },
          { label:"Alertas stock", value:stockBajo.length, color:stockBajo.length>0?C.terracota:C.musgo },
          { label:"Productos", value:productos.reduce((s,p)=>s+p.stock,0)+" u.", color:C.musgo },
          { label:"Clientes", value:clientes.length, color:C.musgo },
        ].map((s,i)=>(
          <Card key={i} style={{ padding:"14px 16px", marginBottom:0 }}>
            <div style={{ fontSize:11, fontFamily:"Georgia", color:C.gris, letterSpacing:1, marginBottom:4 }}>{s.label}</div>
            <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:22, color:s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {stockBajo.length>0 && (
        <Card style={{ borderLeft:`4px solid ${C.terracota}`, background:C.terracota+"0D", marginBottom:14 }}>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
            <Icon name="warning" size={16} color={C.terracota}/>
            <span style={{ fontFamily:"Georgia", fontSize:13, color:C.terracota, fontWeight:600 }}>Stock bajo</span>
          </div>
          {stockBajo.map(i=>(
            <div key={i.id} style={{ fontSize:12, fontFamily:"Georgia", color:C.noche, padding:"2px 0" }}>{i.nombre} — {i.stock}{i.unidad} (mín. {i.minimo}{i.unidad})</div>
          ))}
        </Card>
      )}

      {/* CALENDARIO */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Icon name="calendar" size={16} color={C.musgo}/>
            <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:16, color:C.noche }}>{meses[month]} {year}</span>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <button onClick={()=>setMesCalendario(new Date(year,month-1,1))} style={{ background:C.neutral, border:"none", borderRadius:6, width:28, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="chevronLeft" size={14} color={C.noche}/></button>
            <button onClick={()=>setMesCalendario(new Date(year,month+1,1))} style={{ background:C.neutral, border:"none", borderRadius:6, width:28, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="chevronRight" size={14} color={C.noche}/></button>
            <Btn small onClick={()=>{ setFormEvento({ fecha:`${year}-${String(month+1).padStart(2,"0")}-${String(hoy.getDate()).padStart(2,"0")}`, cliente:"", tipo:"Entrega", nota:"" }); setModalEvento(true); }}>
              <Icon name="plus" size={13}/> Evento
            </Btn>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
          {dias.map((d,i)=><div key={i} style={{ textAlign:"center", fontSize:10, fontFamily:"Georgia", color:C.gris, padding:"2px 0" }}>{d}</div>)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
          {Array(primerDia===0?6:primerDia-1).fill(null).map((_,i)=><div key={"e"+i}/>)}
          {Array.from({length:diasMes},(_,i)=>i+1).map(d=>{
            const evs=eventosDelDia(d);
            const esHoy=d===hoy.getDate()&&month===hoy.getMonth()&&year===hoy.getFullYear();
            return (
              <div key={d} onClick={()=>abrirDia(d)} style={{ borderRadius:8, padding:"4px 2px", minHeight:38, cursor:"pointer", background:esHoy?C.musgo+"22":evs.length>0?C.crema:"transparent", border:esHoy?`1.5px solid ${C.musgo}`:`1px solid ${C.neutral}55` }}>
                <div style={{ textAlign:"center", fontSize:11, fontFamily:"Georgia", color:esHoy?C.musgo:C.noche, fontWeight:esHoy?"bold":"normal" }}>{d}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:2, justifyContent:"center", marginTop:2 }}>
                  {evs.slice(0,3).map((e,i)=><div key={i} style={{ width:6, height:6, borderRadius:"50%", background:TIPO_COLOR[e.tipo]||C.gris }}/>)}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:10, marginTop:10, flexWrap:"wrap" }}>
          {TIPOS_EVENTO.map(t=>(
            <div key={t} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:TIPO_COLOR[t] }}/>
              <span style={{ fontSize:10, fontFamily:"Georgia", color:C.gris }}>{t}</span>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={!!diaSeleccionado} onClose={()=>setDiaSeleccionado(null)} title={diaSeleccionado?`${diaSeleccionado.d} de ${meses[month]}`:""}>
        {diaSeleccionado?.eventos.length===0 && <p style={{ fontFamily:"Georgia", fontSize:13, color:C.gris, fontStyle:"italic" }}>Sin eventos este día.</p>}
        {diaSeleccionado?.eventos.map(e=>(
          <div key={e.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"10px 0", borderBottom:`1px solid ${C.neutral}` }}>
            <div>
              <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                <Badge color={TIPO_COLOR[e.tipo]}>{e.tipo}</Badge>
                <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:15, color:C.noche }}>{e.cliente}</span>
              </div>
              {e.nota && <div style={{ fontSize:12, fontFamily:"Georgia", color:C.gris, fontStyle:"italic" }}>{e.nota}</div>}
            </div>
            <button onClick={async()=>{ await onDeleteEvento(e.id); setDiaSeleccionado(prev=>({...prev,eventos:prev.eventos.filter(x=>x.id!==e.id)})); }} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Icon name="trash" size={15} color={C.terracota}/></button>
          </div>
        ))}
        <div style={{ marginTop:14 }}>
          <Btn onClick={()=>{ setFormEvento({ fecha:diaSeleccionado?.fechaStr||"", cliente:"", tipo:"Entrega", nota:"" }); setDiaSeleccionado(null); setModalEvento(true); }} style={{ width:"100%", justifyContent:"center" }}>
            <Icon name="plus" size={14}/> Agregar evento en este día
          </Btn>
        </div>
      </Modal>

      <Modal open={modalEvento} onClose={()=>setModalEvento(false)} title="Nuevo Evento">
        <Input label="Fecha" type="date" value={formEvento.fecha} onChange={v=>setFormEvento({...formEvento,fecha:v})}/>
        <Input label="Cliente" value={formEvento.cliente} onChange={v=>setFormEvento({...formEvento,cliente:v})} placeholder="Nombre del cliente"/>
        <Sel label="Tipo" value={formEvento.tipo} onChange={v=>setFormEvento({...formEvento,tipo:v})}>
          {TIPOS_EVENTO.map(t=><option key={t}>{t}</option>)}
        </Sel>
        <Input label="Nota" value={formEvento.nota} onChange={v=>setFormEvento({...formEvento,nota:v})} placeholder="Detalle del evento…"/>
        <Btn onClick={guardarEvento} style={{ width:"100%", justifyContent:"center", marginTop:8 }}>Guardar Evento</Btn>
      </Modal>
    </div>
  );
};

// ─── RECETARIO ───────────────────────────────────────────────────
const Recetario = ({ recetas, ingredientes, onSave }) => {
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre:"", tipo:"Bruma", volumen:"50ml", intencion:"", ingredientes:[], notas:"" });
  const [busqueda, setBusqueda] = useState("");
  const filtradas = recetas.filter(r=>r.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const addIng = () => {
    const first = ingredientes[0];
    setForm({...form, ingredientes:[...form.ingredientes, { id:first?.id||"", nombre:first?.nombre||"", cantidad:1, unidad:first?.unidad||"ml" }]});
  };
  const updateIng = (i, campo, val) => {
    const ings=[...form.ingredientes];
    if (campo==="id") {
      const ing=ingredientes.find(x=>x.id===val);
      ings[i]={ ...ings[i], id:val, nombre:ing?.nombre||"", unidad:ing?.unidad||"ml" };
    } else {
      ings[i]={ ...ings[i], [campo]:campo==="cantidad"?Number(val):val };
    }
    setForm({...form, ingredientes:ings});
  };
  const guardar = async () => {
    if (!form.nombre) return;
    const id = "r_"+Date.now();
    await onSave({ ...form, id });
    setModal(false);
    setForm({ nombre:"", tipo:"Bruma", volumen:"50ml", intencion:"", ingredientes:[], notas:"" });
  };

  return (
    <div>
      <SectionTitle icon="flask" title="Recetario" action={<Btn small onClick={()=>setModal(true)}><Icon name="plus" size={14}/> Nueva</Btn>}/>
      <Input placeholder="Buscar receta…" value={busqueda} onChange={setBusqueda}/>
      {filtradas.map(r=>(
        <Card key={r.id} style={{ cursor:"pointer" }} onClick={()=>setSel(sel?.id===r.id?null:r)}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:17, color:C.noche, marginBottom:4 }}>{r.nombre}</div>
              <div style={{ display:"flex", gap:6 }}>
                <Badge color={r.tipo==="Roll-on"?C.terracota:C.musgo}>{r.tipo}</Badge>
                <Badge color={C.gris}>{r.volumen}</Badge>
              </div>
            </div>
            <Icon name="chevronRight" size={16} color={C.gris}/>
          </div>
          {sel?.id===r.id && (
            <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.neutral}` }}>
              <div style={{ fontSize:12, color:C.gris, fontFamily:"Georgia", marginBottom:10, fontStyle:"italic" }}>{r.intencion}</div>
              <div style={{ fontSize:11, fontFamily:"Georgia", color:C.noche, fontWeight:600, marginBottom:8, letterSpacing:1 }}>INGREDIENTES</div>
              {r.ingredientes?.map((ing,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontFamily:"Georgia", color:C.noche, padding:"5px 0", borderBottom:`1px solid ${C.neutral}44` }}>
                  <span>{ing.nombre}</span>
                  <span style={{ color:C.musgo, fontWeight:600 }}>{ing.cantidad} {ing.unidad}</span>
                </div>
              ))}
              {r.notas && <div style={{ marginTop:10, fontSize:12, color:C.gris, fontFamily:"Georgia", fontStyle:"italic" }}>📝 {r.notas}</div>}
            </div>
          )}
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nueva Receta" wide>
        <Input label="Nombre" value={form.nombre} onChange={v=>setForm({...form,nombre:v})}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Sel label="Tipo" value={form.tipo} onChange={v=>setForm({...form,tipo:v})}><option>Bruma</option><option>Roll-on</option></Sel>
          <Input label="Volumen" value={form.volumen} onChange={v=>setForm({...form,volumen:v})} placeholder="50ml"/>
        </div>
        <Input label="Intención" value={form.intencion} onChange={v=>setForm({...form,intencion:v})} placeholder="Propósito de la fragancia"/>
        <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:8, textTransform:"uppercase" }}>Ingredientes</div>
        {form.ingredientes.map((ing,i)=>(
          <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 80px 36px", gap:8, marginBottom:8, alignItems:"flex-end" }}>
            <div>
              <div style={{ fontSize:10, color:C.gris, fontFamily:"Georgia", marginBottom:3 }}>INGREDIENTE</div>
              <select value={ing.id} onChange={e=>updateIng(i,"id",e.target.value)} style={{ width:"100%", border:`1.5px solid ${C.neutral}`, borderRadius:8, padding:"8px 10px", fontFamily:"Georgia", fontSize:13, color:C.noche, background:C.crema+"55" }}>
                {ingredientes.map(x=><option key={x.id} value={x.id}>{x.nombre}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:C.gris, fontFamily:"Georgia", marginBottom:3 }}>CANT. ({ing.unidad})</div>
              <input type="number" value={ing.cantidad} onChange={e=>updateIng(i,"cantidad",e.target.value)} min={0} step={0.5} style={{ width:"100%", boxSizing:"border-box", border:`1.5px solid ${C.neutral}`, borderRadius:8, padding:"8px 10px", fontFamily:"Georgia", fontSize:13, color:C.noche, background:C.crema+"55" }}/>
            </div>
            <button onClick={()=>setForm({...form,ingredientes:form.ingredientes.filter((_,idx)=>idx!==i)})} style={{ background:C.terracota+"22", border:`1px solid ${C.terracota}44`, borderRadius:8, height:36, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon name="x" size={14} color={C.terracota}/>
            </button>
          </div>
        ))}
        <Btn small outline onClick={addIng} style={{ marginBottom:14 }}><Icon name="plus" size={13}/> Agregar ingrediente</Btn>
        <Input label="Notas" value={form.notas} onChange={v=>setForm({...form,notas:v})} placeholder="Instrucciones de uso…"/>
        <Btn onClick={guardar} style={{ width:"100%", justifyContent:"center", marginTop:4 }}>Guardar Receta</Btn>
      </Modal>
    </div>
  );
};

// ─── INVENTARIO ──────────────────────────────────────────────────
const Inventario = ({ ingredientes, onSave, onUpdate }) => {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre:"", stock:0, unidad:"ml", minimo:10, costo:0, categoria:"Base" });
  const [catFiltro, setCatFiltro] = useState("Todos");
  const categorias = ["Todos",...new Set(ingredientes.map(i=>i.categoria))];
  const filtrados = catFiltro==="Todos" ? ingredientes : ingredientes.filter(i=>i.categoria===catFiltro);

  const guardar = async () => {
    if (!form.nombre) return;
    const id = "i_"+Date.now();
    await onSave({ ...form, id, stock:Number(form.stock), minimo:Number(form.minimo), costo:Number(form.costo) });
    setModal(false);
    setForm({ nombre:"", stock:0, unidad:"ml", minimo:10, costo:0, categoria:"Base" });
  };
  const ajustar = async (ing, delta) => {
    await onUpdate({ ...ing, stock:Math.max(0, ing.stock+delta) });
  };

  return (
    <div>
      <SectionTitle icon="box" title="Inventario" action={<Btn small onClick={()=>setModal(true)}><Icon name="plus" size={14}/> Agregar</Btn>}/>
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        {categorias.map(c=><button key={c} onClick={()=>setCatFiltro(c)} style={{ background:catFiltro===c?C.musgo:C.neutral, color:catFiltro===c?C.crema:C.noche, border:"none", borderRadius:20, padding:"5px 14px", fontFamily:"Georgia", fontSize:12, cursor:"pointer" }}>{c}</button>)}
      </div>
      {filtrados.map(ing=>{
        const bajo=ing.stock<=ing.minimo;
        return (
          <Card key={ing.id} style={{ borderLeft:bajo?`4px solid ${C.terracota}`:`4px solid ${C.musgo}33` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:15, color:C.noche }}>{ing.nombre}</div>
                <div style={{ fontSize:11, fontFamily:"Georgia", color:C.gris, marginTop:2 }}>{ing.categoria} · Mín: {ing.minimo}{ing.unidad} · ${ing.costo?.toLocaleString("es-CL")}/u</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {bajo && <Icon name="warning" size={15} color={C.terracota}/>}
                <NumBtn onClick={()=>ajustar(ing,-10)} label="−"/>
                <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:17, color:bajo?C.terracota:C.musgo, minWidth:52, textAlign:"center" }}>{ing.stock}{ing.unidad}</span>
                <NumBtn onClick={()=>ajustar(ing,10)} label="+"/>
              </div>
            </div>
          </Card>
        );
      })}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nuevo Ingrediente">
        <Input label="Nombre" value={form.nombre} onChange={v=>setForm({...form,nombre:v})}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Input label="Stock inicial" type="number" value={form.stock} onChange={v=>setForm({...form,stock:v})}/>
          <Input label="Unidad" value={form.unidad} onChange={v=>setForm({...form,unidad:v})} placeholder="ml, g, u"/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Input label="Stock mínimo" type="number" value={form.minimo} onChange={v=>setForm({...form,minimo:v})}/>
          <Input label="Costo unitario ($)" type="number" value={form.costo} onChange={v=>setForm({...form,costo:v})}/>
        </div>
        <Sel label="Categoría" value={form.categoria} onChange={v=>setForm({...form,categoria:v})}>
          <option>Base</option><option>Mezcla</option><option>Esencial</option><option>Packaging</option>
        </Sel>
        <Btn onClick={guardar} style={{ width:"100%", justifyContent:"center", marginTop:4 }}>Guardar</Btn>
      </Modal>
    </div>
  );
};

// ─── CALCULADORA ─────────────────────────────────────────────────
const Calculadora = ({ recetas, ingredientes }) => {
  const [recetaSel, setRecetaSel] = useState(recetas[0]||null);
  const [unidades, setUnidades] = useState(1);
  useEffect(()=>{ if(recetas.length>0 && !recetaSel) setRecetaSel(recetas[0]); },[recetas]);

  const calcular = () => {
    if (!recetaSel) return [];
    return (recetaSel.ingredientes||[]).map(ing=>{
      const invIng = ingredientes.find(x=>x.id===ing.id)||ingredientes.find(x=>x.nombre===ing.nombre);
      const total = ing.cantidad*unidades;
      const stock = invIng?.stock||0;
      return { ...ing, total, suficiente:stock>=total, stock, costo:(invIng?.costo||0)*total, unidad:invIng?.unidad||ing.unidad };
    });
  };
  const resultado = calcular();
  const costoTotal = resultado.reduce((s,i)=>s+(i.costo||0),0);

  return (
    <div>
      <SectionTitle icon="calculator" title="Calculadora"/>
      <Card>
        <Sel label="Seleccionar Receta" value={recetaSel?.id||""} onChange={v=>setRecetaSel(recetas.find(r=>r.id===v))}>
          {recetas.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
        </Sel>
        <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:8, textTransform:"uppercase" }}>Cantidad a producir</div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <NumBtn onClick={()=>setUnidades(Math.max(1,unidades-1))} label="−"/>
          <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:28, color:C.musgo, minWidth:40, textAlign:"center" }}>{unidades}</span>
          <NumBtn onClick={()=>setUnidades(unidades+1)} label="+"/>
          <span style={{ fontFamily:"Georgia", fontSize:13, color:C.gris }}>× {recetaSel?.volumen}</span>
        </div>
      </Card>
      {resultado.length>0 && (
        <Card>
          <div style={{ fontSize:11, fontFamily:"Georgia", color:C.noche, fontWeight:600, marginBottom:12, letterSpacing:1 }}>INGREDIENTES NECESARIOS</div>
          {resultado.map((ing,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.neutral}` }}>
              <div>
                <div style={{ fontFamily:"Georgia", fontSize:13, color:C.noche }}>{ing.nombre}</div>
                <div style={{ fontSize:11, color:C.gris }}>Stock: {ing.stock}{ing.unidad}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:15, color:ing.suficiente?C.musgo:C.terracota }}>{ing.total}{ing.unidad}</div>
                <div style={{ display:"flex", alignItems:"center", gap:4, justifyContent:"flex-end" }}>
                  <Icon name={ing.suficiente?"check":"warning"} size={12} color={ing.suficiente?C.musgo:C.terracota}/>
                  <span style={{ fontSize:10, fontFamily:"Georgia", color:ing.suficiente?C.musgo:C.terracota }}>{ing.suficiente?"OK":"Sin stock"}</span>
                </div>
              </div>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12 }}>
            <span style={{ fontFamily:"Georgia", fontSize:13, color:C.gris }}>Costo estimado</span>
            <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:18, color:C.musgo }}>${costoTotal.toLocaleString("es-CL")}</span>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─── PEDIDOS ─────────────────────────────────────────────────────
const Pedidos = ({ pedidos, productos, onSave, onUpdate }) => {
  const [modal, setModal] = useState(false);
  const [filtro, setFiltro] = useState("Todos");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  const sigNum = (tipo) => {
    const nums = pedidos.filter(p=>p.tipodoc===tipo).map(p=>p.numero||0);
    return nums.length>0 ? Math.max(...nums)+1 : 1;
  };
  const [form, setForm] = useState({ tipodoc:"Pedido", numero:1, cliente:"", fecha:new Date().toISOString().split("T")[0], items:[], estado:"Pendiente" });

  const abrirModal = () => {
    setForm({ tipodoc:"Pedido", numero:sigNum("Pedido"), cliente:"", fecha:new Date().toISOString().split("T")[0], items:[], estado:"Pendiente" });
    setModal(true);
  };
  const cambiarTipoDoc = (t) => setForm(prev=>({...prev, tipodoc:t, numero:sigNum(t)}));

  const estados = ["Todos","Pendiente","En preparación","Entregado"];
  const tiposFiltro = ["Todos","Pedido","Cotización"];
  const filtrados = pedidos.filter(p=>{
    const matchE = filtro==="Todos"||p.estado===filtro;
    const matchT = filtroTipo==="Todos"||p.tipodoc===filtroTipo||((!p.tipodoc)&&filtroTipo==="Pedido");
    return matchE&&matchT;
  });

  const addItem = () => { const p=productos[0]; setForm({...form,items:[...form.items,{producto:p?.nombre||"",qty:1,precio:p?.precio||0}]}); };
  const updateItem = (i,campo,val) => {
    const items=[...form.items];
    if (campo==="producto") { const prod=productos.find(p=>p.nombre===val); items[i]={...items[i],producto:val,precio:prod?.precio||items[i].precio}; }
    else items[i]={...items[i],[campo]:Number(val)};
    setForm({...form,items});
  };
  const calcTotal = items => items.reduce((s,it)=>s+(it.precio||0)*it.qty,0);

  const guardar = async () => {
    if (!form.cliente) return;
    const prefijo = form.tipodoc==="Cotización"?"COT":"PED";
    const id = `${prefijo}-${String(form.numero).padStart(4,"0")}`;
    await onSave({ ...form, id, total:calcTotal(form.items) });
    setModal(false);
  };
  const cambiarEstado = async (p, estado) => await onUpdate({...p, estado});

  return (
    <div>
      <SectionTitle icon="cart" title="Pedidos" action={<Btn small onClick={abrirModal}><Icon name="plus" size={14}/> Nuevo</Btn>}/>
      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
        {tiposFiltro.map(t=><button key={t} onClick={()=>setFiltroTipo(t)} style={{ background:filtroTipo===t?C.noche:C.neutral, color:filtroTipo===t?C.crema:C.noche, border:"none", borderRadius:20, padding:"4px 12px", fontFamily:"Georgia", fontSize:11, cursor:"pointer" }}>{t}</button>)}
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
        {estados.map(e=><button key={e} onClick={()=>setFiltro(e)} style={{ background:filtro===e?C.musgo:C.neutral, color:filtro===e?C.crema:C.noche, border:"none", borderRadius:20, padding:"4px 12px", fontFamily:"Georgia", fontSize:11, cursor:"pointer" }}>{e}</button>)}
      </div>
      {filtrados.map(p=>{
        const esCot = p.tipodoc==="Cotización";
        return (
          <Card key={p.id}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:3 }}>
                  <Badge color={esCot?"#7B6FA0":C.musgo}>{esCot?"📋 Cotización":"🛒 Pedido"}</Badge>
                  <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:13, color:C.musgo }}>{p.id}</span>
                </div>
                <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:16, color:C.noche }}>{p.cliente}</div>
                <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia" }}>{p.fecha}</div>
              </div>
              <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:17, color:C.musgo }}>${p.total?.toLocaleString("es-CL")}</div>
            </div>
            <div style={{ marginBottom:10 }}>
              {p.items?.map((it,i)=>(
                <div key={i} style={{ fontSize:12, fontFamily:"Georgia", color:C.noche, padding:"2px 0", display:"flex", justifyContent:"space-between" }}>
                  <span>• {it.qty}× {it.producto}</span>
                  <span style={{ color:C.gris }}>${((it.precio||0)*it.qty).toLocaleString("es-CL")}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <Badge color={p.estado==="Entregado"?C.musgo:p.estado==="Pendiente"?C.terracota:"#C1A048"}>{p.estado}</Badge>
              <div style={{ display:"flex", gap:6 }}>
                {p.estado==="Pendiente" && <Btn small onClick={()=>cambiarEstado(p,"En preparación")} color={C.terracota}>Preparar</Btn>}
                {p.estado==="En preparación" && <Btn small onClick={()=>cambiarEstado(p,"Entregado")}>Entregar</Btn>}
              </div>
            </div>
          </Card>
        );
      })}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nuevo Documento" wide>
        <SelectorDocumento tipo={form.tipodoc} numero={form.numero} onTipo={cambiarTipoDoc} onNumero={v=>setForm({...form,numero:v})}/>
        <Input label="Cliente" value={form.cliente} onChange={v=>setForm({...form,cliente:v})} placeholder="Nombre del cliente"/>
        <Input label="Fecha" type="date" value={form.fecha} onChange={v=>setForm({...form,fecha:v})}/>
        <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:8, textTransform:"uppercase" }}>Productos</div>
        {form.items.map((it,i)=>(
          <div key={i} style={{ background:C.crema+"66", borderRadius:10, padding:10, marginBottom:8 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 80px", gap:8, marginBottom:6 }}>
              <div>
                <div style={{ fontSize:10, color:C.gris, fontFamily:"Georgia", marginBottom:3 }}>PRODUCTO</div>
                <select value={it.producto} onChange={e=>updateItem(i,"producto",e.target.value)} style={{ width:"100%", border:`1.5px solid ${C.neutral}`, borderRadius:8, padding:"7px 10px", fontFamily:"Georgia", fontSize:13, color:C.noche, background:C.blanco }}>
                  {productos.map(p=><option key={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:10, color:C.gris, fontFamily:"Georgia", marginBottom:3 }}>CANT.</div>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <button onClick={()=>updateItem(i,"qty",Math.max(1,it.qty-1))} style={{ background:C.neutral, border:"none", borderRadius:6, width:26, height:32, cursor:"pointer", fontSize:16 }}>−</button>
                  <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:16, color:C.musgo, minWidth:20, textAlign:"center" }}>{it.qty}</span>
                  <button onClick={()=>updateItem(i,"qty",it.qty+1)} style={{ background:C.musgo, border:"none", borderRadius:6, width:26, height:32, cursor:"pointer", fontSize:14, color:C.crema }}>+</button>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, fontFamily:"Georgia", color:C.gris }}>Precio $</span>
                <input type="number" value={it.precio} onChange={e=>updateItem(i,"precio",e.target.value)} style={{ width:90, border:`1.5px solid ${C.neutral}`, borderRadius:6, padding:"4px 8px", fontFamily:"Georgia", fontSize:13, color:C.musgo, background:C.blanco }}/>
              </div>
              <button onClick={()=>setForm({...form,items:form.items.filter((_,idx)=>idx!==i)})} style={{ background:"none", border:"none", cursor:"pointer" }}><Icon name="x" size={15} color={C.terracota}/></button>
            </div>
          </div>
        ))}
        <Btn small outline onClick={addItem} style={{ marginBottom:12 }}><Icon name="plus" size={13}/> Agregar producto</Btn>
        <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderTop:`1px solid ${C.neutral}`, marginBottom:12 }}>
          <span style={{ fontFamily:"Georgia", fontSize:13, color:C.gris }}>Total</span>
          <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:20, color:C.musgo }}>${calcTotal(form.items).toLocaleString("es-CL")}</span>
        </div>
        <Btn onClick={guardar} style={{ width:"100%", justifyContent:"center" }}>
          Guardar {form.tipodoc} {form.tipodoc==="Cotización"?"COT":"PED"}-{String(form.numero).padStart(4,"0")}
        </Btn>
      </Modal>
    </div>
  );
};

// ─── STOCK PRODUCTOS ─────────────────────────────────────────────
const StockProductos = ({ productos, onSave, onUpdate }) => {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre:"", tipo:"Bruma", stock:0, precio:0, costo:0 });

  const guardar = async () => {
    if (!form.nombre) return;
    const id = "p_"+Date.now();
    await onSave({ ...form, id, stock:Number(form.stock), precio:Number(form.precio), costo:Number(form.costo) });
    setModal(false);
    setForm({ nombre:"", tipo:"Bruma", stock:0, precio:0, costo:0 });
  };
  const ajustar = async (p, delta) => await onUpdate({...p, stock:Math.max(0,p.stock+delta)});
  const actualizarCampo = async (p, campo, val) => await onUpdate({...p, [campo]:Number(val)});

  return (
    <div>
      <SectionTitle icon="package" title="Stock de Productos" action={<Btn small onClick={()=>setModal(true)}><Icon name="plus" size={14}/> Agregar</Btn>}/>
      {productos.map(p=>{
        const margen = p.precio>0?Math.round((p.precio-p.costo)/p.precio*100):0;
        const editandoEste = editando===p.id;
        return (
          <Card key={p.id}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div>
                <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:16, color:C.noche }}>{p.nombre}</div>
                <div style={{ display:"flex", gap:6, marginTop:4 }}>
                  <Badge color={p.tipo==="Roll-on"?C.terracota:C.musgo}>{p.tipo}</Badge>
                  <Badge color={C.gris}>Margen {margen}%</Badge>
                </div>
              </div>
              <button onClick={()=>setEditando(editandoEste?null:p.id)} style={{ background:editandoEste?C.musgo:C.neutral, border:"none", borderRadius:8, padding:"5px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                <Icon name="edit" size={13} color={editandoEste?C.crema:C.noche}/>
                <span style={{ fontSize:11, fontFamily:"Georgia", color:editandoEste?C.crema:C.noche }}>Editar</span>
              </button>
            </div>
            {editandoEste ? (
              <div style={{ background:C.crema+"66", borderRadius:10, padding:12, marginBottom:10 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <div style={{ fontSize:10, color:C.gris, fontFamily:"Georgia", marginBottom:4 }}>PRECIO VENTA ($)</div>
                    <input type="number" value={p.precio} onChange={e=>actualizarCampo(p,"precio",e.target.value)} style={{ width:"100%", boxSizing:"border-box", border:`1.5px solid ${C.musgo}`, borderRadius:8, padding:"8px 10px", fontFamily:"Palatino Linotype, Palatino, serif", fontSize:15, color:C.musgo, background:C.blanco }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:C.gris, fontFamily:"Georgia", marginBottom:4 }}>COSTO ($)</div>
                    <input type="number" value={p.costo} onChange={e=>actualizarCampo(p,"costo",e.target.value)} style={{ width:"100%", boxSizing:"border-box", border:`1.5px solid ${C.neutral}`, borderRadius:8, padding:"8px 10px", fontFamily:"Georgia", fontSize:13, color:C.noche, background:C.blanco }}/>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", gap:12, marginBottom:10 }}>
                <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:16, color:C.musgo }}>${p.precio?.toLocaleString("es-CL")}</div>
                <div style={{ fontSize:12, color:C.gris, fontFamily:"Georgia", paddingTop:2 }}>Costo: ${p.costo?.toLocaleString("es-CL")}</div>
              </div>
            )}
            <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"flex-end" }}>
              <NumBtn onClick={()=>ajustar(p,-1)} label="−"/>
              <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:20, color:p.stock<=2?C.terracota:C.musgo, minWidth:30, textAlign:"center" }}>{p.stock}</span>
              <NumBtn onClick={()=>ajustar(p,+1)} label="+"/>
              <span style={{ fontSize:12, fontFamily:"Georgia", color:C.gris }}>unidades</span>
            </div>
          </Card>
        );
      })}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nuevo Producto">
        <Input label="Nombre" value={form.nombre} onChange={v=>setForm({...form,nombre:v})}/>
        <Sel label="Tipo" value={form.tipo} onChange={v=>setForm({...form,tipo:v})}><option>Bruma</option><option>Roll-on</option></Sel>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          <Input label="Stock" type="number" value={form.stock} onChange={v=>setForm({...form,stock:v})}/>
          <Input label="Precio $" type="number" value={form.precio} onChange={v=>setForm({...form,precio:v})}/>
          <Input label="Costo $" type="number" value={form.costo} onChange={v=>setForm({...form,costo:v})}/>
        </div>
        <Btn onClick={guardar} style={{ width:"100%", justifyContent:"center", marginTop:4 }}>Guardar</Btn>
      </Modal>
    </div>
  );
};

// ─── CLIENTES ─────────────────────────────────────────────────────
const Clientes = ({ clientes, onSave }) => {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre:"", email:"", telefono:"", notas:"" });
  const [sel, setSel] = useState(null);

  const guardar = async () => {
    if (!form.nombre) return;
    const id = "c_"+Date.now();
    await onSave({ ...form, id, compras:0, totalGastado:0 });
    setModal(false);
    setForm({ nombre:"", email:"", telefono:"", notas:"" });
  };

  return (
    <div>
      <SectionTitle icon="users" title="Clientes" action={<Btn small onClick={()=>setModal(true)}><Icon name="plus" size={14}/> Agregar</Btn>}/>
      {clientes.map(c=>(
        <Card key={c.id} style={{ cursor:"pointer" }} onClick={()=>setSel(sel?.id===c.id?null:c)}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <div style={{ width:42, height:42, borderRadius:"50%", background:C.musgo, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Palatino Linotype, Palatino, serif", fontSize:15, color:C.crema, flexShrink:0 }}>
                {c.nombre.split(" ").map(n=>n[0]).join("").slice(0,2)}
              </div>
              <div>
                <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:16, color:C.noche }}>{c.nombre}</div>
                <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia" }}>{c.compras} compra{c.compras!==1?"s":""} · ${c.totalGastado?.toLocaleString("es-CL")}</div>
              </div>
            </div>
            <Icon name="chevronRight" size={16} color={C.gris}/>
          </div>
          {sel?.id===c.id && (
            <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.neutral}` }}>
              {c.email && <div style={{ fontSize:13, fontFamily:"Georgia", color:C.noche, marginBottom:4 }}>✉ {c.email}</div>}
              {c.telefono && <div style={{ fontSize:13, fontFamily:"Georgia", color:C.noche, marginBottom:4 }}>📞 {c.telefono}</div>}
              {c.notas && <div style={{ fontSize:12, fontFamily:"Georgia", color:C.gris, fontStyle:"italic", marginTop:6 }}>💬 {c.notas}</div>}
            </div>
          )}
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nuevo Cliente">
        <Input label="Nombre completo" value={form.nombre} onChange={v=>setForm({...form,nombre:v})}/>
        <Input label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})}/>
        <Input label="Teléfono" value={form.telefono} onChange={v=>setForm({...form,telefono:v})} placeholder="+56 9 XXXX XXXX"/>
        <Input label="Notas" value={form.notas} onChange={v=>setForm({...form,notas:v})} placeholder="Preferencias, historial…"/>
        <Btn onClick={guardar} style={{ width:"100%", justifyContent:"center", marginTop:4 }}>Guardar Cliente</Btn>
      </Modal>
    </div>
  );
};

// ─── ETIQUETAS ───────────────────────────────────────────────────
const Etiquetas = () => {
  const fileRef = useRef({});
  const [imagenes, setImagenes] = useState({});
  const etiquetas = [
    { key:"noche", nombre:"Noche Serena", fondo:C.musgo, texto:C.crema, tipo:"BRUMA AMBIENTAL" },
    { key:"refugio", nombre:"Refugio de Invierno", fondo:C.terracota, texto:C.crema, tipo:"BRUMA AMBIENTAL" },
    { key:"jardin", nombre:"Jardín de Agua", fondo:C.crema, texto:C.noche, tipo:"BRUMA AMBIENTAL" },
    { key:"paz", nombre:"Paz Interior", fondo:C.noche, texto:C.crema, tipo:"BRUMA AMBIENTAL" },
    { key:"sueno", nombre:"Sueño del Bosque", fondo:C.neutral, texto:C.noche, tipo:"ROLL-ON" },
  ];
  const handleFile = (key, e) => {
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>setImagenes(prev=>({...prev,[key]:ev.target.result}));
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <SectionTitle icon="tag" title="Etiquetas"/>
      <p style={{ fontFamily:"Georgia", fontSize:12, color:C.gris, marginBottom:16 }}>Vista previa · Sube tu imagen para cada etiqueta</p>
      {etiquetas.map(et=>{
        const img=imagenes[et.key];
        return (
          <Card key={et.key} style={{ background:et.fondo, border:"none", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"Georgia", fontSize:9, letterSpacing:4, color:et.texto, opacity:.6, textTransform:"uppercase", marginBottom:5 }}>FERAZ · {et.tipo}</div>
                <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:20, color:et.texto, letterSpacing:1, lineHeight:1.2 }}>{et.nombre}</div>
                <div style={{ fontFamily:"Georgia", fontSize:9, letterSpacing:2, color:et.texto, opacity:.55, marginTop:5 }}>DESDE 2025 · 50 ML</div>
                <div style={{ marginTop:10 }}>
                  <input ref={el=>fileRef.current[et.key]=el} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleFile(et.key,e)}/>
                  <button onClick={()=>fileRef.current[et.key]?.click()} style={{ background:et.texto+"22", border:`1px solid ${et.texto}44`, borderRadius:8, padding:"5px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                    <Icon name="upload" size={13} color={et.texto}/>
                    <span style={{ fontFamily:"Georgia", fontSize:11, color:et.texto }}>{img?"Cambiar":"Subir imagen"}</span>
                  </button>
                  {img && <button onClick={()=>setImagenes(prev=>{const n={...prev};delete n[et.key];return n;})} style={{ background:"none", border:"none", cursor:"pointer", marginTop:4, fontFamily:"Georgia", fontSize:10, color:et.texto, opacity:.6 }}>✕ Quitar</button>}
                </div>
              </div>
              <div style={{ width:70, height:80, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", borderRadius:8 }}>
                {img ? <img src={img} alt={et.nombre} style={{ width:70, height:80, objectFit:"cover", borderRadius:8 }}/> : <div style={{ fontSize:28 }}>🌿</div>}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ─── APP PRINCIPAL ───────────────────────────────────────────────
export default function FerazApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modulo, setModulo] = useState("inicio");
  const [seeded, setSeeded] = useState(false);

  const [recetas,      , readyR] = useCollection("recetas");
  const [ingredientes, , readyI] = useCollection("ingredientes");
  const [productos,    , readyP]   = useCollection("productos");
  const [pedidos,      , readyPed] = useCollection("pedidos");
  const [clientes,     , readyC]   = useCollection("clientes");
  const [eventos,      , readyE]   = useCollection("eventos");

  const allReady = readyR && readyI && readyP && readyPed && readyC && readyE;

  useEffect(() => {
    if (!allReady || seeded) return;
    const doSeed = async () => {
      if (recetas.length===0) for (const r of seedRecetas) await upsert("recetas", r.id, r);
      if (ingredientes.length===0) for (const i of seedIngredientes) await upsert("ingredientes", i.id, i);
      if (productos.length===0) for (const p of seedProductos) await upsert("productos", p.id, p);
      if (pedidos.length===0) for (const p of seedPedidos) await upsert("pedidos", p.id, p);
      if (clientes.length===0) for (const c of seedClientes) await upsert("clientes", c.id, c);
      if (eventos.length===0) for (const e of seedEventos) await upsert("eventos", e.id, e);
      setSeeded(true);
    };
    doSeed();
  }, [allReady]);

  const nav = [
    { id:"inicio",     label:"Inicio",         icon:"home" },
    { id:"recetario",  label:"Recetario",       icon:"flask" },
    { id:"inventario", label:"Inventario",      icon:"box" },
    { id:"calculadora",label:"Calculadora",     icon:"calculator" },
    { id:"pedidos",    label:"Pedidos",         icon:"cart" },
    { id:"stock",      label:"Stock Productos", icon:"package" },
    { id:"clientes",   label:"Clientes",        icon:"users" },
    { id:"etiquetas",  label:"Etiquetas",       icon:"tag" },
  ];

  if (!allReady) return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#F2E8D5", gap:16 }}>
      <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:32, color:"#4A5D23", letterSpacing:3 }}>FERAZ</div>
      <div style={{ fontFamily:"Georgia", fontSize:12, color:"#666", letterSpacing:2 }}>Conectando con Firebase…</div>
      <div style={{ width:40, height:40, border:"3px solid #E8DCC8", borderTop:"3px solid #4A5D23", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const renderModulo = () => {
    switch(modulo) {
      case "inicio":     return <Inicio productos={productos} pedidos={pedidos} ingredientes={ingredientes} clientes={clientes} eventos={eventos} onSaveEvento={e=>upsert("eventos",e.id,e)} onDeleteEvento={id=>remove("eventos",id)}/>;
      case "recetario":  return <Recetario recetas={recetas} ingredientes={ingredientes} onSave={r=>upsert("recetas",r.id,r)}/>;
      case "inventario": return <Inventario ingredientes={ingredientes} onSave={i=>upsert("ingredientes",i.id,i)} onUpdate={i=>upsert("ingredientes",i.id,i)}/>;
      case "calculadora":return <Calculadora recetas={recetas} ingredientes={ingredientes}/>;
      case "pedidos":    return <Pedidos pedidos={pedidos} productos={productos} onSave={p=>upsert("pedidos",p.id,p)} onUpdate={p=>upsert("pedidos",p.id,p)}/>;
      case "stock":      return <StockProductos productos={productos} onSave={p=>upsert("productos",p.id,p)} onUpdate={p=>upsert("productos",p.id,p)}/>;
      case "clientes":   return <Clientes clientes={clientes} onSave={c=>upsert("clientes",c.id,c)}/>;
      case "etiquetas":  return <Etiquetas/>;
      default:           return null;
    }
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:"#F2E8D5", fontFamily:"Georgia", overflow:"hidden" }}>
      {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(44,38,56,0.35)", zIndex:10 }}/>}
      <div style={{ position:"fixed", top:0, left:0, height:"100%", width:sidebarOpen?220:0, background:"#2C2638", zIndex:20, overflow:"hidden", transition:"width .28s cubic-bezier(.4,0,.2,1)", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"26px 20px 18px", borderBottom:"1px solid rgba(242,232,213,0.12)", minWidth:220 }}>
          <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:22, color:"#F2E8D5", letterSpacing:2 }}>FERAZ</div>
          <div style={{ fontFamily:"Georgia", fontSize:9, color:"#F2E8D5", opacity:.5, letterSpacing:3, marginTop:2 }}>AROMATERAPIA · FIREBASE</div>
        </div>
        <nav style={{ flex:1, padding:"10px 0", overflowY:"auto", minWidth:220 }}>
          {nav.map(item=>(
            <button key={item.id} onClick={()=>{ setModulo(item.id); setSidebarOpen(false); }} style={{ display:"flex", alignItems:"center", gap:14, width:"100%", padding:"13px 20px", background:modulo===item.id?"#4A5D2355":"transparent", border:"none", cursor:"pointer", borderLeft:modulo===item.id?"3px solid #C16748":"3px solid transparent", transition:"all .18s" }}>
              <Icon name={item.icon} size={18} color={modulo===item.id?"#F2E8D5":"#F2E8D588"}/>
              <span style={{ fontFamily:"Georgia", fontSize:13, color:modulo===item.id?"#F2E8D5":"#F2E8D588", letterSpacing:.5, whiteSpace:"nowrap" }}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding:"14px 20px", borderTop:"1px solid rgba(242,232,213,0.1)", minWidth:220 }}>
          <div style={{ fontFamily:"Georgia", fontSize:10, color:"#F2E8D5", opacity:.3, letterSpacing:2 }}>DESDE 2025 · SANTIAGO</div>
        </div>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <div style={{ background:"#4A5D23", padding:"14px 18px", display:"flex", alignItems:"center", gap:14, flexShrink:0, boxShadow:"0 2px 12px rgba(44,38,56,0.15)" }}>
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:4 }}>
            <Icon name="menu" size={22} color="#F2E8D5"/>
          </button>
          <div>
            <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:18, color:"#F2E8D5", letterSpacing:2 }}>FERAZ</div>
            <div style={{ fontFamily:"Georgia", fontSize:9, color:"#F2E8D5", opacity:.65, letterSpacing:3 }}>{nav.find(n=>n.id===modulo)?.label.toUpperCase()}</div>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"20px 16px 48px" }}>
          {renderModulo()}
        </div>
      </div>
    </div>
  );
}
