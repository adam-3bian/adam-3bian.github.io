/** Select reusable regional building forms from mapped tags and stable fallbacks.
 * Unspecified UK homes default to two storeys, never random tower blocks. */
export function classifyBuilding(feature){
 const type=String(feature.buildingType||'').toLowerCase(),legacy=String(feature.style||'house').toLowerCase();
 const use=String(feature.buildingUse||'').toLowerCase();
 const fp=feature.footprint||[],xs=fp.map(p=>p[0]),zs=fp.map(p=>p[1]);
 const span=fp.length?Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs)):0;
 let form;
 if(['school','college','university','hospital','library'].includes(use))form='institutional';
 else if(use==='place_of_worship')form='church';
 else if(use.startsWith('shop:'))form='commercial';
 else if(type==='bungalow')form='bungalow';
 else if(type==='terrace'||(type==='residential'&&span>20))form='terrace';
 else if(type==='residential')form='house';
 else if(type==='semidetached_house')form='semi';
 else if(['house','detached','farm','cabin'].includes(type))form='house';
 else if(['garage','garages','shed','hut'].includes(type))form='outbuilding';
 else if(['industrial','warehouse','factory'].includes(type))form='industrial';
 else if(['retail','supermarket','commercial','office'].includes(type))form='commercial';
 else if(['apartments','hotel'].includes(type))form='apartments';
 else if(['church','chapel','cathedral'].includes(type))form='church';
 else if(['school','hospital','public','train_station','university'].includes(type))form='institutional';
 else form=legacy==='industrial'?'industrial':legacy==='urban'?'apartments':legacy==='church'?'church':'house';
 const taggedLevels=Number(feature.buildingLevels),levels=Number.isFinite(taggedLevels)&&taggedLevels>=1&&taggedLevels<=80?taggedLevels:(form==='bungalow'||form==='outbuilding'?1:form==='apartments'?4:2);
 const residential=['house','semi','terrace','bungalow','apartments'].includes(form);
 const pitched=['house','semi','terrace','bungalow'].includes(form);
 const roofRise=pitched?1.8:0;
 const sourceHeight=Number(feature.sourceHeight),oldHeight=Number(feature.height);
 // OSM height includes the roof; the older exported height measured walls.
 const explicitHeight=Number.isFinite(sourceHeight)&&sourceHeight>1&&sourceHeight<200?Math.max(2,sourceHeight-roofRise):(Number.isFinite(oldHeight)&&oldHeight>1&&Math.abs(oldHeight-7.8)>.001?oldHeight:0);
 const height=explicitHeight||(residential?levels*2.7:form==='outbuilding'?2.7:form==='industrial'?6.4:form==='church'?8.5:6);
 return {form,levels:Math.max(1,Math.ceil(levels)),wallHeight:height,roofRise,residential,pitched,sourceType:type||undefined,sourceLevels:taggedLevels||undefined};
}
