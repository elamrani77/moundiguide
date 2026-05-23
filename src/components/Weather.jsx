import { useState, useEffect } from "react";
import { STADIUMS } from "../constants.js";

export default function Weather({C,city}){
  const[w,setW]=useState(null);
  useEffect(()=>{const s=STADIUMS.find(st=>st.city===city);if(!s)return;fetch(`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lng}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`).then(r=>r.json()).then(d=>setW(d.current)).catch(()=>{});},[city]);
  if(!w)return null;
  const ic=c=>{if(c===0)return"☀️";if(c<=3)return"⛅";if(c<=48)return"🌫️";if(c<=67)return"🌧️";return"⛈️";};
  return(
    <div style={{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:16,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(16px)"}}>
      <div>
        <div style={{fontFamily:"'Outfit'",fontSize:10,color:C.mut,letterSpacing:1.5,textTransform:"uppercase"}}>{city}</div>
        <div style={{fontFamily:"'Outfit'",fontSize:30,fontWeight:700,color:C.str,lineHeight:1,marginTop:2}}>{Math.round(w.temperature_2m)}°<span style={{fontSize:15,fontWeight:400,color:C.mut}}>C</span></div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:32}}>{ic(w.weather_code)}</div>
        <div style={{fontFamily:"'Outfit'",fontSize:10,color:C.mut,marginTop:4}}>💨 {Math.round(w.wind_speed_10m)} km/h</div>
      </div>
    </div>
  );
}
