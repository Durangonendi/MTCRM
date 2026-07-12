import { useState, useMemo, useEffect } from "react";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const PASSWORD = "Mtcrm2026";

const C = {
  bg:"#F8F9FA", navy:"#1B2E4B", iron:"#243447", panel:"#EEF1F5",
  card:"#FFFFFF", 
  green:"#2ECC71", greenDim:"#2ECC7115",
  blue:"#3498DB", blueDim:"#3498DB15",
  orange:"#E67E22", orangeDim:"#E67E2215",
  purple:"#9B59B6", purpleDim:"#9B59B615",
  pink:"#E91E8C", pinkDim:"#E91E8C15",
  ghost:"#1B2E4B", smoke:"#7F8C8D", muted:"#BDC3C7",
  border:"#E0E6ED", accent:"#2ECC71",
};

const STAGES = ["Potansiyel","İletişime Geçildi","Teklif Verildi","Müzakere","Anlaşma Yapıldı","Olumsuz"];
const SC = {
  "Potansiyel":"#7F8C8D",
  "İletişime Geçildi":"#3498DB",
  "Teklif Verildi":"#E67E22",
  "Müzakere":"#9B59B6",
  "Anlaşma Yapıldı":"#2ECC71",
  "Olumsuz":"#E74C3C",
};

const KATEGORILER = ["Anaokulu","Kreş","Oyun Alanı","Workshop & Etkinlik","İlkokul","Montessori Merkezi","Çocuk Gelişim Merkezi","Diğer"];

const TR_ILLER = ["Adana","Adıyaman","Afyonkarahisar","Ağrı","Ankara","Antalya","Artvin","Aydın","Balıkesir","Bitlis","Bolu","Burdur","Bursa","Çanakkale","Çorum","Denizli","Diyarbakır","Düzce","Edirne","Elazığ","Erzincan","Erzurum","Eskişehir","Gaziantep","Giresun","Hatay","Iğdır","Isparta","İstanbul","İzmir","Kahramanmaraş","Karabük","Karaman","Kars","Kastamonu","Kayseri","Kilis","Kırıkkale","Kırklareli","Kırşehir","Kocaeli","Konya","Kütahya","Malatya","Manisa","Mardin","Mersin","Muğla","Muş","Nevşehir","Niğde","Ordu","Osmaniye","Rize","Sakarya","Samsun","Şanlıurfa","Siirt","Sinop","Şırnak","Sivas","Tekirdağ","Tokat","Trabzon","Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak"];

const fmt = n => n>=1000?`₺${(n/1000).toFixed(0)}K`:`₺${n}`;
//const today = () => new Date().toISOString().split("T")[0];

// ─── DB ───────────────────────────────────────────────────────────────────────
async function dbGetLeads() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/mt_leads?select=*&order=id.desc`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
    });
    const data = await res.json();
    return Array.isArray(data) ? data.map(l=>({...l,value:Number(l.value)||0})) : [];
  } catch(e) { return []; }
}

async function dbInsert(lead) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/mt_leads`, {
      method:"POST",
      headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json","Prefer":"return=minimal"},
      body:JSON.stringify({
        firma:lead.firma, yetkili:lead.yetkili, kategori:lead.kategori,
        il:lead.il, ilce:lead.ilce, telefon:lead.telefon, whatsapp:lead.whatsapp,
        email:lead.email, adres:lead.adres, ogrenci_sayisi:lead.ogrenci_sayisi,
        notlar:lead.notlar, stage:lead.stage||"Potansiyel",
        potansiyel_ciro:lead.potansiyel_ciro||0
      })
    });
  } catch(e) {}
}

async function dbUpdate(id, lead) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/mt_leads?id=eq.${id}`, {
      method:"PATCH",
      headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        firma:lead.firma, yetkili:lead.yetkili, kategori:lead.kategori,
        il:lead.il, ilce:lead.ilce, telefon:lead.telefon, whatsapp:lead.whatsapp,
        email:lead.email, adres:lead.adres, ogrenci_sayisi:lead.ogrenci_sayisi,
        notlar:lead.notlar, stage:lead.stage, potansiyel_ciro:lead.potansiyel_ciro||0
      })
    });
  } catch(e) {}
}

async function dbUpdateStage(id, stage) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/mt_leads?id=eq.${id}`, {
      method:"PATCH",
      headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({stage})
    });
  } catch(e) {}
}

async function dbDelete(id) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/mt_leads?id=eq.${id}`, {
      method:"DELETE",
      headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`}
    });
  } catch(e) {}
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const bs = (bg,color,ex={}) => ({background:bg,color,border:"none",borderRadius:6,padding:"8px 18px",cursor:"pointer",fontSize:13,fontWeight:700,...ex});
const ob = (color) => ({background:"transparent",color,border:`1px solid ${color}44`,borderRadius:6,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:600});
const cardSt = (ex={}) => ({background:C.card,border:`1px solid ${C.border}`,borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",...ex});
const pill = (color) => ({background:color+"20",color,border:`1px solid ${color}40`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600,whiteSpace:"nowrap",display:"inline-block"});
const inpSt = {background:"#F8F9FA",color:C.ghost,border:`1px solid ${C.border}`,borderRadius:6,padding:"9px 12px",fontSize:13,width:"100%",boxSizing:"border-box",outline:"none"};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}) {
  const [pass,setPass]=useState("");
  const [error,setError]=useState(false);
  function tryLogin(){
    if(pass===PASSWORD){onLogin();}
    else{setError(true);setTimeout(()=>setError(false),2000);}
  }
  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"linear-gradient(135deg,#1B2E4B,#243447)",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#fff",borderRadius:16,padding:48,width:360,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{fontSize:40,marginBottom:8}}>🎨</div>
        <div style={{fontSize:24,fontWeight:900,color:C.navy,marginBottom:4,letterSpacing:1}}>MTCRM</div>
        <div style={{fontSize:11,color:C.smoke,letterSpacing:2,marginBottom:32}}>MontessoriToys CRM</div>
        <input type="password" placeholder="Şifre girin..." value={pass}
          onChange={e=>setPass(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&tryLogin()}
          style={{...inpSt,textAlign:"center",letterSpacing:4,marginBottom:12,border:`1px solid ${error?"#E74C3C":C.border}`}}
        />
        {error&&<div style={{color:"#E74C3C",fontSize:12,marginBottom:8}}>Yanlış şifre!</div>}
        <button onClick={tryLogin} style={{...bs(C.navy,"#fff"),width:"100%",padding:12,fontSize:14}}>Giriş Yap</button>
        <div style={{fontSize:11,color:C.muted,marginTop:16}}>Sadece yetkili erişim</div>
      </div>
    </div>
  );
}

// ─── FORM MODAL ───────────────────────────────────────────────────────────────
function LeadForm({editLead, onClose, onSave}) {
  const [firma,setFirma]=useState(editLead?.firma||"");
  const [yetkili,setYetkili]=useState(editLead?.yetkili||"");
  const [kategori,setKategori]=useState(editLead?.kategori||"Anaokulu");
  const [il,setIl]=useState(editLead?.il||"İstanbul");
  const [ilce,setIlce]=useState(editLead?.ilce||"");
  const [telefon,setTelefon]=useState(editLead?.telefon||"");
  const [whatsapp,setWhatsapp]=useState(editLead?.whatsapp||"");
  const [email,setEmail]=useState(editLead?.email||"");
  const [adres,setAdres]=useState(editLead?.adres||"");
  const [ogrenci,setOgrenci]=useState(editLead?.ogrenci_sayisi||"");
  const [ciro,setCiro]=useState(editLead?.potansiyel_ciro||"");
  const [stage,setStage]=useState(editLead?.stage||"Potansiyel");
  const [notlar,setNotlar]=useState(editLead?.notlar||"");
  const [saving,setSaving]=useState(false);

  async function handleSave(){
    if(!firma)return;
    setSaving(true);
    await onSave({firma,yetkili,kategori,il,ilce,telefon,whatsapp,email,adres,ogrenci_sayisi:ogrenci,potansiyel_ciro:Number(ciro)||0,stage,notlar});
    setSaving(false);
  }

  const row={display:"flex",flexDirection:"column",gap:5};
  const lbl={fontSize:11,color:C.smoke,fontWeight:600,letterSpacing:0.5};
  const sel={...inpSt,cursor:"pointer"};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{...cardSt({padding:28}),width:"100%",maxWidth:580,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{fontSize:17,fontWeight:800,color:C.navy}}>{editLead?"Firma Düzenle":"Yeni Firma Ekle"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.smoke,cursor:"pointer",fontSize:22}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{...row,gridColumn:"1/-1"}}><label style={lbl}>FİRMA ADI *</label><input style={inpSt} value={firma} onChange={e=>setFirma(e.target.value)} placeholder="Anaokulu / Kreş adı"/></div>
          <div style={row}><label style={lbl}>YETKİLİ KİŞİ</label><input style={inpSt} value={yetkili} onChange={e=>setYetkili(e.target.value)} placeholder="Müdür / Sahip"/></div>
          <div style={row}><label style={lbl}>KATEGORİ</label><select style={sel} value={kategori} onChange={e=>setKategori(e.target.value)}>{KATEGORILER.map(k=><option key={k}>{k}</option>)}</select></div>
          <div style={row}><label style={lbl}>İL</label><select style={sel} value={il} onChange={e=>setIl(e.target.value)}>{TR_ILLER.map(i=><option key={i}>{i}</option>)}</select></div>
          <div style={row}><label style={lbl}>İLÇE</label><input style={inpSt} value={ilce} onChange={e=>setIlce(e.target.value)} placeholder="İlçe adı"/></div>
          <div style={row}><label style={lbl}>TELEFON</label><input style={inpSt} value={telefon} onChange={e=>setTelefon(e.target.value)} placeholder="0532..."/></div>
          <div style={row}><label style={lbl}>WHATSAPP</label><input style={inpSt} value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="0532..."/></div>
          <div style={{...row,gridColumn:"1/-1"}}><label style={lbl}>E-POSTA</label><input style={inpSt} value={email} onChange={e=>setEmail(e.target.value)}/></div>
          <div style={row}><label style={lbl}>ÖĞRENCİ SAYISI</label><input style={inpSt} type="number" value={ogrenci} onChange={e=>setOgrenci(e.target.value)} placeholder="50"/></div>
          <div style={row}><label style={lbl}>POTANSİYEL CİRO (₺)</label><input style={inpSt} type="number" value={ciro} onChange={e=>setCiro(e.target.value)} placeholder="5000"/></div>
          <div style={row}><label style={lbl}>AŞAMA</label><select style={sel} value={stage} onChange={e=>setStage(e.target.value)}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></div>
          <div style={{...row,gridColumn:"1/-1"}}><label style={lbl}>ADRES</label><input style={inpSt} value={adres} onChange={e=>setAdres(e.target.value)}/></div>
          <div style={{...row,gridColumn:"1/-1"}}><label style={lbl}>NOTLAR</label><textarea style={{...inpSt,minHeight:70,resize:"vertical"}} value={notlar} onChange={e=>setNotlar(e.target.value)}/></div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
          <button onClick={onClose} style={ob(C.smoke)}>İptal</button>
          <button onClick={handleSave} disabled={saving} style={bs(C.navy,"#fff",{opacity:saving?0.7:1})}>{saving?"⏳ Kaydediliyor...":"💾 Kaydet"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── CRM ─────────────────────────────────────────────────────────────────────
function CRMView({leads, loadLeads}) {
  const [sub,setSub]=useState("pipeline");
  const [search,setSearch]=useState("");
  const [fIl,setFIl]=useState("Tümü");
  const [fKat,setFKat]=useState("Tümü");
  const [fStage,setFStage]=useState("Tümü");
  const [detail,setDetail]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [editLead,setEditLead]=useState(null);

  const filtered=useMemo(()=>leads.filter(l=>{
    if(fIl!=="Tümü"&&l.il!==fIl)return false;
    if(fKat!=="Tümü"&&l.kategori!==fKat)return false;
    if(fStage!=="Tümü"&&l.stage!==fStage)return false;
    if(search&&!`${l.firma} ${l.yetkili} ${l.il}`.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  }),[leads,fIl,fKat,fStage,search]);

  async function handleSave(data){
    if(editLead){await dbUpdate(editLead.id,data);}
    else{await dbInsert(data);}
    await loadLeads();
    setShowForm(false);setEditLead(null);
  }

  async function handleDelete(id){
    if(window.confirm("Silinsin mi?")){await dbDelete(id);await loadLeads();setDetail(null);}
  }

  async function handleStage(id,stage){
    await dbUpdateStage(id,stage);await loadLeads();
  }

  return (
    <div>
      {showForm&&<LeadForm editLead={editLead} onClose={()=>{setShowForm(false);setEditLead(null);}} onSave={handleSave}/>}

      <div style={{display:"flex",gap:8,marginBottom:18,borderBottom:`1px solid ${C.border}`,paddingBottom:12}}>
        {[["pipeline","Pipeline"],["liste","Liste"]].map(([k,v])=>(
          <button key={k} onClick={()=>setSub(k)} style={bs(sub===k?C.navy:"transparent",sub===k?"#fff":C.smoke,{border:`1px solid ${sub===k?C.navy:C.border}`})}>{v}</button>
        ))}
        <button onClick={()=>{setEditLead(null);setShowForm(true);}} style={bs(C.green,"#fff",{marginLeft:"auto"})}>+ Yeni Firma</button>
      </div>

      {(sub==="pipeline"||sub==="liste")&&(
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
          <input style={{...inpSt,width:200}} placeholder="🔍 Firma, yetkili, il ara..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <select style={{...inpSt,width:"auto",cursor:"pointer"}} value={fIl} onChange={e=>setFIl(e.target.value)}><option>Tümü</option>{TR_ILLER.map(i=><option key={i}>{i}</option>)}</select>
          <select style={{...inpSt,width:"auto",cursor:"pointer"}} value={fKat} onChange={e=>setFKat(e.target.value)}><option>Tümü</option>{KATEGORILER.map(k=><option key={k}>{k}</option>)}</select>
          <select style={{...inpSt,width:"auto",cursor:"pointer"}} value={fStage} onChange={e=>setFStage(e.target.value)}><option>Tümü</option>{STAGES.map(s=><option key={s}>{s}</option>)}</select>
          <span style={{fontSize:12,color:C.smoke}}>{filtered.length} firma</span>
        </div>
      )}

      {sub==="pipeline"&&(
        <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
          {STAGES.map(stage=>{
            const sl=filtered.filter(l=>l.stage===stage);
            const total=sl.reduce((a,l)=>a+(l.potansiyel_ciro||0),0);
            return(
              <div key={stage} style={{minWidth:200,flex:"0 0 200px"}}>
                <div style={{background:SC[stage],borderRadius:"6px 6px 0 0",padding:"8px 12px",fontSize:11,fontWeight:700,color:"#fff",display:"flex",justifyContent:"space-between"}}>
                  <span>{stage}</span><span>{total>0?fmt(total):sl.length+" firma"}</span>
                </div>
                <div style={{background:"#F8F9FA",border:`1px solid ${C.border}`,borderTop:"none",borderRadius:"0 0 6px 6px",padding:8,minHeight:80,display:"flex",flexDirection:"column",gap:8}}>
                  {sl.length===0&&<div style={{fontSize:11,color:C.smoke,textAlign:"center",padding:12}}>Boş</div>}
                  {sl.map(l=>(
                    <div key={l.id} onClick={()=>setDetail(l)} style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:6,padding:"10px 12px",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
                      <div style={{fontWeight:700,fontSize:13,color:C.navy}}>{l.firma}</div>
                      <div style={{fontSize:11,color:C.smoke}}>{l.yetkili}</div>
                      <div style={{fontSize:10,color:C.smoke,marginTop:2}}>📍 {l.il}{l.ilce?` / ${l.ilce}`:""}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
                        <span style={pill(SC[stage]||C.smoke)}>{l.kategori}</span>
                        {l.potansiyel_ciro>0&&<span style={{fontSize:11,color:C.green,fontWeight:700}}>{fmt(l.potansiyel_ciro)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sub==="liste"&&(
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr>{["FİRMA","YETKİLİ","KATEGORİ","İL","TELEFON","AŞAMA","İLETİŞİM"].map(h=><th key={h} style={{background:C.panel,color:C.smoke,padding:"9px 12px",textAlign:"left",fontSize:11,borderBottom:`1px solid ${C.border}`,fontWeight:600}}>{h}</th>)}</tr></thead>
            <tbody>{filtered.map(l=>(
              <tr key={l.id} onClick={()=>setDetail(l)} style={{cursor:"pointer"}}>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`,fontWeight:700,color:C.navy}}>{l.firma}</td>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`}}>{l.yetkili}</td>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`}}><span style={pill(C.blue)}>{l.kategori}</span></td>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`,color:C.smoke}}>{l.il}</td>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`,color:C.smoke}}>{l.telefon}</td>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`}}><span style={pill(SC[l.stage]||C.smoke)}>{l.stage}</span></td>
                <td style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`}} onClick={e=>e.stopPropagation()}>
                  <a href={`https://wa.me/${(l.whatsapp||l.telefon||"").replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{...ob("#25D366"),textDecoration:"none",marginRight:4}}>WA</a>
                  {l.email&&<a href={`mailto:${l.email}`} style={{...ob(C.blue),textDecoration:"none"}}>Mail</a>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {detail&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{...cardSt({padding:28}),width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <div style={{fontSize:20,fontWeight:800,color:C.navy}}>{detail.firma}</div>
                <div style={{fontSize:13,color:C.smoke,marginTop:2}}>📍 {detail.il}{detail.ilce?` / ${detail.ilce}`:""}</div>
              </div>
              <button onClick={()=>setDetail(null)} style={{background:"none",border:"none",color:C.smoke,cursor:"pointer",fontSize:22}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
              <div><div style={{fontSize:10,color:C.smoke,marginBottom:2}}>YETKİLİ</div><div style={{color:C.navy}}>{detail.yetkili||"-"}</div></div>
              <div><div style={{fontSize:10,color:C.smoke,marginBottom:2}}>KATEGORİ</div><span style={pill(C.blue)}>{detail.kategori}</span></div>
              <div><div style={{fontSize:10,color:C.smoke,marginBottom:2}}>ÖĞRENCİ SAYISI</div><div style={{color:C.navy}}>{detail.ogrenci_sayisi||"-"}</div></div>
              <div><div style={{fontSize:10,color:C.smoke,marginBottom:2}}>POTANSİYEL CİRO</div><div style={{color:C.green,fontWeight:700,fontSize:16}}>{detail.potansiyel_ciro>0?fmt(detail.potansiyel_ciro):"-"}</div></div>
            </div>
            <div style={{marginBottom:14,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.smoke,marginBottom:8}}>İLETİŞİM</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {(detail.whatsapp||detail.telefon)&&<a href={`https://wa.me/${(detail.whatsapp||detail.telefon).replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{...ob("#25D366"),textDecoration:"none"}}>📱 WhatsApp</a>}
                {detail.telefon&&<a href={`tel:${detail.telefon}`} style={{...ob(C.blue),textDecoration:"none"}}>📞 {detail.telefon}</a>}
                {detail.email&&<a href={`mailto:${detail.email}`} style={{...ob(C.purple),textDecoration:"none"}}>✉ {detail.email}</a>}
              </div>
            </div>
            {detail.notlar&&<div style={{marginBottom:14}}><div style={{fontSize:10,color:C.smoke,marginBottom:4}}>NOTLAR</div><div style={{background:C.panel,borderRadius:6,padding:"8px 12px",fontSize:13,lineHeight:1.5,color:C.navy}}>{detail.notlar}</div></div>}
            <div style={{marginBottom:14,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.smoke,marginBottom:8}}>AŞAMA DEĞİŞTİR</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {STAGES.map(s=><button key={s} onClick={async()=>{await handleStage(detail.id,s);setDetail(d=>({...d,stage:s}));}} style={{...pill(SC[s]),cursor:"pointer",border:detail.stage===s?`2px solid ${SC[s]}`:`1px solid ${SC[s]}33`,background:detail.stage===s?SC[s]+"33":SC[s]+"11"}}>{s}</button>)}
              </div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>handleDelete(detail.id)} style={ob("#E74C3C")}>Sil</button>
              <button onClick={()=>setDetail(null)} style={ob(C.smoke)}>Kapat</button>
              <button onClick={()=>{setEditLead(detail);setShowForm(true);setDetail(null);}} style={bs(C.navy,"#fff")}>✏ Düzenle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({leads}) {
  const total=leads.length;
  const anlasmalar=leads.filter(l=>l.stage==="Anlaşma Yapıldı").length;
  const totalCiro=leads.reduce((a,l)=>a+(l.potansiyel_ciro||0),0);
  const kazanilanCiro=leads.filter(l=>l.stage==="Anlaşma Yapıldı").reduce((a,l)=>a+(l.potansiyel_ciro||0),0);

  const byKat=KATEGORILER.map(k=>({label:k,count:leads.filter(l=>l.kategori===k).length})).filter(k=>k.count>0).sort((a,b)=>b.count-a.count);
  const byIl=[...new Set(leads.map(l=>l.il))].map(il=>({il,count:leads.filter(l=>l.il===il).length})).sort((a,b)=>b.count-a.count).slice(0,8);
  const byStage=STAGES.map(s=>({label:s,count:leads.filter(l=>l.stage===s).length,color:SC[s]}));

  const Bar=({pct,color})=><div style={{height:6,background:C.border,borderRadius:3,marginTop:4}}><div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3}}/></div>;

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[
          {l:"TOPLAM FİRMA",v:total,c:C.navy,icon:"🏫"},
          {l:"ANLAŞMA",v:anlasmalar,c:C.green,icon:"✅"},
          {l:"POTANSİYEL",v:fmt(totalCiro),c:C.blue,icon:"💰"},
          {l:"KAZANILAN",v:fmt(kazanilanCiro),c:C.green,icon:"🎯"},
        ].map(k=>(
          <div key={k.l} style={cardSt({padding:16})}>
            <div style={{fontSize:20,marginBottom:6}}>{k.icon}</div>
            <div style={{fontSize:22,fontWeight:900,color:k.c}}>{k.v}</div>
            <div style={{fontSize:10,color:C.smoke,marginTop:4,letterSpacing:0.8}}>{k.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div style={cardSt({padding:20})}>
          <div style={{fontSize:12,fontWeight:700,color:C.navy,letterSpacing:1,marginBottom:14}}>📊 AŞAMA DAĞILIMI</div>
          {byStage.map(s=>(
            <div key={s.label} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span>{s.label}</span><span style={{color:s.color,fontWeight:700}}>{s.count}</span></div>
              <Bar pct={total?Math.round(s.count/total*100):0} color={s.color}/>
            </div>
          ))}
        </div>
        <div style={cardSt({padding:20})}>
          <div style={{fontSize:12,fontWeight:700,color:C.navy,letterSpacing:1,marginBottom:14}}>🏫 KATEGORİ DAĞILIMI</div>
          {byKat.map(k=>(
            <div key={k.label} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span>{k.label}</span><span style={{color:C.blue,fontWeight:700}}>{k.count}</span></div>
              <Bar pct={total?Math.round(k.count/total*100):0} color={C.blue}/>
            </div>
          ))}
          {byKat.length===0&&<div style={{color:C.smoke,fontSize:13}}>Henüz veri yok</div>}
        </div>
      </div>
      <div style={cardSt({padding:20})}>
        <div style={{fontSize:12,fontWeight:700,color:C.navy,letterSpacing:1,marginBottom:14}}>📍 İL DAĞILIMI</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {byIl.map(i=>(
            <div key={i.il} style={{background:C.panel,borderRadius:6,padding:"10px 14px",display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:13,color:C.navy}}>{i.il}</span>
              <span style={{fontSize:13,fontWeight:700,color:C.green}}>{i.count}</span>
            </div>
          ))}
          {byIl.length===0&&<div style={{color:C.smoke,fontSize:13,gridColumn:"1/-1"}}>Henüz veri yok</div>}
        </div>
      </div>
    </div>
  );
}

// ─── ANA UYGULAMA ─────────────────────────────────────────────────────────────
export default function MTCRM() {
  const [loggedIn,setLoggedIn]=useState(()=>{try{return localStorage.getItem("mtcrm_auth")==="1";}catch(e){return false;}});
  const [active,setActive]=useState("dashboard");
  const [leads,setLeads]=useState([]);
  const [loading,setLoading]=useState(false);

  async function loadLeads(){
    setLoading(true);
    const data=await dbGetLeads();
    setLeads(data);
    setLoading(false);
  }

  useEffect(()=>{if(loggedIn)loadLeads();},[loggedIn]);

  function handleLogin(){
    try{localStorage.setItem("mtcrm_auth","1");}catch(e){}
    setLoggedIn(true);
  }

  if(!loggedIn)return <LoginScreen onLogin={handleLogin}/>;
  if(loading)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:C.navy,fontSize:18,fontWeight:700,fontFamily:"'Inter',sans-serif"}}>🎨 MTCRM yükleniyor...</div>;

  const TABS=[
    {key:"dashboard",icon:"📊",label:"Dashboard"},
    {key:"crm",icon:"🏫",label:"Firmalar"},
  ];

  return (
    <div style={{fontFamily:"'Inter','Helvetica Neue',sans-serif",background:C.bg,minHeight:"100vh",color:C.ghost,display:"flex",flexDirection:"column"}}>
      <div style={{background:C.navy,padding:"0 24px",display:"flex",alignItems:"center",height:56,flexShrink:0,position:"sticky",top:0,zIndex:50}}>
        <div style={{marginRight:20,paddingRight:20,borderRight:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontWeight:900,fontSize:16,letterSpacing:2,color:"#fff",lineHeight:1}}>🎨 MTCRM</div>
          <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2}}>MontessoriToys</div>
        </div>
        <div style={{display:"flex",gap:4,flex:1}}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setActive(t.key)} style={{background:active===t.key?"rgba(255,255,255,0.15)":"transparent",color:active===t.key?"#fff":"rgba(255,255,255,0.5)",border:"none",borderRadius:6,padding:"6px 16px",cursor:"pointer",fontSize:13,fontWeight:active===t.key?700:400,display:"flex",alignItems:"center",gap:6}}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:C.green}}/>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>Online</span>
          <button onClick={()=>{try{localStorage.removeItem("mtcrm_auth");}catch(e){}setLoggedIn(false);}} style={{...ob("rgba(255,255,255,0.3)"),color:"rgba(255,255,255,0.5)",fontSize:11,padding:"3px 10px",marginLeft:8}}>Çıkış</button>
        </div>
      </div>

      <div style={{flex:1,padding:"24px 28px",overflowY:"auto",maxWidth:1300,width:"100%",margin:"0 auto",boxSizing:"border-box"}}>
        {active==="dashboard"&&<Dashboard leads={leads}/>}
        {active==="crm"&&<CRMView leads={leads} loadLeads={loadLeads}/>}
      </div>
    </div>
  );
}
