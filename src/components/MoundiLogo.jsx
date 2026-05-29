import { BR } from "../constants.js";

export default function MoundiLogo({size=36, showText=true, textColor="#111", showSubtitle=true, textSize=18}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
      <img src="/logo.png" alt="Moundi Guide" style={{height:size,width:size,objectFit:"contain"}}
        onError={e=>{e.target.style.display="none";e.target.nextSibling&&(e.target.nextSibling.style.display="flex");}}
      />
      {/* SVG fallback shown if logo.png missing */}
      <svg width={size} height={size} viewBox="0 0 100 100" style={{display:"none",flexShrink:0}}>
        <circle cx="50" cy="20" r="8" fill={BR.red}/>
        <circle cx="80" cy="50" r="8" fill={BR.gold}/>
        <circle cx="50" cy="80" r="8" fill={BR.green}/>
        <circle cx="20" cy="50" r="8" fill={BR.blue}/>
        <path d="M50 20 Q80 20 80 50 Q80 80 50 80 Q20 80 20 50 Q20 20 50 20" fill="none" stroke={BR.red} strokeWidth="3" strokeDasharray="8,4"/>
        <text x="50" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={BR.red}>M</text>
      </svg>
      {showText&&(
        <div style={{lineHeight:1}}>
          <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:textSize,color:textColor,letterSpacing:0.3}}>
            Moundi Guide
          </div>
          {showSubtitle&&<div style={{fontFamily:"'Outfit',sans-serif",fontSize:8,color:"rgba(120,120,120,0.9)",letterSpacing:2,textTransform:"uppercase",marginTop:2,whiteSpace:"nowrap"}}>
            Unity · Community · Innovation
          </div>}
        </div>
      )}
    </div>
  );
}
