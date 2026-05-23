import { useState } from "react";
import { TRANSLATIONS, BR, PHASE_COLORS, MATCHES, FIFA_RANKINGS, NEWS, F } from "../constants.js";

export default function SchedulePage({C,ac,F: Fprop,send,isDesk,lang,selectedTeam}){
  const font = Fprop || F;
  const T = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const[phase,setPhase]=useState("all");
  const phases=[{id:"all",label:T.phAll},{id:"G",label:T.phG},{id:"8",label:T.ph8},{id:"Q",label:T.phQ},{id:"S",label:T.phS},{id:"F",label:T.phF}];
  const PHASE_LABELS_T = {G:T.phG,"8":T.ph8,Q:T.phQ,S:T.phS,F:T.phF};
  const filtered=phase==="all"?MATCHES:MATCHES.filter(m=>m.ph===phase);

  return(
    <div style={{minHeight:"100vh",paddingTop:68,background:"#F4F5F7"}}>

      {/* Page hero */}
      <div style={{background:`linear-gradient(135deg,#121414 0%,#0A1A0A 50%,#121414 100%)`,padding:isDesk?"56px 48px":"36px 20px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at center, ${BR.green}18 0%, transparent 70%)`}}/>
        <div style={{position:"relative"}}>
          <div style={{fontFamily:font,fontSize:12,fontWeight:600,color:BR.gold,letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>{T.schBadge}</div>
          <div style={{fontFamily:font,fontSize:isDesk?48:30,fontWeight:900,color:"#FFF",marginBottom:14}}>📅 {T.schTitle}</div>
          <div style={{fontFamily:font,fontSize:15,color:"rgba(255,255,255,0.65)"}}>{T.schSub}</div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:isDesk?"40px 32px":"20px 16px"}}>

        {/* Phase filter */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:32,justifyContent:"center"}}>
          {phases.map(p=>(
            <button key={p.id} onClick={()=>setPhase(p.id)}
              style={{padding:"8px 18px",borderRadius:24,border:`1px solid ${phase===p.id?ac:C.bdr}`,
                background:phase===p.id?`${ac}18`:C.card,color:phase===p.id?ac:C.mut,
                fontFamily:font,fontSize:13,fontWeight:phase===p.id?600:400,cursor:"pointer",
                transition:"all .2s",backdropFilter:"blur(8px)"}}>
              {p.label}
            </button>
          ))}
        </div>

        {/* 2-column grid desktop, 1-col mobile */}
        <div style={{display:"grid",gridTemplateColumns:isDesk?"1fr 1fr":"1fr",gap:14,marginBottom:48}}>
          {filtered.map((m,i)=>{
            const isTeamMatch=selectedTeam&&(m.a.includes(selectedTeam.f)||m.b.includes(selectedTeam.f));
            return(
            <div key={i}
              style={{background:isTeamMatch?`${ac}10`:"#FFFFFF",
                border:`1px solid ${isTeamMatch?ac:"#E5E7EB"}`,borderRadius:16,padding:"16px 20px",
                borderLeft:`4px solid ${isTeamMatch?ac:PHASE_COLORS[m.ph]}`,
                transition:"transform .2s,box-shadow .2s",cursor:"default",
                boxShadow:isTeamMatch?`0 0 0 1px ${ac}22,0 4px 20px ${ac}18`:"0 2px 12px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontFamily:font,fontSize:10,fontWeight:700,color:PHASE_COLORS[m.ph],
                    background:`${PHASE_COLORS[m.ph]}18`,padding:"3px 10px",borderRadius:20}}>
                    {PHASE_LABELS_T[m.ph]}
                  </span>
                  {isTeamMatch&&<span style={{fontFamily:font,fontSize:9,fontWeight:700,color:ac,background:`${ac}18`,padding:"3px 8px",borderRadius:20}}>{selectedTeam.f} Your team</span>}
                </div>
                <span style={{fontFamily:font,fontSize:11,color:C.mut}}>{m.d} · {m.tm}</span>
              </div>
              <div style={{fontFamily:font,fontSize:isDesk?16:14,fontWeight:700,color:C.str,marginBottom:6}}>
                {m.a} <span style={{color:C.mut,fontWeight:400,fontSize:13}}>vs</span> {m.b}
              </div>
              <div style={{fontFamily:font,fontSize:12,color:C.mut}}>📍 {m.c}</div>
            </div>
            );
          })}
        </div>

        {/* Rankings */}
        <div style={{display:"grid",gridTemplateColumns:isDesk?"1fr 1fr":"1fr",gap:24}}>
          <div style={{background:"#FFFFFF",border:"1px solid #E5E7EB",borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontFamily:font,fontSize:16,fontWeight:700,color:C.str,marginBottom:16}}>🏆 {T.rankTitle}</div>
            {FIFA_RANKINGS.map((r)=>{
              const isHost=r.f==="🇲🇦"||r.f==="🇪🇸"||r.f==="🇵🇹";
              const isFan=selectedTeam&&r.t===selectedTeam.t;
              const medal=r.r===1?"🥇":r.r===2?"🥈":r.r===3?"🥉":null;
              return(
                <div key={r.r} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:10,
                  marginBottom:2,
                  background:isFan?`${ac}18`:isHost?"rgba(228,28,58,0.04)":"transparent",
                  border:isFan?`1px solid ${ac}55`:isHost?`1px solid ${BR.gold}22`:"1px solid transparent"}}>
                  <span style={{fontFamily:font,fontSize:11,fontWeight:700,color:r.r<=3?BR.gold:C.mut,width:20,textAlign:"right"}}>{medal||r.r}</span>
                  <span style={{fontSize:15}}>{r.f}</span>
                  <span style={{fontFamily:font,fontSize:12,fontWeight:isFan||isHost?700:400,color:isFan?ac:isHost?C.str:C.txt,flex:1}}>{r.t}</span>
                  <span style={{fontFamily:font,fontSize:10,color:C.mut}}>{r.p}</span>
                  <span style={{fontSize:9,color:r.c==="up"?BR.check:r.c==="dn"?BR.red:C.mut}}>{r.c==="up"?"▲":r.c==="dn"?"▼":"•"}</span>
                  {isFan&&<span style={{fontSize:12}}>{selectedTeam.f}</span>}
                </div>
              );
            })}
          </div>
          {/* News */}
          <div style={{background:"#FFFFFF",border:"1px solid #E5E7EB",borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontFamily:font,fontSize:16,fontWeight:700,color:C.str,marginBottom:16}}>📰 {T.newsTitle}</div>
            {NEWS.map((n,i)=>(
              <div key={i} onClick={()=>send(n.t)}
                style={{padding:"12px 0",borderBottom:i<NEWS.length-1?`1px solid ${C.bdr}`:"none",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontFamily:font,fontSize:9,color:n.tc,fontWeight:600,background:`${n.tc}18`,padding:"2px 8px",borderRadius:20}}>{n.tg}</span>
                  <span style={{fontFamily:font,fontSize:10,color:C.mut}}>{n.d}</span>
                </div>
                <div style={{fontFamily:font,fontSize:13,color:C.str,lineHeight:1.4}}>{n.t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
