import React, { useRef, useEffect } from "react";
import { BR, STADIUMS, POIS, POI_CATS } from "../constants.js";
import { useAnalytics } from "../hooks/useAnalytics.js";

function SMap({C,onSelect,onPoiSelect,activeCategory,flyTarget,userCoords,height}){
  const ref=useRef(null);const mR=useRef(null);
  const { track } = useAnalytics();
  const poiLayersRef=useRef({});const markersRef=useRef({});
  useEffect(()=>{
    if(mR.current)return;
    if(!window.L){const l=document.createElement("link");l.rel="stylesheet";l.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(l);const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";s.onload=()=>go();document.head.appendChild(s);}else go();
    function go(){
      if(!ref.current||mR.current)return;
      const m=window.L.map(ref.current,{zoomControl:false,attributionControl:false,tap:false,dragging:false,touchZoom:false,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:false}).setView([32.5,-6.5],5.5);
      const mapContainer=m.getContainer();
      mapContainer.style.touchAction='pan-y';
      window.L.control.zoom({position:"bottomright"}).addTo(m);
      window.L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{attribution:"©OSM ©CartoDB",maxZoom:19,subdomains:"abcd"}).addTo(m);
      // Stadium markers — pin style
      const stIc=window.L.divIcon({className:"",html:`<div style="position:relative;width:34px;height:42px;cursor:pointer;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.45))"><div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,${BR.red},${BR.green});transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.9)"><span style="transform:rotate(45deg);font-size:15px">⚽</span></div></div>`,iconSize:[34,42],iconAnchor:[17,42]});
      STADIUMS.forEach(s=>{const mk=window.L.marker([s.lat,s.lng],{icon:stIc}).addTo(m);mk.bindPopup(`<div style="font-family:-apple-system,sans-serif;min-width:180px"><b style="font-size:13px;color:#111">${s.city}</b><br><span style="font-size:11px;color:#555">${s.name}</span><br><span style="font-size:11px;color:${BR.red};font-weight:700">🏟️ ${s.cap} places</span></div>`,{maxWidth:220});mk.on("click",()=>onSelect&&onSelect(s));});
      // POI layer groups per category
      const layers={};
      POI_CATS.forEach(cat=>{layers[cat.id]=window.L.layerGroup().addTo(m);});
      POIS.forEach(poi=>{
        const cat=POI_CATS.find(c=>c.id===poi.category);if(!cat)return;
        const ic=window.L.divIcon({className:"",
          html:`<div style="width:32px;height:32px;border-radius:50%;background:${cat.color};display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 3px 14px ${cat.color}66;border:2.5px solid #FFF;cursor:pointer;transition:.15s">${cat.icon}</div>`,
          iconSize:[32,32],iconAnchor:[16,16]});
        const popup=`<div style="font-family:-apple-system,system-ui,sans-serif;min-width:220px;max-width:240px;padding:0;line-height:1.4">`+
          `<div style="background:linear-gradient(135deg,${cat.color}18,${cat.color}06);padding:12px 14px 10px;border-bottom:1px solid rgba(0,0,0,0.07)">`+
          `<div style="display:flex;align-items:center;gap:9px;margin-bottom:6px">`+
          `<div style="width:32px;height:32px;border-radius:10px;background:${cat.color};display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;box-shadow:0 2px 8px ${cat.color}55">${cat.icon}</div>`+
          `<div><b style="font-size:13px;color:#111;display:block;line-height:1.3;margin:0">${poi.name}</b>`+
          `<span style="font-size:10px;color:#888">${poi.city}</span></div></div>`+
          (poi.rating?`<div style="display:flex;align-items:center;gap:8px"><span style="background:#fff7ed;border:1px solid #fed7aa;border-radius:999px;padding:2px 8px;font-size:10px;font-weight:700;color:#c2410c">⭐ ${poi.rating}</span>${poi.price?`<span style="font-size:10px;color:#6b7280;font-weight:600">${poi.price}</span>`:""}</div>`:"")+
          `</div><div style="padding:10px 14px">`+
          (poi.address?`<div style="font-size:10px;color:#6b7280;margin-bottom:5px">📍 ${poi.address}</div>`:"")+
          (poi.hours?`<div style="font-size:10px;color:#9ca3af;margin-bottom:5px">🕐 ${poi.hours}</div>`:"")+
          (poi.phone?`<a href="tel:${poi.phone}" style="display:block;font-size:10px;color:${cat.color};text-decoration:none;font-weight:600;margin-bottom:8px">📞 ${poi.phone}</a>`:"")+
          `<div style="display:flex;gap:6px;margin-top:8px">`+
          `<button onclick="window.__poiGo&&window.__poiGo('${poi.id}')" style="flex:1;padding:8px 0;background:${cat.color};color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:11px;font-weight:700;box-shadow:0 2px 10px ${cat.color}44">🧭 Itinéraire</button>`+
          `<button onclick="window.__poiFav&&window.__poiFav('${poi.id}')" style="padding:8px 11px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;cursor:pointer;font-size:15px;line-height:1">♡</button>`+
          `<button onclick="window.__poiAsk&&window.__poiAsk('${poi.id}')" style="flex:1;padding:8px 0;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;cursor:pointer;font-size:11px;color:#374151;font-weight:600">💬 AI</button>`+
          `</div></div></div>`;
        const mk=window.L.marker([poi.lat,poi.lng],{icon:ic});
        mk.bindPopup(popup,{maxWidth:240});
        mk.on("click",()=>{track("poi_click",{category:poi.category,city:poi.city});onPoiSelect&&onPoiSelect(poi);});
        mk.addTo(layers[poi.category]);
        markersRef.current[poi.id]=mk;
      });
      poiLayersRef.current=layers;mR.current=m;
      setTimeout(()=>m.invalidateSize(),300);
      setTimeout(()=>m.invalidateSize(),800);
    }
    return()=>{if(mR.current){mR.current.remove();mR.current=null;poiLayersRef.current={};markersRef.current={};}};
  },[]);
  // Toggle POI layers on category change
  useEffect(()=>{
    if(!mR.current)return;
    Object.entries(poiLayersRef.current).forEach(([cat,layer])=>{
      if(!activeCategory||activeCategory==="all"||activeCategory===cat) mR.current.addLayer(layer);
      else mR.current.removeLayer(layer);
    });
  },[activeCategory]);
  // Fly to target POI
  useEffect(()=>{
    if(!mR.current||!flyTarget)return;
    mR.current.flyTo([flyTarget.lat,flyTarget.lng],16,{duration:1.2});
    if(flyTarget.id&&markersRef.current[flyTarget.id]){
      const mk=markersRef.current[flyTarget.id];
      setTimeout(()=>mk.openPopup(),1300);
    }
  },[flyTarget]);
  // User location dot
  const userDotRef=useRef(null);
  useEffect(()=>{
    if(!mR.current||!window.L)return;
    if(userDotRef.current){userDotRef.current.remove();userDotRef.current=null;}
    if(!userCoords)return;
    const ic=window.L.divIcon({className:"",
      html:`<div style="width:16px;height:16px;border-radius:50%;background:#1A56DB;border:3px solid #FFF;box-shadow:0 0 0 3px #1A56DB55;animation:pulse 1.8s infinite"></div>`,
      iconSize:[16,16],iconAnchor:[8,8]});
    userDotRef.current=window.L.marker([userCoords.lat,userCoords.lng],{icon:ic}).addTo(mR.current);
    userDotRef.current.bindPopup("📍 Vous êtes ici");
  },[userCoords]);
  return(
    <div style={{overflow:"hidden",borderRadius:20,touchAction:"pan-x pan-y",border:`1px solid ${C.bdr}`,boxShadow:"0 2px 16px rgba(0,0,0,0.10)"}}>
      <div ref={ref} style={{width:"100%",height:height||300,touchAction:"pan-y"}}/>
    </div>
  );
}

export default React.memo(SMap);
