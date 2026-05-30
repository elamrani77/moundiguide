import { useEffect } from "react";
import { BR } from "../constants.js";

export default function Splash({onDone}){
  useEffect(()=>{const t=setTimeout(onDone,2600);return()=>clearTimeout(t);},[]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:999999,background:"#121414",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <style>{`@keyframes kickBall{0%{transform:translateY(0) rotate(0deg)}30%{transform:translateY(-60px) rotate(180deg)}50%{transform:translateY(0) rotate(360deg)}70%{transform:translateY(-30px) rotate(540deg)}100%{transform:translateY(0) rotate(720deg)}}@keyframes growBar{from{width:0}to{width:100%}}@keyframes spl{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{fontSize:72,animation:"kickBall 1.5s ease-in-out infinite",filter:"drop-shadow(0 0 20px rgba(240,180,41,0.6))"}}>⚽</div>
      <div style={{fontFamily:"'Outfit',sans-serif",fontSize:34,fontWeight:800,marginTop:20,animation:"spl .6s .2s both"}}>
        <span style={{color:BR.red}}>Moundi</span><span style={{color:"#FFF"}}> Guide</span>
      </div>
      <div style={{fontFamily:"'Outfit',sans-serif",fontSize:10,color:BR.gold,letterSpacing:5,marginTop:6,textTransform:"uppercase",animation:"spl .6s .4s both"}}>
        Unity · Community · Innovation
      </div>
      <div style={{width:140,height:3,background:"rgba(255,255,255,0.08)",borderRadius:3,marginTop:28,overflow:"hidden",animation:"spl .6s .5s both"}}>
        <div style={{height:"100%",background:`linear-gradient(90deg,${BR.red},${BR.gold},${BR.green})`,borderRadius:3,animation:"growBar 2.2s .5s ease-out forwards",width:0}}/>
      </div>
      <div style={{display:"flex",gap:10,marginTop:16,animation:"spl .6s .6s both"}}>
        <span style={{fontSize:22}}>🇲🇦</span><span style={{fontSize:22}}>🇪🇸</span><span style={{fontSize:22}}>🇵🇹</span>
      </div>
    </div>
  );
}
