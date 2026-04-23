import { useState, useMemo } from "react";

const D={bg:"#060e1a",card:"#0f2035",border:"#1e3a5f",text:"#e8f4fd",t2:"#8a9bb0",t3:"#5a7a9a",input:"#0d1b2a",ib:"#1e3048",cyan:"#4fc3f7",green:"#34d399",red:"#f87171",yellow:"#fbbf24",purple:"#a78bfa",orange:"#f97316",act:"#060e1a"};
const L={bg:"#f0f4f8",card:"#ffffff",border:"#d0dce8",text:"#0d1f33",t2:"#4a6280",t3:"#8aa0b8",input:"#e8eef5",ib:"#c8d8e8",cyan:"#0284c7",green:"#059669",red:"#dc2626",yellow:"#d97706",purple:"#7c3aed",orange:"#ea580c",act:"#ffffff"};

const fmt=(n)=>!n&&n!==0?"$0":"$"+Number(n).toLocaleString("en-AU",{maximumFractionDigits:0});
const pct=(n)=>isNaN(n)?"0%":n.toFixed(1)+"%";
const n=(v)=>isNaN(parseFloat(v))?0:parseFloat(v);
let _i=1; const id=()=>String(_i++);

const TABS=["🏠 Property","📈 Stocks","₿ Crypto","💼 Assets & Debts","💵 Income & Expenses","🧾 Super","🔭 Scenarios","💡 Insights","🎯 Goals","⚡ Stress Tests","📊 Accounting","⚙️ Settings"];
const PRO=new Set(["💡 Insights","🎯 Goals","⚡ Stress Tests","📊 Accounting"]);
const MILES=[{v:50000,l:"$50K",b:"🌱"},{v:100000,l:"$100K",b:"🌿"},{v:250000,l:"$250K",b:"🌳"},{v:500000,l:"$500K",b:"⭐"},{v:1000000,l:"$1M",b:"🏆"},{v:2000000,l:"$2M",b:"💎"},{v:5000000,l:"$5M",b:"👑"}];

export default function App(){
  const [tab,setTab]=useState("🏠 Property");
  const [dark,setDark]=useState(true);
  const [isPro,setIsPro]=useState(true);
  const [disc,setDisc]=useState(true);
  const [props,setProps]=useState([]);
  const [stocks,setStocks]=useState([]);
  const [crypto,setCrypto]=useState([]);
  const [assets,setAssets]=useState([]);
  const [debts,setDebts]=useState([]);
  const [goals,setGoals]=useState([]);
  const [income,setIncome]=useState({salary:"",other:"",rental:"",divs:"",freq:"monthly"});
  const [exp,setExp]=useState({housing:"",food:"",transport:"",utilities:"",insurance:"",entertainment:"",health:"",other:""});
  const [sup,setSup]=useState({bal:"",contribs:"",empRate:"11.5",growth:"7",age:""});
  const [settings,setSettings]=useState({monthlyInv:"2000"});
  const [bcOpen,setBcOpen]=useState(false);
  const [bc,setBc]=useState({income:"",deps:"0",debts:"",rate:"6.5"});
  const [fire,setFire]=useState({exp:"",swr:"4",ret:"7"});
  const [aiQ,setAiQ]=useState("");
  const [aiA,setAiA]=useState("");
  const [aiLoad,setAiLoad]=useState(false);
  const [valModal,setValModal]=useState(null);
  const [cgtModal,setCgtModal]=useState(null);
  const [cgtUnits,setCgtUnits]=useState("");
  const [cgtIncome,setCgtIncome]=useState("120000");

  const T=dark?D:L;

  // ── computed ─────────────────────────────────────────────
  const C=useMemo(()=>{
    const tp=props.map(p=>{
      const eq=n(p.val)-n(p.mtg);
      const ar=n(p.rent)*12;
      const ao=n(p.repay)*12+n(p.rates)+n(p.ins)+n(p.maint)+n(p.strata)+n(p.mgmt)*12+n(p.other);
      const cf=ar-ao;
      const yld=n(p.val)>0?(ar/n(p.val))*100:0;
      const lvr=n(p.val)>0?(n(p.mtg)/n(p.val))*100:0;
      return {...p,eq,ar,ao,cf,yld,lvr};
    });
    const propVal=tp.reduce((s,p)=>s+n(p.val),0);
    const propMtg=tp.reduce((s,p)=>s+n(p.mtg),0);
    const propEq=propVal-propMtg;
    const propCF=tp.reduce((s,p)=>s+p.cf,0);

    const ts=stocks.map(s=>{
      const cv=n(s.units)*n(s.cur);
      const cb=n(s.units)*n(s.buy);
      const gain=cv-cb;
      const gp=cb>0?(gain/cb)*100:0;
      const div=cv*(n(s.divYld)/100);
      return {...s,cv,cb,gain,gp,div};
    });
    const stockVal=ts.reduce((s,x)=>s+x.cv,0);
    const totalDiv=ts.reduce((s,x)=>s+x.div,0);

    const tc=crypto.map(c=>{
      const cv=n(c.units)*n(c.cur);
      const cb=n(c.units)*n(c.buy);
      return {...c,cv,gain:cv-cb,gp:cb>0?((cv-cb)/cb)*100:0};
    });
    const cryptoVal=tc.reduce((s,c)=>s+c.cv,0);

    const assetVal=assets.reduce((s,a)=>s+n(a.val),0);
    const debtBal=debts.reduce((s,d)=>s+n(d.bal),0);

    const sg=n(sup.growth)/100;
    const sc=(n(sup.contribs)+n(sup.contribs)*(n(sup.empRate)/100))*12;
    let sb=n(sup.bal);
    for(let i=0;i<10;i++) sb=sb*(1+sg)+sc;
    const sup10=sb;

    const fm=income.freq==="annual"?1/12:1;
    const mInc=(n(income.salary)+n(income.other)+n(income.rental)+n(income.divs))*fm;
    const mExp=Object.values(exp).reduce((s,v)=>s+n(v),0);
    const mSurplus=mInc-mExp;

    const nw=propEq+stockVal+cryptoVal+assetVal+n(sup.bal)-debtBal;
    const nw10=propVal*Math.pow(1.07,10)-propMtg+stockVal*Math.pow(1.09,10)+cryptoVal*Math.pow(1.15,10)+assetVal*Math.pow(1.05,10)+sup10-debtBal;

    const mi=n(settings.monthlyInv);
    const sg2=n(sup.growth)/100;
    const curves=["Conservative","Base","Optimistic"].map(name=>{
      const r={Conservative:{p:0.04,s:0.06,c:0.05},Base:{p:0.07,s:0.09,c:0.15},Optimistic:{p:0.10,s:0.12,c:0.40}}[name];
      const col={Conservative:D.red,Base:D.cyan,Optimistic:D.green}[name];
      const pts=[];
      for(let yr=0;yr<=15;yr++){
        const ep=propEq*Math.pow(1+r.p,yr);
        const es=stockVal*Math.pow(1+r.s,yr);
        const ec=cryptoVal*Math.pow(1+r.c,yr);
        const ea=assetVal*Math.pow(1.05,yr);
        const eSup=n(sup.bal)*Math.pow(1+sg2,yr);
        let supC=0; for(let i=0;i<yr;i++) supC=supC*(1+sg2)+sc;
        const ni=mi*12*((Math.pow(1+r.s/12,yr*12)-1)/(r.s/12||0.001));
        pts.push({yr,nw:Math.max(0,ep+es+ec+ea+eSup+supC+ni-debtBal)});
      }
      return {name,pts,col};
    });

    const tg=goals.map(g=>{
      const target=n(g.amt),yr=n(g.yr),now=new Date().getFullYear();
      const yrsLeft=Math.max(0,yr-now);
      let cur=0;
      if(g.cat==="Net Worth") cur=nw;
      else if(g.cat==="Property") cur=propEq;
      else if(g.cat==="Stocks") cur=stockVal;
      else if(g.cat==="Super") cur=n(sup.bal);
      const pp=target>0?Math.min(100,(cur/target)*100):0;
      const gap=Math.max(0,target-cur);
      const monthly=yrsLeft>0?gap/(yrsLeft*12):gap;
      return {...g,cur,pp,gap,monthly,yrsLeft};
    });

    const curM=MILES.slice().reverse().find(m=>nw>=m.v)||null;
    const nextM=MILES.find(m=>nw<m.v)||null;

    return {tp,propVal,propMtg,propEq,propCF,ts,stockVal,totalDiv,tc,cryptoVal,assetVal,debtBal,sup10,mInc,mExp,mSurplus,nw,nw10,curves,tg,curM,nextM};
  },[props,stocks,crypto,assets,debts,goals,income,exp,sup,settings]);

  // borrow calc
  const bcResult=useMemo(()=>{
    const gi=n(bc.income); if(!gi) return null;
    const dep=[0,5000,10000,15000,20000,25000][Math.min(n(bc.deps),5)];
    const rate=n(bc.rate)/100,br=rate+0.03,nr=30*12,r=br/12;
    const ma=(gi*0.7/12)-n(bc.debts)-((25000+dep)/12);
    if(ma<=0) return {loan:0,prop:0,repay:0};
    const loan=ma*(1-Math.pow(1+r,-nr))/r;
    const mr=rate/12,repay=loan*mr/(1-Math.pow(1+mr,-nr));
    return {loan:Math.max(0,loan),prop:Math.max(0,loan/0.8),repay:Math.max(0,repay)};
  },[bc]);

  const fireResult=useMemo(()=>{
    const e=n(fire.exp); if(!e) return null;
    const swr=n(fire.swr)/100||0.04;
    const lean=e*0.7/swr,reg=e/swr,fat=e*1.5/swr;
    const gap=Math.max(0,reg-C.nw);
    const yrs=C.mSurplus>0&&gap>0?Math.log(1+(gap*(0.07/12))/C.mSurplus)/Math.log(1+0.07/12)/12:null;
    return {lean,reg,fat,gap,yrs};
  },[fire,C.nw,C.mSurplus]);

  // ── helpers ───────────────────────────────────────────────
  const inp=()=>({background:T.input,border:`1px solid ${T.ib}`,borderRadius:8,padding:"8px 10px",color:T.text,fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"'Sora',sans-serif"});
  const Card=({children,s={}})=><div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:20,...s}}>{children}</div>;
  const Hd=({children,c})=><div style={{fontSize:11,fontWeight:700,color:c||T.cyan,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12,fontFamily:"'DM Mono',monospace"}}>{children}</div>;
  const Stat=({label,val,color})=><div><div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{label}</div><div style={{fontSize:20,fontWeight:700,color:color||T.cyan,fontFamily:"'DM Mono',monospace"}}>{val}</div></div>;
  const Row=({label,value,onChange,prefix="$"})=>(
    <div style={{display:"flex",flexDirection:"column",gap:3}}>
      <label style={{fontSize:11,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>{label}</label>
      <div style={{position:"relative"}}>
        {prefix&&<span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:T.t3,fontSize:13,zIndex:1}}>{prefix}</span>}
        <input type="number" value={value||""} onChange={e=>onChange(e.target.value)} style={{...inp(),padding:prefix?"8px 10px 8px 21px":"8px 10px"}}/>
      </div>
    </div>
  );
  const PRow=({label,value,onChange})=>(
    <div style={{display:"flex",flexDirection:"column",gap:3}}>
      <label style={{fontSize:11,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>{label}</label>
      <div style={{position:"relative"}}>
        <input type="number" value={value||""} onChange={e=>onChange(e.target.value)} style={{...inp(),paddingRight:26}}/>
        <span style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",color:T.t3,fontSize:13}}>%</span>
      </div>
    </div>
  );
  const TRow=({label,value,onChange})=>(
    <div style={{display:"flex",flexDirection:"column",gap:3}}>
      <label style={{fontSize:11,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>{label}</label>
      <input type="text" value={value||""} onChange={e=>onChange(e.target.value)} style={inp()}/>
    </div>
  );
  const AddBtn=({onClick,label})=><button onClick={onClick} style={{background:"transparent",border:`1px dashed ${T.t3}`,borderRadius:9,color:T.cyan,padding:"9px 18px",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:7,fontFamily:"'Sora',sans-serif"}} onMouseOver={e=>e.currentTarget.style.borderColor=T.cyan} onMouseOut={e=>e.currentTarget.style.borderColor=T.t3}><span style={{fontSize:17}}>+</span>{label}</button>;
  const RmBtn=({onClick})=><button onClick={onClick} style={{background:`${T.red}18`,border:`1px solid ${T.red}40`,borderRadius:7,color:T.red,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"'Sora',sans-serif",flexShrink:0}}>✕ Remove</button>;
  const Pill=({v,ok})=>{const c=ok?T.green:T.red;return <span style={{background:`${c}18`,color:c,border:`1px solid ${c}35`,borderRadius:20,padding:"2px 9px",fontSize:11,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{v}</span>;};
  const grid=(...cols)=>({display:"grid",gridTemplateColumns:cols.join(" "),gap:12});
  const flex=(gap=10)=>({display:"flex",gap,alignItems:"center",flexWrap:"wrap"});

  const upProp=(id,f,v)=>setProps(ps=>ps.map(p=>p.id===id?{...p,[f]:v}:p));
  const upStock=(id,f,v)=>setStocks(ss=>ss.map(s=>s.id===id?{...s,[f]:v}:s));
  const upCrypto=(id,f,v)=>setCrypto(cs=>cs.map(c=>c.id===id?{...c,[f]:v}:c));
  const upAsset=(id,f,v)=>setAssets(as=>as.map(a=>a.id===id?{...a,[f]:v}:a));
  const upDebt=(id,f,v)=>setDebts(ds=>ds.map(d=>d.id===id?{...d,[f]:v}:d));
  const upGoal=(id,f,v)=>setGoals(gs=>gs.map(g=>g.id===id?{...g,[f]:v}:g));

  const askAI=async(q)=>{
    if(!q.trim()) return;
    setAiLoad(true); setAiA("");
    const sum=`Net worth: ${fmt(C.nw)}. Property equity: ${fmt(C.propEq)} across ${props.length} properties. Shares: ${fmt(C.stockVal)}. Crypto: ${fmt(C.cryptoVal)}. Super: ${fmt(n(sup.bal))}. Debt: ${fmt(C.debtBal)}. Monthly surplus: ${fmt(C.mSurplus)}. Annual dividends: ${fmt(C.totalDiv)}.`;
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:`You are a helpful Australian finance assistant inside networth. app. Provide general financial information only — NOT personal advice. Not an AFS licensee. User portfolio: ${sum}. Be concise (2-3 paragraphs). End with a brief disclaimer.`,messages:[{role:"user",content:q}]})});
      const d=await r.json();
      setAiA(d.content?.map(x=>x.text||"").join("")||"Unable to respond.");
    }catch{setAiA("Connection error. Please try again.");}
    setAiLoad(false);
  };

  // ── PROPERTY TAB ─────────────────────────────────────────
  const TabProperty=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card>
        <Hd>Portfolio Summary</Hd>
        <div style={{...grid("1fr 1fr 1fr 1fr"),gap:20}}>
          <Stat label="Total Value" val={fmt(C.propVal)}/>
          <Stat label="Total Equity" val={fmt(C.propEq)} color={T.green}/>
          <Stat label="Total Debt" val={fmt(C.propMtg)} color={T.red}/>
          <Stat label="Net Cashflow p.a." val={fmt(C.propCF)} color={C.propCF>=0?T.green:T.red}/>
        </div>
      </Card>

      {C.tp.map(p=>(
        <Card key={p.id}>
          <div style={{...flex(10),justifyContent:"space-between",marginBottom:14}}>
            <input value={p.name||""} placeholder="Property address" onChange={e=>upProp(p.id,"name",e.target.value)}
              style={{background:"none",border:"none",color:T.text,fontSize:16,fontWeight:600,outline:"none",flex:1,fontFamily:"'Sora',sans-serif"}}/>
            <div style={flex(8)}>
              <Pill v={`${p.yld.toFixed(1)}% yield`} ok={true}/>
              <Pill v={`LVR ${p.lvr.toFixed(0)}%`} ok={p.lvr<80}/>
              <Pill v={`${fmt(p.cf)} p.a.`} ok={p.cf>=0}/>
              <RmBtn onClick={()=>setProps(ps=>ps.filter(x=>x.id!==p.id))}/>
            </div>
          </div>
          <div style={{...grid("1fr 1fr 1fr"),gap:16}}>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <Hd>Details</Hd>
              <Row label="Current Value" value={p.val} onChange={v=>upProp(p.id,"val",v)}/>
              <Row label="Mortgage Balance" value={p.mtg} onChange={v=>upProp(p.id,"mtg",v)}/>
              <PRow label="Interest Rate" value={p.rate} onChange={v=>upProp(p.id,"rate",v)}/>
              <div style={{padding:10,background:T.input,borderRadius:9,marginTop:4}}>
                <div style={{fontSize:10,color:T.t2}}>EQUITY</div>
                <div style={{fontSize:18,fontWeight:700,color:T.green,fontFamily:"'DM Mono',monospace"}}>{fmt(p.eq)}</div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <Hd>Monthly Income</Hd>
              <Row label="Rental Income" value={p.rent} onChange={v=>upProp(p.id,"rent",v)}/>
              <Hd>Annual Inflows</Hd>
              <div style={{fontSize:20,fontWeight:700,color:T.green,fontFamily:"'DM Mono',monospace"}}>{fmt(p.ar)}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <Hd>Monthly Outflows</Hd>
              <Row label="Mortgage Repayment" value={p.repay} onChange={v=>upProp(p.id,"repay",v)}/>
              <Row label="Rates (p.a.)" value={p.rates} onChange={v=>upProp(p.id,"rates",v)}/>
              <Row label="Insurance (p.a.)" value={p.ins} onChange={v=>upProp(p.id,"ins",v)}/>
              <Row label="Maintenance (p.a.)" value={p.maint} onChange={v=>upProp(p.id,"maint",v)}/>
              <Row label="Strata (p.a.)" value={p.strata} onChange={v=>upProp(p.id,"strata",v)}/>
              <Row label="Mgmt Fee (mo)" value={p.mgmt} onChange={v=>upProp(p.id,"mgmt",v)}/>
              <Row label="Other (p.a.)" value={p.other} onChange={v=>upProp(p.id,"other",v)}/>
            </div>
          </div>
          {/* Valuation history */}
          <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
            <div style={{...flex(10),justifyContent:"space-between",marginBottom:8}}>
              <Hd>Valuation History</Hd>
              <button onClick={()=>setValModal({propId:p.id,date:new Date().toISOString().slice(0,7),val:""})}
                style={{background:"transparent",border:`1px dashed ${T.t3}`,borderRadius:7,color:T.cyan,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"'Sora',sans-serif"}}>+ Log Valuation</button>
            </div>
            {(p.vals||[]).length===0&&<div style={{fontSize:12,color:T.t3}}>No valuations logged yet. realestate.com.au doesn't have a public API — log manually each month.</div>}
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {(p.vals||[]).map((v,i)=>(
                <div key={i} style={{display:"flex",gap:6,alignItems:"center",padding:"4px 10px",background:T.input,borderRadius:7,fontSize:12}}>
                  <span style={{color:T.t3}}>{v.date}</span>
                  <span style={{color:T.cyan,fontFamily:"'DM Mono',monospace"}}>{fmt(n(v.val))}</span>
                  <button onClick={()=>setProps(ps=>ps.map(pp=>pp.id===p.id?{...pp,vals:(pp.vals||[]).filter((_,j)=>j!==i)}:pp))} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:13}}>×</button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}

      <AddBtn onClick={()=>setProps(ps=>[...ps,{id:id(),name:"",val:"",mtg:"",rate:"",rent:"",repay:"",rates:"",ins:"",maint:"",strata:"",mgmt:"",other:"",vals:[]}])} label="Add Property"/>

      {/* Borrowing calculator - collapsible */}
      <div>
        <button onClick={()=>setBcOpen(o=>!o)} style={{width:"100%",background:T.card,border:`1px solid ${T.border}`,borderRadius:bcOpen?"12px 12px 0 0":12,padding:"14px 20px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"'Sora',sans-serif"}}>
          <div style={flex(10)}>
            <span style={{fontSize:18}}>🏦</span>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>How much can I borrow for my next property?</div>
              <div style={{fontSize:12,color:T.t2,marginTop:1}}>Borrowing Capacity Estimator</div>
            </div>
          </div>
          <span style={{color:T.cyan,fontSize:18,transform:bcOpen?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▾</span>
        </button>
        {bcOpen&&(
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:20}}>
            <div style={{padding:"8px 12px",background:`${T.cyan}10`,border:`1px solid ${T.cyan}25`,borderRadius:8,marginBottom:14,fontSize:12,color:T.t2}}>Simplified estimate — income×70%, APRA +3% buffer. Actual capacity varies by lender. Speak to a mortgage broker for accurate figures.</div>
            <div style={{...grid("1fr 1fr 1fr 1fr"),marginBottom:14}}>
              <Row label="Gross Annual Income" value={bc.income} onChange={v=>setBc(b=>({...b,income:v}))}/>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <label style={{fontSize:11,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>Dependants</label>
                <select value={bc.deps} onChange={e=>setBc(b=>({...b,deps:e.target.value}))} style={{...inp()}}>
                  {["0","1","2","3","4","5+"].map(v=><option key={v}>{v}</option>)}
                </select>
              </div>
              <Row label="Existing Debt Repayments (mo)" value={bc.debts} onChange={v=>setBc(b=>({...b,debts:v}))}/>
              <PRow label="Interest Rate" value={bc.rate} onChange={v=>setBc(b=>({...b,rate:v}))}/>
            </div>
            {bcResult&&(
              <div style={{...grid("1fr 1fr 1fr"),gap:12}}>
                {[{l:"Est. Max Loan",v:fmt(bcResult.loan),c:T.cyan},{l:"Est. Property at 80% LVR",v:fmt(bcResult.prop),c:T.green},{l:"Est. Monthly Repayment",v:fmt(bcResult.repay),c:T.yellow}].map(x=>(
                  <div key={x.l} style={{padding:14,background:T.input,borderRadius:10,textAlign:"center"}}>
                    <div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{x.l}</div>
                    <div style={{fontSize:20,fontWeight:800,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {valModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:16}}>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:28,width:300}}>
            <div style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:18,fontFamily:"'Sora',sans-serif"}}>Log Valuation</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <label style={{fontSize:11,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>Month</label>
                <input type="month" value={valModal.date} onChange={e=>setValModal(m=>({...m,date:e.target.value}))} style={{...inp(),colorScheme:dark?"dark":"light"}}/>
              </div>
              <Row label="Estimated Value" value={valModal.val} onChange={v=>setValModal(m=>({...m,val:v}))}/>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18}}>
              <button onClick={()=>{setProps(ps=>ps.map(p=>p.id===valModal.propId?{...p,vals:[...(p.vals||[]),{date:valModal.date,val:valModal.val}].sort((a,b)=>a.date.localeCompare(b.date))}:p));setValModal(null);}} style={{flex:1,background:T.cyan,border:"none",borderRadius:8,color:T.act,padding:"10px",cursor:"pointer",fontWeight:700,fontFamily:"'Sora',sans-serif"}}>Save</button>
              <button onClick={()=>setValModal(null)} style={{flex:1,background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.t2,padding:"10px",cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── STOCKS ───────────────────────────────────────────────
  const downloadStockTemplate=()=>{
    const csv="ticker,name,units,buy_price,current_price,dividend_yield_pct\nVAS,Vanguard Australian Shares ETF,100,90.00,95.50,3.8\nVGS,Vanguard International Shares ETF,50,110.00,118.00,1.5\nCBA,Commonwealth Bank of Australia,20,95.00,128.00,4.2\n";
    const a=document.createElement("a");a.href="data:text/csv,"+encodeURIComponent(csv);a.download="networth-stocks-template.csv";a.click();
  };
  const downloadStockExport=()=>{
    const rows=["ticker,name,units,buy_price,current_price,dividend_yield_pct",...stocks.map(s=>`${s.ticker||""},${s.name||""},${s.units||""},${s.buy||""},${s.cur||""},${s.divYld||""}`)];
    const a=document.createElement("a");a.href="data:text/csv,"+encodeURIComponent(rows.join("\n"));a.download="networth-stocks-export.csv";a.click();
  };
  const importStocksCSV=(e)=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      const lines=ev.target.result.trim().split("\n");
      const header=lines[0].toLowerCase().split(",").map(h=>h.trim());
      const gi=(row,names)=>{const i=names.findIndex(nm=>header.includes(nm));return i>=0?row[header.indexOf(names.find(nm=>header.includes(nm)))]?.trim()||"":""};
      const newStocks=lines.slice(1).filter(l=>l.trim()).map(line=>{
        const row=line.split(",");
        return{id:id(),ticker:gi(row,["ticker","symbol","code"]),name:gi(row,["name","company","description"]),units:gi(row,["units","shares","quantity","qty"]),buy:gi(row,["buy_price","buy price","avg_buy","average_buy","cost","purchase_price"]),cur:gi(row,["current_price","current price","price","last_price","market_price"]),divYld:gi(row,["dividend_yield_pct","dividend_yield","div_yield","yield","dividendyield"])};
      });
      setStocks(ss=>[...ss,...newStocks]);
    };
    reader.readAsText(file);
    e.target.value="";
  };

  const TabStocks=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card>
        <Hd>Portfolio Summary</Hd>
        <div style={{...grid("1fr 1fr 1fr"),gap:20,marginBottom:16}}>
          <Stat label="Total Value" val={fmt(C.stockVal)}/>
          <Stat label="Total Gain/Loss" val={fmt(C.ts.reduce((s,x)=>s+x.gain,0))} color={C.ts.reduce((s,x)=>s+x.gain,0)>=0?T.green:T.red}/>
          <Stat label="Annual Dividends" val={fmt(C.totalDiv)} color={T.yellow}/>
        </div>
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14}}>
          <div style={{fontSize:11,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Import / Export</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button onClick={downloadStockTemplate} style={{background:`${T.cyan}15`,border:`1px solid ${T.cyan}35`,borderRadius:8,color:T.cyan,padding:"8px 14px",cursor:"pointer",fontSize:12,fontFamily:"'Sora',sans-serif",display:"flex",alignItems:"center",gap:6}}>
              📄 Download Template CSV
            </button>
            <label style={{background:`${T.green}15`,border:`1px solid ${T.green}35`,borderRadius:8,color:T.green,padding:"8px 14px",cursor:"pointer",fontSize:12,fontFamily:"'Sora',sans-serif",display:"flex",alignItems:"center",gap:6}}>
              ⬆️ Import CSV
              <input type="file" accept=".csv,.txt" onChange={importStocksCSV} style={{display:"none"}}/>
            </label>
            {stocks.length>0&&<button onClick={downloadStockExport} style={{background:`${T.purple}15`,border:`1px solid ${T.purple}35`,borderRadius:8,color:T.purple,padding:"8px 14px",cursor:"pointer",fontSize:12,fontFamily:"'Sora',sans-serif",display:"flex",alignItems:"center",gap:6}}>
              ⬇️ Export My Holdings
            </button>}
          </div>
          <div style={{marginTop:10,fontSize:11,color:T.t3,lineHeight:1.6}}>
            Download the template, fill it in with your holdings, then import. Columns: <span style={{color:T.cyan,fontFamily:"'DM Mono',monospace"}}>ticker, name, units, buy_price, current_price, dividend_yield_pct</span>
          </div>
        </div>
      </Card>
      {C.ts.map(s=>(
        <Card key={s.id}>
          <div style={{...flex(10),justifyContent:"space-between",marginBottom:12}}>
            <div style={flex(10)}>
              <input value={s.ticker||""} placeholder="TICKER" onChange={e=>upStock(s.id,"ticker",e.target.value)} style={{background:"none",border:"none",color:T.cyan,fontWeight:800,width:70,outline:"none",fontSize:16,fontFamily:"'DM Mono',monospace"}}/>
              <input value={s.name||""} placeholder="Company name" onChange={e=>upStock(s.id,"name",e.target.value)} style={{background:"none",border:"none",color:T.text,outline:"none",fontSize:14,fontFamily:"'Sora',sans-serif",minWidth:120}}/>
            </div>
            <div style={flex(8)}>
              {s.cv>0&&<Pill v={`${fmt(s.cv)}`} ok={true}/>}
              {s.cb>0&&<Pill v={`${s.gp>=0?"+":""}${s.gp.toFixed(1)}%`} ok={s.gain>=0}/>}
              <button onClick={()=>setCgtModal({stockId:s.id})} style={{background:`${T.purple}18`,border:`1px solid ${T.purple}35`,borderRadius:7,color:T.purple,padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:"'Sora',sans-serif"}}>CGT Calc</button>
              <RmBtn onClick={()=>setStocks(ss=>ss.filter(x=>x.id!==s.id))}/>
            </div>
          </div>
          <div style={{...grid("1fr 1fr 1fr 1fr 1fr"),gap:12}}>
            <Row label="Units" value={s.units} onChange={v=>upStock(s.id,"units",v)} prefix=""/>
            <Row label="Buy Price" value={s.buy} onChange={v=>upStock(s.id,"buy",v)}/>
            <Row label="Current Price" value={s.cur} onChange={v=>upStock(s.id,"cur",v)}/>
            <PRow label="Dividend Yield" value={s.divYld} onChange={v=>upStock(s.id,"divYld",v)}/>
            <div style={{padding:10,background:T.input,borderRadius:9,display:"flex",flexDirection:"column",gap:3}}>
              <div style={{fontSize:10,color:T.t2}}>ANNUAL DIV</div>
              <div style={{fontSize:16,fontWeight:700,color:T.yellow,fontFamily:"'DM Mono',monospace"}}>{fmt(s.div)}</div>
            </div>
          </div>
        </Card>
      ))}
      <AddBtn onClick={()=>setStocks(ss=>[...ss,{id:id(),ticker:"",name:"",units:"",buy:"",cur:"",divYld:""}])} label="Add Stock / ETF"/>
      {cgtModal&&(()=>{
        const s=C.ts.find(x=>x.id===cgtModal.stockId);
        const proceeds=n(cgtUnits)*n(s?.cur||0);
        const cost=n(cgtUnits)*n(s?.buy||0);
        const gross=proceeds-cost;
        const disc=gross*0.5;
        const marg=n(cgtIncome)<18201?0:n(cgtIncome)<45001?0.19:n(cgtIncome)<135001?0.325:n(cgtIncome)<190001?0.37:0.45;
        const tax=Math.max(0,disc*(marg+0.02));
        return(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:16}}>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:28,width:380,maxWidth:"95vw"}}>
              <div style={{fontSize:15,fontWeight:700,color:T.purple,marginBottom:4,fontFamily:"'Sora',sans-serif"}}>CGT Estimator</div>
              <div style={{fontSize:12,color:T.t2,marginBottom:16}}>{s?.ticker} — {s?.name}</div>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  <label style={{fontSize:11,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>Units to Sell</label>
                  <input type="number" value={cgtUnits} onChange={e=>setCgtUnits(e.target.value)} placeholder={`Max ${s?.units||0}`} style={inp()}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  <label style={{fontSize:11,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>Your Annual Taxable Income</label>
                  <input type="number" value={cgtIncome} onChange={e=>setCgtIncome(e.target.value)} style={inp()}/>
                </div>
              </div>
              {n(cgtUnits)>0&&<div style={{marginBottom:14}}>
                {[["Sale Proceeds",fmt(proceeds),T.text],["Cost Base",fmt(cost),T.t2],["Gross Gain",fmt(gross),gross>=0?T.green:T.red],["After 50% Discount",fmt(disc),T.cyan],["Est. Tax Payable",fmt(tax),T.red],["Net After Tax",fmt(proceeds-tax),T.green]].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`,fontSize:12}}>
                    <span style={{color:T.t2}}>{l}</span><span style={{color:c,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{v}</span>
                  </div>
                ))}
                <p style={{fontSize:10,color:T.t3,marginTop:8,lineHeight:1.6}}>⚠️ Estimate only. Assumes 12+ month hold (50% discount). Consult your accountant.</p>
              </div>}
              <button onClick={()=>{setCgtModal(null);setCgtUnits("");}} style={{width:"100%",background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.t2,padding:"10px",cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>Close</button>
            </div>
          </div>
        );
      })()}
    </div>
  );

  // ── CRYPTO ───────────────────────────────────────────────
  const downloadCryptoTemplate=()=>{
    const csv="symbol,name,units,buy_price,current_price\nBTC,Bitcoin,0.5,40000,65000\nETH,Ethereum,3,2500,3200\nSOL,Solana,50,80,150\n";
    const a=document.createElement("a");a.href="data:text/csv,"+encodeURIComponent(csv);a.download="networth-crypto-template.csv";a.click();
  };
  const downloadCryptoExport=()=>{
    const rows=["symbol,name,units,buy_price,current_price",...crypto.map(c=>`${c.symbol||""},${c.name||""},${c.units||""},${c.buy||""},${c.cur||""}`)];
    const a=document.createElement("a");a.href="data:text/csv,"+encodeURIComponent(rows.join("\n"));a.download="networth-crypto-export.csv";a.click();
  };
  const importCryptoCSV=(e)=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      const lines=ev.target.result.trim().split("\n");
      const header=lines[0].toLowerCase().split(",").map(h=>h.trim());
      const gi=(row,names)=>{const nm=names.find(nm=>header.includes(nm));return nm?row[header.indexOf(nm)]?.trim()||"":""};
      const newCryptos=lines.slice(1).filter(l=>l.trim()).map(line=>{
        const row=line.split(",");
        return{id:id(),symbol:gi(row,["symbol","ticker","coin","token"]),name:gi(row,["name","coin","description"]),units:gi(row,["units","amount","quantity","qty","holdings"]),buy:gi(row,["buy_price","buy price","avg_buy","average_buy","cost","purchase_price","avg_cost"]),cur:gi(row,["current_price","current price","price","last_price","market_price"])};
      });
      setCrypto(cs=>[...cs,...newCryptos]);
    };
    reader.readAsText(file);
    e.target.value="";
  };

  const TabCrypto=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card>
        <Hd>Crypto Portfolio</Hd>
        <div style={{...grid("1fr 1fr 1fr"),gap:20,marginBottom:16}}>
          <Stat label="Total Value" val={fmt(C.cryptoVal)} color={T.yellow}/>
          <Stat label="Total Gain/Loss" val={fmt(C.tc.reduce((s,c)=>s+c.gain,0))} color={C.tc.reduce((s,c)=>s+c.gain,0)>=0?T.green:T.red}/>
          <Stat label="% of Net Worth" val={C.nw>0?pct(C.cryptoVal/C.nw*100):"-"} color={C.cryptoVal/C.nw*100>20?T.red:T.purple}/>
        </div>
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14}}>
          <div style={{fontSize:11,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Import / Export</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button onClick={downloadCryptoTemplate} style={{background:`${T.cyan}15`,border:`1px solid ${T.cyan}35`,borderRadius:8,color:T.cyan,padding:"8px 14px",cursor:"pointer",fontSize:12,fontFamily:"'Sora',sans-serif",display:"flex",alignItems:"center",gap:6}}>
              📄 Download Template CSV
            </button>
            <label style={{background:`${T.green}15`,border:`1px solid ${T.green}35`,borderRadius:8,color:T.green,padding:"8px 14px",cursor:"pointer",fontSize:12,fontFamily:"'Sora',sans-serif",display:"flex",alignItems:"center",gap:6}}>
              ⬆️ Import CSV
              <input type="file" accept=".csv,.txt" onChange={importCryptoCSV} style={{display:"none"}}/>
            </label>
            {crypto.length>0&&<button onClick={downloadCryptoExport} style={{background:`${T.purple}15`,border:`1px solid ${T.purple}35`,borderRadius:8,color:T.purple,padding:"8px 14px",cursor:"pointer",fontSize:12,fontFamily:"'Sora',sans-serif",display:"flex",alignItems:"center",gap:6}}>
              ⬇️ Export My Holdings
            </button>}
          </div>
          <div style={{marginTop:10,fontSize:11,color:T.t3,lineHeight:1.6}}>
            Columns: <span style={{color:T.yellow,fontFamily:"'DM Mono',monospace"}}>symbol, name, units, buy_price, current_price</span>. Export from Coinbase, Binance, or Swyftx as CSV and import directly.
          </div>
        </div>
      </Card>
      {C.tc.map(c=>(
        <Card key={c.id}>
          <div style={{...flex(10),justifyContent:"space-between",marginBottom:12}}>
            <div style={flex(10)}>
              <input value={c.symbol||""} placeholder="BTC" onChange={e=>upCrypto(c.id,"symbol",e.target.value)} style={{background:"none",border:"none",color:T.yellow,fontWeight:800,width:65,outline:"none",fontSize:16,fontFamily:"'DM Mono',monospace"}}/>
              <input value={c.name||""} placeholder="Coin name" onChange={e=>upCrypto(c.id,"name",e.target.value)} style={{background:"none",border:"none",color:T.text,outline:"none",fontSize:14,fontFamily:"'Sora',sans-serif",minWidth:100}}/>
            </div>
            <div style={flex(8)}>
              {c.cv>0&&<Pill v={fmt(c.cv)} ok={true}/>}
              {c.cb>0&&<Pill v={`${c.gp>=0?"+":""}${c.gp.toFixed(1)}%`} ok={c.gain>=0}/>}
              <RmBtn onClick={()=>setCrypto(cs=>cs.filter(x=>x.id!==c.id))}/>
            </div>
          </div>
          <div style={{...grid("1fr 1fr 1fr"),gap:12}}>
            <Row label="Units Held" value={c.units} onChange={v=>upCrypto(c.id,"units",v)} prefix=""/>
            <Row label="Buy Price (avg)" value={c.buy} onChange={v=>upCrypto(c.id,"buy",v)}/>
            <Row label="Current Price" value={c.cur} onChange={v=>upCrypto(c.id,"cur",v)}/>
          </div>
        </Card>
      ))}
      <AddBtn onClick={()=>setCrypto(cs=>[...cs,{id:id(),symbol:"",name:"",units:"",buy:"",cur:""}])} label="Add Cryptocurrency"/>
      <p style={{fontSize:11,color:T.t3,marginTop:4,lineHeight:1.6}}>⚠️ Note: Crypto is treated as an asset for CGT purposes by the ATO — every disposal is a taxable event. Consult your accountant.</p>
    </div>
  );

  // ── ASSETS & DEBTS ────────────────────────────────────────
  const TabAssetsDebts=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Summary row */}
      <div style={{...grid("1fr 1fr 1fr 1fr"),gap:12}}>
        {[{l:"Total Assets",v:fmt(C.assetVal),c:T.cyan},{l:"Non-Mtg Debt",v:fmt(C.debtBal),c:T.red},{l:"Net Assets",v:fmt(C.assetVal-C.debtBal),c:C.assetVal-C.debtBal>=0?T.green:T.red},{l:"Annual Interest",v:fmt(debts.reduce((s,d)=>s+n(d.bal)*n(d.rate)/100,0)),c:T.orange}].map(x=>(
          <Card key={x.l} s={{padding:14}}><div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{x.l}</div><div style={{fontSize:18,fontWeight:800,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div></Card>
        ))}
      </div>

      {/* ASSETS section */}
      <Card>
        <Hd>Assets</Hd>
        {assets.length===0&&<div style={{fontSize:12,color:T.t3,marginBottom:12}}>Add business equity, vehicles, art, gold, term deposits, trusts and other assets here.</div>}
        {assets.map(a=>(
          <div key={a.id} style={{marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${T.border}`}}>
            <div style={{...flex(10),justifyContent:"space-between",marginBottom:10}}>
              <input value={a.name||""} placeholder="Asset name (e.g. Business equity, car)" onChange={e=>upAsset(a.id,"name",e.target.value)} style={{background:"none",border:"none",color:T.text,fontWeight:600,outline:"none",flex:1,fontSize:14,fontFamily:"'Sora',sans-serif"}}/>
              <RmBtn onClick={()=>setAssets(as=>as.filter(x=>x.id!==a.id))}/>
            </div>
            <div style={{...grid("1fr 1fr 1fr 1fr"),gap:10}}>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <label style={{fontSize:11,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>Type</label>
                <select value={a.type||"Other"} onChange={e=>upAsset(a.id,"type",e.target.value)} style={inp()}>
                  {["Business Equity","Vehicle","Art / Collectible","Cash / Term Deposit","Trust","Gold","Other"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <Row label="Current Value" value={a.val} onChange={v=>upAsset(a.id,"val",v)}/>
              <PRow label="Growth Rate p.a." value={a.growth} onChange={v=>upAsset(a.id,"growth",v)}/>
              <div style={{padding:10,background:T.input,borderRadius:9,display:"flex",flexDirection:"column",gap:3}}>
                <div style={{fontSize:10,color:T.t2}}>VALUE IN 10YRS</div>
                <div style={{fontSize:15,fontWeight:700,color:T.yellow,fontFamily:"'DM Mono',monospace"}}>{fmt(n(a.val)*Math.pow(1+n(a.growth)/100,10))}</div>
              </div>
            </div>
          </div>
        ))}
        <AddBtn onClick={()=>setAssets(as=>[...as,{id:id(),name:"",type:"Other",val:"",growth:""}])} label="Add Asset"/>
      </Card>

      {/* DEBTS section */}
      <Card>
        <Hd>Debts (Non-Mortgage)</Hd>
        <div style={{padding:"8px 12px",background:`${T.cyan}08`,border:`1px solid ${T.cyan}20`,borderRadius:9,marginBottom:14,fontSize:11,color:T.t2}}>ℹ️ Mortgage debt is tracked in the Property tab. Add personal loans, car finance, HECS/HELP, credit cards here.</div>
        {debts.length===0&&<div style={{fontSize:12,color:T.t3,marginBottom:12}}>No debts added yet.</div>}
        {debts.map(d=>(
          <div key={d.id} style={{marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${T.border}`}}>
            <div style={{...flex(10),justifyContent:"space-between",marginBottom:10}}>
              <input value={d.name||""} placeholder="Debt name (e.g. Car loan)" onChange={e=>upDebt(d.id,"name",e.target.value)} style={{background:"none",border:"none",color:T.text,fontWeight:600,outline:"none",flex:1,fontSize:14,fontFamily:"'Sora',sans-serif"}}/>
              <RmBtn onClick={()=>setDebts(ds=>ds.filter(x=>x.id!==d.id))}/>
            </div>
            <div style={{...grid("1fr 1fr 1fr 1fr"),gap:10}}>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <label style={{fontSize:11,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>Type</label>
                <select value={d.type||"Personal Loan"} onChange={e=>upDebt(d.id,"type",e.target.value)} style={inp()}>
                  {["Personal Loan","Car Finance","Credit Card","HECS/HELP","Line of Credit","Other"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <Row label="Balance Owing" value={d.bal} onChange={v=>upDebt(d.id,"bal",v)}/>
              <PRow label="Interest Rate" value={d.rate} onChange={v=>upDebt(d.id,"rate",v)}/>
              <Row label="Min Payment (mo)" value={d.minPay} onChange={v=>upDebt(d.id,"minPay",v)}/>
            </div>
          </div>
        ))}
        {debts.length>1&&(
          <div style={{padding:12,background:T.input,borderRadius:9,marginBottom:14}}>
            <div style={{fontSize:11,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Payoff Priority (Avalanche — highest rate first)</div>
            {[...debts].sort((a,b)=>n(b.rate)-n(a.rate)).map((d,i)=>(
              <div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.border}`,fontSize:12}}>
                <span style={{color:T.text}}>{i+1}. {d.name||d.type||"Debt"}</span>
                <div style={flex(12)}><span style={{color:T.red,fontFamily:"'DM Mono',monospace"}}>{fmt(n(d.bal))}</span><span style={{color:T.orange,fontFamily:"'DM Mono',monospace"}}>{d.rate||0}% p.a.</span></div>
              </div>
            ))}
          </div>
        )}
        <AddBtn onClick={()=>setDebts(ds=>[...ds,{id:id(),name:"",type:"Personal Loan",bal:"",rate:"",minPay:""}])} label="Add Debt"/>
      </Card>
    </div>
  );

  // ── INCOME & EXPENSES ─────────────────────────────────────
  const TabIncomeExpenses=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{...grid("1fr 1fr 1fr 1fr"),gap:12}}>
        {[{l:"Monthly Income",v:fmt(C.mInc),c:T.green},{l:"Monthly Expenses",v:fmt(C.mExp),c:T.red},{l:"Monthly Surplus",v:fmt(C.mSurplus),c:C.mSurplus>=0?T.green:T.red},{l:"Annual Surplus",v:fmt(C.mSurplus*12),c:C.mSurplus>=0?T.green:T.red}].map(x=>(
          <Card key={x.l} s={{padding:14}}><div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{x.l}</div><div style={{fontSize:20,fontWeight:800,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div></Card>
        ))}
      </div>
      {C.mSurplus>0&&(
        <Card s={{border:`1px solid ${T.green}35`}}>
          <Hd>💡 Suggested Surplus Allocation</Hd>
          <p style={{fontSize:12,color:T.t2,marginBottom:12,lineHeight:1.6}}>You have <strong style={{color:T.green}}>{fmt(C.mSurplus)}/mo</strong> available to invest. One common split — adjust to your goals.</p>
          <div style={{...grid("1fr 1fr 1fr"),gap:10}}>
            {[{l:"Shares/ETFs (40%)",a:C.mSurplus*0.4,c:T.cyan,d:"Liquid, diversified growth"},{l:"Offset/Principal (40%)",a:C.mSurplus*0.4,c:T.green,d:"Reduce mortgage interest"},{l:"Emergency Fund (20%)",a:C.mSurplus*0.2,c:T.yellow,d:"3–6 month cash buffer"}].map(x=>(
              <div key={x.l} style={{padding:12,background:T.input,borderRadius:9,borderLeft:`3px solid ${x.c}`}}>
                <div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>{x.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:x.c,fontFamily:"'DM Mono',monospace",margin:"4px 0"}}>{fmt(x.a)}<span style={{fontSize:11,fontWeight:400}}>/mo</span></div>
                <div style={{fontSize:11,color:T.t3}}>{x.d}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div style={{...grid("1fr 1fr"),gap:16}}>
        <Card>
          <Hd>Income</Hd>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {["monthly","annual"].map(f=>(
              <button key={f} onClick={()=>setIncome(i=>({...i,freq:f}))} style={{flex:1,background:income.freq===f?T.cyan:"transparent",border:`1px solid ${T.border}`,borderRadius:7,color:income.freq===f?T.act:T.t2,padding:"7px",cursor:"pointer",fontFamily:"'Sora',sans-serif",fontSize:12,fontWeight:income.freq===f?700:400}}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Row label={`Salary / Wages (${income.freq})`} value={income.salary} onChange={v=>setIncome(i=>({...i,salary:v}))}/>
            <Row label={`Rental Income (${income.freq})`} value={income.rental} onChange={v=>setIncome(i=>({...i,rental:v}))}/>
            <Row label={`Dividends (${income.freq})`} value={income.divs} onChange={v=>setIncome(i=>({...i,divs:v}))}/>
            <Row label={`Other Income (${income.freq})`} value={income.other} onChange={v=>setIncome(i=>({...i,other:v}))}/>
          </div>
          <div style={{marginTop:14,padding:12,background:T.input,borderRadius:9}}>
            <div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>Monthly Total</div>
            <div style={{fontSize:20,fontWeight:700,color:T.green,fontFamily:"'DM Mono',monospace"}}>{fmt(C.mInc)}</div>
          </div>
        </Card>
        <Card>
          <Hd>Monthly Expenses</Hd>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {[["Housing / Mortgage","housing"],["Food / Groceries","food"],["Transport","transport"],["Utilities","utilities"],["Insurance","insurance"],["Entertainment","entertainment"],["Health","health"],["Other","other"]].map(([l,f])=>(
              <Row key={f} label={l} value={exp[f]} onChange={v=>setExp(e=>({...e,[f]:v}))}/>
            ))}
          </div>
          <div style={{marginTop:14,padding:12,background:T.input,borderRadius:9}}>
            <div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>Monthly Total</div>
            <div style={{fontSize:20,fontWeight:700,color:T.red,fontFamily:"'DM Mono',monospace"}}>{fmt(C.mExp)}</div>
          </div>
        </Card>
      </div>
      {C.mExp>0&&(
        <Card>
          <Hd>Expense Breakdown</Hd>
          <div style={{...grid("repeat(4,1fr)"),gap:10}}>
            {[["Housing","housing"],["Food","food"],["Transport","transport"],["Utilities","utilities"],["Insurance","insurance"],["Entertainment","entertainment"],["Health","health"],["Other","other"]].filter(([,f])=>n(exp[f])>0).map(([l,f])=>{
              const p=C.mExp>0?(n(exp[f])/C.mExp)*100:0;
              return(
                <div key={f} style={{padding:10,background:T.input,borderRadius:9}}>
                  <div style={{fontSize:10,color:T.t2,marginBottom:3}}>{l}</div>
                  <div style={{fontSize:14,fontWeight:700,color:T.text,fontFamily:"'DM Mono',monospace"}}>{fmt(n(exp[f]))}</div>
                  <div style={{marginTop:6,height:3,background:T.border,borderRadius:2}}><div style={{height:"100%",width:`${p}%`,background:T.red,borderRadius:2}}/></div>
                  <div style={{marginTop:2,fontSize:10,color:T.t3}}>{p.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );

  // ── SUPER ────────────────────────────────────────────────
  const TabSuper=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card>
        <Hd>Superannuation</Hd>
        <div style={{...grid("1fr 1fr 1fr"),gap:12,marginBottom:16}}>
          <Row label="Current Balance" value={sup.bal} onChange={v=>setSup(s=>({...s,bal:v}))}/>
          <Row label="Your Contributions (monthly)" value={sup.contribs} onChange={v=>setSup(s=>({...s,contribs:v}))}/>
          <PRow label="Employer SG Rate" value={sup.empRate} onChange={v=>setSup(s=>({...s,empRate:v}))}/>
          <PRow label="Assumed Growth Rate p.a." value={sup.growth} onChange={v=>setSup(s=>({...s,growth:v}))}/>
          <Row label="Current Age" value={sup.age} onChange={v=>setSup(s=>({...s,age:v}))} prefix=""/>
        </div>
      </Card>
      <Card>
        <Hd>10-Year Projection</Hd>
        <div style={{...grid("1fr 1fr 1fr"),gap:12,marginBottom:12}}>
          {[{l:"Current Balance",v:fmt(n(sup.bal)),c:T.cyan},{l:"Projected (10yr)",v:fmt(C.sup10),c:T.green,sub:n(sup.age)>0?`At age ${n(sup.age)+10}`:""},{l:"Concessional Cap Remaining",v:fmt(Math.max(0,30000-n(sup.contribs)*12)),c:T.yellow}].map(x=>(
            <div key={x.l} style={{padding:14,background:T.input,borderRadius:10}}>
              <div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{x.l}</div>
              <div style={{fontSize:18,fontWeight:700,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div>
              {x.sub&&<div style={{fontSize:11,color:T.t3,marginTop:2}}>{x.sub}</div>}
            </div>
          ))}
        </div>
        <div style={{padding:10,background:`${T.green}10`,border:`1px solid ${T.green}25`,borderRadius:9,fontSize:12,color:T.t2,lineHeight:1.6}}>
          💡 Concessional cap: $30,000 p.a. (2024–25). Contributions taxed at 15% vs your marginal rate. An accountant can help assess whether salary sacrifice suits your situation.
        </div>
      </Card>
    </div>
  );

  // ── SCENARIOS ─────────────────────────────────────────────
  const TabScenarios=()=>{
    const [hover,setHover]=useState(null);
    const allNW=C.curves.flatMap(c=>c.pts.map(p=>p.nw));
    const maxNW=Math.max(...allNW,1);
    const W=500,H=180,PL=55;
    const xS=yr=>PL+(yr/15)*(W-PL-8);
    const yS=nw=>H-10-((nw/maxNW)*(H-20));
    return(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Card>
          <Hd>Current Net Worth Snapshot</Hd>
          <div style={{...grid("1fr 1fr 1fr 1fr 1fr"),gap:16}}>
            <Stat label="Net Worth" val={fmt(C.nw)}/>
            <Stat label="Property Equity" val={fmt(C.propEq)}/>
            <Stat label="Stocks" val={fmt(C.stockVal)} color={T.yellow}/>
            <Stat label="Crypto" val={fmt(C.cryptoVal)} color={T.orange}/>
            <Stat label="Super" val={fmt(n(sup.bal))} color={T.purple}/>
          </div>
        </Card>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:10}}>
            <Hd>15-Year Net Worth Projection</Hd>
            <div style={flex(8)}>
              <span style={{fontSize:12,color:T.t2}}>Monthly investment:</span>
              <div style={{position:"relative"}}><span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:T.t3,fontSize:13}}>$</span><input type="number" value={settings.monthlyInv||""} onChange={e=>setSettings(s=>({...s,monthlyInv:e.target.value}))} style={{...inp(),width:100,padding:"6px 10px 6px 20px"}}/></div>
            </div>
          </div>
          <div style={{padding:"8px 12px",background:`${T.cyan}08`,border:`1px solid ${T.cyan}20`,borderRadius:9,marginBottom:12,fontSize:11,color:T.t2}}>
            📊 Starts from your current net worth. Each asset class grows at its scenario rate. Monthly investment split: 50% shares, 30% property equity, 20% super.
          </div>
          <div style={{overflowX:"auto"}}>
            <svg width={W} height={H+28} style={{display:"block",margin:"0 auto"}} onMouseLeave={()=>setHover(null)}>
              {[0,0.25,0.5,0.75,1].map((f,i)=>{const v=maxNW*f;return(<g key={i}><line x1={PL} y1={yS(v)} x2={W-8} y2={yS(v)} stroke={T.border} strokeWidth={1} strokeDasharray="4,3"/><text x={PL-4} y={yS(v)+4} textAnchor="end" fill={T.t3} fontSize={9}>{v>=1e6?"$"+(v/1e6).toFixed(1)+"M":v>=1e3?"$"+(v/1e3).toFixed(0)+"K":"$0"}</text></g>);})}
              {[0,3,6,9,12,15].map(yr=>(<text key={yr} x={xS(yr)} y={H+20} textAnchor="middle" fill={T.t3} fontSize={9}>Yr{yr}</text>))}
              {C.curves.map(c=>(<g key={c.name}><path d={"M "+c.pts.map(p=>`${xS(p.yr).toFixed(1)},${yS(p.nw).toFixed(1)}`).join(" L ")} fill="none" stroke={c.col} strokeWidth={2.5} strokeLinecap="round"/>{c.pts.map(p=>(<circle key={p.yr} cx={xS(p.yr)} cy={yS(p.nw)} r={hover===p.yr?5:2.5} fill={c.col} onMouseEnter={()=>setHover(p.yr)} style={{cursor:"crosshair"}}/>))}</g>))}
              {hover!==null&&(<><line x1={xS(hover)} y1={10} x2={xS(hover)} y2={H} stroke={T.t3} strokeWidth={1} strokeDasharray="3,3"/>{C.curves.map((c,i)=>{const pt=c.pts.find(p=>p.yr===hover);if(!pt)return null;return(<text key={c.name} x={xS(hover)+6} y={yS(pt.nw)-2+i*13} fill={c.col} fontSize={9}>{c.name.slice(0,4)}: {pt.nw>=1e6?"$"+(pt.nw/1e6).toFixed(1)+"M":"$"+(pt.nw/1e3).toFixed(0)+"K"}</text>);})}</>)}
            </svg>
          </div>
          <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:6}}>
            {C.curves.map(c=>(<div key={c.name} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:T.t2}}><div style={{width:18,height:3,background:c.col,borderRadius:2}}/>{c.name}</div>))}
          </div>
        </Card>
        <div style={{...grid("1fr 1fr 1fr"),gap:14}}>
          {C.curves.map(sc=>(
            <Card key={sc.name} s={{border:`1px solid ${sc.col}40`}}>
              <div style={{color:sc.col,fontWeight:700,fontSize:15,marginBottom:10}}>{sc.name}</div>
              <div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>Net Worth at Year 10</div>
              <div style={{fontSize:26,fontWeight:800,color:sc.col,fontFamily:"'DM Mono',monospace",margin:"6px 0 12px"}}>{fmt(sc.pts[10].nw)}</div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // ── INSIGHTS ─────────────────────────────────────────────
  const TabInsights=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{padding:"10px 14px",background:`${T.yellow}15`,border:`1px solid ${T.yellow}40`,borderRadius:10,fontSize:12,color:T.t2,lineHeight:1.6}}>⚖️ <strong style={{color:T.yellow}}>General information only</strong> — not personal financial advice. Not an AFS licensee. Consult a licensed financial adviser.</div>
      <Card s={{border:`1px solid ${T.cyan}40`}}>
        <Hd>💬 Ask networth.</Hd>
        <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:12}}>
          {["How do I reach $100k in passive income?","Should my next capital go into property or stocks?","How do I reach $1M in equity?","Am I on track to retire early?","What's the most tax-efficient move right now?","Is my portfolio too negatively geared?"].map(q=>(
            <button key={q} onClick={()=>{setAiQ(q);askAI(q);}} style={{background:`${T.cyan}12`,border:`1px solid ${T.cyan}28`,borderRadius:20,color:T.cyan,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"'Sora',sans-serif"}}>{q}</button>
          ))}
        </div>
        <div style={flex(10)}>
          <input value={aiQ} onChange={e=>setAiQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askAI(aiQ)} placeholder="Ask anything about your portfolio..." style={{...inp(),flex:1,padding:"11px 13px"}}/>
          <button onClick={()=>askAI(aiQ)} disabled={aiLoad||!aiQ.trim()} style={{background:T.cyan,border:"none",borderRadius:9,color:T.act,padding:"11px 18px",cursor:"pointer",fontWeight:700,fontFamily:"'Sora',sans-serif",fontSize:13,opacity:aiLoad?0.6:1,flexShrink:0}}>{aiLoad?"...":"Ask →"}</button>
        </div>
        {aiLoad&&<div style={{marginTop:12,padding:12,background:T.input,borderRadius:9,color:T.t2,fontSize:13}}>Analysing your portfolio...</div>}
        {aiA&&!aiLoad&&<div style={{marginTop:12,padding:14,background:T.input,borderRadius:10}}><div style={{fontSize:10,color:T.cyan,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6,fontFamily:"'DM Mono',monospace"}}>networth. response</div><p style={{color:T.text,fontSize:13,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiA}</p></div>}
      </Card>
      <Card>
        <Hd>Portfolio Observations</Hd>
        {[
          C.propEq===0&&{icon:"🏠",title:"No property holdings",text:"Your portfolio shows no property. Many Australian investors include property for leveraged long-term growth."},
          C.stockVal<C.propEq*0.2&&C.nw>50000&&{icon:"📈",title:"Shares may be underweight",text:`Shares are ${C.nw>0?pct(C.stockVal/C.nw*100):"—"} of net worth. Many investors diversify with broad ETFs (VAS, VGS) alongside property.`},
          C.cryptoVal/C.nw*100>20&&{icon:"⚠️",title:"High crypto concentration",text:`Crypto is ~${pct(C.cryptoVal/C.nw*100)} of net worth — above the 5–10% many commentators suggest for high-volatility assets.`},
          C.propCF<0&&{icon:"🔴",title:"Negatively geared properties",text:`Properties are negatively geared by ~${fmt(Math.abs(C.propCF))}/yr. This can be a valid strategy in some tax situations — an accountant can help assess.`},
          n(sup.contribs)===0&&{icon:"🧾",title:"No voluntary super contributions",text:"Concessional super contributions are taxed at 15% vs your marginal rate. An accountant can help you assess whether salary sacrifice suits your situation."},
          C.mSurplus<0&&{icon:"🚨",title:"Budget deficit",text:`Expenses appear to exceed income by ~${fmt(Math.abs(C.mSurplus))}/mo. Addressing a budget deficit before investing further is often a priority.`},
        ].filter(Boolean).map((r,i)=>(
          <div key={i} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.border}`,alignItems:"flex-start"}}>
            <span style={{fontSize:20,flexShrink:0}}>{r.icon}</span>
            <div><div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:3}}>{r.title}</div><div style={{fontSize:12,color:T.t2,lineHeight:1.6}}>{r.text}</div></div>
          </div>
        ))}
        {C.propEq>0&&C.stockVal>C.propEq*0.2&&C.nw>0&&<div style={{padding:"12px 0",fontSize:12,color:T.t2}}>✅ No major imbalances detected based on current inputs.</div>}
      </Card>
    </div>
  );

  // ── GOALS ────────────────────────────────────────────────
  const TabGoals=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Milestones */}
      <Card s={{border:`1px solid ${T.yellow}40`}}>
        <Hd c={T.yellow}>🏆 Wealth Level</Hd>
        <div style={flex(16)}>
          <div style={{textAlign:"center",flexShrink:0}}>
            <div style={{fontSize:44}}>{C.curM?.b||"🌱"}</div>
            <div style={{color:T.yellow,fontWeight:700,fontSize:13}}>{C.curM?`Level ${MILES.indexOf(C.curM)+1}`:"Starting"}</div>
          </div>
          <div style={{flex:1,minWidth:160}}>
            {C.nextM&&<>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.t2,marginBottom:5}}>
                <span>Next: {C.nextM.b} {C.nextM.l}</span>
                <span style={{color:T.yellow}}>{fmt(C.nw)} / {fmt(C.nextM.v)}</span>
              </div>
              <div style={{height:12,background:T.input,borderRadius:6,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,(C.nw/C.nextM.v)*100)}%`,background:`linear-gradient(90deg,${T.yellow},${T.orange})`,borderRadius:6}}/></div>
              <div style={{marginTop:4,fontSize:11,color:T.t3}}>Gap: {fmt(C.nextM.v-C.nw)}</div>
            </>}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{MILES.map(m=>(<div key={m.v} title={m.l} style={{fontSize:20,opacity:C.nw>=m.v?1:0.25}}>{m.b}</div>))}</div>
        </div>
      </Card>
      {/* FIRE */}
      <Card s={{border:`1px solid ${T.orange}40`}}>
        <Hd c={T.orange}>🔥 Early Retirement Calculator (FIRE)</Hd>
        <div style={{padding:"8px 12px",background:`${T.cyan}08`,border:`1px solid ${T.cyan}20`,borderRadius:9,marginBottom:12,fontSize:11,color:T.t2}}>FIRE = Financial Independence, Retire Early. The "4% rule" estimates the portfolio needed for indefinite withdrawals — a planning concept, not a guarantee.</div>
        <div style={{...grid("1fr 1fr 1fr"),marginBottom:12}}>
          <Row label="Target Annual Expenses" value={fire.exp} onChange={v=>setFire(f=>({...f,exp:v}))}/>
          <PRow label="Safe Withdrawal Rate" value={fire.swr} onChange={v=>setFire(f=>({...f,swr:v}))}/>
          <PRow label="Expected Return in Retirement" value={fire.ret} onChange={v=>setFire(f=>({...f,ret:v}))}/>
        </div>
        {fireResult&&(<>
          <div style={{...grid("1fr 1fr 1fr"),gap:10,marginBottom:10}}>
            {[{l:"Lean FIRE",v:fmt(fireResult.lean),c:T.yellow},{l:"Regular FIRE",v:fmt(fireResult.reg),c:T.cyan},{l:"Fat FIRE",v:fmt(fireResult.fat),c:T.green}].map(x=>(
              <div key={x.l} style={{padding:12,background:T.input,borderRadius:10,textAlign:"center"}}>
                <div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{x.l}</div>
                <div style={{fontSize:18,fontWeight:800,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div>
              </div>
            ))}
          </div>
          <div style={{padding:10,background:T.input,borderRadius:9,fontSize:12,color:T.t2,lineHeight:1.7}}>
            Current: <strong style={{color:T.cyan}}>{fmt(C.nw)}</strong> · Gap to FIRE: <strong style={{color:T.red}}>{fmt(fireResult.gap)}</strong>
            {fireResult.yrs!==null&&<> · Est. <strong style={{color:T.green}}>{fireResult.yrs.toFixed(1)} years</strong> at current surplus</>}
          </div>
        </>)}
      </Card>
      {/* Goals */}
      {C.tg.map(g=>{
        const pc=g.pp>=75?T.green:g.pp>=40?T.yellow:T.red;
        return(
          <Card key={g.id} s={{border:`1px solid ${pc}28`}}>
            <div style={{...flex(10),justifyContent:"space-between",marginBottom:12}}>
              <input value={g.title||""} placeholder="Goal title (e.g. Reach $2M net worth)" onChange={e=>upGoal(g.id,"title",e.target.value)} style={{background:"none",border:"none",color:T.text,fontWeight:600,outline:"none",flex:1,fontSize:15,fontFamily:"'Sora',sans-serif"}}/>
              <RmBtn onClick={()=>setGoals(gs=>gs.filter(x=>x.id!==g.id))}/>
            </div>
            <div style={{...grid("1fr 1fr 1fr 1fr"),gap:10,marginBottom:12}}>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <label style={{fontSize:11,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>Category</label>
                <select value={g.cat||"Net Worth"} onChange={e=>upGoal(g.id,"cat",e.target.value)} style={inp()}>
                  {["Net Worth","Property","Stocks","Super","Savings"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <Row label="Target Amount" value={g.amt} onChange={v=>upGoal(g.id,"amt",v)}/>
              <Row label="Target Year" value={g.yr} onChange={v=>upGoal(g.id,"yr",v)} prefix=""/>
              <TRow label="Notes" value={g.notes} onChange={v=>upGoal(g.id,"notes",v)}/>
            </div>
            <div style={{...grid("1fr 1fr 1fr 1fr"),gap:10,marginBottom:12}}>
              {[{l:"Current",v:fmt(g.cur),c:T.cyan},{l:"Target",v:fmt(n(g.amt)),c:T.t2},{l:"Gap",v:fmt(g.gap),c:g.gap>0?T.red:T.green},{l:"Monthly Needed",v:fmt(g.monthly),c:pc}].map(x=>(
                <div key={x.l} style={{padding:10,background:T.input,borderRadius:9}}>
                  <div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{x.l}</div>
                  <div style={{fontSize:15,fontWeight:700,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.t2,marginBottom:5}}>
              <span>Progress</span><span style={{color:pc,fontWeight:600}}>{g.pp.toFixed(0)}% · {g.yrsLeft} yr{g.yrsLeft!==1?"s":""} left</span>
            </div>
            <div style={{height:9,background:T.input,borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:`${g.pp}%`,background:`linear-gradient(90deg,${pc},${pc}88)`,borderRadius:5}}/></div>
          </Card>
        );
      })}
      <AddBtn onClick={()=>setGoals(gs=>[...gs,{id:id(),title:"",cat:"Net Worth",amt:"",yr:"",notes:""}])} label="Add Goal"/>
    </div>
  );

  // ── STRESS TESTS ─────────────────────────────────────────
  const TabStress=()=>{
    const tests=[
      {l:"Property Crash −30%",i:"🏚️",s:"Severe",col:T.red,desc:"Property prices fall 30%.",impact:-(C.propVal*0.3),nw:C.nw-C.propVal*0.3},
      {l:"Rate Hike +3%",i:"📈",s:"High",col:T.orange,desc:"RBA raises cash rate 300bps.",impact:-(C.propMtg*0.03),nw:C.nw-C.propMtg*0.03*5},
      {l:"Sharemarket −40% + Crypto −70%",i:"📉",s:"Severe",col:T.red,desc:"GFC-level equities crash + crypto collapse.",impact:-(C.stockVal*0.4+C.cryptoVal*0.7),nw:C.nw-C.stockVal*0.4-C.cryptoVal*0.7},
      {l:"Stagflation",i:"🔥",s:"Moderate",col:T.yellow,desc:"Inflation 8%+, stagnant growth.",impact:-(C.nw*0.15),nw:C.nw*0.85},
      {l:"Recession + Income Shock",i:"💼",s:"High",col:T.orange,desc:"Unemployment 8%, income drops 40%.",impact:-(C.propMtg*0.015),nw:C.nw-C.propMtg*0.015},
    ];
    return(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{padding:"10px 14px",background:`${T.cyan}08`,border:`1px solid ${T.cyan}20`,borderRadius:9,fontSize:12,color:T.t2}}>ℹ️ These are modelling tools to help identify portfolio vulnerabilities — not predictions. Consult a licensed financial adviser for personalised risk assessment.</div>
        {tests.map(t=>{
          const ret=C.nw>0?Math.max(0,(t.nw/C.nw)*100):100;
          const sCol={Severe:T.red,High:T.orange,Moderate:T.yellow}[t.s];
          return(
            <Card key={t.l} s={{border:`1px solid ${t.col}28`}}>
              <div style={{...flex(12),justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
                <div style={flex(10)}><span style={{fontSize:24}}>{t.i}</span><div><div style={{fontSize:14,fontWeight:700,color:t.col}}>{t.l}</div><div style={{fontSize:11,color:T.t2,marginTop:2}}>{t.desc}</div></div></div>
                <span style={{background:`${sCol}18`,color:sCol,border:`1px solid ${sCol}35`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600}}>{t.s}</span>
              </div>
              <div style={{...grid("1fr 1fr 1fr"),gap:10,marginBottom:12}}>
                {[{l:"Current Net Worth",v:fmt(C.nw),c:T.cyan},{l:"Modelled Impact",v:fmt(t.impact),c:t.col},{l:"Net Worth After",v:fmt(t.nw),c:t.nw>=0?T.green:T.red}].map(x=>(
                  <div key={x.l} style={{padding:10,background:T.input,borderRadius:9}}><div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em"}}>{x.l}</div><div style={{fontSize:16,fontWeight:700,color:x.c,fontFamily:"'DM Mono',monospace",marginTop:3}}>{x.v}</div></div>
                ))}
              </div>
              <div style={{fontSize:10,color:T.t2,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.07em"}}>Value retained</div>
              <div style={{height:8,background:T.input,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${ret}%`,background:`linear-gradient(90deg,${t.col},${t.col}88)`,borderRadius:4}}/></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.t3,marginTop:3}}><span>$0</span><span style={{color:T.cyan}}>{ret.toFixed(0)}% retained</span><span>{fmt(C.nw)}</span></div>
            </Card>
          );
        })}
      </div>
    );
  };

  // ── ACCOUNTING ───────────────────────────────────────────
  const TabAccounting=()=>{
    const items=[{l:"Property Equity",v:C.propEq,c:T.cyan},{l:"Stocks & ETFs",v:C.stockVal,c:T.yellow},{l:"Crypto",v:C.cryptoVal,c:T.orange},{l:"Other Assets",v:C.assetVal,c:T.purple},{l:"Superannuation",v:n(sup.bal),c:T.green},{l:"Non-Mtg Debts",v:-C.debtBal,c:T.red}];
    const totalRent=C.tp.reduce((s,p)=>s+p.ar,0);
    const totalOut=C.tp.reduce((s,p)=>s+p.ao,0);
    const cfRows=[{l:"INFLOWS",h:true},{l:"Rental Income",v:totalRent,pos:true},{l:"Share Dividends",v:C.totalDiv,pos:true},{l:"TOTAL INFLOWS",v:totalRent+C.totalDiv,tot:true,pos:true},{l:"OUTFLOWS",h:true},...C.tp.map(p=>({l:`  ${p.name||"Property"} outflows`,v:p.ao,pos:false})),{l:"Debt Payments p.a.",v:C.debtBal>0?debts.reduce((s,d)=>s+n(d.minPay)*12,0):0,pos:false},{l:"TOTAL OUTFLOWS",v:totalOut,tot:true,pos:false},{l:"NET CASHFLOW",v:totalRent+C.totalDiv-totalOut,grand:true,pos:totalRent+C.totalDiv-totalOut>=0}];
    return(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",justifyContent:"flex-end"}}><button onClick={()=>window.print()} style={{background:T.cyan,border:"none",borderRadius:9,color:T.act,padding:"11px 22px",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"'Sora',sans-serif",display:"flex",alignItems:"center",gap:7}}>🖨️ Print Report</button></div>
        <Card>
          <Hd>Asset Allocation</Hd>
          <div style={{...grid("1fr 1fr 1fr 1fr 1fr 1fr"),gap:10}}>
            {items.map(x=>{const p=((Math.abs(x.v)/(C.nw||1))*100).toFixed(1);return(<div key={x.l} style={{padding:12,background:T.input,borderRadius:10,border:`1px solid ${x.c}25`}}><div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{x.l}</div><div style={{fontSize:14,fontWeight:700,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v<0?"-":""}{fmt(Math.abs(x.v))}</div><div style={{marginTop:6,height:3,background:T.border,borderRadius:2}}><div style={{height:"100%",width:`${Math.min(100,p)}%`,background:x.c,borderRadius:2}}/></div><div style={{marginTop:2,fontSize:10,color:T.t3}}>{p}%</div></div>);} )}
          </div>
        </Card>
        <Card s={{border:`1px solid ${T.yellow}28`}}>
          <Hd>Tax Data for Your Accountant</Hd>
          <div style={{padding:"8px 12px",background:`${T.cyan}08`,border:`1px solid ${T.cyan}20`,borderRadius:9,marginBottom:12,fontSize:11,color:T.t2}}>networth. does not calculate your tax liability — these are the raw inputs your accountant will need.</div>
          <div style={{...grid("1fr 1fr 1fr"),gap:10}}>
            {[{l:"Rental Income p.a.",v:fmt(totalRent),c:T.cyan},{l:"Rental Expenses p.a.",v:fmt(totalOut),c:T.red},{l:"Net Rental Position",v:fmt(C.propCF),c:C.propCF>=0?T.green:T.orange},{l:"Dividend Income p.a.",v:fmt(C.totalDiv),c:T.yellow},{l:"Unrealised Stock Gain",v:fmt(C.ts.reduce((s,x)=>s+x.gain,0)),c:T.green},{l:"Unrealised Crypto Gain",v:fmt(C.tc.reduce((s,c)=>s+c.gain,0)),c:T.green}].map(x=>(
              <div key={x.l} style={{padding:10,background:T.input,borderRadius:9}}><div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{x.l}</div><div style={{fontSize:15,fontWeight:700,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div></div>
            ))}
          </div>
        </Card>
        <Card>
          <Hd>Annual Cashflow Statement</Hd>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <tbody>{cfRows.map((r,i)=>(
              <tr key={i} style={{background:r.grand?`${T.cyan}06`:r.tot?T.input:"transparent",borderTop:(r.h||r.tot||r.grand)?`1px solid ${T.border}`:"none"}}>
                <td style={{padding:"8px 12px",fontSize:r.h?10:r.grand?13:12,color:r.h?T.t2:T.text,textTransform:r.h?"uppercase":"none",letterSpacing:r.h?"0.09em":"normal",fontWeight:(r.tot||r.grand)?700:400}}>{r.l}</td>
                {!r.h&&<td style={{padding:"8px 12px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:r.grand?14:12,color:r.grand?(r.pos?T.green:T.red):r.tot?T.text:r.pos?T.green:T.red,fontWeight:(r.tot||r.grand)?700:400}}>{fmt(r.v)}</td>}
              </tr>
            ))}</tbody>
          </table>
        </Card>
        <Card>
          <Hd>Total Net Worth</Hd>
          <div style={{textAlign:"center",padding:"18px 0"}}>
            <div style={{fontSize:10,color:T.t2,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:7}}>Combined Net Worth</div>
            <div style={{fontSize:44,fontWeight:800,color:T.cyan,fontFamily:"'DM Mono',monospace"}}>{fmt(C.nw)}</div>
            <div style={{marginTop:6,color:T.t3,fontSize:12}}>Property · Shares · Crypto · Assets · Super · minus Debts</div>
          </div>
        </Card>
      </div>
    );
  };

  // ── SETTINGS ─────────────────────────────────────────────
  const TabSettings=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card s={{border:`1px solid ${T.cyan}40`}}>
        <Hd>Subscription</Hd>
        <div style={{...flex(14),justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{...flex(8),marginBottom:4}}><div style={{fontSize:14,fontWeight:700,color:T.text}}>networth. {isPro?"Pro ✨":"Free"}</div>{isPro&&<span style={{background:`${T.cyan}20`,color:T.cyan,border:`1px solid ${T.cyan}35`,borderRadius:20,padding:"1px 9px",fontSize:10,fontWeight:700}}>ACTIVE</span>}</div>
            <div style={{fontSize:12,color:T.t2,lineHeight:1.5}}>{isPro?"Full access: Goals, Stress Tests, AI Insights, Accounting.":"Upgrade to Pro ($10/mo) for Goals, Stress Tests, AI Insights, Accounting."}</div>
          </div>
          <button onClick={()=>setIsPro(p=>!p)} style={{background:isPro?T.input:T.cyan,border:`1px solid ${isPro?T.border:T.cyan}`,borderRadius:9,color:isPro?T.t2:T.act,padding:"9px 18px",cursor:"pointer",fontWeight:700,fontFamily:"'Sora',sans-serif",fontSize:12,flexShrink:0}}>{isPro?"Switch to Free view":"Unlock Pro — Try Free"}</button>
        </div>
      </Card>
      <Card>
        <Hd>Appearance</Hd>
        <div style={{display:"flex",gap:10,maxWidth:260}}>
          {[["dark","🌙 Dark"],["light","☀️ Light"]].map(([v,l])=>(
            <button key={v} onClick={()=>setDark(v==="dark")} style={{flex:1,background:(dark&&v==="dark")||(!dark&&v==="light")?T.cyan:"transparent",border:`1px solid ${T.border}`,borderRadius:9,color:(dark&&v==="dark")||(!dark&&v==="light")?T.act:T.t2,padding:"11px",cursor:"pointer",fontFamily:"'Sora',sans-serif",fontSize:12,fontWeight:700}}>{l}</button>
          ))}
        </div>
      </Card>
      <Card>
        <Hd>Scenario Settings</Hd>
        <div style={{maxWidth:220}}>
          <Row label="Monthly Investment Amount" value={settings.monthlyInv} onChange={v=>setSettings(s=>({...s,monthlyInv:v}))}/>
        </div>
      </Card>
      <Card>
        <Hd>Data</Hd>
        <div style={{fontSize:12,color:T.t2,marginBottom:12,lineHeight:1.6}}>All data is stored in browser memory only — nothing is sent to any server. Export to save your data before refreshing.</div>
        <button onClick={()=>{const d={props,stocks,crypto,assets,debts,goals,income,exp,sup,settings};const a=document.createElement("a");a.href="data:text/json,"+encodeURIComponent(JSON.stringify(d));a.download="networth-backup.json";a.click();}} style={{background:T.cyan,border:"none",borderRadius:8,color:T.act,padding:"9px 18px",cursor:"pointer",fontWeight:600,fontFamily:"'Sora',sans-serif",fontSize:12}}>⬇️ Export Data</button>
      </Card>
      <div style={{padding:12,background:T.input,borderRadius:10,fontSize:11,color:T.t3,lineHeight:1.8}}>
        <strong style={{color:T.t2}}>networth.</strong> — Personal Wealth Dashboard for Aussie Investors<br/>
        General financial information only. Not personal financial advice. Not an AFS licensee.<br/>
        Consult a licensed financial adviser before making investment decisions.
      </div>
    </div>
  );

  // ── Paywall ───────────────────────────────────────────────
  const Paywall=({name})=>(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",textAlign:"center",gap:18}}>
      <div style={{fontSize:48}}>🔒</div>
      <div style={{fontSize:20,fontWeight:800,color:T.text,fontFamily:"'Sora',sans-serif"}}>{name}</div>
      <div style={{fontSize:14,color:T.t2,maxWidth:380,lineHeight:1.7}}>This is a <strong style={{color:T.cyan}}>networth. Pro</strong> feature. Unlock goals, stress tests, AI insights, and full accounting for $10/mo.</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:320}}>
        <div style={{padding:"14px 18px",background:`${T.cyan}10`,border:`1px solid ${T.cyan}28`,borderRadius:12}}>
          <div style={{fontWeight:700,color:T.cyan,marginBottom:8}}>Pro — $10/mo</div>
          {["🎯 Goals + FIRE calculator","⚡ Stress tests","💡 AI portfolio insights","📊 Full accounting & tax summary"].map(f=><div key={f} style={{fontSize:12,color:T.text,marginBottom:5,display:"flex",gap:7,alignItems:"center"}}><span style={{color:T.green,fontSize:10}}>✓</span>{f}</div>)}
        </div>
        <button onClick={()=>setIsPro(true)} style={{background:T.cyan,border:"none",borderRadius:11,color:T.act,padding:"13px",cursor:"pointer",fontWeight:800,fontSize:13,fontFamily:"'Sora',sans-serif"}}>Unlock Pro — Try Free</button>
        <p style={{fontSize:11,color:T.t3}}>No payment required right now. Billing coming soon.</p>
      </div>
    </div>
  );

  const CONTENT={"🏠 Property":<TabProperty/>,"📈 Stocks":<TabStocks/>,"₿ Crypto":<TabCrypto/>,"💼 Assets & Debts":<TabAssetsDebts/>,"💵 Income & Expenses":<TabIncomeExpenses/>,"🧾 Super":<TabSuper/>,"🔭 Scenarios":<TabScenarios/>,"💡 Insights":isPro?<TabInsights/>:<Paywall name="Insights"/>,"🎯 Goals":isPro?<TabGoals/>:<Paywall name="Goals"/>,"⚡ Stress Tests":isPro?<TabStress/>:<Paywall name="Stress Tests"/>,"📊 Accounting":isPro?<TabAccounting/>:<Paywall name="Accounting"/>,"⚙️ Settings":<TabSettings/>};

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${T.bg};}
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none;}
        input[type=month]{color-scheme:${dark?"dark":"light"};}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:${T.bg};}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}
        select option{background:${T.input};}
        @media print{.np{display:none!important;}}
      `}</style>

      {/* Disclaimer modal */}
      {disc&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:16}}>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:32,maxWidth:480,width:"100%"}}>
            <div style={{fontSize:24,fontWeight:800,marginBottom:6,fontFamily:"'Sora',sans-serif"}}><span style={{color:T.cyan}}>net</span><span style={{color:T.text}}>worth.</span></div>
            <div style={{fontSize:12,color:T.t2,marginBottom:18}}>Personal Wealth Dashboard for Aussie Investors</div>
            <div style={{padding:16,background:`${T.yellow}12`,border:`1px solid ${T.yellow}35`,borderRadius:11,marginBottom:18}}>
              <div style={{fontWeight:700,color:T.yellow,marginBottom:8}}>⚖️ Important — Please Read</div>
              <p style={{color:T.t2,fontSize:12,lineHeight:1.8}}>networth. provides <strong style={{color:T.text}}>general financial information only</strong> and does not constitute personal financial advice under the <em>Corporations Act 2001</em>.<br/><br/>networth. is <strong style={{color:T.text}}>not an AFS licensee</strong>. All projections are <strong style={{color:T.text}}>illustrative estimates only</strong>. Consult a <strong style={{color:T.text}}>licensed financial adviser</strong> before making investment decisions.</p>
            </div>
            <p style={{color:T.t3,fontSize:11,marginBottom:18,lineHeight:1.5}}>All data stays in your browser — nothing is sent to any server.</p>
            <button onClick={()=>setDisc(false)} style={{width:"100%",background:T.cyan,border:"none",borderRadius:11,color:T.act,padding:"14px",cursor:"pointer",fontWeight:800,fontSize:14,fontFamily:"'Sora',sans-serif"}}>I understand — Let's go</button>
          </div>
        </div>
      )}

      <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Sora',sans-serif",color:T.text}}>
        {/* Header */}
        <div className="np" style={{background:T.card,borderBottom:`1px solid ${T.border}`,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:20,fontWeight:800,fontFamily:"'Sora',sans-serif"}}><span style={{color:T.cyan}}>net</span><span style={{color:T.text}}>worth.</span></div>
            {C.curM&&<span style={{background:`${T.yellow}18`,color:T.yellow,border:`1px solid ${T.yellow}35`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600}}>{C.curM.b} Level {MILES.indexOf(C.curM)+1}</span>}
            {isPro&&<span style={{background:`${T.cyan}18`,color:T.cyan,border:`1px solid ${T.cyan}35`,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700}}>PRO</span>}
          </div>
          <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
            {[{l:"Net Worth",v:fmt(C.nw),c:T.cyan},{l:"Surplus/mo",v:fmt(C.mSurplus),c:C.mSurplus>=0?T.green:T.red},{l:"10yr",v:fmt(C.nw10),c:T.purple}].map(x=>(
              <div key={x.l} style={{textAlign:"right"}}><div style={{fontSize:9,color:T.t2,textTransform:"uppercase",letterSpacing:"0.08em"}}>{x.l}</div><div style={{fontSize:16,fontWeight:800,color:x.c,fontFamily:"'DM Mono',monospace"}}>{x.v}</div></div>
            ))}
            <button onClick={()=>setDark(d=>!d)} style={{background:T.input,border:`1px solid ${T.border}`,borderRadius:7,color:T.t2,padding:"6px 10px",cursor:"pointer",fontSize:14}}>{dark?"☀️":"🌙"}</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="np" style={{display:"flex",gap:2,padding:"11px 20px 0",borderBottom:`1px solid ${T.border}`,background:T.card,overflowX:"auto"}}>
          {TABS.map(t=>{
            const locked=PRO.has(t)&&!isPro;
            return(
              <button key={t} onClick={()=>setTab(t)} style={{background:tab===t?T.cyan:"transparent",border:tab===t?"none":`1px solid ${T.border}`,borderBottom:"none",borderRadius:"7px 7px 0 0",color:tab===t?T.act:locked?T.t3:T.t2,padding:"7px 11px",cursor:"pointer",fontWeight:tab===t?700:400,fontSize:11,fontFamily:"'Sora',sans-serif",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4,opacity:locked?0.6:1}}>
                {t}{locked&&<span style={{fontSize:9}}>🔒</span>}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{padding:"18px 20px",maxWidth:1400,margin:"0 auto"}}>
          {CONTENT[tab]}
        </div>

        {/* Footer */}
        <div className="np" style={{borderTop:`1px solid ${T.border}`,padding:"9px 20px",textAlign:"center",fontSize:10,color:T.t3,background:T.card}}>
          networth. · General information only · Not financial advice · Not an AFS licensee · Consult a licensed financial adviser
        </div>
      </div>
    </>
  );
}
