import { Sparkles, X } from "lucide-react";
import { BR, PLACEHOLDERS, F } from "../constants.js";

function md(t){if(!t)return t;return t.split("\n").map((l,i)=>{let c=l.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>");if(l.startsWith("- ")||l.startsWith("• "))return<div key={i} style={{paddingLeft:12,marginBottom:2}} dangerouslySetInnerHTML={{__html:"• "+c.slice(2)}}/>;if(l.trim()==="")return<div key={i} style={{height:6}}/>;return<div key={i} dangerouslySetInnerHTML={{__html:c}}/>;});}

export default function ChatFloat({C,lang,msgs,input,setInput,loading,send,listening,toggleVoice,chatOpen,setChatOpen,isRTL,ac,F: Fprop,endRef,inpRef}){
  const font = Fprop || F;
  if(!chatOpen) return(
    <button onClick={()=>setChatOpen(true)}
      style={{position:"fixed",bottom:28,right:28,width:58,height:58,borderRadius:"50%",
        background:"linear-gradient(135deg,#C8102E,#00913F)",border:"none",cursor:"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:"0 8px 28px rgba(200,16,46,0.45)",zIndex:900,animation:"chatPulse 2s ease-in-out infinite"}}>
      <Sparkles size={22} color="white"/>
    </button>
  );
  return(
    <div style={{position:"fixed",bottom:28,right:28,width:360,height:520,borderRadius:20,
      background:"rgba(255,255,255,0.97)",
      border:`1px solid ${C.bdr}`,boxShadow:C.sh,zIndex:900,
      display:"flex",flexDirection:"column",backdropFilter:"blur(24px)",
      animation:"popIn .25s ease both"}}>
      {/* Chat header */}
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${BR.red},${BR.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚽</div>
          <div>
            <div style={{fontFamily:font,fontSize:13,fontWeight:700,color:C.str}}>MoundiGuide AI</div>
            <div style={{fontFamily:font,fontSize:9,color:BR.green}}>● En ligne</div>
          </div>
        </div>
        <button onClick={()=>setChatOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.mut,display:"flex",alignItems:"center"}}><X size={18}/></button>
      </div>
      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"12px 10px",display:"flex",flexDirection:"column",gap:8}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",direction:isRTL?"rtl":"ltr"}}>
            {m.role==="assistant"&&<div style={{width:24,height:24,borderRadius:"50%",flexShrink:0,background:`linear-gradient(135deg,${BR.red},${BR.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,marginRight:6,marginTop:2}}>⚽</div>}
            <div style={{maxWidth:"82%",padding:"9px 13px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?C.usr:C.bot,border:m.role==="user"?"none":`1px solid ${C.bbdr}`,color:m.role==="user"?"#FFF":C.txt,fontSize:12.5,lineHeight:1.55,fontFamily:isRTL?"'Noto Sans Arabic'":font}}>
              {m.role==="assistant"?md(m.content):m.content}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",gap:6,padding:"6px 10px"}}>{[0,.15,.3].map((d,i)=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:ac,animation:`dp 1s ease-in-out infinite`,animationDelay:`${d}s`}}/>)}</div>}
        <div ref={endRef}/>
      </div>
      {/* Quick topics */}
      <div style={{padding:"5px 10px",display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none",borderTop:`1px solid ${C.bdr}`,flexShrink:0}}>
        {(({fr:["🏟️ Stades","🚇 Transport","🍜 Restaurants","🏨 Hôtels","☀️ Météo"],en:["🏟️ Stadiums","🍜 Food","🏨 Hotels","☀️ Weather"]})[lang]||[]).map((t,i)=>(
          <button key={i} onClick={()=>send(t)} style={{whiteSpace:"nowrap",padding:"3px 9px",background:C.card,border:`1px solid ${C.bdr}`,borderRadius:20,color:C.mut,fontSize:10,cursor:"pointer",fontFamily:font,flexShrink:0}}>{t}</button>
        ))}
      </div>
      {/* Input */}
      <div style={{padding:"8px 12px 12px",flexShrink:0}}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button onClick={toggleVoice} style={{width:34,height:34,borderRadius:10,border:`1px solid ${listening?BR.red:C.bdr}`,background:listening?`${BR.red}22`:C.card,cursor:"pointer",fontSize:13,color:listening?BR.red:C.mut}}>🎤</button>
          <input id="chat-input" name="chat-input" ref={inpRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();send();}}} placeholder={PLACEHOLDERS[lang]} dir={isRTL?"rtl":"ltr"}
            style={{flex:1,padding:"8px 12px",background:C.fld,border:`1px solid ${C.bdr}`,borderRadius:10,color:C.str,fontSize:12,fontFamily:font,outline:"none"}}/>
          <button onClick={()=>send()} disabled={!input.trim()||loading}
            style={{width:34,height:34,borderRadius:10,background:input.trim()&&!loading?`linear-gradient(135deg,${BR.red},${BR.green})`:C.card,border:"none",cursor:input.trim()&&!loading?"pointer":"not-allowed",fontSize:14,color:input.trim()&&!loading?"white":C.mut}}>
            {loading?<div style={{width:12,height:12,border:`2px solid ${C.bdr}`,borderTopColor:ac,borderRadius:"50%",animation:"sp .6s linear infinite",margin:"auto"}}/>:"➤"}
          </button>
        </div>
      </div>
    </div>
  );
}
