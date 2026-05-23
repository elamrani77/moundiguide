import { TRANSLATIONS, BR, F } from "../constants.js";
import MoundiLogo from "./MoundiLogo.jsx";

export default function Footer({C,F: Fprop,setPage,lang}){
  const font = Fprop || F;
  const T = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return(
    <footer style={{background:"rgba(255,255,255,0.7)",backdropFilter:"blur(16px)",borderTop:`1px solid ${C.bdr}`,padding:"32px 32px 20px"}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:24,marginBottom:24}}>
          <div>
            <MoundiLogo size={36} textColor={C.str}/>
            <div style={{fontFamily:font,fontSize:12,color:C.mut,marginTop:10,maxWidth:280,lineHeight:1.6}}>
              {T.footDesc}
            </div>
          </div>
          <div style={{display:"flex",gap:40,flexWrap:"wrap"}}>
            <div>
              <div style={{fontFamily:font,fontSize:11,fontWeight:700,color:C.str,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>{T.footNav}</div>
              {[{id:"home",label:T.navHome},{id:"ticket",label:T.navTicket},{id:"schedule",label:T.navSchedule}].map(p=>(
                <div key={p.id} onClick={()=>setPage(p.id)}
                  style={{fontFamily:font,fontSize:13,color:C.mut,marginBottom:7,cursor:"pointer",transition:"color .2s"}}>
                  {p.label}
                </div>
              ))}
            </div>
            <div>
              <div style={{fontFamily:font,fontSize:11,fontWeight:700,color:C.str,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>{T.footCountries}</div>
              {["🇲🇦 Morocco","🇪🇸 Spain","🇵🇹 Portugal"].map((c,i)=>(
                <div key={i} style={{fontFamily:font,fontSize:13,color:C.mut,marginBottom:7}}>{c}</div>
              ))}
            </div>
          </div>
        </div>
        <div style={{height:1,background:C.bdr,marginBottom:16}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div style={{fontFamily:font,fontSize:11,color:C.mut}}>{T.footRights}</div>
          <div style={{display:"flex",gap:6}}>
            {[BR.red,BR.gold,BR.green,BR.blue].map((c,i)=><div key={i} style={{width:8,height:3,borderRadius:2,background:c}}/>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
