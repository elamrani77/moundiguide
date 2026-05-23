import { TRANSLATIONS, BR, TICKET_CATS, F } from "../constants.js";

export default function TicketPage({C,F: Fprop,isDesk,lang}){
  const font = Fprop || F;
  const T = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const steps = T.tickSteps.map((s,i)=>({n:String(i+1),...s}));
  return(
    <div style={{minHeight:"100vh",paddingTop:68,background:"#F4F5F7"}}>

      {/* Page hero */}
      <div style={{background:`linear-gradient(135deg,#0A0F1A 0%,#1A0505 50%,#0A0F1A 100%)`,padding:isDesk?"64px 48px":"40px 20px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at center, ${BR.red}22 0%, transparent 70%)`}}/>
        <div style={{position:"relative"}}>
          <div style={{fontFamily:font,fontSize:12,fontWeight:600,color:BR.gold,letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>{T.tickBadge}</div>
          <div style={{fontFamily:font,fontSize:isDesk?48:30,fontWeight:900,color:"#FFF",marginBottom:14}}>🎟️ {T.tickTitle}</div>
          <div style={{fontFamily:font,fontSize:15,color:"rgba(255,255,255,0.65)",maxWidth:500,margin:"0 auto"}}>
            {T.tickSub}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:isDesk?"48px 32px":"24px 16px"}}>

        {/* Ticket categories */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontFamily:font,fontSize:isDesk?28:22,fontWeight:800,color:C.str}}>{T.tickCatTitle}</div>
          <div style={{fontFamily:font,fontSize:13,color:C.mut,marginTop:6}}>{T.tickCatSub}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isDesk?"repeat(4,1fr)":"repeat(2,1fr)",gap:16,marginBottom:56}}>
          {TICKET_CATS.map((tc,i)=>(
            <div key={i} style={{background:"#FFFFFF",border:`2px solid ${tc.color}33`,borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",textAlign:"center",transition:"transform .2s,box-shadow .2s",cursor:"default"}}>
              <div style={{fontSize:32,marginBottom:10}}>{tc.icon}</div>
              <div style={{fontFamily:font,fontSize:12,fontWeight:700,color:tc.color,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{tc.cat}</div>
              <div style={{fontFamily:font,fontSize:28,fontWeight:900,color:C.str,marginBottom:8}}>{tc.price}</div>
              <div style={{fontFamily:font,fontSize:12,color:C.mut,lineHeight:1.5}}>{tc.desc}</div>
              <div style={{marginTop:16,padding:"8px 0",borderRadius:10,background:`${tc.color}18`,border:`1px solid ${tc.color}33`}}>
                <span style={{fontFamily:font,fontSize:11,fontWeight:600,color:tc.color}}>{T.tickStarting}</span>
              </div>
            </div>
          ))}
        </div>

        {/* How to buy */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontFamily:font,fontSize:isDesk?28:22,fontWeight:800,color:C.str}}>{T.tickHowTitle}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isDesk?"repeat(4,1fr)":"repeat(2,1fr)",gap:16,marginBottom:48}}>
          {steps.map((s,i)=>(
            <div key={i} style={{background:"#FFFFFF",border:`1px solid #E5E7EB`,borderRadius:16,padding:20,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${BR.red},${BR.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:font,fontSize:16,fontWeight:800,color:"#FFF",marginBottom:12}}>{s.n}</div>
              <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
              <div style={{fontFamily:font,fontSize:13,fontWeight:700,color:C.str,marginBottom:6}}>{s.title}</div>
              <div style={{fontFamily:font,fontSize:12,color:C.mut,lineHeight:1.5}}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Important info */}
        <div style={{background:`linear-gradient(135deg,${BR.gold}11,${BR.red}08)`,border:`1px solid ${BR.gold}33`,borderRadius:20,padding:28,marginBottom:40}}>
          <div style={{fontFamily:font,fontSize:16,fontWeight:700,color:C.str,marginBottom:16}}>⚠️ {T.tickInfoTitle}</div>
          <div style={{display:"grid",gridTemplateColumns:isDesk?"1fr 1fr":"1fr",gap:12}}>
            {T.tickInfoItems.map((info,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                <span style={{color:BR.gold,fontSize:14,flexShrink:0}}>✦</span>
                <span style={{fontFamily:font,fontSize:13,color:C.txt,lineHeight:1.5}}>{info}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{textAlign:"center"}}>
          <a href="https://www.fifa.com/en/tournaments/mens/worldcup/2030fifaworldcup" target="_blank" rel="noopener noreferrer"
            style={{display:"inline-block",padding:"10px 20px",borderRadius:10,background:"#C8102E",
              textDecoration:"none",fontFamily:font,fontWeight:700,fontSize:16,color:"white",
              boxShadow:`0 4px 16px rgba(200,16,46,0.35)`}}>
            🌐 {T.tickCTA}
          </a>
        </div>
      </div>
    </div>
  );
}
