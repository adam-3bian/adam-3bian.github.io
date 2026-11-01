/** Stable asset IDs mapped to the existing procedural appearance. */
const landmarkFamilies=['rotunda','selfridges','turntable','exchange-signal','gwr-signal-box','gwr-frontage','snow-hill','tyseley-depot','tyseley-works','carriage-works'];
const definitions=[
 {id:'regional/buffer-stop',generator:'furniture',kind:'buffer'},
 ...['rail-bed','sleepers','rails','road-surface'].map(kind=>({id:`existing/${kind}`,generator:'world-mesh',kind})),
 ...landmarkFamilies.map(family=>({id:`landmark/${family}`,generator:'landmark',family})),
];
export const ASSET_REGISTRY=Object.freeze(Object.fromEntries(definitions.map(d=>[d.id,Object.freeze(d)])));
export const resolveAsset=id=>ASSET_REGISTRY[id];
