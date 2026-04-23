import { useState, useMemo, useCallback, useRef, useEffect } from "react";

// ─── Theme ────────────────────────────────────────────────────────────────────
const DARK={bg:"#060e1a",card:"#0f2035",border:"#1e3a5f",text:"#e8f4fd",t2:"#8a9bb0",t3:"#5a7a9a",inp:"#0d1b2a",ib:"#1e3048",cyan:"#4fc3f7",green:"#34d399",red:"#f87171",yellow:"#fbbf24",purple:"#a78bfa",orange:"#f97316",act:"#060e1a"};
const LITE={bg:"#f0f4f8",card:"#ffffff",border:"#d0dce8",text:"#0d1f33",t2:"#4a6280",t3:"#8aa0b8",inp:"#e8eef5",ib:"#c8d8e8",cyan:"#0284c7",green:"#059669",red:"#dc2626",yellow:"#d97706",purple:"#7c3aed",orange:"#ea580c",act:"#ffffff"};

// Module-level theme pointer — updated by App before any render, read by all components
// This avoids passing T as a prop (which would change identity every render and remount inputs)
let TH = DARK;

const fmt=v=>(!v&&v!==0)?"$0":"$"+Number(v).toLocaleString("en-AU",{maximumFractionDigits:0});
const n=v=>isNaN(parseFloat(v))?0:parseFloat(v);
let _id=1; const uid=()=>String(_id++);

const TABS=["🏠 Property","📈 Stocks","₿ Crypto","💼 Assets & Debts","💵 Income & Expenses","🧾 Super","🔭 Scenarios","💡 Insights","🎯 Goals","⚡ Stress Tests","📊 Accounting","⚙️ Settings"];
const PRO_TABS=new Set(["💡 Insights","🎯 Goals","⚡ Stress Tests","📊 Accounting"]);
const MILES=[{v:50000,b:"🌱"},{v:100000,b:"🌿"},{v:250000,b:"🌳"},{v:500000,b:"⭐"},{v:1000000,b:"🏆"},{v:2000000,b:"💎"},{v:5000000,b:"👑"}];

// ─── Input components ────────────────────────────────────────────────────────
// Each input has its OWN local useState so parent re-renders never interrupt typing.
// Value syncs FROM parent only when not focused (handles auto-fill buttons).

const inpBase=()=>({background:TH.inp,border:`1px solid ${TH.ib}`,borderRadius:8,color:TH.text,fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"'Sora',sans-serif"});
const lbl=()=>({fontSize:11,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em"});

// Number field — uses type="text" to avoid browser number input quirks
// (type="number" swallows characters and behaves inconsistently across browsers)
function NI({label,val,save,pre,suf,ph=""}){
  const [v,sv]=useState(val||"");
  const focused=useRef(false);
  const prev=useRef(val);
  useEffect(()=>{
    if(!focused.current&&val!==prev.current){prev.current=val;sv(val||"");}
  },[val]);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:3}}>
      {label&&<label style={lbl()}>{label}</label>}
      <div style={{position:"relative"}}>
        {pre&&<span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:TH.t3,fontSize:13,pointerEvents:"none",zIndex:1}}>{pre}</span>}
        <input type="text" inputMode="decimal" value={v} placeholder={ph}
          onChange={e=>sv(e.target.value)}
          onFocus={()=>{focused.current=true;}}
          onBlur={e=>{focused.current=false;prev.current=e.target.value;save(e.target.value);}}
          style={{...inpBase(),padding:pre?"8px 10px 8px 21px":suf?"8px 24px 8px 10px":"8px 10px"}}/>
        {suf&&<span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",color:TH.t3,fontSize:13,pointerEvents:"none"}}>{suf}</span>}
      </div>
    </div>
  );
}

// Text field — with label renders as card field, without label renders inline (for name fields)
function TI({label,val,save,ph="",style:xs={}}){
  const [v,sv]=useState(val||"");
  const focused=useRef(false);
  const prev=useRef(val);
  useEffect(()=>{
    if(!focused.current&&val!==prev.current){prev.current=val;sv(val||"");}
  },[val]);
  const hasLabel=!!label;
  const s=hasLabel
    ?{...inpBase(),padding:"8px 10px",...xs}
    :{background:"none",border:"none",outline:"none",color:TH.text,fontFamily:"'Sora',sans-serif",fontSize:13,...xs};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:3,...(xs.flex?{flex:xs.flex}:{})}}>
      {label&&<label style={lbl()}>{label}</label>}
      <input type="text" value={v} placeholder={ph}
        onChange={e=>sv(e.target.value)}
        onFocus={()=>{focused.current=true;}}
        onBlur={e=>{focused.current=false;prev.current=e.target.value;save(e.target.value);}}
        style={s}/>
    </div>
  );
}

// Select — controlled is fine, no typing
function SI({label,val,onChange,opts}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:3}}>
      {label&&<label style={lbl()}>{label}</label>}
      <select value={val||opts[0]} onChange={e=>onChange(e.target.value)}
        style={{...inpBase(),padding:"8px 10px"}}>
        {opts.map(o=><option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

// Controlled input for modals only (modals remount cleanly)
function CI({label,val,onChange,type="text"}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:3}}>
      {label&&<label style={lbl()}>{label}</label>}
      <input type={type} inputMode="decimal" value={val} onChange={e=>onChange(e.target.value)}
        style={{...inpBase(),padding:"8px 10px"}}/>
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Card({children,border,pad=20}){
  return <div style={{background:TH.card,border:`1px solid ${border||TH.border}`,borderRadius:14,padding:pad}}>{children}</div>;
}
function Hd({children,color}){
  return <div style={{fontSize:11,fontWeight:700,color:color||TH.cyan,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12,fontFamily:"'DM Mono',monospace"}}>{children}</div>;
}
function Stat({label,val,color}){
  return(
    <div>
      <div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{label}</div>
      <div style={{fontSize:20,fontWeight:700,color:color||TH.cyan,fontFamily:"'DM Mono',monospace"}}>{val}</div>
    </div>
  );
}
function Pill({v,ok=true,col}){
  const c=col||(ok?TH.green:TH.red);
  return <span style={{background:`${c}20`,color:c,border:`1px solid ${c}40`,borderRadius:20,padding:"2px 9px",fontSize:11,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{v}</span>;
}
function AddBtn({onClick,label}){
  return(
    <button onClick={onClick} style={{background:"transparent",border:`1px dashed ${TH.t3}`,borderRadius:9,color:TH.cyan,padding:"9px 18px",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:7,fontFamily:"'Sora',sans-serif"}}
      onMouseOver={e=>e.currentTarget.style.borderColor=TH.cyan}
      onMouseOut={e=>e.currentTarget.style.borderColor=TH.t3}>
      <span style={{fontSize:17}}>+</span>{label}
    </button>
  );
}
function RmBtn({onClick}){
  return <button onClick={onClick} style={{background:`${TH.red}18`,border:`1px solid ${TH.red}40`,borderRadius:7,color:TH.red,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"'Sora',sans-serif",flexShrink:0}}>✕ Remove</button>;
}
const fx=(gap=10)=>({display:"flex",gap,alignItems:"center",flexWrap:"wrap"});
const gr=(...cols)=>({display:"grid",gridTemplateColumns:cols.join(" "),gap:12});

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("🏠 Property");
  const [dark,setDark]=useState(()=>{try{const s=localStorage.getItem("nw_dark");return s!==null?JSON.parse(s):true;}catch{return true;}});
  const [isPro,setIsPro]=useState(true);
  const [disc,setDisc]=useState(()=>{try{const s=localStorage.getItem("nw_disc");return s!==null?JSON.parse(s):true;}catch{return true;}});
  const [props,setProps]=useState(()=>{try{return JSON.parse(localStorage.getItem("nw_props")||"[]");}catch{return [];}});
  const [stocks,setStocks]=useState(()=>{try{return JSON.parse(localStorage.getItem("nw_stocks")||"[]");}catch{return [];}});
  const [crypto,setCrypto]=useState(()=>{try{return JSON.parse(localStorage.getItem("nw_crypto")||"[]");}catch{return [];}});
  const [assets,setAssets]=useState(()=>{try{return JSON.parse(localStorage.getItem("nw_assets")||"[]");}catch{return [];}});
  const [debts,setDebts]=useState(()=>{try{return JSON.parse(localStorage.getItem("nw_debts")||"[]");}catch{return [];}});
  const [goals,setGoals]=useState(()=>{try{return JSON.parse(localStorage.getItem("nw_goals")||"[]");}catch{return [];}});
  const [income,setIncome]=useState(()=>{try{return JSON.parse(localStorage.getItem("nw_income")||"null")||{salary:"",rental:"",divs:"",other:"",freq:"monthly"};}catch{return {salary:"",rental:"",divs:"",other:"",freq:"monthly"};}});
  const [exp,setExp]=useState(()=>{try{return JSON.parse(localStorage.getItem("nw_exp")||"null")||{housing:"",food:"",transport:"",utilities:"",insurance:"",entertainment:"",holidays:"",health:"",other:""};}catch{return {housing:"",food:"",transport:"",utilities:"",insurance:"",entertainment:"",holidays:"",health:"",other:""};}});
  const [sup,setSup]=useState(()=>{try{return JSON.parse(localStorage.getItem("nw_sup")||"null")||{bal:"",contribs:"",empRate:"11.5",growth:"7",age:""};}catch{return {bal:"",contribs:"",empRate:"11.5",growth:"7",age:""};}});
  const [settings,setSettings]=useState(()=>{try{return JSON.parse(localStorage.getItem("nw_settings")||"null")||{monthlyInv:"2000"};}catch{return {monthlyInv:"2000"};}});
  const [bcOpen,setBcOpen]=useState(false);
  const [bc,setBc]=useState({income:"",deps:"0",debts:"",rate:"6.5"});
  const [fire,setFire]=useState({exp:"",swr:"4"});
  const [aiQ,setAiQ]=useState("");
  const [aiA,setAiA]=useState("");
  const [aiLoad,setAiLoad]=useState(false);
  const [valModal,setValModal]=useState(null);
  const [cgtModal,setCgtModal]=useState(null);
  const [cgtUnits,setCgtUnits]=useState("");
  const [cgtInc,setCgtInc]=useState("120000");
  const [scHover,setScHover]=useState(null);

  // Update module-level theme before render so all components read correct colours
  TH = dark ? DARK : LITE;

  // Auto-save to localStorage whenever data changes
  useEffect(()=>{try{localStorage.setItem("nw_props",JSON.stringify(props));}catch{}},[props]);
  useEffect(()=>{try{localStorage.setItem("nw_stocks",JSON.stringify(stocks));}catch{}},[stocks]);
  useEffect(()=>{try{localStorage.setItem("nw_crypto",JSON.stringify(crypto));}catch{}},[crypto]);
  useEffect(()=>{try{localStorage.setItem("nw_assets",JSON.stringify(assets));}catch{}},[assets]);
  useEffect(()=>{try{localStorage.setItem("nw_debts",JSON.stringify(debts));}catch{}},[debts]);
  useEffect(()=>{try{localStorage.setItem("nw_goals",JSON.stringify(goals));}catch{}},[goals]);
  useEffect(()=>{try{localStorage.setItem("nw_income",JSON.stringify(income));}catch{}},[income]);
  useEffect(()=>{try{localStorage.setItem("nw_exp",JSON.stringify(exp));}catch{}},[exp]);
  useEffect(()=>{try{localStorage.setItem("nw_sup",JSON.stringify(sup));}catch{}},[sup]);
  useEffect(()=>{try{localStorage.setItem("nw_settings",JSON.stringify(settings));}catch{}},[settings]);
  useEffect(()=>{try{localStorage.setItem("nw_dark",JSON.stringify(dark));}catch{}},[dark]);
  useEffect(()=>{try{localStorage.setItem("nw_disc",JSON.stringify(disc));}catch{}},[disc]);

  // ── update helpers ─────────────────────────────────────────
  const upP=useCallback((id,f,v)=>setProps(ps=>ps.map(p=>p.id===id?{...p,[f]:v}:p)),[]);
  const upS=useCallback((id,f,v)=>setStocks(ss=>ss.map(s=>s.id===id?{...s,[f]:v}:s)),[]);
  const upC=useCallback((id,f,v)=>setCrypto(cs=>cs.map(c=>c.id===id?{...c,[f]:v}:c)),[]);
  const upA=useCallback((id,f,v)=>setAssets(as=>as.map(a=>a.id===id?{...a,[f]:v}:a)),[]);
  const upD=useCallback((id,f,v)=>setDebts(ds=>ds.map(d=>d.id===id?{...d,[f]:v}:d)),[]);
  const upG=useCallback((id,f,v)=>setGoals(gs=>gs.map(g=>g.id===id?{...g,[f]:v}:g)),[]);

  // ── computed ───────────────────────────────────────────────
  const C=useMemo(()=>{
    const tp=props.map(p=>{
      const rate=n(p.rate)/100||0.065, isIO=p.loanType==="IO";
      const calcRepay=n(p.mtg)>0?(isIO?n(p.mtg)*(rate/12):n(p.mtg)*(rate/12)/(1-Math.pow(1+rate/12,-360))):0;
      const repayMo=n(p.repay)||calcRepay;
      const ar=n(p.rent)*12;
      const ao=(repayMo+n(p.rates)+n(p.ins)+n(p.maint)+n(p.strata)+n(p.mgmt)+n(p.other))*12;
      return{...p,eq:n(p.val)-n(p.mtg),ar,ao,cf:ar-ao,yld:n(p.val)>0?(ar/n(p.val))*100:0,lvr:n(p.val)>0?(n(p.mtg)/n(p.val))*100:0,repayMo};
    });
    const propVal=tp.reduce((s,p)=>s+n(p.val),0),propMtg=tp.reduce((s,p)=>s+n(p.mtg),0);
    const propEq=propVal-propMtg,propCF=tp.reduce((s,p)=>s+p.cf,0);
    const totalRent=tp.reduce((s,p)=>s+p.ar,0),totalMtgRepay=tp.reduce((s,p)=>s+p.repayMo,0);

    const ts=stocks.map(s=>{const cv=n(s.units)*n(s.cur),cb=n(s.units)*n(s.buy);return{...s,cv,cb,gain:cv-cb,gp:cb>0?((cv-cb)/cb)*100:0,div:cv*(n(s.divYld)/100)};});
    const stockVal=ts.reduce((s,x)=>s+x.cv,0),totalDiv=ts.reduce((s,x)=>s+x.div,0);

    const tc=crypto.map(c=>{const cv=n(c.units)*n(c.cur),cb=n(c.units)*n(c.buy);return{...c,cv,gain:cv-cb,gp:cb>0?((cv-cb)/cb)*100:0};});
    const cryptoVal=tc.reduce((s,c)=>s+c.cv,0);
    const assetVal=assets.reduce((s,a)=>s+n(a.val),0);
    const debtBal=debts.reduce((s,d)=>s+n(d.bal),0);

    const sg=n(sup.growth)/100, sc=(n(sup.contribs)*(1+n(sup.empRate)/100))*12;
    let sb=n(sup.bal); for(let i=0;i<10;i++) sb=sb*(1+sg)+sc;

    const fm=income.freq==="annual"?1/12:1;
    const mInc=(n(income.salary)+n(income.rental)+n(income.divs)+n(income.other))*fm;
    const mExp=Object.values(exp).reduce((s,v)=>s+n(v),0);
    const mSurplus=mInc-mExp;
    const nw=propEq+stockVal+cryptoVal+assetVal+n(sup.bal)-debtBal;
    const nw10=propVal*Math.pow(1.07,10)-propMtg+stockVal*Math.pow(1.09,10)+cryptoVal*Math.pow(1.15,10)+assetVal*Math.pow(1.05,10)+sb-debtBal;

    const mi=n(settings.monthlyInv);
    const curves=["Conservative","Base","Optimistic"].map(name=>{
      const r={Conservative:{p:0.04,s:0.06,c:0.05},Base:{p:0.07,s:0.09,c:0.15},Optimistic:{p:0.10,s:0.12,c:0.40}}[name];
      const col={Conservative:DARK.red,Base:DARK.cyan,Optimistic:DARK.green}[name];
      const pts=[];
      for(let yr=0;yr<=15;yr++){let sc2=0;for(let i=0;i<yr;i++)sc2=sc2*(1+sg)+sc;pts.push({yr,nw:Math.max(0,propEq*Math.pow(1+r.p,yr)+stockVal*Math.pow(1+r.s,yr)+cryptoVal*Math.pow(1+r.c,yr)+assetVal*Math.pow(1.05,yr)+n(sup.bal)*Math.pow(1+sg,yr)+sc2+mi*12*((Math.pow(1+r.s/12,yr*12)-1)/(r.s/12||0.001))-debtBal)});}
      return{name,pts,col};
    });

    const tg=goals.map(g=>{
      const target=n(g.amt),yr=n(g.yr),now=new Date().getFullYear(),yrsLeft=Math.max(0,yr-now);
      const cur=g.cat==="Net Worth"?nw:g.cat==="Property"?propEq:g.cat==="Stocks"?stockVal:g.cat==="Super"?n(sup.bal):0;
      const pp=target>0?Math.min(100,(cur/target)*100):0,gap=Math.max(0,target-cur);
      return{...g,cur,pp,gap,monthly:yrsLeft>0?gap/(yrsLeft*12):gap,yrsLeft};
    });

    return{tp,propVal,propMtg,propEq,propCF,totalRent,totalMtgRepay,ts,stockVal,totalDiv,tc,cryptoVal,assetVal,debtBal,sup10:sb,mInc,mExp,mSurplus,nw,nw10,curves,tg,curM:MILES.slice().reverse().find(m=>nw>=m.v)||null,nextM:MILES.find(m=>nw<m.v)||null};
  },[props,stocks,crypto,assets,debts,goals,income,exp,sup,settings]);

  const bcR=useMemo(()=>{
    const gi=n(bc.income);if(!gi)return null;
    const dep=[0,5000,10000,15000,20000,25000][Math.min(n(bc.deps),5)];
    const rate=n(bc.rate)/100,r=(rate+0.03)/12,ma=(gi*0.7/12)-n(bc.debts)-((25000+dep)/12);
    if(ma<=0)return{loan:0,prop:0,repay:0};
    const loan=ma*(1-Math.pow(1+r,-360))/r,mr=rate/12,repay=loan>0?loan*mr/(1-Math.pow(1+mr,-360)):0;
    return{loan:Math.max(0,loan),prop:Math.max(0,loan/0.8),repay:Math.max(0,repay)};
  },[bc]);

  const fireR=useMemo(()=>{
    const e=n(fire.exp);if(!e)return null;
    const swr=n(fire.swr)/100||0.04,reg=e/swr,gap=Math.max(0,reg-C.nw);
    const yrs=C.mSurplus>0&&gap>0?Math.log(1+(gap*(0.07/12))/C.mSurplus)/Math.log(1+0.07/12)/12:null;
    return{lean:e*0.7/swr,reg,fat:e*1.5/swr,gap,yrs};
  },[fire,C.nw,C.mSurplus]);

  const cgtR=useMemo(()=>{
    const s=C.ts.find(x=>x.id===cgtModal?.stockId);
    if(!s||!cgtUnits)return null;
    const proceeds=n(cgtUnits)*n(s.cur),cost=n(cgtUnits)*n(s.buy),gross=proceeds-cost;
    const inc=n(cgtInc)||120000,marg=inc<18201?0:inc<45001?0.19:inc<135001?0.325:inc<190001?0.37:0.45;
    return{proceeds,cost,gross,disc:gross*0.5,tax:Math.max(0,gross*0.5*(marg+0.02))};
  },[cgtModal,cgtUnits,cgtInc,C.ts]);

  const askAI=useCallback(async q=>{
    if(!q.trim())return;
    setAiLoad(true);setAiA("");
    const sum=`NW:${fmt(C.nw)},PropEq:${fmt(C.propEq)},Stocks:${fmt(C.stockVal)},Crypto:${fmt(C.cryptoVal)},Super:${fmt(n(sup.bal))},Debt:${fmt(C.debtBal)},Surplus:${fmt(C.mSurplus)}/mo`;
    try{
      const apiKey=process.env.REACT_APP_ANTHROPIC_KEY||"";
      if(!apiKey){
        setAiA("⚠️ API key not set up yet.\n\nTo enable AI chat on your live site:\n1. Go to vercel.com → your networth project\n2. Click Settings → Environment Variables\n3. Add: REACT_APP_ANTHROPIC_KEY = your_key_here\n4. Get your key from console.anthropic.com → API Keys\n5. Redeploy (push any change to GitHub)\n\nFor local testing: create a .env file in your networth folder with the same line, then restart npm start.");
        setAiLoad(false);return;
      }
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","x-api-key":apiKey},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:`Australian finance assistant in networth. app. General info only — NOT personal advice, not AFS licensed. Portfolio: ${sum}. Be concise (2-3 paragraphs). End with a brief disclaimer.`,messages:[{role:"user",content:q}]})});
      const d=await r.json();setAiA(d.content?.map(x=>x.text||"").join("")||"No response.");
    }catch{setAiA("Connection error — ensure REACT_APP_ANTHROPIC_KEY is set in your .env file.");}
    setAiLoad(false);
  },[C,sup.bal]);

  const dlCSV=(name,content)=>{
    const blob=new Blob([content],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=name;a.style.display="none";
    document.body.appendChild(a);a.click();
    setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},100);
  };
  const parseCSV=(text,fields)=>{
    const lines=text.trim().split("\n"),hdr=lines[0].toLowerCase().split(",").map(h=>h.trim().replace(/"/g,""));
    const gi=(row,names)=>{const nm=names.find(nm=>hdr.includes(nm));return nm?(row[hdr.indexOf(nm)]||"").trim().replace(/"/g,""):""};
    return lines.slice(1).filter(l=>l.trim()).map(line=>{const row=line.split(","),obj={id:uid()};fields.forEach(([k,ns])=>{obj[k]=gi(row,ns);});return obj;});
  };

  // ══ TAB: PROPERTY ═════════════════════════════════════════
  const tabProperty=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card>
        <Hd>Portfolio Summary</Hd>
        <div style={{...gr("1fr 1fr 1fr 1fr"),gap:20}}>
          <Stat label="Total Value" val={fmt(C.propVal)}/>
          <Stat label="Total Equity" val={fmt(C.propEq)} color={TH.green}/>
          <Stat label="Total Debt" val={fmt(C.propMtg)} color={TH.red}/>
          <Stat label="Net Cashflow p.a." val={fmt(C.propCF)} color={C.propCF>=0?TH.green:TH.red}/>
        </div>
      </Card>

      {props.map(p=>{
        const cp=C.tp.find(x=>x.id===p.id)||{eq:0,ar:0,ao:0,cf:0,yld:0,lvr:0,repayMo:0};
        return(
          <Card key={p.id}>
            <div style={{...fx(10),justifyContent:"space-between",marginBottom:14}}>
              <TI val={p.name} save={v=>upP(p.id,"name",v)} ph="Property address" style={{background:"none",border:"none",color:TH.text,fontSize:16,fontWeight:600,flex:1}}/>
              <div style={fx(8)}>
                <Pill v={`${cp.yld.toFixed(1)}% yield`}/>
                <Pill v={`LVR ${cp.lvr.toFixed(0)}%`} ok={cp.lvr<80}/>
                <Pill v={`${fmt(cp.cf)} p.a.`} ok={cp.cf>=0}/>
                <RmBtn onClick={()=>setProps(ps=>ps.filter(x=>x.id!==p.id))}/>
              </div>
            </div>
            <div style={{...gr("1fr 1fr 1fr"),gap:16}}>
              {/* Details */}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <Hd>Details</Hd>
                <NI label="Current Value" val={p.val} save={v=>upP(p.id,"val",v)} pre="$"/>
                <NI label="Mortgage Balance" val={p.mtg} save={v=>upP(p.id,"mtg",v)} pre="$"/>
                <NI label="Interest Rate" val={p.rate} save={v=>upP(p.id,"rate",v)} suf="%" ph="6.5"/>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  <label style={{fontSize:11,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>Loan Type</label>
                  <div style={{display:"flex",gap:6}}>
                    {[["PI","P&I"],["IO","Interest Only"]].map(([val,lbl])=>(
                      <button key={val} onClick={()=>upP(p.id,"loanType",val)} style={{flex:1,background:(p.loanType||"PI")===val?TH.cyan:"transparent",border:`1px solid ${(p.loanType||"PI")===val?TH.cyan:TH.border}`,borderRadius:7,color:(p.loanType||"PI")===val?TH.act:TH.t2,padding:"7px 4px",cursor:"pointer",fontFamily:"'Sora',sans-serif",fontSize:11,fontWeight:700}}>{lbl}</button>
                    ))}
                  </div>
                  {(p.loanType||"PI")==="IO"&&<div style={{fontSize:10,color:TH.yellow,marginTop:2}}>⚠️ Interest only — no principal reduction</div>}
                </div>
                <div style={{padding:10,background:TH.inp,borderRadius:9}}>
                  <div style={{fontSize:10,color:TH.t2}}>EQUITY</div>
                  <div style={{fontSize:18,fontWeight:700,color:TH.green,fontFamily:"'DM Mono',monospace"}}>{fmt(cp.eq)}</div>
                </div>
              </div>
              {/* Income */}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <Hd>Monthly Income</Hd>
                <NI label="Rental Income (mo)" val={p.rent} save={v=>upP(p.id,"rent",v)} pre="$"/>
                <div style={{padding:10,background:TH.inp,borderRadius:9}}>
                  <div style={{fontSize:10,color:TH.t2}}>ANNUAL INCOME</div>
                  <div style={{fontSize:18,fontWeight:700,color:TH.green,fontFamily:"'DM Mono',monospace"}}>{fmt(cp.ar)}</div>
                </div>
              </div>
              {/* Outflows */}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <Hd>Monthly Outflows</Hd>
                <div>
                  <NI label="Mortgage Repayment (mo)" val={p.repay} save={v=>upP(p.id,"repay",v)} pre="$"/>
                  {!p.repay&&n(p.mtg)>0&&n(p.rate)>0&&<div style={{fontSize:10,color:TH.cyan,marginTop:3}}>Est: {fmt(cp.repayMo)}/mo — <button onClick={()=>upP(p.id,"repay",String(Math.round(cp.repayMo)))} style={{background:"none",border:"none",color:TH.cyan,cursor:"pointer",fontSize:10,textDecoration:"underline",padding:0}}>use this</button></div>}
                </div>
                <NI label="Council Rates (mo)" val={p.rates} save={v=>upP(p.id,"rates",v)} pre="$"/>
                <NI label="Insurance (mo)" val={p.ins} save={v=>upP(p.id,"ins",v)} pre="$"/>
                <NI label="Maintenance (mo)" val={p.maint} save={v=>upP(p.id,"maint",v)} pre="$"/>
                <NI label="Strata (mo)" val={p.strata} save={v=>upP(p.id,"strata",v)} pre="$"/>
                <NI label="Mgmt Fee (mo)" val={p.mgmt} save={v=>upP(p.id,"mgmt",v)} pre="$"/>
                <NI label="Other (mo)" val={p.other} save={v=>upP(p.id,"other",v)} pre="$"/>
                <div style={{padding:10,background:TH.inp,borderRadius:9}}>
                  <div style={{fontSize:10,color:TH.t2}}>TOTAL ANNUAL OUTFLOWS</div>
                  <div style={{fontSize:16,fontWeight:700,color:TH.red,fontFamily:"'DM Mono',monospace"}}>{fmt(cp.ao)}</div>
                </div>
              </div>
            </div>
            {/* Valuations */}
            <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${TH.border}`}}>
              <div style={{...fx(10),justifyContent:"space-between",marginBottom:8}}>
                <Hd>Valuation History</Hd>
                <button onClick={()=>setValModal({propId:p.id,date:new Date().toISOString().slice(0,7),val:""})} style={{background:"transparent",border:`1px dashed ${TH.t3}`,borderRadius:7,color:TH.cyan,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"'Sora',sans-serif"}}>+ Log Valuation</button>
              </div>
              {!(p.vals||[]).length&&<div style={{fontSize:12,color:TH.t3}}>No valuations yet.</div>}
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {(p.vals||[]).map((v,i)=>(
                  <div key={i} style={{display:"flex",gap:6,alignItems:"center",padding:"4px 10px",background:TH.inp,borderRadius:7,fontSize:12}}>
                    <span style={{color:TH.t3}}>{v.date}</span>
                    <span style={{color:TH.cyan,fontFamily:"'DM Mono',monospace"}}>{fmt(n(v.val))}</span>
                    <button onClick={()=>setProps(ps=>ps.map(pp=>pp.id===p.id?{...pp,vals:(pp.vals||[]).filter((_,j)=>j!==i)}:pp))} style={{background:"none",border:"none",color:TH.red,cursor:"pointer",fontSize:13}}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}

      <AddBtn onClick={()=>setProps(ps=>[...ps,{id:uid(),name:"",val:"",mtg:"",rate:"",loanType:"PI",rent:"",repay:"",rates:"",ins:"",maint:"",strata:"",mgmt:"",other:"",vals:[]}])} label="Add Property"/>

      {/* Borrowing calc */}
      <div>
        <button onClick={()=>setBcOpen(o=>!o)} style={{width:"100%",background:TH.card,border:`1px solid ${TH.border}`,borderRadius:bcOpen?"12px 12px 0 0":12,padding:"14px 20px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={fx(10)}><span style={{fontSize:18}}>🏦</span><div style={{textAlign:"left"}}><div style={{fontSize:14,fontWeight:700,color:TH.text,fontFamily:"'Sora',sans-serif"}}>How much can I borrow for my next property?</div><div style={{fontSize:12,color:TH.t2}}>Borrowing Capacity Estimator</div></div></div>
          <span style={{color:TH.cyan,fontSize:18,transform:bcOpen?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▾</span>
        </button>
        {bcOpen&&(
          <div style={{background:TH.card,border:`1px solid ${TH.border}`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:20}}>
            <div style={{padding:"8px 12px",background:`${TH.cyan}10`,border:`1px solid ${TH.cyan}25`,borderRadius:8,marginBottom:14,fontSize:12,color:TH.t2}}>Simplified estimate (income×70%, APRA +3% buffer). Speak to a mortgage broker for accurate figures.</div>
            <div style={{...gr("1fr 1fr 1fr 1fr"),marginBottom:14}}>
              <NI label="Gross Annual Income" val={bc.income} save={v=>setBc(b=>({...b,income:v}))} pre="$"/>
              <SI label="Dependants" val={bc.deps} onChange={v=>setBc(b=>({...b,deps:v}))} opts={["0","1","2","3","4","5+"]}/>
              <NI label="Existing Debt Repayments (mo)" val={bc.debts} save={v=>setBc(b=>({...b,debts:v}))} pre="$"/>
              <NI label="Interest Rate" val={bc.rate} save={v=>setBc(b=>({...b,rate:v}))} suf="%" ph="6.5"/>
            </div>
            {bcR&&<div style={{...gr("1fr 1fr 1fr"),gap:12}}>{[{l:"Est. Max Loan",v:fmt(bcR.loan),c:TH.cyan},{l:"Est. Property (80% LVR)",v:fmt(bcR.prop),c:TH.green},{l:"Est. Monthly Repayment",v:fmt(bcR.repay),c:TH.yellow}].map(x=>(<div key={x.l} style={{padding:14,background:TH.inp,borderRadius:10,textAlign:"center"}}><div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{x.l}</div><div style={{fontSize:20,fontWeight:800,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div></div>))}</div>}
          </div>
        )}
      </div>

      {valModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:16}}>
          <div style={{background:TH.card,border:`1px solid ${TH.border}`,borderRadius:14,padding:28,width:300}}>
            <div style={{fontSize:16,fontWeight:700,color:TH.text,marginBottom:18,fontFamily:"'Sora',sans-serif"}}>Log Valuation</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <label style={{fontSize:11,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>Month</label>
                <input type="month" value={valModal.date} onChange={e=>setValModal(m=>({...m,date:e.target.value}))} style={{...inpBase(),padding:"8px 10px",colorScheme:dark?"dark":"light"}}/>
              </div>
              <CI label="Estimated Value" val={valModal.val} onChange={v=>setValModal(m=>({...m,val:v}))}/>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18}}>
              <button onClick={()=>{setProps(ps=>ps.map(p=>p.id===valModal.propId?{...p,vals:[...(p.vals||[]),{date:valModal.date,val:valModal.val}].sort((a,b)=>a.date.localeCompare(b.date))}:p));setValModal(null);}} style={{flex:1,background:TH.cyan,border:"none",borderRadius:8,color:TH.act,padding:"10px",cursor:"pointer",fontWeight:700,fontFamily:"'Sora',sans-serif"}}>Save</button>
              <button onClick={()=>setValModal(null)} style={{flex:1,background:"transparent",border:`1px solid ${TH.border}`,borderRadius:8,color:TH.t2,padding:"10px",cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ══ TAB: STOCKS ════════════════════════════════════════════
  const tabStocks=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card>
        <Hd>Portfolio Summary</Hd>
        <div style={{...gr("1fr 1fr 1fr"),gap:20}}>
          <Stat label="Total Value" val={fmt(C.stockVal)}/>
          <Stat label="Total Gain/Loss" val={fmt(C.ts.reduce((s,x)=>s+x.gain,0))} color={C.ts.reduce((s,x)=>s+x.gain,0)>=0?TH.green:TH.red}/>
          <Stat label="Annual Dividends" val={fmt(C.totalDiv)} color={TH.yellow}/>
        </div>
      </Card>
      {C.ts.map(s=>(
        <Card key={s.id}>
          <div style={{...fx(10),justifyContent:"space-between",marginBottom:12}}>
            <div style={fx(10)}>
              <TI val={s.ticker} save={v=>upS(s.id,"ticker",v)} ph="TICKER" style={{background:"none",border:"none",color:TH.cyan,fontWeight:800,width:90,fontSize:16,fontFamily:"'DM Mono',monospace"}}/>
              <TI val={s.name} save={v=>upS(s.id,"name",v)} ph="Company name" style={{background:"none",border:"none",color:TH.text,fontSize:14,minWidth:120}}/>
            </div>
            <div style={fx(8)}>
              {s.cv>0&&<Pill v={fmt(s.cv)}/>}
              {s.cb>0&&<Pill v={`${s.gp>=0?"+":""}${s.gp.toFixed(1)}%`} ok={s.gain>=0}/>}
              <button onClick={()=>{setCgtModal({stockId:s.id});setCgtUnits("");}} style={{background:`${TH.purple}18`,border:`1px solid ${TH.purple}35`,borderRadius:7,color:TH.purple,padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:"'Sora',sans-serif"}}>CGT Calc</button>
              <RmBtn onClick={()=>setStocks(ss=>ss.filter(x=>x.id!==s.id))}/>
            </div>
          </div>
          <div style={{...gr("1fr 1fr 1fr 1fr 1fr"),gap:12}}>
            <NI label="Units" val={s.units} save={v=>upS(s.id,"units",v)}/>
            <NI label="Buy Price" val={s.buy} save={v=>upS(s.id,"buy",v)} pre="$"/>
            <NI label="Current Price" val={s.cur} save={v=>upS(s.id,"cur",v)} pre="$"/>
            <NI label="Dividend Yield" val={s.divYld} save={v=>upS(s.id,"divYld",v)} suf="%"/>
            <div style={{padding:10,background:TH.inp,borderRadius:9}}><div style={{fontSize:10,color:TH.t2}}>ANNUAL DIV</div><div style={{fontSize:16,fontWeight:700,color:TH.yellow,fontFamily:"'DM Mono',monospace"}}>{fmt(s.div)}</div></div>
          </div>
        </Card>
      ))}
      <AddBtn onClick={()=>setStocks(ss=>[...ss,{id:uid(),ticker:"",name:"",units:"",buy:"",cur:"",divYld:""}])} label="Add Stock / ETF"/>
      {cgtModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:16}}>
          <div style={{background:TH.card,border:`1px solid ${TH.border}`,borderRadius:14,padding:28,width:380,maxWidth:"95vw"}}>
            <div style={{fontSize:15,fontWeight:700,color:TH.purple,marginBottom:4,fontFamily:"'Sora',sans-serif"}}>CGT Estimator</div>
            <div style={{fontSize:12,color:TH.t2,marginBottom:16}}>{C.ts.find(x=>x.id===cgtModal.stockId)?.ticker}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
              <CI label="Units to Sell" val={cgtUnits} onChange={setCgtUnits}/>
              <CI label="Annual Taxable Income" val={cgtInc} onChange={setCgtInc}/>
            </div>
            {cgtR&&<div style={{marginBottom:14}}>{[["Sale Proceeds",fmt(cgtR.proceeds),TH.text],["Cost Base",fmt(cgtR.cost),TH.t2],["Gross Gain",fmt(cgtR.gross),cgtR.gross>=0?TH.green:TH.red],["After 50% Discount",fmt(cgtR.disc),TH.cyan],["Est. Tax Payable",fmt(cgtR.tax),TH.red],["Net After Tax",fmt(cgtR.proceeds-cgtR.tax),TH.green]].map(([l,v,c])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${TH.border}`,fontSize:12}}><span style={{color:TH.t2}}>{l}</span><span style={{color:c,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{v}</span></div>))}<p style={{fontSize:10,color:TH.t3,marginTop:8,lineHeight:1.6}}>⚠️ Estimate only — assumes 12+ month hold. Consult your accountant.</p></div>}
            <button onClick={()=>{setCgtModal(null);setCgtUnits("");}} style={{width:"100%",background:"transparent",border:`1px solid ${TH.border}`,borderRadius:8,color:TH.t2,padding:"10px",cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );

  // ══ TAB: CRYPTO ════════════════════════════════════════════
  const tabCrypto=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card>
        <Hd>Crypto Portfolio</Hd>
        <div style={{...gr("1fr 1fr 1fr"),gap:20}}>
          <Stat label="Total Value" val={fmt(C.cryptoVal)} color={TH.yellow}/>
          <Stat label="Total Gain/Loss" val={fmt(C.tc.reduce((s,c)=>s+c.gain,0))} color={C.tc.reduce((s,c)=>s+c.gain,0)>=0?TH.green:TH.red}/>
          <Stat label="% of Net Worth" val={C.nw>0?(C.cryptoVal/C.nw*100).toFixed(1)+"%":"-"} color={C.cryptoVal/C.nw*100>20?TH.red:TH.purple}/>
        </div>
      </Card>
      {C.tc.map(c=>(
        <Card key={c.id}>
          <div style={{...fx(10),justifyContent:"space-between",marginBottom:12}}>
            <div style={fx(10)}>
              <TI val={c.symbol} save={v=>upC(c.id,"symbol",v)} ph="BTC" style={{background:"none",border:"none",color:TH.yellow,fontWeight:800,width:65,fontSize:16,fontFamily:"'DM Mono',monospace"}}/>
              <TI val={c.name} save={v=>upC(c.id,"name",v)} ph="Coin name" style={{background:"none",border:"none",color:TH.text,fontSize:14,minWidth:100}}/>
            </div>
            <div style={fx(8)}>
              {c.cv>0&&<Pill v={fmt(c.cv)} ok={true}/>}
              {c.cb>0&&<Pill v={`${c.gp>=0?"+":""}${c.gp.toFixed(1)}%`} ok={c.gain>=0}/>}
              <RmBtn onClick={()=>setCrypto(cs=>cs.filter(x=>x.id!==c.id))}/>
            </div>
          </div>
          <div style={{...gr("1fr 1fr 1fr"),gap:12}}>
            <NI label="Units Held" val={c.units} save={v=>upC(c.id,"units",v)}/>
            <NI label="Buy Price (avg)" val={c.buy} save={v=>upC(c.id,"buy",v)} pre="$"/>
            <NI label="Current Price" val={c.cur} save={v=>upC(c.id,"cur",v)} pre="$"/>
          </div>
        </Card>
      ))}
      <AddBtn onClick={()=>setCrypto(cs=>[...cs,{id:uid(),symbol:"",name:"",units:"",buy:"",cur:""}])} label="Add Cryptocurrency"/>
      <p style={{fontSize:11,color:TH.t3,lineHeight:1.6}}>⚠️ Crypto is a CGT asset in Australia — every disposal is a taxable event. Consult your accountant.</p>
    </div>
  );

  // ══ TAB: ASSETS & DEBTS ════════════════════════════════════
  const tabAssetsDebts=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{...gr("1fr 1fr 1fr 1fr"),gap:12}}>
        {[{l:"Total Assets",v:fmt(C.assetVal),c:TH.cyan},{l:"Non-Mtg Debt",v:fmt(C.debtBal),c:TH.red},{l:"Net Position",v:fmt(C.assetVal-C.debtBal),c:C.assetVal-C.debtBal>=0?TH.green:TH.red},{l:"Annual Interest",v:fmt(debts.reduce((s,d)=>s+n(d.bal)*n(d.rate)/100,0)),c:TH.orange}].map(x=>(
          <Card key={x.l} pad={14}><div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{x.l}</div><div style={{fontSize:18,fontWeight:800,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div></Card>
        ))}
      </div>
      <Card>
        <Hd>Assets</Hd>
        {assets.length===0&&<div style={{fontSize:12,color:TH.t3,marginBottom:12}}>Add business equity, vehicles, art, gold, term deposits, trusts here.</div>}
        {assets.map(a=>(
          <div key={a.id} style={{marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${TH.border}`}}>
            <div style={{...fx(10),justifyContent:"space-between",marginBottom:10}}>
              <TI val={a.name} save={v=>upA(a.id,"name",v)} ph="Asset name" style={{background:"none",border:"none",color:TH.text,fontWeight:600,fontSize:14,flex:1}}/>
              <RmBtn onClick={()=>setAssets(as=>as.filter(x=>x.id!==a.id))}/>
            </div>
            <div style={{...gr("1fr 1fr 1fr 1fr"),gap:10}}>
              <SI label="Type" val={a.type} onChange={v=>upA(a.id,"type",v)} opts={["Business Equity","Vehicle","Art / Collectible","Cash / Term Deposit","Trust","Gold","Other"]}/>
              <NI label="Current Value" val={a.val} save={v=>upA(a.id,"val",v)} pre="$"/>
              <NI label="Growth Rate p.a." val={a.growth} save={v=>upA(a.id,"growth",v)} suf="%" ph="5"/>
              <div style={{padding:10,background:TH.inp,borderRadius:9}}><div style={{fontSize:10,color:TH.t2}}>VALUE IN 10YRS</div><div style={{fontSize:15,fontWeight:700,color:TH.yellow,fontFamily:"'DM Mono',monospace"}}>{fmt(n(a.val)*Math.pow(1+n(a.growth)/100,10))}</div></div>
            </div>
          </div>
        ))}
        <AddBtn onClick={()=>setAssets(as=>[...as,{id:uid(),name:"",type:"Other",val:"",growth:""}])} label="Add Asset"/>
      </Card>
      <Card>
        <Hd>Debts (Non-Mortgage)</Hd>
        <div style={{padding:"8px 12px",background:`${TH.cyan}08`,border:`1px solid ${TH.cyan}20`,borderRadius:9,marginBottom:14,fontSize:11,color:TH.t2}}>Mortgage debt is tracked in the Property tab. Add personal loans, car finance, HECS/HELP, credit cards here.</div>
        {debts.map(d=>(
          <div key={d.id} style={{marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${TH.border}`}}>
            <div style={{...fx(10),justifyContent:"space-between",marginBottom:10}}>
              <TI val={d.name} save={v=>upD(d.id,"name",v)} ph="Debt name" style={{background:"none",border:"none",color:TH.text,fontWeight:600,fontSize:14,flex:1}}/>
              <RmBtn onClick={()=>setDebts(ds=>ds.filter(x=>x.id!==d.id))}/>
            </div>
            <div style={{...gr("1fr 1fr 1fr 1fr"),gap:10}}>
              <SI label="Type" val={d.type} onChange={v=>upD(d.id,"type",v)} opts={["Personal Loan","Car Finance","Credit Card","HECS/HELP","Line of Credit","Other"]}/>
              <NI label="Balance Owing" val={d.bal} save={v=>upD(d.id,"bal",v)} pre="$"/>
              <NI label="Interest Rate" val={d.rate} save={v=>upD(d.id,"rate",v)} suf="%" ph="8"/>
              <NI label="Min Payment (mo)" val={d.minPay} save={v=>upD(d.id,"minPay",v)} pre="$"/>
            </div>
          </div>
        ))}
        {debts.length>1&&<div style={{padding:12,background:TH.inp,borderRadius:9,marginBottom:14}}><div style={{fontSize:11,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Payoff Priority (Avalanche)</div>{[...debts].sort((a,b)=>n(b.rate)-n(a.rate)).map((d,i)=>(<div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${TH.border}`,fontSize:12}}><span style={{color:TH.text}}>{i+1}. {d.name||d.type||"Debt"}</span><div style={fx(12)}><span style={{color:TH.red,fontFamily:"'DM Mono',monospace"}}>{fmt(n(d.bal))}</span><span style={{color:TH.orange,fontFamily:"'DM Mono',monospace"}}>{d.rate||0}%</span></div></div>))}</div>}
        <AddBtn onClick={()=>setDebts(ds=>[...ds,{id:uid(),name:"",type:"Personal Loan",bal:"",rate:"",minPay:""}])} label="Add Debt"/>
      </Card>
    </div>
  );

  // ══ TAB: INCOME & EXPENSES ═════════════════════════════════
  const tabIncome=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{...gr("1fr 1fr 1fr 1fr"),gap:12}}>
        {[{l:"Monthly Income",v:fmt(C.mInc),c:TH.green},{l:"Monthly Expenses",v:fmt(C.mExp),c:TH.red},{l:"Monthly Surplus",v:fmt(C.mSurplus),c:C.mSurplus>=0?TH.green:TH.red},{l:"Annual Surplus",v:fmt(C.mSurplus*12),c:C.mSurplus>=0?TH.green:TH.red}].map(x=>(
          <Card key={x.l} pad={14}><div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{x.l}</div><div style={{fontSize:22,fontWeight:800,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div></Card>
        ))}
      </div>
      {C.mSurplus>0&&<Card border={`${TH.green}35`}>
        <Hd>💡 Suggested Surplus Allocation</Hd>
        <div style={{...gr("1fr 1fr 1fr"),gap:10}}>
          {[{l:"Shares/ETFs (40%)",a:C.mSurplus*0.4,c:TH.cyan,d:"Liquid, diversified growth"},{l:"Offset/Principal (40%)",a:C.mSurplus*0.4,c:TH.green,d:"Reduce mortgage interest"},{l:"Emergency Fund (20%)",a:C.mSurplus*0.2,c:TH.yellow,d:"3–6 month cash buffer"}].map(x=>(
            <div key={x.l} style={{padding:12,background:TH.inp,borderRadius:9,borderLeft:`3px solid ${x.c}`}}><div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>{x.l}</div><div style={{fontSize:18,fontWeight:700,color:x.c,fontFamily:"'DM Mono',monospace",margin:"4px 0"}}>{fmt(x.a)}<span style={{fontSize:11,fontWeight:400}}>/mo</span></div><div style={{fontSize:11,color:TH.t3}}>{x.d}</div></div>
          ))}
        </div>
      </Card>}
      <div style={{...gr("1fr 1fr"),gap:16}}>
        <Card>
          <Hd>Income</Hd>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {["monthly","annual"].map(f=>(
              <button key={f} onClick={()=>setIncome(i=>({...i,freq:f}))} style={{flex:1,background:income.freq===f?TH.cyan:"transparent",border:`1px solid ${TH.border}`,borderRadius:7,color:income.freq===f?TH.act:TH.t2,padding:"7px",cursor:"pointer",fontFamily:"'Sora',sans-serif",fontSize:12,fontWeight:income.freq===f?700:400}}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <NI label={`Salary / Wages (${income.freq})`} val={income.salary} save={v=>setIncome(i=>({...i,salary:v}))} pre="$"/>
            <div>
              <NI label={`Rental Income (${income.freq})`} val={income.rental} save={v=>setIncome(i=>({...i,rental:v}))} pre="$"/>
              {C.totalRent>0&&!income.rental&&<div style={{fontSize:10,color:TH.cyan,marginTop:3}}>💡 From properties: {fmt(income.freq==="annual"?C.totalRent:C.totalRent/12)} — <button onClick={()=>setIncome(i=>({...i,rental:String(Math.round(income.freq==="annual"?C.totalRent:C.totalRent/12))}))} style={{background:"none",border:"none",color:TH.cyan,cursor:"pointer",fontSize:10,textDecoration:"underline",padding:0}}>auto-fill</button></div>}
            </div>
            <div>
              <NI label={`Dividends (${income.freq})`} val={income.divs} save={v=>setIncome(i=>({...i,divs:v}))} pre="$"/>
              {C.totalDiv>0&&!income.divs&&<div style={{fontSize:10,color:TH.cyan,marginTop:3}}>💡 From shares: {fmt(income.freq==="annual"?C.totalDiv:C.totalDiv/12)} — <button onClick={()=>setIncome(i=>({...i,divs:String(Math.round(income.freq==="annual"?C.totalDiv:C.totalDiv/12))}))} style={{background:"none",border:"none",color:TH.cyan,cursor:"pointer",fontSize:10,textDecoration:"underline",padding:0}}>auto-fill</button></div>}
            </div>
            <NI label={`Other Income (${income.freq})`} val={income.other} save={v=>setIncome(i=>({...i,other:v}))} pre="$"/>
          </div>
          <div style={{marginTop:14,padding:12,background:TH.inp,borderRadius:9,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>Total Monthly Income</span>
            <span style={{fontSize:18,fontWeight:700,color:TH.green,fontFamily:"'DM Mono',monospace"}}>{fmt(C.mInc)}</span>
          </div>
        </Card>
        <Card>
          <Hd>Expenses</Hd>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <div>
              <NI label="Housing / Mortgage (mo)" val={exp.housing} save={v=>setExp(e=>({...e,housing:v}))} pre="$"/>
              {C.totalMtgRepay>0&&!exp.housing&&<div style={{fontSize:10,color:TH.cyan,marginTop:3}}>💡 From properties: {fmt(C.totalMtgRepay)}/mo — <button onClick={()=>setExp(e=>({...e,housing:String(Math.round(C.totalMtgRepay))}))} style={{background:"none",border:"none",color:TH.cyan,cursor:"pointer",fontSize:10,textDecoration:"underline",padding:0}}>auto-fill</button></div>}
            </div>
            {[["Food / Groceries (mo)","food"],["Transport (mo)","transport"],["Utilities (mo)","utilities"],["Insurance (mo)","insurance"],["Entertainment (mo)","entertainment"],["Holidays (mo)","holidays"],["Health (mo)","health"],["Other (mo)","other"]].map(([l,f])=>(
              <NI key={f} label={l} val={exp[f]} save={v=>setExp(e=>({...e,[f]:v}))} pre="$"/>
            ))}
          </div>
          <div style={{marginTop:14,padding:12,background:TH.inp,borderRadius:9,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>Total Monthly Expenses</span>
            <span style={{fontSize:18,fontWeight:700,color:TH.red,fontFamily:"'DM Mono',monospace"}}>{fmt(C.mExp)}</span>
          </div>
        </Card>
      </div>
    </div>
  );

  // ══ TAB: SUPER ═════════════════════════════════════════════
  const tabSuper=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card><Hd>Superannuation</Hd>
        <div style={{...gr("1fr 1fr 1fr"),gap:12,marginBottom:16}}>
          <NI label="Current Balance" val={sup.bal} save={v=>setSup(s=>({...s,bal:v}))} pre="$"/>
          <NI label="Your Contributions (monthly)" val={sup.contribs} save={v=>setSup(s=>({...s,contribs:v}))} pre="$"/>
          <NI label="Employer SG Rate" val={sup.empRate} save={v=>setSup(s=>({...s,empRate:v}))} suf="%" ph="11.5"/>
          <NI label="Growth Rate p.a." val={sup.growth} save={v=>setSup(s=>({...s,growth:v}))} suf="%" ph="7"/>
          <NI label="Current Age" val={sup.age} save={v=>setSup(s=>({...s,age:v}))}/>
        </div>
      </Card>
      <Card><Hd>10-Year Projection</Hd>
        <div style={{...gr("1fr 1fr 1fr"),gap:12,marginBottom:12}}>
          {[{l:"Current Balance",v:fmt(n(sup.bal)),c:TH.cyan},{l:"Projected (10yr)",v:fmt(C.sup10),c:TH.green,sub:n(sup.age)>0?`At age ${n(sup.age)+10}`:""},{l:"Concessional Cap Remaining",v:fmt(Math.max(0,30000-n(sup.contribs)*12)),c:TH.yellow}].map(x=>(
            <div key={x.l} style={{padding:14,background:TH.inp,borderRadius:10}}><div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{x.l}</div><div style={{fontSize:18,fontWeight:700,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div>{x.sub&&<div style={{fontSize:11,color:TH.t3,marginTop:2}}>{x.sub}</div>}</div>
          ))}
        </div>
        <div style={{padding:10,background:`${TH.green}10`,border:`1px solid ${TH.green}25`,borderRadius:9,fontSize:12,color:TH.t2,lineHeight:1.6}}>💡 Concessional cap: $30,000 p.a. (2024–25). Contributions taxed at 15% vs your marginal rate. Speak to an accountant about salary sacrifice.</div>
      </Card>
    </div>
  );

  // ══ TAB: SCENARIOS ═════════════════════════════════════════
  const tabScenarios=()=>{
    const allNW=C.curves.flatMap(c=>c.pts.map(p=>p.nw)),maxNW=Math.max(...allNW,1);
    const xS=yr=>55+(yr/15)*537, yS=nw=>185-10-((nw/maxNW)*(175-20));
    return(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Card><Hd>Current Net Worth Snapshot</Hd>
          <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
            <div style={{paddingRight:20,borderRight:`1px solid ${TH.border}`}}>
              <div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Net Worth</div>
              <div style={{fontSize:32,fontWeight:800,color:TH.cyan,fontFamily:"'DM Mono',monospace"}}>{fmt(C.nw)}</div>
            </div>
            <div style={{display:"flex",gap:20,flexWrap:"wrap",flex:1}}>
              {[{l:"Property Equity",v:fmt(C.propEq),c:TH.text},{l:"Stocks",v:fmt(C.stockVal),c:TH.yellow},{l:"Crypto",v:fmt(C.cryptoVal),c:TH.orange},{l:"Other Assets",v:fmt(C.assetVal),c:TH.purple},{l:"Super",v:fmt(n(sup.bal)),c:TH.green}].map(x=>(
                <div key={x.l}>
                  <div style={{fontSize:9,color:TH.t3,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:2}}>{x.l}</div>
                  <div style={{fontSize:15,fontWeight:700,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <div style={{...fx(10),justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:10}}>
            <Hd>15-Year Net Worth Projection</Hd>
            <div style={fx(8)}>
              <span style={{fontSize:12,color:TH.t2}}>Monthly investment:</span>
              <div style={{position:"relative"}}><span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:TH.t3,fontSize:13,pointerEvents:"none"}}>$</span><input type="text" inputMode="decimal" value={settings.monthlyInv||""} onChange={e=>setSettings(s=>({...s,monthlyInv:e.target.value}))} style={{...inpBase(),width:100,padding:"6px 10px 6px 20px"}}/></div>
            </div>
          </div>
          <div style={{padding:"8px 12px",background:`${TH.cyan}08`,border:`1px solid ${TH.cyan}20`,borderRadius:9,marginBottom:12,fontSize:11,color:TH.t2}}>📊 Starts from current net worth. Monthly investment split: 50% shares / 30% property / 20% super.</div>
          <svg viewBox="0 0 600 205" style={{width:"100%",display:"block"}} onMouseLeave={()=>setScHover(null)}>
            {[0,0.25,0.5,0.75,1].map((f,i)=>{const v=maxNW*f,y=yS(maxNW*f);return(<g key={i}><line x1={55} y1={y} x2={592} y2={y} stroke={TH.border} strokeWidth={1} strokeDasharray="4,3"/><text x={51} y={y+4} textAnchor="end" fill={TH.t3} fontSize={9}>{v>=1e6?"$"+(v/1e6).toFixed(1)+"M":v>=1e3?"$"+(v/1e3).toFixed(0)+"K":"$0"}</text></g>);})}
            {[0,3,6,9,12,15].map(yr=><text key={yr} x={xS(yr)} y={200} textAnchor="middle" fill={TH.t3} fontSize={9}>Yr{yr}</text>)}
            {C.curves.map(c=>(<g key={c.name}><path d={"M "+c.pts.map(p=>`${xS(p.yr).toFixed(1)},${yS(p.nw).toFixed(1)}`).join(" L ")} fill="none" stroke={c.col} strokeWidth={2.5} strokeLinecap="round"/>{c.pts.map(p=>(<circle key={p.yr} cx={xS(p.yr)} cy={yS(p.nw)} r={scHover===p.yr?5:2.5} fill={c.col} onMouseEnter={()=>setScHover(p.yr)} style={{cursor:"crosshair"}}/>))}</g>))}
            {scHover!==null&&(<><line x1={xS(scHover)} y1={10} x2={xS(scHover)} y2={185} stroke={TH.t3} strokeWidth={1} strokeDasharray="3,3"/>{C.curves.map((c,i)=>{const pt=c.pts.find(p=>p.yr===scHover);if(!pt)return null;return(<text key={c.name} x={xS(scHover)+6} y={yS(pt.nw)-2+i*13} fill={c.col} fontSize={9}>{c.name.slice(0,4)}: {pt.nw>=1e6?"$"+(pt.nw/1e6).toFixed(2)+"M":"$"+(pt.nw/1e3).toFixed(0)+"K"}</text>);})}</>)}
          </svg>
          <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:6}}>{C.curves.map(c=>(<div key={c.name} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:TH.t2}}><div style={{width:18,height:3,background:c.col,borderRadius:2}}/>{c.name}</div>))}</div>
        </Card>
        <div style={{...gr("1fr 1fr 1fr"),gap:14}}>{C.curves.map(sc=>(<Card key={sc.name} border={`${sc.col}40`}><div style={{color:sc.col,fontWeight:700,fontSize:15,marginBottom:10}}>{sc.name}</div><div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>Net Worth at Year 10</div><div style={{fontSize:26,fontWeight:800,color:sc.col,fontFamily:"'DM Mono',monospace",margin:"6px 0"}}>{fmt(sc.pts[10].nw)}</div></Card>))}</div>
      </div>
    );
  };

  // ══ TAB: INSIGHTS ══════════════════════════════════════════
  const tabInsights=()=>{
    const propPct=C.nw>0?(C.propEq/C.nw)*100:0,stockPct=C.nw>0?(C.stockVal/C.nw)*100:0,cryptoPct=C.nw>0?(C.cryptoVal/C.nw)*100:0;
    const obs=[];
    if(C.propEq===0) obs.push({i:"🏠",t:"No property holdings detected",d:"Property is a common asset class for Australian investors, offering leveraged capital growth and rental income."});
    if(propPct>70&&stockPct<15) obs.push({i:"⚖️",t:"Portfolio heavily weighted to property",d:`Property is ~${propPct.toFixed(0)}% of net worth. Some investors in this position direct future surplus into liquid ETFs for diversification rather than adding more property debt.`});
    if(C.propEq>0&&stockPct<10&&C.nw>100000) obs.push({i:"📈",t:"Shares appear underweight",d:`Shares are ~${stockPct.toFixed(0)}% of net worth. Broad ETFs (VAS for Australian shares, VGS for global) are a common diversification tool alongside property.`});
    if(C.propCF<0) obs.push({i:"🔴",t:"Properties are negatively geared",d:`Properties are negatively geared by ~${fmt(Math.abs(C.propCF))}/yr. An accountant can help assess whether the tax offset is beneficial in your situation.`});
    if(C.propCF>0&&C.propEq>0) obs.push({i:"✅",t:"Properties are positively geared",d:`Your properties generate ${fmt(C.propCF)}/yr net cashflow — covering their costs and producing surplus.`});
    if(cryptoPct>20) obs.push({i:"⚠️",t:"Crypto is a high share of net worth",d:`Crypto is ~${cryptoPct.toFixed(0)}% of your portfolio. Many commentators suggest limiting high-volatility assets to 5–10% of net worth.`});
    if(n(sup.contribs)===0) obs.push({i:"🧾",t:"No voluntary super contributions recorded",d:"Concessional contributions are taxed at 15% vs your marginal rate (up to 47%). The annual cap is $30,000 (2024–25 FY). Worth discussing with an accountant."});
    if(C.debtBal>0) obs.push({i:"💳",t:"Non-mortgage debt detected",d:`You have ${fmt(C.debtBal)} in non-property debt. High-interest debt typically costs more than what investments reliably generate.`});
    if(C.mSurplus>2000) obs.push({i:"🚀",t:"Strong monthly surplus",d:`You have ${fmt(C.mSurplus)}/mo surplus. Consistently investing this compounds significantly — see the Scenarios tab for projections.`});
    if(C.mSurplus<0) obs.push({i:"🚨",t:"Monthly budget is in deficit",d:`Expenses exceed income by ~${fmt(Math.abs(C.mSurplus))}/mo. Addressing a deficit is generally a priority before new investments.`});
    if(obs.length===0) obs.push({i:"✅",t:"No major observations",d:"Your portfolio looks reasonably balanced. Ongoing considerations include tax efficiency, insurance, and estate planning."});
    return(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{padding:"10px 14px",background:`${TH.yellow}15`,border:`1px solid ${TH.yellow}40`,borderRadius:10,fontSize:12,color:TH.t2,lineHeight:1.6}}>⚖️ <strong style={{color:TH.yellow}}>General information only</strong> — not personal financial advice. Not an AFS licensee. Consult a licensed financial adviser.</div>
        <Card border={`${TH.cyan}40`}>
          <Hd>💬 Ask networth.</Hd>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:12}}>
            {["How do I reach $100k in passive income?","Should my next capital go into property or stocks?","How do I reach $1M in equity?","Am I on track to retire early?","What's the most tax-efficient move right now?"].map(q=>(
              <button key={q} onClick={()=>{setAiQ(q);askAI(q);}} style={{background:`${TH.cyan}12`,border:`1px solid ${TH.cyan}28`,borderRadius:20,color:TH.cyan,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"'Sora',sans-serif"}}>{q}</button>
            ))}
          </div>
          <div style={fx(10)}>
            <input value={aiQ} onChange={e=>setAiQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askAI(aiQ)} placeholder="Ask anything about your portfolio..." style={{...inpBase(),padding:"11px 13px",flex:1}}/>
            <button onClick={()=>askAI(aiQ)} disabled={aiLoad||!aiQ.trim()} style={{background:TH.cyan,border:"none",borderRadius:9,color:TH.act,padding:"11px 18px",cursor:"pointer",fontWeight:700,fontFamily:"'Sora',sans-serif",fontSize:13,opacity:aiLoad?0.6:1,flexShrink:0}}>{aiLoad?"...":"Ask →"}</button>
          </div>
          {aiLoad&&<div style={{marginTop:12,padding:12,background:TH.inp,borderRadius:9,color:TH.t2,fontSize:13}}>Analysing your portfolio...</div>}
          {aiA&&!aiLoad&&<div style={{marginTop:12,padding:14,background:TH.inp,borderRadius:10}}><div style={{fontSize:10,color:TH.cyan,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6,fontFamily:"'DM Mono',monospace"}}>networth. response</div><p style={{color:TH.text,fontSize:13,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiA}</p></div>}
        </Card>
        <Card><Hd>Portfolio Observations</Hd>{obs.map((r,i)=>(<div key={i} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:`1px solid ${TH.border}`,alignItems:"flex-start"}}><span style={{fontSize:20,flexShrink:0}}>{r.i}</span><div><div style={{fontSize:13,fontWeight:600,color:TH.text,marginBottom:3}}>{r.t}</div><div style={{fontSize:12,color:TH.t2,lineHeight:1.6}}>{r.d}</div></div></div>))}</Card>
      </div>
    );
  };

  // ══ TAB: GOALS ═════════════════════════════════════════════
  const tabGoals=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card border={`${TH.yellow}40`}>
        <Hd color={TH.yellow}>🏆 Wealth Level</Hd>
        <div style={fx(16)}>
          <div style={{textAlign:"center",flexShrink:0}}><div style={{fontSize:44}}>{C.curM?.b||"🌱"}</div><div style={{color:TH.yellow,fontWeight:700,fontSize:13}}>{C.curM?`Level ${MILES.indexOf(C.curM)+1}`:"Starting"}</div></div>
          <div style={{flex:1,minWidth:160}}>{C.nextM&&<><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:TH.t2,marginBottom:5}}><span>Next: {C.nextM.b} {MILES.find(m=>m.b===C.nextM.b)&&(["$50K","$100K","$250K","$500K","$1M","$2M","$5M"][MILES.indexOf(C.nextM)])}</span><span style={{color:TH.yellow}}>{fmt(C.nw)} / {fmt(C.nextM.v)}</span></div><div style={{height:12,background:TH.inp,borderRadius:6,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,(C.nw/C.nextM.v)*100)}%`,background:`linear-gradient(90deg,${TH.yellow},${TH.orange})`,borderRadius:6}}/></div><div style={{marginTop:4,fontSize:11,color:TH.t3}}>Gap: {fmt(C.nextM.v-C.nw)}</div></>}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{MILES.map(m=>(<div key={m.v} title={fmt(m.v)} style={{fontSize:20,opacity:C.nw>=m.v?1:0.25}}>{m.b}</div>))}</div>
        </div>
      </Card>
      <Card border={`${TH.orange}40`}>
        <Hd color={TH.orange}>🔥 Early Retirement Calculator (FIRE)</Hd>
        <div style={{padding:"8px 12px",background:`${TH.cyan}08`,border:`1px solid ${TH.cyan}20`,borderRadius:9,marginBottom:12,fontSize:11,color:TH.t2}}>The "4% rule" estimates the portfolio needed for indefinite withdrawals — a planning concept, not a guarantee.</div>
        <div style={{...gr("1fr 1fr"),marginBottom:12}}>
          <NI label="Target Annual Expenses" val={fire.exp} save={v=>setFire(f=>({...f,exp:v}))} pre="$"/>
          <NI label="Safe Withdrawal Rate" val={fire.swr} save={v=>setFire(f=>({...f,swr:v}))} suf="%" ph="4"/>
        </div>
        {fireR&&<><div style={{...gr("1fr 1fr 1fr"),gap:10,marginBottom:10}}>{[{l:"Lean FIRE",v:fmt(fireR.lean),c:TH.yellow},{l:"Regular FIRE",v:fmt(fireR.reg),c:TH.cyan},{l:"Fat FIRE",v:fmt(fireR.fat),c:TH.green}].map(x=>(<div key={x.l} style={{padding:12,background:TH.inp,borderRadius:10,textAlign:"center"}}><div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{x.l}</div><div style={{fontSize:18,fontWeight:800,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div></div>))}</div><div style={{padding:10,background:TH.inp,borderRadius:9,fontSize:12,color:TH.t2,lineHeight:1.7}}>Current: <strong style={{color:TH.cyan}}>{fmt(C.nw)}</strong> · Gap to Regular FIRE: <strong style={{color:TH.red}}>{fmt(fireR.gap)}</strong>{fireR.yrs!==null&&<> · Est. <strong style={{color:TH.green}}>{fireR.yrs.toFixed(1)} years</strong> at current surplus</>}</div></>}
      </Card>
      {C.tg.map(g=>{const pc=g.pp>=75?TH.green:g.pp>=40?TH.yellow:TH.red;return(
        <Card key={g.id} border={`${pc}28`}>
          <div style={{...fx(10),justifyContent:"space-between",marginBottom:12}}>
            <TI val={g.title} save={v=>upG(g.id,"title",v)} ph="Goal title (e.g. Reach $2M net worth)" style={{background:"none",border:"none",color:TH.text,fontWeight:600,fontSize:15,flex:1}}/>
            <RmBtn onClick={()=>setGoals(gs=>gs.filter(x=>x.id!==g.id))}/>
          </div>
          <div style={{...gr("1fr 1fr 1fr 1fr"),gap:10,marginBottom:12}}>
            <SI label="Category" val={g.cat} onChange={v=>upG(g.id,"cat",v)} opts={["Net Worth","Property","Stocks","Super","Savings"]}/>
            <NI label="Target Amount" val={g.amt} save={v=>upG(g.id,"amt",v)} pre="$"/>
            <NI label="Target Year" val={g.yr} save={v=>upG(g.id,"yr",v)} ph="2030"/>
            <TI label="Notes" val={g.notes} save={v=>upG(g.id,"notes",v)} ph="Optional notes"/>
          </div>
          <div style={{...gr("1fr 1fr 1fr 1fr"),gap:10,marginBottom:12}}>{[{l:"Current",v:fmt(g.cur),c:TH.cyan},{l:"Target",v:fmt(n(g.amt)),c:TH.t2},{l:"Gap",v:fmt(g.gap),c:g.gap>0?TH.red:TH.green},{l:"Monthly Needed",v:fmt(g.monthly),c:pc}].map(x=>(<div key={x.l} style={{padding:10,background:TH.inp,borderRadius:9}}><div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{x.l}</div><div style={{fontSize:15,fontWeight:700,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div></div>))}</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:TH.t2,marginBottom:5}}><span>Progress</span><span style={{color:pc,fontWeight:600}}>{g.pp.toFixed(0)}% · {g.yrsLeft} yr{g.yrsLeft!==1?"s":""} left</span></div>
          <div style={{height:9,background:TH.inp,borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:`${g.pp}%`,background:`linear-gradient(90deg,${pc},${pc}88)`,borderRadius:5}}/></div>
        </Card>
      );})}
      <AddBtn onClick={()=>setGoals(gs=>[...gs,{id:uid(),title:"",cat:"Net Worth",amt:"",yr:"",notes:""}])} label="Add Goal"/>
    </div>
  );

  // ══ TAB: STRESS TESTS ══════════════════════════════════════
  const tabStress=()=>{
    const tests=[
      {l:"Property Correction −15%",i:"🏚️",s:"Moderate",col:TH.orange,desc:"Property prices fall 15% — consistent with the 2017–19 Sydney/Melbourne correction.",impact:-(C.propVal*0.15),nw:C.nw-C.propVal*0.15,mit:["Hold — corrections have historically recovered within 3–5 years","Rental income continues as a buffer","Ensure 6+ months of repayments in offset"]},
      {l:"Rate Hike +2%",i:"📈",s:"Moderate",col:TH.orange,desc:"RBA raises cash rate 200bps — similar to the 2022–23 rate cycle.",impact:-(C.propMtg*0.02),nw:C.nw-C.propMtg*0.02*4,mit:["Consider fixing a portion of your mortgage","Build offset balance now","Rents often rise during rate cycles — review pricing"]},
      {l:"Sharemarket Pullback −25%",i:"📉",s:"Moderate",col:TH.yellow,desc:"Global equities fall 25% — consistent with 2022 or early 2020.",impact:-(C.stockVal*0.25+C.cryptoVal*0.4),nw:C.nw-C.stockVal*0.25-C.cryptoVal*0.4,mit:["Don't sell — moderate corrections typically recover in 1–3 years","Consider continuing ETF contributions during the pullback","Property and super provide portfolio stability"]},
      {l:"Stagflation",i:"🔥",s:"Moderate",col:TH.yellow,desc:"Inflation 6–8% with stagnant growth for 2+ years.",impact:-(C.nw*0.10),nw:C.nw*0.90,mit:["Property and commodities historically hedge inflation well","Review super fund allocation — consider real asset exposure","Consider locking in fixed rates"]},
    ];
    return(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{padding:"10px 14px",background:`${TH.cyan}08`,border:`1px solid ${TH.cyan}20`,borderRadius:9,fontSize:12,color:TH.t2}}>ℹ️ Modelling tools to identify portfolio vulnerabilities — not predictions. Consult a licensed financial adviser for personalised risk assessment.</div>
        {tests.map(t=>{
          const ret=C.nw>0?Math.max(0,(t.nw/C.nw)*100):100,sCol={Severe:TH.red,High:TH.orange,Moderate:TH.yellow}[t.s];
          return(
            <Card key={t.l} border={`${t.col}28`}>
              <div style={{...fx(12),justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
                <div style={fx(10)}><span style={{fontSize:24}}>{t.i}</span><div><div style={{fontSize:14,fontWeight:700,color:t.col}}>{t.l}</div><div style={{fontSize:11,color:TH.t2,marginTop:2}}>{t.desc}</div></div></div>
                <span style={{background:`${sCol}18`,color:sCol,border:`1px solid ${sCol}35`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600}}>{t.s}</span>
              </div>
              <div style={{...gr("1fr 1fr 1fr"),gap:10,marginBottom:12}}>{[{l:"Current Net Worth",v:fmt(C.nw),c:TH.cyan},{l:"Modelled Impact",v:fmt(t.impact),c:t.col},{l:"Net Worth After",v:fmt(t.nw),c:t.nw>=0?TH.green:TH.red}].map(x=>(<div key={x.l} style={{padding:10,background:TH.inp,borderRadius:9}}><div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>{x.l}</div><div style={{fontSize:16,fontWeight:700,color:x.c,fontFamily:"'DM Mono',monospace",marginTop:3}}>{x.v}</div></div>))}</div>
              <div style={{fontSize:10,color:TH.t2,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.07em"}}>Value retained</div>
              <div style={{height:8,background:TH.inp,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${ret}%`,background:`linear-gradient(90deg,${t.col},${t.col}88)`,borderRadius:4}}/></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:TH.t3,marginTop:3,marginBottom:12}}><span>$0</span><span style={{color:TH.cyan}}>{ret.toFixed(0)}% retained</span><span>{fmt(C.nw)}</span></div>
              <div style={{paddingTop:12,borderTop:`1px solid ${TH.border}`}}><div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Considerations</div>{t.mit.map((m,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:7,fontSize:12}}><span style={{color:t.col,flexShrink:0}}>→</span><span style={{color:TH.t2,lineHeight:1.5}}>{m}</span></div>)}</div>
            </Card>
          );
        })}
      </div>
    );
  };

  // ══ TAB: ACCOUNTING ════════════════════════════════════════
  const tabAccounting=()=>{
    const totalRent=C.totalRent,totalOut=C.tp.reduce((s,p)=>s+p.ao,0);
    const items=[{l:"Property Equity",v:C.propEq,c:TH.cyan},{l:"Stocks & ETFs",v:C.stockVal,c:TH.yellow},{l:"Crypto",v:C.cryptoVal,c:TH.orange},{l:"Other Assets",v:C.assetVal,c:TH.purple},{l:"Superannuation",v:n(sup.bal),c:TH.green},{l:"Non-Mtg Debts",v:-C.debtBal,c:TH.red}];
    const cfRows=[{l:"INVESTMENT INFLOWS",h:true},{l:"Rental Income p.a.",v:totalRent,pos:true},{l:"Share Dividends p.a.",v:C.totalDiv,pos:true},{l:"TOTAL INVESTMENT INFLOWS",v:totalRent+C.totalDiv,tot:true,pos:true},{l:"INVESTMENT OUTFLOWS",h:true},...C.tp.map(p=>({l:`  ${p.name||"Property"} outgoings p.a.`,v:p.ao,pos:false})),{l:"Debt Payments p.a.",v:debts.reduce((s,d)=>s+n(d.minPay)*12,0),pos:false},{l:"TOTAL INVESTMENT OUTFLOWS",v:totalOut,tot:true,pos:false},{l:"NET INVESTMENT CASHFLOW",v:totalRent+C.totalDiv-totalOut,grand:true,pos:totalRent+C.totalDiv-totalOut>=0}];
    return(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        
        <Card><Hd>Asset Allocation</Hd><div style={{...gr("1fr 1fr 1fr 1fr 1fr 1fr"),gap:10}}>{items.map(x=>{const p=((Math.abs(x.v)/(C.nw||1))*100).toFixed(1);return(<div key={x.l} style={{padding:12,background:TH.inp,borderRadius:10,border:`1px solid ${x.c}25`}}><div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{x.l}</div><div style={{fontSize:14,fontWeight:700,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v<0?"-":""}{fmt(Math.abs(x.v))}</div><div style={{marginTop:6,height:3,background:TH.border,borderRadius:2}}><div style={{height:"100%",width:`${Math.min(100,p)}%`,background:x.c,borderRadius:2}}/></div><div style={{marginTop:2,fontSize:10,color:TH.t3}}>{p}%</div></div>);})} </div></Card>
        <Card border={`${TH.yellow}28`}><Hd>Tax Data for Your Accountant</Hd><div style={{padding:"8px 12px",background:`${TH.cyan}08`,border:`1px solid ${TH.cyan}20`,borderRadius:9,marginBottom:12,fontSize:11,color:TH.t2}}>networth. does not calculate your tax — these are the raw investment figures your accountant will need.</div><div style={{...gr("1fr 1fr 1fr"),gap:10}}>{[{l:"Rental Income p.a.",v:fmt(totalRent),c:TH.cyan},{l:"Rental Expenses p.a.",v:fmt(totalOut),c:TH.red},{l:"Net Rental Position",v:fmt(C.propCF),c:C.propCF>=0?TH.green:TH.orange},{l:"Dividend Income p.a.",v:fmt(C.totalDiv),c:TH.yellow},{l:"Unrealised Stock Gain",v:fmt(C.ts.reduce((s,x)=>s+x.gain,0)),c:TH.green},{l:"Unrealised Crypto Gain",v:fmt(C.tc.reduce((s,c)=>s+c.gain,0)),c:TH.green}].map(x=>(<div key={x.l} style={{padding:10,background:TH.inp,borderRadius:9}}><div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{x.l}</div><div style={{fontSize:15,fontWeight:700,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div></div>))}</div></Card>
        <Card><Hd>Investment Cashflow Statement (Annual)</Hd><table style={{width:"100%",borderCollapse:"collapse"}}><tbody>{cfRows.map((r,i)=>(<tr key={i} style={{background:r.grand?`${TH.cyan}06`:r.tot?TH.inp:"transparent",borderTop:(r.h||r.tot||r.grand)?`1px solid ${TH.border}`:"none"}}><td style={{padding:"8px 12px",fontSize:r.h?10:r.grand?13:12,color:r.h?TH.t2:TH.text,textTransform:r.h?"uppercase":"none",letterSpacing:r.h?"0.09em":"normal",fontWeight:(r.tot||r.grand)?700:400}}>{r.l}</td>{!r.h&&<td style={{padding:"8px 12px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:r.grand?14:12,color:r.grand?(r.pos?TH.green:TH.red):r.tot?TH.text:r.pos?TH.green:TH.red,fontWeight:(r.tot||r.grand)?700:400}}>{fmt(r.v)}</td>}</tr>))}</tbody></table></Card>
        <Card><Hd>Total Net Worth</Hd><div style={{textAlign:"center",padding:"18px 0"}}><div style={{fontSize:10,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:7}}>Combined Net Worth</div><div style={{fontSize:44,fontWeight:800,color:TH.cyan,fontFamily:"'DM Mono',monospace"}}>{fmt(C.nw)}</div><div style={{marginTop:6,color:TH.t3,fontSize:12}}>Property · Shares · Crypto · Assets · Super · minus Debts</div></div></Card>
      </div>
    );
  };

  // ══ TAB: SETTINGS ══════════════════════════════════════════
  const tabSettings=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card border={`${TH.cyan}40`}><Hd>Subscription</Hd><div style={{...fx(14),justifyContent:"space-between",flexWrap:"wrap",gap:12}}><div><div style={{...fx(8),marginBottom:4}}><div style={{fontSize:14,fontWeight:700,color:TH.text}}>networth. {isPro?"Pro ✨":"Free"}</div>{isPro&&<span style={{background:`${TH.cyan}20`,color:TH.cyan,border:`1px solid ${TH.cyan}35`,borderRadius:20,padding:"1px 9px",fontSize:10,fontWeight:700}}>ACTIVE</span>}</div><div style={{fontSize:12,color:TH.t2,lineHeight:1.5}}>{isPro?"Full access to Goals, Stress Tests, AI Insights & Accounting.":"Upgrade to Pro ($10/mo) for Goals, Stress Tests, AI Insights & Accounting."}</div></div><button onClick={()=>setIsPro(p=>!p)} style={{background:isPro?TH.inp:TH.cyan,border:`1px solid ${isPro?TH.border:TH.cyan}`,borderRadius:9,color:isPro?TH.t2:TH.act,padding:"9px 18px",cursor:"pointer",fontWeight:700,fontFamily:"'Sora',sans-serif",fontSize:12,flexShrink:0}}>{isPro?"Switch to Free view":"Unlock Pro — Try Free"}</button></div></Card>
      <Card><Hd>Appearance</Hd><div style={{display:"flex",gap:10,maxWidth:260}}>{[["dark","🌙 Dark"],["light","☀️ Light"]].map(([v,l])=>(<button key={v} onClick={()=>setDark(v==="dark")} style={{flex:1,background:(dark&&v==="dark")||(!dark&&v==="light")?TH.cyan:"transparent",border:`1px solid ${TH.border}`,borderRadius:9,color:(dark&&v==="dark")||(!dark&&v==="light")?TH.act:TH.t2,padding:"11px",cursor:"pointer",fontFamily:"'Sora',sans-serif",fontSize:12,fontWeight:700}}>{l}</button>))}</div></Card>
      <Card><Hd>Scenario Settings</Hd><div style={{maxWidth:220}}><NI label="Monthly Investment Amount" val={settings.monthlyInv} save={v=>setSettings(s=>({...s,monthlyInv:v}))} pre="$"/></div></Card>
      <Card><Hd>Data</Hd><div style={{fontSize:12,color:TH.t2,marginBottom:12,lineHeight:1.6}}>All data is stored in your browser only — nothing sent to any server. Export before refreshing to avoid losing data.</div><button onClick={()=>{const d={props,stocks,crypto,assets,debts,goals,income,exp,sup,settings};const blob=new Blob([JSON.stringify(d)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="networth-backup.json";a.style.display="none";document.body.appendChild(a);a.click();setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},100);}} style={{background:TH.cyan,border:"none",borderRadius:8,color:TH.act,padding:"9px 18px",cursor:"pointer",fontWeight:600,fontFamily:"'Sora',sans-serif",fontSize:12}}>⬇️ Export Data (JSON)</button></Card>
      <div style={{padding:12,background:TH.inp,borderRadius:10,fontSize:11,color:TH.t3,lineHeight:1.8}}><strong style={{color:TH.t2}}>networth.</strong> — Personal Wealth Dashboard for Aussie Investors<br/>General financial information only. Not personal financial advice. Not an AFS licensee.<br/>Always consult a licensed financial adviser before making investment decisions.</div>
    </div>
  );

  const paywall=(name)=>(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",textAlign:"center",gap:18}}>
      <div style={{fontSize:48}}>🔒</div>
      <div style={{fontSize:20,fontWeight:800,color:TH.text,fontFamily:"'Sora',sans-serif"}}>{name}</div>
      <div style={{fontSize:14,color:TH.t2,maxWidth:380,lineHeight:1.7}}>This is a <strong style={{color:TH.cyan}}>networth. Pro</strong> feature. Unlock goals, stress tests, AI insights, and full accounting for $10/mo.</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:320}}>
        <div style={{padding:"14px 18px",background:`${TH.cyan}10`,border:`1px solid ${TH.cyan}28`,borderRadius:12}}><div style={{fontWeight:700,color:TH.cyan,marginBottom:8}}>Pro — $10/mo</div>{["🎯 Goals + FIRE calculator","⚡ Stress tests","💡 AI portfolio insights","📊 Full accounting & tax summary"].map(f=><div key={f} style={{fontSize:12,color:TH.text,marginBottom:5,display:"flex",gap:7,alignItems:"center"}}><span style={{color:TH.green,fontSize:10}}>✓</span>{f}</div>)}</div>
        <button onClick={()=>setIsPro(true)} style={{background:TH.cyan,border:"none",borderRadius:11,color:TH.act,padding:"13px",cursor:"pointer",fontWeight:800,fontSize:13,fontFamily:"'Sora',sans-serif"}}>Unlock Pro — Try Free</button>
        <p style={{fontSize:11,color:TH.t3}}>No payment required right now. Billing coming soon.</p>
      </div>
    </div>
  );

  const renderTab=()=>{
    if(tab==="🏠 Property") return tabProperty();
    if(tab==="📈 Stocks") return tabStocks();
    if(tab==="₿ Crypto") return tabCrypto();
    if(tab==="💼 Assets & Debts") return tabAssetsDebts();
    if(tab==="💵 Income & Expenses") return tabIncome();
    if(tab==="🧾 Super") return tabSuper();
    if(tab==="🔭 Scenarios") return tabScenarios();
    if(tab==="💡 Insights") return isPro?tabInsights():paywall("Insights");
    if(tab==="🎯 Goals") return isPro?tabGoals():paywall("Goals");
    if(tab==="⚡ Stress Tests") return isPro?tabStress():paywall("Stress Tests");
    if(tab==="📊 Accounting") return isPro?tabAccounting():paywall("Accounting");
    return tabSettings();
  };

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${TH.bg};}
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none;}
        input[type=month]{color-scheme:${dark?"dark":"light"};}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:${TH.bg};}
        ::-webkit-scrollbar-thumb{background:${TH.border};border-radius:3px;}
        select option{background:${TH.inp};}
        @media print{.np{display:none!important;}body{background:white!important;}}
      `}</style>

      {disc&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:16}}>
          <div style={{background:TH.card,border:`1px solid ${TH.border}`,borderRadius:18,padding:32,maxWidth:480,width:"100%"}}>
            <div style={{fontSize:36,fontWeight:800,marginBottom:6,fontFamily:"'Sora',sans-serif",letterSpacing:"-0.02em"}}><span style={{color:TH.cyan}}>net</span><span style={{color:TH.text}}>worth.</span></div>
            <div style={{fontSize:12,color:TH.t2,marginBottom:18}}>Personal Wealth Dashboard for Aussie Investors</div>
            <div style={{padding:16,background:`${TH.yellow}12`,border:`1px solid ${TH.yellow}35`,borderRadius:11,marginBottom:18}}><div style={{fontWeight:700,color:TH.yellow,marginBottom:8}}>⚖️ Important — Please Read</div><p style={{color:TH.t2,fontSize:12,lineHeight:1.8}}>networth. provides <strong style={{color:TH.text}}>general financial information only</strong> and does not constitute personal financial advice under the <em>Corporations Act 2001</em>. networth. is <strong style={{color:TH.text}}>not an AFS licensee</strong>. All projections are <strong style={{color:TH.text}}>illustrative estimates only</strong>. Consult a <strong style={{color:TH.text}}>licensed financial adviser</strong> before making investment decisions.</p></div>
            <p style={{color:TH.t3,fontSize:11,marginBottom:18,lineHeight:1.5}}>All data stays in your browser — nothing is sent to any server.</p>
            <button onClick={()=>setDisc(false)} style={{width:"100%",background:TH.cyan,border:"none",borderRadius:11,color:TH.act,padding:"14px",cursor:"pointer",fontWeight:800,fontSize:14,fontFamily:"'Sora',sans-serif"}}>I understand — Let's go</button>
          </div>
        </div>
      )}

      <div style={{minHeight:"100vh",background:TH.bg,fontFamily:"'Sora',sans-serif",color:TH.text}}>
        <div className="np" style={{background:TH.card,borderBottom:`1px solid ${TH.border}`,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div style={fx(12)}>
            <div style={{fontSize:20,fontWeight:800,fontFamily:"'Sora',sans-serif"}}><span style={{color:TH.cyan}}>net</span><span style={{color:TH.text}}>worth.</span></div>
            {C.curM&&<span style={{background:`${TH.yellow}18`,color:TH.yellow,border:`1px solid ${TH.yellow}35`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600}}>{C.curM.b} Level {MILES.indexOf(C.curM)+1}</span>}
            {isPro&&<span style={{background:`${TH.cyan}18`,color:TH.cyan,border:`1px solid ${TH.cyan}35`,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700}}>PRO</span>}
          </div>
          <div style={{...fx(18),flexWrap:"wrap"}}>
            {[{l:"Net Worth",v:fmt(C.nw),c:TH.cyan},{l:"Surplus/mo",v:fmt(C.mSurplus),c:C.mSurplus>=0?TH.green:TH.red},{l:"10yr",v:fmt(C.nw10),c:TH.purple}].map(x=>(<div key={x.l} style={{textAlign:"right"}}><div style={{fontSize:9,color:TH.t2,textTransform:"uppercase",letterSpacing:"0.08em"}}>{x.l}</div><div style={{fontSize:16,fontWeight:800,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div></div>))}
            <button onClick={()=>setDark(d=>!d)} style={{background:TH.inp,border:`1px solid ${TH.border}`,borderRadius:7,color:TH.t2,padding:"6px 10px",cursor:"pointer",fontSize:14}}>{dark?"☀️":"🌙"}</button>
          </div>
        </div>
        <div className="np" style={{display:"flex",gap:2,padding:"11px 20px 0",borderBottom:`1px solid ${TH.border}`,background:TH.card,overflowX:"auto"}}>
          {TABS.map(t=>{const locked=PRO_TABS.has(t)&&!isPro;return(<button key={t} onClick={()=>setTab(t)} style={{background:tab===t?TH.cyan:"transparent",border:tab===t?"none":`1px solid ${TH.border}`,borderBottom:"none",borderRadius:"7px 7px 0 0",color:tab===t?TH.act:locked?TH.t3:TH.t2,padding:"7px 11px",cursor:"pointer",fontWeight:tab===t?700:400,fontSize:11,fontFamily:"'Sora',sans-serif",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4,opacity:locked?0.6:1}}>{t}{locked&&<span style={{fontSize:9}}>🔒</span>}</button>);})}
        </div>
        <div style={{padding:"18px 20px",maxWidth:1400,margin:"0 auto"}}>{renderTab()}</div>
        <div className="np" style={{borderTop:`1px solid ${TH.border}`,padding:"9px 20px",textAlign:"center",fontSize:10,color:TH.t3,background:TH.card}}>networth. · General information only · Not financial advice · Not an AFS licensee · Consult a licensed financial adviser</div>
      </div>
    </>
  );
}