import { useState, useEffect, useRef } from "react";
import { upsert, remove, useFS } from "./firebase.js";

const C = { musgo:"#4A5D23", musgoClaro:"#5E7A2C", terracota:"#C16748", crema:"#F2E8D5", noche:"#2C2638", neutral:"#E8DCC8", gris:"#666666", blanco:"#FFFFFF" };

// ─── DATOS SEMILLA ──────────────────────────────────────────────
const sRecetas = [];
const sIngredientes = [];
const sProductos = [];
const sPedidos = [];
const sClientes = [];
const sEventos = [];

const FRASES = [
  "Cada aroma cuenta una historia 🌸", "El olfato es la memoria del alma 🌿",
  "Naturaleza destilada en cada gota 🍃", "Aromas que sanan y transforman 🌺",
  "El arte de los sentidos 🌼", "Fragancias que abrazan el espacio ✨",
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
    plus:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>,
    x:           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>,
    edit:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>,
    warning:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>,
    check:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>,
    chevronRight:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>,
    chevronLeft: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>,
    calendar:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>,
    upload:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>,
    trash:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>,
    save:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>,
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
const Btn = ({ children, onClick, color=C.musgo, small=false, outline=false, style={} }) => (
  <button onClick={onClick} style={{ background:outline?"transparent":color, color:outline?color:C.crema, border:`1.5px solid ${color}`, borderRadius:10, padding:small?"5px 13px":"9px 20px", fontSize:small?12:14, fontFamily:"Georgia", cursor:"pointer", display:"flex", alignItems:"center", gap:6, letterSpacing:.5, ...style }}>{children}</button>
);
const Input = ({ label, value, onChange, type="text", placeholder="" }) => (
  <div style={{ marginBottom:12 }}>
    {label && <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:4, textTransform:"uppercase" }}>{label}</div>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ width:"100%", boxSizing:"border-box", border:`1.5px solid ${C.neutral}`, borderRadius:8, padding:"9px 12px", fontFamily:"Georgia", fontSize:14, color:C.noche, background:C.crema+"55", outline:"none" }}/>
  </div>
);
const Sel = ({ label, value, onChange, children }) => (
  <div style={{ marginBottom:12 }}>
    {label && <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:4, textTransform:"uppercase" }}>{label}</div>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{ width:"100%", border:`1.5px solid ${C.neutral}`, borderRadius:8, padding:"9px 12px", fontFamily:"Georgia", fontSize:14, color:C.noche, background:C.crema+"55", boxSizing:"border-box" }}>{children}</select>
  </div>
);
const Modal = ({ open, onClose, title, children, wide=false }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,38,56,0.5)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.blanco, borderRadius:18, width:"100%", maxWidth:wide?600:480, maxHeight:"88vh", overflowY:"auto", boxShadow:"0 8px 40px rgba(44,38,56,0.28)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 22px 14px", borderBottom:`1px solid ${C.neutral}`, position:"sticky", top:0, background:C.blanco, zIndex:1 }}>
          <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:18, color:C.noche }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Icon name="x" size={20} color={C.gris}/></button>
        </div>
        <div style={{ padding:"18px 22px 22px" }}>{children}</div>
      </div>
    </div>
  );
};
const NumBtn = ({ onClick, label, color=C.neutral }) => (
  <button onClick={onClick} style={{ background:color, border:"none", borderRadius:8, width:34, height:34, cursor:"pointer", fontSize:20, color:color===C.musgo?C.crema:C.noche, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{label}</button>
);
const SectionTitle = ({ icon, title, action }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <Icon name={icon} size={20} color={C.musgo}/>
      <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:22, color:C.noche }}>{title}</span>
    </div>
    {action}
  </div>
);

const TIPOS_EVENTO = ["Entrega","Visita","Cobrar","Llamar","Otra"];
const TIPO_COLOR = { Entrega:C.musgo, Visita:"#7B6FA0", Cobrar:C.terracota, Llamar:"#C1A048", Otra:C.gris };
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// ─── INICIO ─────────────────────────────────────────────────────
const Inicio = ({ productos, pedidos, ingredientes, clientes, eventos, setEventos }) => {
  const hoy = new Date();
  const [filtroV, setFV] = useState("mes");
  const [rD, setRD] = useState(""); const [rH, setRH] = useState("");
  const [mes, setMes] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [modalEv, setModalEv] = useState(false);
  const [diaS, setDiaS] = useState(null);
  const [formEv, setFormEv] = useState({ fecha:"", clienteId:"", tipo:"Entrega", nota:"" });
  const fraseIdx = hoy.getDate() % FRASES.length;

  const year = mes.getFullYear(); const month = mes.getMonth();
  const primerDia = new Date(year,month,1).getDay();
  const diasMes = new Date(year,month+1,0).getDate();

  const filtrarP = () => pedidos.filter(p => {
    const f=new Date(p.fecha); const a=new Date();
    if (filtroV==="dia") return f.toDateString()===a.toDateString();
    if (filtroV==="semana") { const d=new Date(a); d.setDate(d.getDate()-7); return f>=d; }
    if (filtroV==="mes") return f.getMonth()===a.getMonth()&&f.getFullYear()===a.getFullYear();
    if (filtroV==="rango"&&rD&&rH) return f>=new Date(rD)&&f<=new Date(rH+"T23:59:59");
    return true;
  });
  const pF=filtrarP(); const vF=pF.reduce((s,p)=>s+p.total,0);
  const stockBajo=ingredientes.filter(i=>i.stock<=i.minimo);

  const evsDia = (d) => {
    const fs=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return eventos.filter(e=>e.fecha===fs);
  };
  const guardarEv = async () => {
    const cliente = clientes.find(c=>c.id===formEv.clienteId);
    if (!cliente||!formEv.fecha) return;
    const id="ev_"+Date.now();
    const nuevo={...formEv, id, cliente:cliente.nombre};
    await upsert("eventos",id,nuevo);
    setEventos(prev=>[...prev,nuevo]);
    setModalEv(false);
    setFormEv({ fecha:"", clienteId:"", tipo:"Entrega", nota:"" });
  };
  const eliminarEv = async (id) => {
    await remove("eventos",id);
    setEventos(prev=>prev.filter(e=>e.id!==id));
    setDiaS(prev=>prev?{...prev,evs:prev.evs.filter(e=>e.id!==id)}:null);
  };

  const diasSem = ["D","L","M","M","J","V","S"];
  const fechaHoy = hoy.toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"});

  return (
    <div>
      {/* Banner con fecha */}
      <div style={{ background:`linear-gradient(135deg,${C.musgo},${C.musgoClaro})`, borderRadius:16, padding:"22px 22px 26px", marginBottom:18, color:C.crema }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontFamily:"Georgia", fontSize:10, letterSpacing:3, opacity:.7, textTransform:"uppercase", marginBottom:4 }}>Bienvenida</div>
            <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:26, marginBottom:3 }}>Feraz</div>
            <div style={{ fontFamily:"Georgia", fontSize:12, opacity:.8 }}>{FRASES[fraseIdx]}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:22, color:C.crema, opacity:.9 }}>{hoy.getDate()}</div>
            <div style={{ fontFamily:"Georgia", fontSize:10, color:C.crema, opacity:.7, letterSpacing:1, textTransform:"capitalize" }}>{MESES[hoy.getMonth()]}</div>
            <div style={{ fontFamily:"Georgia", fontSize:10, color:C.crema, opacity:.6, letterSpacing:1, marginTop:2, textTransform:"capitalize" }}>{hoy.toLocaleDateString("es-CL",{weekday:"long"})}</div>
          </div>
        </div>
      </div>

      {/* Filtro ventas */}
      <Card>
        <div style={{ fontFamily:"Georgia", fontSize:11, color:C.gris, letterSpacing:1, marginBottom:10, textTransform:"uppercase" }}>Ventas</div>
        <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
          {["dia","semana","mes","rango"].map(f=>(
            <button key={f} onClick={()=>setFV(f)} style={{ background:filtroV===f?C.musgo:C.neutral, color:filtroV===f?C.crema:C.noche, border:"none", borderRadius:20, padding:"5px 14px", fontFamily:"Georgia", fontSize:12, cursor:"pointer" }}>
              {f==="dia"?"Hoy":f==="semana"?"Semana":f==="mes"?"Este mes":"Rango"}
            </button>
          ))}
        </div>
        {filtroV==="rango" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            <Input label="Desde" type="date" value={rD} onChange={setRD}/>
            <Input label="Hasta" type="date" value={rH} onChange={setRH}/>
          </div>
        )}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div style={{ background:C.crema, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:11, fontFamily:"Georgia", color:C.gris }}>Total ventas</div>
            <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:22, color:C.musgo }}>${vF.toLocaleString("es-CL")}</div>
          </div>
          <div style={{ background:C.crema, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:11, fontFamily:"Georgia", color:C.gris }}>Pedidos</div>
            <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:22, color:C.musgo }}>{pF.length}</div>
          </div>
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        <Card style={{ padding:"14px 16px", marginBottom:0 }}>
          <div style={{ fontSize:11, fontFamily:"Georgia", color:C.gris, marginBottom:4 }}>Stock bajo</div>
          <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:22, color:stockBajo.length>0?C.terracota:C.musgo }}>{stockBajo.length}</div>
        </Card>
        <Card style={{ padding:"14px 16px", marginBottom:0 }}>
          <div style={{ fontSize:11, fontFamily:"Georgia", color:C.gris, marginBottom:4 }}>Clientes</div>
          <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:22, color:C.musgo }}>{clientes.length}</div>
        </Card>
      </div>

      {/* Calendario */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Icon name="calendar" size={16} color={C.musgo}/>
            <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:16, color:C.noche }}>{MESES[month]} {year}</span>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <button onClick={()=>setMes(new Date(year,month-1,1))} style={{ background:C.neutral, border:"none", borderRadius:6, width:28, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="chevronLeft" size={14} color={C.noche}/></button>
            <button onClick={()=>setMes(new Date(year,month+1,1))} style={{ background:C.neutral, border:"none", borderRadius:6, width:28, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="chevronRight" size={14} color={C.noche}/></button>
            <Btn small onClick={()=>{ setFormEv({ fecha:`${year}-${String(month+1).padStart(2,"0")}-${String(hoy.getDate()).padStart(2,"0")}`, clienteId:clientes[0]?.id||"", tipo:"Entrega", nota:"" }); setModalEv(true); }}><Icon name="plus" size={13}/> Evento</Btn>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
          {diasSem.map((d,i)=><div key={i} style={{ textAlign:"center", fontSize:10, fontFamily:"Georgia", color:C.gris }}>{d}</div>)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
          {Array(primerDia===0?6:primerDia-1).fill(null).map((_,i)=><div key={"e"+i}/>)}
          {Array.from({length:diasMes},(_,i)=>i+1).map(d=>{
            const evs=evsDia(d);
            const esHoy=d===hoy.getDate()&&month===hoy.getMonth()&&year===hoy.getFullYear();
            return (
              <div key={d} onClick={()=>setDiaS({ d, fechaStr:`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`, evs:evsDia(d) })} style={{ borderRadius:8, padding:"4px 2px", minHeight:38, cursor:"pointer", background:esHoy?C.musgo+"22":evs.length>0?C.crema:"transparent", border:esHoy?`1.5px solid ${C.musgo}`:`1px solid ${C.neutral}55` }}>
                <div style={{ textAlign:"center", fontSize:11, fontFamily:"Georgia", color:esHoy?C.musgo:C.noche, fontWeight:esHoy?"bold":"normal" }}>{d}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:2, justifyContent:"center", marginTop:2 }}>
                  {evs.slice(0,3).map((e,i)=><div key={i} style={{ width:6, height:6, borderRadius:"50%", background:TIPO_COLOR[e.tipo]||C.gris }}/>)}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:10, marginTop:10, flexWrap:"wrap" }}>
          {TIPOS_EVENTO.map(t=><div key={t} style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:8, height:8, borderRadius:"50%", background:TIPO_COLOR[t] }}/><span style={{ fontSize:10, fontFamily:"Georgia", color:C.gris }}>{t}</span></div>)}
        </div>
      </Card>

      <Modal open={!!diaS} onClose={()=>setDiaS(null)} title={diaS?`${diaS.d} de ${MESES[month]}`:""}>
        {diaS?.evs.length===0 && <p style={{ fontFamily:"Georgia", fontSize:13, color:C.gris, fontStyle:"italic" }}>Sin eventos este día.</p>}
        {diaS?.evs.map(e=>(
          <div key={e.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"10px 0", borderBottom:`1px solid ${C.neutral}` }}>
            <div>
              <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}><Badge color={TIPO_COLOR[e.tipo]}>{e.tipo}</Badge><span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:15, color:C.noche }}>{e.cliente}</span></div>
              {e.nota && <div style={{ fontSize:12, fontFamily:"Georgia", color:C.gris, fontStyle:"italic" }}>{e.nota}</div>}
            </div>
            <button onClick={()=>eliminarEv(e.id)} style={{ background:"none", border:"none", cursor:"pointer" }}><Icon name="trash" size={15} color={C.terracota}/></button>
          </div>
        ))}
        <Btn onClick={()=>{ setFormEv({ fecha:diaS?.fechaStr||"", clienteId:clientes[0]?.id||"", tipo:"Entrega", nota:"" }); setDiaS(null); setModalEv(true); }} style={{ width:"100%", justifyContent:"center", marginTop:14 }}><Icon name="plus" size={14}/> Agregar evento</Btn>
      </Modal>

      <Modal open={modalEv} onClose={()=>setModalEv(false)} title="Nuevo Evento">
        <Input label="Fecha" type="date" value={formEv.fecha} onChange={v=>setFormEv({...formEv,fecha:v})}/>
        <Sel label="Cliente" value={formEv.clienteId} onChange={v=>setFormEv({...formEv,clienteId:v})}>
          <option value="">— Seleccionar cliente —</option>
          {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
        </Sel>
        <Sel label="Tipo" value={formEv.tipo} onChange={v=>setFormEv({...formEv,tipo:v})}>{TIPOS_EVENTO.map(t=><option key={t}>{t}</option>)}</Sel>
        <Input label="Nota" value={formEv.nota} onChange={v=>setFormEv({...formEv,nota:v})} placeholder="Detalle…"/>
        <Btn onClick={guardarEv} style={{ width:"100%", justifyContent:"center", marginTop:8 }}>Guardar Evento</Btn>
      </Modal>
    </div>
  );
};

// ─── RECETARIO ───────────────────────────────────────────────────
const Recetario = ({ recetas, setRecetas, ingredientes }) => {
  const [sel, setSel] = useState(null);
  const [editando, setEditando] = useState(null); // receta en modo edición
  const [modal, setModal] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({ nombre:"", tipo:"Bruma", volumen:"50ml", intencion:"", ingredientes:[], notas:"" });
  const filtradas = recetas.filter(r=>r.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const addIng = (f, setF) => { const x=ingredientes[0]; setF({...f, ingredientes:[...f.ingredientes,{id:x?.id||"",nombre:x?.nombre||"",cantidad:1,unidad:x?.unidad||"ml"}]}); };
  const updIng = (f, setF, i, campo, val) => {
    const ings=[...f.ingredientes];
    if(campo==="id"){ const x=ingredientes.find(x=>x.id===val); ings[i]={...ings[i],id:val,nombre:x?.nombre||"",unidad:x?.unidad||"ml"}; }
    else ings[i]={...ings[i],[campo]:campo==="cantidad"?Number(val):val};
    setF({...f,ingredientes:ings});
  };
  const guardar = async () => {
    if(!form.nombre) return;
    const id="r_"+Date.now(); const nuevo={...form,id};
    await upsert("recetas",id,nuevo);
    setRecetas(prev=>[...prev,nuevo]);
    setModal(false); setForm({nombre:"",tipo:"Bruma",volumen:"50ml",intencion:"",ingredientes:[],notas:""});
  };
  const guardarEdicion = async (r) => {
    await upsert("recetas",r.id,r);
    setRecetas(prev=>prev.map(x=>x.id===r.id?r:x));
    setEditando(null); setSel(r);
  };
  const eliminarReceta = async (id) => {
    await remove("recetas",id);
    setRecetas(prev=>prev.filter(x=>x.id!==id));
    setSel(null);
  };

  const FormIngredientes = ({ f, setF }) => (
    <>
      {f.ingredientes.map((ing,i)=>(
        <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 80px 36px", gap:8, marginBottom:8, alignItems:"flex-end" }}>
          <div>
            <div style={{ fontSize:10, color:C.gris, fontFamily:"Georgia", marginBottom:3 }}>INGREDIENTE</div>
            <select value={ing.id} onChange={e=>updIng(f,setF,i,"id",e.target.value)} style={{ width:"100%", border:`1.5px solid ${C.neutral}`, borderRadius:8, padding:"8px 10px", fontFamily:"Georgia", fontSize:13, color:C.noche, background:C.crema+"55" }}>
              {ingredientes.map(x=><option key={x.id} value={x.id}>{x.nombre}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:10, color:C.gris, fontFamily:"Georgia", marginBottom:3 }}>CANT. ({ing.unidad})</div>
            <input type="number" value={ing.cantidad} onChange={e=>updIng(f,setF,i,"cantidad",e.target.value)} min={0} step={0.5} style={{ width:"100%", boxSizing:"border-box", border:`1.5px solid ${C.neutral}`, borderRadius:8, padding:"8px 10px", fontFamily:"Georgia", fontSize:13 }}/>
          </div>
          <button onClick={()=>setF({...f,ingredientes:f.ingredientes.filter((_,idx)=>idx!==i)})} style={{ background:C.terracota+"22", border:`1px solid ${C.terracota}44`, borderRadius:8, height:36, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="x" size={14} color={C.terracota}/></button>
        </div>
      ))}
      <Btn small outline onClick={()=>addIng(f,setF)} style={{ marginBottom:14 }}><Icon name="plus" size={13}/> Ingrediente</Btn>
    </>
  );

  return (
    <div>
      <SectionTitle icon="flask" title="Recetario" action={<Btn small onClick={()=>setModal(true)}><Icon name="plus" size={14}/> Nueva</Btn>}/>
      <Input placeholder="Buscar receta…" value={busqueda} onChange={setBusqueda}/>

      {filtradas.map(r=>{
        const esSel = sel?.id===r.id;
        const esEdit = editando?.id===r.id;
        return (
          <Card key={r.id}>
            <div style={{ display:"flex", justifyContent:"space-between", cursor:"pointer" }} onClick={()=>{ if(!esEdit){ setSel(esSel?null:r); setEditando(null); } }}>
              <div>
                <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:17, color:C.noche, marginBottom:4 }}>{r.nombre}</div>
                <div style={{ display:"flex", gap:6 }}><Badge color={r.tipo==="Roll-on"?C.terracota:C.musgo}>{r.tipo}</Badge><Badge color={C.gris}>{r.volumen}</Badge></div>
              </div>
              <Icon name="chevronRight" size={16} color={C.gris}/>
            </div>

            {/* Vista expandida */}
            {esSel && !esEdit && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.neutral}` }}>
                <div style={{ fontSize:12, color:C.gris, fontFamily:"Georgia", marginBottom:10, fontStyle:"italic" }}>{r.intencion}</div>
                <div style={{ fontSize:11, fontFamily:"Georgia", color:C.noche, fontWeight:600, marginBottom:8, letterSpacing:1 }}>INGREDIENTES</div>
                {r.ingredientes?.map((ing,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontFamily:"Georgia", color:C.noche, padding:"5px 0", borderBottom:`1px solid ${C.neutral}44` }}>
                    <span>{ing.nombre}</span><span style={{ color:C.musgo, fontWeight:600 }}>{ing.cantidad} {ing.unidad}</span>
                  </div>
                ))}
                {r.notas && <div style={{ marginTop:10, fontSize:12, color:C.gris, fontFamily:"Georgia", fontStyle:"italic" }}>📝 {r.notas}</div>}
                <div style={{ display:"flex", gap:8, marginTop:14 }}>
                  <Btn small onClick={()=>setEditando({...r})} style={{ flex:1, justifyContent:"center" }}><Icon name="edit" size={13}/> Editar</Btn>
                  <Btn small onClick={()=>eliminarReceta(r.id)} color={C.terracota} style={{ flex:1, justifyContent:"center" }}><Icon name="trash" size={13}/> Eliminar</Btn>
                </div>
              </div>
            )}

            {/* Modo edición inline */}
            {esEdit && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.neutral}` }}>
                <Input label="Nombre" value={editando.nombre} onChange={v=>setEditando({...editando,nombre:v})}/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Sel label="Tipo" value={editando.tipo} onChange={v=>setEditando({...editando,tipo:v})}><option>Bruma</option><option>Roll-on</option></Sel>
                  <Input label="Volumen" value={editando.volumen} onChange={v=>setEditando({...editando,volumen:v})}/>
                </div>
                <Input label="Intención" value={editando.intencion} onChange={v=>setEditando({...editando,intencion:v})}/>
                <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:8, textTransform:"uppercase" }}>Ingredientes</div>
                <FormIngredientes f={editando} setF={setEditando}/>
                <Input label="Notas" value={editando.notas} onChange={v=>setEditando({...editando,notas:v})}/>
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  <Btn onClick={()=>guardarEdicion(editando)} style={{ flex:1, justifyContent:"center" }}><Icon name="save" size={14}/> Guardar</Btn>
                  <Btn outline onClick={()=>setEditando(null)} style={{ flex:1, justifyContent:"center" }}>Cancelar</Btn>
                </div>
              </div>
            )}
          </Card>
        );
      })}

      <Modal open={modal} onClose={()=>setModal(false)} title="Nueva Receta" wide>
        <Input label="Nombre" value={form.nombre} onChange={v=>setForm({...form,nombre:v})}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Sel label="Tipo" value={form.tipo} onChange={v=>setForm({...form,tipo:v})}><option>Bruma</option><option>Roll-on</option></Sel>
          <Input label="Volumen" value={form.volumen} onChange={v=>setForm({...form,volumen:v})} placeholder="50ml"/>
        </div>
        <Input label="Intención" value={form.intencion} onChange={v=>setForm({...form,intencion:v})}/>
        <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:8, textTransform:"uppercase" }}>Ingredientes</div>
        <FormIngredientes f={form} setF={setForm}/>
        <Input label="Notas" value={form.notas} onChange={v=>setForm({...form,notas:v})} placeholder="Instrucciones de uso…"/>
        <Btn onClick={guardar} style={{ width:"100%", justifyContent:"center", marginTop:4 }}>Guardar Receta</Btn>
      </Modal>
    </div>
  );
};

// ─── INVENTARIO + STOCK (MÓDULO UNIFICADO) ───────────────────────
const Almacen = ({ ingredientes, setIngredientes, productos, setProductos }) => {
  const [tab, setTab] = useState("ingredientes");
  const [modalIng, setModalIng] = useState(false);
  const [modalProd, setModalProd] = useState(false);
  const [editIngId, setEditIngId] = useState(null);
  const [editProdId, setEditProdId] = useState(null);
  const [catF, setCatF] = useState("Todos");
  const [formIng, setFormIng] = useState({ nombre:"", stock:0, unidad:"ml", minimo:10, costo:0, categoria:"Base" });
  const [formProd, setFormProd] = useState({ nombre:"", tipo:"Bruma", stock:0, precio:0, costo:0 });

  const cats = ["Todos",...new Set(ingredientes.map(i=>i.categoria))];
  const filtrados = catF==="Todos"?ingredientes:ingredientes.filter(i=>i.categoria===catF);

  // Ingredientes CRUD
  const ajustarIng = async (ing,delta) => {
    const u={...ing,stock:Math.max(0,ing.stock+delta)};
    await upsert("ingredientes",ing.id,u);
    setIngredientes(prev=>prev.map(x=>x.id===ing.id?u:x));
  };
  const guardarIng = async () => {
    if(!formIng.nombre) return;
    const id="i_"+Date.now(); const n={...formIng,id,stock:Number(formIng.stock),minimo:Number(formIng.minimo),costo:Number(formIng.costo)};
    await upsert("ingredientes",id,n);
    setIngredientes(prev=>[...prev,n]);
    setModalIng(false); setFormIng({nombre:"",stock:0,unidad:"ml",minimo:10,costo:0,categoria:"Base"});
  };
  const guardarEdIng = async (ing) => {
    await upsert("ingredientes",ing.id,ing);
    setIngredientes(prev=>prev.map(x=>x.id===ing.id?ing:x));
    setEditIngId(null);
  };
  const eliminarIng = async (id) => {
    await remove("ingredientes",id);
    setIngredientes(prev=>prev.filter(x=>x.id!==id));
  };

  // Productos CRUD
  const ajustarProd = async (p,delta) => {
    const u={...p,stock:Math.max(0,p.stock+delta)};
    await upsert("productos",p.id,u);
    setProductos(prev=>prev.map(x=>x.id===p.id?u:x));
  };
  const guardarProd = async () => {
    if(!formProd.nombre) return;
    const id="p_"+Date.now(); const n={...formProd,id,stock:Number(formProd.stock),precio:Number(formProd.precio),costo:Number(formProd.costo)};
    await upsert("productos",id,n);
    setProductos(prev=>[...prev,n]);
    setModalProd(false); setFormProd({nombre:"",tipo:"Bruma",stock:0,precio:0,costo:0});
  };
  const guardarEdProd = async (p) => {
    await upsert("productos",p.id,p);
    setProductos(prev=>prev.map(x=>x.id===p.id?p:x));
    setEditProdId(null);
  };
  const eliminarProd = async (id) => {
    await remove("productos",id);
    setProductos(prev=>prev.filter(x=>x.id!==id));
  };

  return (
    <div>
      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[["ingredientes","Ingredientes"],["productos","Productos"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"12px 0", borderRadius:12, border:`2px solid ${tab===id?C.musgo:C.neutral}`, background:tab===id?C.musgo:C.blanco, color:tab===id?C.crema:C.gris, fontFamily:"Palatino Linotype, Palatino, serif", fontSize:15, cursor:"pointer", transition:"all .2s" }}>{label}</button>
        ))}
      </div>

      {/* INGREDIENTES */}
      {tab==="ingredientes" && (
        <div>
          <SectionTitle icon="box" title="Ingredientes" action={<Btn small onClick={()=>setModalIng(true)}><Icon name="plus" size={14}/> Agregar</Btn>}/>
          <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
            {cats.map(c=><button key={c} onClick={()=>setCatF(c)} style={{ background:catF===c?C.musgo:C.neutral, color:catF===c?C.crema:C.noche, border:"none", borderRadius:20, padding:"5px 14px", fontFamily:"Georgia", fontSize:12, cursor:"pointer" }}>{c}</button>)}
          </div>
          {filtrados.map(ing=>{
            const bajo=ing.stock<=ing.minimo;
            return (
              <Card key={ing.id} style={{ borderLeft:bajo?`4px solid ${C.terracota}`:`4px solid ${C.musgo}33` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: editIngId===ing.id?12:0 }}>
                  <div>
                    <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:15, color:C.noche }}>{ing.nombre}</div>
                    <div style={{ fontSize:11, fontFamily:"Georgia", color:C.gris, marginTop:2 }}>{ing.categoria} · Mín: {ing.minimo}{ing.unidad} · ${ing.costo?.toLocaleString("es-CL")}/u</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {bajo && <Icon name="warning" size={15} color={C.terracota}/>}
                    <NumBtn onClick={()=>ajustarIng(ing,-10)} label="−"/>
                    <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:17, color:bajo?C.terracota:C.musgo, minWidth:52, textAlign:"center" }}>{ing.stock}{ing.unidad}</span>
                    <NumBtn onClick={()=>ajustarIng(ing,10)} label="+" color={C.musgo}/>
                    <button onClick={()=>setEditIngId(editIngId===ing.id?null:ing.id)} style={{ background:editIngId===ing.id?C.musgo:C.neutral, border:"none", borderRadius:8, padding:"6px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                      <Icon name="edit" size={13} color={editIngId===ing.id?C.crema:C.noche}/>
                    </button>
                  </div>
                </div>
                {editIngId===ing.id && <EditIngrediente ing={ing} ingredientes={ingredientes} onSave={guardarEdIng} onDelete={()=>eliminarIng(ing.id)} onCancel={()=>setEditIngId(null)}/>}
              </Card>
            );
          })}
          <Modal open={modalIng} onClose={()=>setModalIng(false)} title="Nuevo Ingrediente">
            <Input label="Nombre" value={formIng.nombre} onChange={v=>setFormIng({...formIng,nombre:v})}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Input label="Stock" type="number" value={formIng.stock} onChange={v=>setFormIng({...formIng,stock:v})}/>
              <Input label="Unidad" value={formIng.unidad} onChange={v=>setFormIng({...formIng,unidad:v})} placeholder="ml, g"/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Input label="Mínimo" type="number" value={formIng.minimo} onChange={v=>setFormIng({...formIng,minimo:v})}/>
              <Input label="Costo ($)" type="number" value={formIng.costo} onChange={v=>setFormIng({...formIng,costo:v})}/>
            </div>
            <Sel label="Categoría" value={formIng.categoria} onChange={v=>setFormIng({...formIng,categoria:v})}><option>Base</option><option>Mezcla</option><option>Esencial</option><option>Packaging</option></Sel>
            <Btn onClick={guardarIng} style={{ width:"100%", justifyContent:"center" }}>Guardar</Btn>
          </Modal>
        </div>
      )}

      {/* PRODUCTOS */}
      {tab==="productos" && (
        <div>
          <SectionTitle icon="tag" title="Productos" action={
            ingredientes.length===0
              ? <span style={{ fontSize:12, fontFamily:"Georgia", color:C.terracota }}>Agrega ingredientes primero</span>
              : <Btn small onClick={()=>setModalProd(true)}><Icon name="plus" size={14}/> Agregar</Btn>
          }/>
          {productos.map(p=>{
            const margen=p.precio>0?Math.round((p.precio-p.costo)/p.precio*100):0;
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
                  <button onClick={()=>setEditProdId(editProdId===p.id?null:p.id)} style={{ background:editProdId===p.id?C.musgo:C.neutral, border:"none", borderRadius:8, padding:"5px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                    <Icon name="edit" size={13} color={editProdId===p.id?C.crema:C.noche}/>
                    <span style={{ fontSize:11, fontFamily:"Georgia", color:editProdId===p.id?C.crema:C.noche }}>Editar</span>
                  </button>
                </div>
                {editProdId===p.id
                  ? <EditProducto p={p} onSave={guardarEdProd} onDelete={()=>eliminarProd(p.id)} onCancel={()=>setEditProdId(null)}/>
                  : (
                    <>
                      <div style={{ display:"flex", gap:12, marginBottom:10 }}>
                        <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:16, color:C.musgo }}>${p.precio?.toLocaleString("es-CL")}</div>
                        <div style={{ fontSize:12, color:C.gris, fontFamily:"Georgia", paddingTop:2 }}>Costo: ${p.costo?.toLocaleString("es-CL")}</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"flex-end" }}>
                        <NumBtn onClick={()=>ajustarProd(p,-1)} label="−"/>
                        <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:20, color:p.stock<=2?C.terracota:C.musgo, minWidth:30, textAlign:"center" }}>{p.stock}</span>
                        <NumBtn onClick={()=>ajustarProd(p,+1)} label="+" color={C.musgo}/>
                        <span style={{ fontSize:12, fontFamily:"Georgia", color:C.gris }}>unidades</span>
                      </div>
                    </>
                  )
                }
              </Card>
            );
          })}
          <Modal open={modalProd} onClose={()=>setModalProd(false)} title="Nuevo Producto">
            <Input label="Nombre" value={formProd.nombre} onChange={v=>setFormProd({...formProd,nombre:v})}/>
            <Sel label="Tipo" value={formProd.tipo} onChange={v=>setFormProd({...formProd,tipo:v})}><option>Bruma</option><option>Roll-on</option></Sel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              <Input label="Stock" type="number" value={formProd.stock} onChange={v=>setFormProd({...formProd,stock:v})}/>
              <Input label="Precio $" type="number" value={formProd.precio} onChange={v=>setFormProd({...formProd,precio:v})}/>
              <Input label="Costo $" type="number" value={formProd.costo} onChange={v=>setFormProd({...formProd,costo:v})}/>
            </div>
            <Btn onClick={guardarProd} style={{ width:"100%", justifyContent:"center" }}>Guardar</Btn>
          </Modal>
        </div>
      )}
    </div>
  );
};

// Sub-componente edición de ingrediente
const EditIngrediente = ({ ing, onSave, onDelete, onCancel }) => {
  const [v, setV] = useState({...ing});
  return (
    <div style={{ background:C.crema+"66", borderRadius:10, padding:12 }}>
      <Input label="Nombre" value={v.nombre} onChange={x=>setV({...v,nombre:x})}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Input label="Stock" type="number" value={v.stock} onChange={x=>setV({...v,stock:Number(x)})}/>
        <Input label="Costo ($)" type="number" value={v.costo} onChange={x=>setV({...v,costo:Number(x)})}/>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <Btn small onClick={()=>onSave(v)} style={{ flex:1, justifyContent:"center" }}><Icon name="save" size={13}/> Guardar</Btn>
        <Btn small onClick={onDelete} color={C.terracota} style={{ flex:1, justifyContent:"center" }}><Icon name="trash" size={13}/> Eliminar</Btn>
        <Btn small outline onClick={onCancel} style={{ flex:1, justifyContent:"center" }}>Cancelar</Btn>
      </div>
    </div>
  );
};

// Sub-componente edición de producto
const EditProducto = ({ p, onSave, onDelete, onCancel }) => {
  const [v, setV] = useState({...p});
  return (
    <div style={{ background:C.crema+"66", borderRadius:10, padding:12, marginBottom:10 }}>
      <Input label="Nombre" value={v.nombre} onChange={x=>setV({...v,nombre:x})}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Input label="Precio venta ($)" type="number" value={v.precio} onChange={x=>setV({...v,precio:Number(x)})}/>
        <Input label="Costo ($)" type="number" value={v.costo} onChange={x=>setV({...v,costo:Number(x)})}/>
      </div>
      <Input label="Stock" type="number" value={v.stock} onChange={x=>setV({...v,stock:Number(x)})}/>
      <div style={{ display:"flex", gap:8 }}>
        <Btn small onClick={()=>onSave(v)} style={{ flex:1, justifyContent:"center" }}><Icon name="save" size={13}/> Guardar</Btn>
        <Btn small onClick={onDelete} color={C.terracota} style={{ flex:1, justifyContent:"center" }}><Icon name="trash" size={13}/> Eliminar</Btn>
        <Btn small outline onClick={onCancel} style={{ flex:1, justifyContent:"center" }}>Cancelar</Btn>
      </div>
    </div>
  );
};

// ─── CALCULADORA ─────────────────────────────────────────────────
const Calculadora = ({ recetas, ingredientes }) => {
  const [rSel, setRSel] = useState(recetas[0]||null);
  const [uni, setUni] = useState(1);
  useEffect(()=>{ if(recetas.length>0&&!rSel) setRSel(recetas[0]); },[recetas]);
  const calc = () => {
    if(!rSel) return [];
    return (rSel.ingredientes||[]).map(ing=>{
      const inv=ingredientes.find(x=>x.id===ing.id)||ingredientes.find(x=>x.nombre===ing.nombre);
      const total=ing.cantidad*uni;
      return {...ing,total,suficiente:(inv?.stock||0)>=total,stock:inv?.stock||0,costo:(inv?.costo||0)*total,unidad:inv?.unidad||ing.unidad};
    });
  };
  const res=calc(); const cTotal=res.reduce((s,i)=>s+(i.costo||0),0);
  return (
    <div>
      <SectionTitle icon="calculator" title="Calculadora"/>
      <Card>
        <Sel label="Receta" value={rSel?.id||""} onChange={v=>setRSel(recetas.find(r=>r.id===v))}>{recetas.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}</Sel>
        <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:8, textTransform:"uppercase" }}>Cantidad a producir</div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <NumBtn onClick={()=>setUni(Math.max(1,uni-1))} label="−"/>
          <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:28, color:C.musgo, minWidth:40, textAlign:"center" }}>{uni}</span>
          <NumBtn onClick={()=>setUni(uni+1)} label="+" color={C.musgo}/>
          <span style={{ fontFamily:"Georgia", fontSize:13, color:C.gris }}>× {rSel?.volumen}</span>
        </div>
      </Card>
      {res.length>0 && (
        <Card>
          {res.map((ing,i)=>(
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
            <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:18, color:C.musgo }}>${cTotal.toLocaleString("es-CL")}</span>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─── PEDIDOS ─────────────────────────────────────────────────────
const SelectorDoc = ({ tipo, numero, onTipo, onNumero }) => {
  const pref=tipo==="Cotización"?"COT":"PED";
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:6, textTransform:"uppercase" }}>Tipo de documento</div>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {["Pedido","Cotización"].map(t=>(
          <button key={t} onClick={()=>onTipo(t)} style={{ flex:1, padding:"10px 0", borderRadius:10, border:`2px solid ${tipo===t?C.musgo:C.neutral}`, background:tipo===t?C.musgo:C.blanco, color:tipo===t?C.crema:C.gris, fontFamily:"Georgia", fontSize:13, cursor:"pointer" }}>
            {t==="Pedido"?"🛒 Pedido":"📋 Cotización"}
          </button>
        ))}
      </div>
      <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:6, textTransform:"uppercase" }}>Número</div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <NumBtn onClick={()=>onNumero(Math.max(1,numero-1))} label="−"/>
        <div style={{ flex:1, textAlign:"center", fontFamily:"Palatino Linotype, Palatino, serif", fontSize:26, color:C.musgo, background:C.crema, borderRadius:10, padding:"9px 0", border:`1.5px solid ${C.neutral}` }}>{pref}-{String(numero).padStart(4,"0")}</div>
        <NumBtn onClick={()=>onNumero(numero+1)} label="+" color={C.musgo}/>
      </div>
    </div>
  );
};

const Pedidos = ({ pedidos, setPedidos, productos }) => {
  const [modal, setModal] = useState(false);
  const [filtro, setFiltro] = useState("Todos");
  const [filtroT, setFiltroT] = useState("Todos");
  const sigN=(t)=>{ const ns=pedidos.filter(p=>p.tipodoc===t).map(p=>p.numero||0); return ns.length>0?Math.max(...ns)+1:1; };
  const [form, setForm] = useState({ tipodoc:"Pedido", numero:1, cliente:"", fecha:new Date().toISOString().split("T")[0], items:[], estado:"Pendiente" });

  const abrir=()=>{ setForm({tipodoc:"Pedido",numero:sigN("Pedido"),cliente:"",fecha:new Date().toISOString().split("T")[0],items:[],estado:"Pendiente"}); setModal(true); };
  const cambiarT=(t)=>setForm(prev=>({...prev,tipodoc:t,numero:sigN(t)}));
  const filtrados=pedidos.filter(p=>{ const mE=filtro==="Todos"||p.estado===filtro; const mT=filtroT==="Todos"||p.tipodoc===filtroT; return mE&&mT; });

  const addItem=()=>{ const p=productos[0]; setForm({...form,items:[...form.items,{producto:p?.nombre||"",qty:1,precio:p?.precio||0}]}); };
  const updItem=(i,campo,val)=>{
    const items=[...form.items];
    if(campo==="producto"){ const p=productos.find(x=>x.nombre===val); items[i]={...items[i],producto:val,precio:p?.precio||items[i].precio}; }
    else items[i]={...items[i],[campo]:Number(val)};
    setForm({...form,items});
  };
  const calcT=items=>items.reduce((s,it)=>s+(it.precio||0)*it.qty,0);
  const guardar=async()=>{
    if(!form.cliente) return;
    const pref=form.tipodoc==="Cotización"?"COT":"PED";
    const id=`${pref}-${String(form.numero).padStart(4,"0")}`;
    const nuevo={...form,id,total:calcT(form.items)};
    await upsert("pedidos",id,nuevo);
    setPedidos(prev=>[...prev,nuevo]);
    setModal(false);
  };
  const cambiarE=async(p,estado)=>{ const u={...p,estado}; await upsert("pedidos",p.id,u); setPedidos(prev=>prev.map(x=>x.id===p.id?u:x)); };

  return (
    <div>
      <SectionTitle icon="cart" title="Pedidos" action={<Btn small onClick={abrir}><Icon name="plus" size={14}/> Nuevo</Btn>}/>
      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
        {["Todos","Pedido","Cotización"].map(t=><button key={t} onClick={()=>setFiltroT(t)} style={{ background:filtroT===t?C.noche:C.neutral, color:filtroT===t?C.crema:C.noche, border:"none", borderRadius:20, padding:"4px 12px", fontFamily:"Georgia", fontSize:11, cursor:"pointer" }}>{t}</button>)}
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
        {["Todos","Pendiente","En preparación","Entregado"].map(e=><button key={e} onClick={()=>setFiltro(e)} style={{ background:filtro===e?C.musgo:C.neutral, color:filtro===e?C.crema:C.noche, border:"none", borderRadius:20, padding:"4px 12px", fontFamily:"Georgia", fontSize:11, cursor:"pointer" }}>{e}</button>)}
      </div>
      {filtrados.map(p=>(
        <Card key={p.id}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div>
              <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:3 }}>
                <Badge color={p.tipodoc==="Cotización"?"#7B6FA0":C.musgo}>{p.tipodoc==="Cotización"?"📋 Cotización":"🛒 Pedido"}</Badge>
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
              {p.estado==="Pendiente" && <Btn small onClick={()=>cambiarE(p,"En preparación")} color={C.terracota}>Preparar</Btn>}
              {p.estado==="En preparación" && <Btn small onClick={()=>cambiarE(p,"Entregado")}>Entregar</Btn>}
            </div>
          </div>
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nuevo Documento" wide>
        <SelectorDoc tipo={form.tipodoc} numero={form.numero} onTipo={cambiarT} onNumero={v=>setForm({...form,numero:v})}/>
        <Input label="Cliente" value={form.cliente} onChange={v=>setForm({...form,cliente:v})} placeholder="Nombre del cliente"/>
        <Input label="Fecha" type="date" value={form.fecha} onChange={v=>setForm({...form,fecha:v})}/>
        {productos.length===0 ? (
          <div style={{ padding:"14px", background:C.terracota+"11", borderRadius:10, fontFamily:"Georgia", fontSize:13, color:C.terracota, marginBottom:12 }}>⚠️ Agrega productos en Almacén primero</div>
        ) : (
          <>
            <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia", letterSpacing:1, marginBottom:8, textTransform:"uppercase" }}>Productos</div>
            {form.items.map((it,i)=>(
              <div key={i} style={{ background:C.crema+"66", borderRadius:10, padding:10, marginBottom:8 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 80px", gap:8, marginBottom:6 }}>
                  <div>
                    <div style={{ fontSize:10, color:C.gris, fontFamily:"Georgia", marginBottom:3 }}>PRODUCTO</div>
                    <select value={it.producto} onChange={e=>updItem(i,"producto",e.target.value)} style={{ width:"100%", border:`1.5px solid ${C.neutral}`, borderRadius:8, padding:"7px 10px", fontFamily:"Georgia", fontSize:13, color:C.noche, background:C.blanco }}>
                      {productos.map(p=><option key={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:C.gris, fontFamily:"Georgia", marginBottom:3 }}>CANT.</div>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <button onClick={()=>updItem(i,"qty",Math.max(1,it.qty-1))} style={{ background:C.neutral, border:"none", borderRadius:6, width:26, height:32, cursor:"pointer", fontSize:16 }}>−</button>
                      <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:16, color:C.musgo, minWidth:20, textAlign:"center" }}>{it.qty}</span>
                      <button onClick={()=>updItem(i,"qty",it.qty+1)} style={{ background:C.musgo, border:"none", borderRadius:6, width:26, height:32, cursor:"pointer", fontSize:14, color:C.crema }}>+</button>
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, fontFamily:"Georgia", color:C.gris }}>Precio $</span>
                    <input type="number" value={it.precio} onChange={e=>updItem(i,"precio",e.target.value)} style={{ width:90, border:`1.5px solid ${C.neutral}`, borderRadius:6, padding:"4px 8px", fontFamily:"Georgia", fontSize:13, color:C.musgo, background:C.blanco }}/>
                  </div>
                  <button onClick={()=>setForm({...form,items:form.items.filter((_,idx)=>idx!==i)})} style={{ background:"none", border:"none", cursor:"pointer" }}><Icon name="x" size={15} color={C.terracota}/></button>
                </div>
              </div>
            ))}
            <Btn small outline onClick={addItem} style={{ marginBottom:12 }}><Icon name="plus" size={13}/> Agregar producto</Btn>
          </>
        )}
        <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderTop:`1px solid ${C.neutral}`, marginBottom:12 }}>
          <span style={{ fontFamily:"Georgia", fontSize:13, color:C.gris }}>Total</span>
          <span style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:20, color:C.musgo }}>${calcT(form.items).toLocaleString("es-CL")}</span>
        </div>
        <Btn onClick={guardar} style={{ width:"100%", justifyContent:"center" }}>Guardar {form.tipodoc}</Btn>
      </Modal>
    </div>
  );
};

// ─── CLIENTES ─────────────────────────────────────────────────────
const Clientes = ({ clientes, setClientes }) => {
  const [modal, setModal] = useState(false);
  const [sel, setSel] = useState(null);
  const [form, setForm] = useState({ nombre:"", email:"", telefono:"", notas:"" });
  const guardar=async()=>{
    if(!form.nombre) return;
    const id="c_"+Date.now(); const n={...form,id,compras:0,totalGastado:0};
    await upsert("clientes",id,n);
    setClientes(prev=>[...prev,n]);
    setModal(false); setForm({nombre:"",email:"",telefono:"",notas:""});
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
                <div style={{ fontSize:11, color:C.gris, fontFamily:"Georgia" }}>{c.compras} compra{c.compras!==1?"s":""}</div>
              </div>
            </div>
            <Icon name="chevronRight" size={16} color={C.gris}/>
          </div>
          {sel?.id===c.id && (
            <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.neutral}` }}>
              {c.email && <div style={{ fontSize:13, fontFamily:"Georgia", color:C.noche, marginBottom:4 }}>✉ {c.email}</div>}
              {c.telefono && <div style={{ fontSize:13, fontFamily:"Georgia", color:C.noche, marginBottom:4 }}>📞 {c.telefono}</div>}
              {c.notas && <div style={{ fontSize:12, fontFamily:"Georgia", color:C.gris, fontStyle:"italic" }}>💬 {c.notas}</div>}
            </div>
          )}
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nuevo Cliente">
        <Input label="Nombre completo" value={form.nombre} onChange={v=>setForm({...form,nombre:v})}/>
        <Input label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})}/>
        <Input label="Teléfono" value={form.telefono} onChange={v=>setForm({...form,telefono:v})} placeholder="+56 9 XXXX XXXX"/>
        <Input label="Notas" value={form.notas} onChange={v=>setForm({...form,notas:v})} placeholder="Preferencias…"/>
        <Btn onClick={guardar} style={{ width:"100%", justifyContent:"center", marginTop:4 }}>Guardar Cliente</Btn>
      </Modal>
    </div>
  );
};

// ─── ETIQUETAS ───────────────────────────────────────────────────
const Etiquetas = () => {
  const fileRef=useRef({});
  const [imgs,setImgs]=useState({});
  const ets=[
    { key:"noche", nombre:"Noche Serena", fondo:C.musgo, texto:C.crema, tipo:"BRUMA AMBIENTAL" },
    { key:"refugio", nombre:"Refugio de Invierno", fondo:C.terracota, texto:C.crema, tipo:"BRUMA AMBIENTAL" },
    { key:"jardin", nombre:"Jardín de Agua", fondo:C.crema, texto:C.noche, tipo:"BRUMA AMBIENTAL" },
    { key:"paz", nombre:"Paz Interior", fondo:C.noche, texto:C.crema, tipo:"BRUMA AMBIENTAL" },
    { key:"sueno", nombre:"Sueño del Bosque", fondo:C.neutral, texto:C.noche, tipo:"ROLL-ON" },
  ];
  const handleFile=(key,e)=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>setImgs(prev=>({...prev,[key]:ev.target.result})); r.readAsDataURL(f); };
  return (
    <div>
      <SectionTitle icon="tag" title="Etiquetas"/>
      {ets.map(et=>{
        const img=imgs[et.key];
        return (
          <Card key={et.key} style={{ background:et.fondo, border:"none", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"Georgia", fontSize:9, letterSpacing:4, color:et.texto, opacity:.6, textTransform:"uppercase", marginBottom:5 }}>FERAZ · {et.tipo}</div>
                <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:20, color:et.texto, letterSpacing:1 }}>{et.nombre}</div>
                <div style={{ fontFamily:"Georgia", fontSize:9, letterSpacing:2, color:et.texto, opacity:.55, marginTop:5 }}>DESDE 2025 · 50 ML</div>
                <div style={{ marginTop:10 }}>
                  <input ref={el=>fileRef.current[et.key]=el} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleFile(et.key,e)}/>
                  <button onClick={()=>fileRef.current[et.key]?.click()} style={{ background:et.texto+"22", border:`1px solid ${et.texto}44`, borderRadius:8, padding:"5px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                    <Icon name="upload" size={13} color={et.texto}/>
                    <span style={{ fontFamily:"Georgia", fontSize:11, color:et.texto }}>{img?"Cambiar":"Subir imagen"}</span>
                  </button>
                </div>
              </div>
              <div style={{ width:70, height:80, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {img?<img src={img} alt={et.nombre} style={{ width:70, height:80, objectFit:"cover", borderRadius:8 }}/>:<div style={{ fontSize:32 }}>🌿</div>}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ─── APP ─────────────────────────────────────────────────────────
export default function FerazApp() {
  const [sidebar, setSidebar] = useState(false);
  const [modulo, setModulo] = useState("inicio");
  const [recetas, setRecetas]           = useFS("recetas",      sRecetas);
  const [ingredientes, setIngredientes] = useFS("ingredientes", sIngredientes);
  const [productos, setProductos]       = useFS("productos",    sProductos);
  const [pedidos, setPedidos]           = useFS("pedidos",      sPedidos);
  const [clientes, setClientes]         = useFS("clientes",     sClientes);
  const [eventos, setEventos]           = useFS("eventos",      sEventos);

  const nav = [
    { id:"inicio",     label:"Inicio",     icon:"home" },
    { id:"recetario",  label:"Recetario",  icon:"flask" },
    { id:"almacen",    label:"Almacén",    icon:"box" },
    { id:"calculadora",label:"Calculadora",icon:"calculator" },
    { id:"pedidos",    label:"Pedidos",    icon:"cart" },
    { id:"clientes",   label:"Clientes",   icon:"users" },
    { id:"etiquetas",  label:"Etiquetas",  icon:"tag" },
  ];

  const render = () => {
    switch(modulo) {
      case "inicio":     return <Inicio productos={productos} pedidos={pedidos} ingredientes={ingredientes} clientes={clientes} eventos={eventos} setEventos={setEventos}/>;
      case "recetario":  return <Recetario recetas={recetas} setRecetas={setRecetas} ingredientes={ingredientes}/>;
      case "almacen":    return <Almacen ingredientes={ingredientes} setIngredientes={setIngredientes} productos={productos} setProductos={setProductos}/>;
      case "calculadora":return <Calculadora recetas={recetas} ingredientes={ingredientes}/>;
      case "pedidos":    return <Pedidos pedidos={pedidos} setPedidos={setPedidos} productos={productos}/>;
      case "clientes":   return <Clientes clientes={clientes} setClientes={setClientes}/>;
      case "etiquetas":  return <Etiquetas/>;
      default:           return null;
    }
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:C.crema, overflow:"hidden" }}>
      {sidebar && <div onClick={()=>setSidebar(false)} style={{ position:"fixed", inset:0, background:"rgba(44,38,56,0.35)", zIndex:10 }}/>}
      <div style={{ position:"fixed", top:0, left:0, height:"100%", width:sidebar?220:0, background:C.noche, zIndex:20, overflow:"hidden", transition:"width .28s cubic-bezier(.4,0,.2,1)", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"26px 20px 18px", borderBottom:"1px solid rgba(242,232,213,0.12)", minWidth:220 }}>
          <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:22, color:C.crema, letterSpacing:2 }}>FERAZ</div>
          <div style={{ fontFamily:"Georgia", fontSize:9, color:C.crema, opacity:.5, letterSpacing:3, marginTop:2 }}>AROMATERAPIA</div>
        </div>
        <nav style={{ flex:1, padding:"10px 0", overflowY:"auto", minWidth:220 }}>
          {nav.map(item=>(
            <button key={item.id} onClick={()=>{ setModulo(item.id); setSidebar(false); }} style={{ display:"flex", alignItems:"center", gap:14, width:"100%", padding:"13px 20px", background:modulo===item.id?`${C.musgo}55`:"transparent", border:"none", cursor:"pointer", borderLeft:modulo===item.id?`3px solid ${C.terracota}`:"3px solid transparent", transition:"all .18s" }}>
              <Icon name={item.icon} size={18} color={modulo===item.id?C.crema:C.crema+"88"}/>
              <span style={{ fontFamily:"Georgia", fontSize:13, color:modulo===item.id?C.crema:C.crema+"88", letterSpacing:.5, whiteSpace:"nowrap" }}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding:"14px 20px", borderTop:"1px solid rgba(242,232,213,0.1)", minWidth:220 }}>
          <div style={{ fontFamily:"Georgia", fontSize:10, color:C.crema, opacity:.3, letterSpacing:2 }}>DESDE 2025 · SANTIAGO</div>
        </div>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <div style={{ background:C.musgo, padding:"14px 18px", display:"flex", alignItems:"center", gap:14, flexShrink:0, boxShadow:"0 2px 12px rgba(44,38,56,0.15)" }}>
          <button onClick={()=>setSidebar(!sidebar)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:4 }}>
            <Icon name="menu" size={22} color={C.crema}/>
          </button>
          <div>
            <div style={{ fontFamily:"Palatino Linotype, Palatino, serif", fontSize:18, color:C.crema, letterSpacing:2 }}>FERAZ</div>
            <div style={{ fontFamily:"Georgia", fontSize:9, color:C.crema, opacity:.65, letterSpacing:3 }}>{nav.find(n=>n.id===modulo)?.label.toUpperCase()}</div>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"20px 16px 48px" }}>
          {render()}
        </div>
      </div>
    </div>
  );
}
