import fs from 'node:fs';
// Only project source coordinates; retain every ring and island. No hand-drawn geography.
const source = JSON.parse(fs.readFileSync('frontend/public/maps/china-provinces.geo.json', 'utf8'));
const rings = f => f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
const mercator = ([lon, lat]) => [lon * Math.PI / 180, -Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))];
const projectTo = (points, rect) => {
  const xy = points.map(mercator);
  const xs = xy.map(p => p[0]), ys = xy.map(p => p[1]);
  const bounds = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  const scale = Math.min(rect[2] / (bounds[2] - bounds[0]), rect[3] / (bounds[3] - bounds[1]));
  return p => { const [x,y] = mercator(p); return [rect[0] + (rect[2] - (bounds[2]-bounds[0])*scale)/2 + (x-bounds[0])*scale, rect[1]+(y-bounds[1])*scale]; };
};
const mainPolys = [], southPolys = [];
for (const f of source.features) for (const polygon of rings(f)) {
  (polygon[0].every(p => p[1] < 18) ? southPolys : mainPolys).push(polygon);
}
const project = projectTo(mainPolys.flat(2), [40, 22, 840, 550]);
const southProject = projectTo(southPolys.flat(2), [1147, 512, 78, 82]);
const path = (polygons, projection) => polygons.map(poly => poly.map(ring => ring.map((p,i) => { const [x,y]=projection(p); return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`; }).join('')+'Z').join('')).join('');
// Label positions only. Province geometry remains at the original geographic coordinates.
const labelCoordinates = {110000:[116.4,41.3],120000:[120.4,39.6],130000:[115,37.6],310000:[124,31.05],320000:[120.8,34.3],330000:[122,28.6],340000:[116.6,31.6],370000:[120.4,36.7],620000:[102.4,38.8],810000:[116.4,21.45],820000:[112,20.75]};
const regions = source.features.filter(f=>f.properties.level==='province').map(f=>{
 const props=f.properties, center=props.centroid||props.center;
 const label=props.name.replace(/壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区|省|市/g,'');
 return {code:String(props.adcode),name:props.name,label,anchor:project(center),position:project(labelCoordinates[props.adcode]||center),path:path(rings(f).filter(p=>!p[0].every(v=>v[1]<18)),project)};
});
const output={regions,southPath:path(southPolys,southProject),boundaryPath:path(rings(source.features.find(f=>f.properties.adchar==='JD')).filter(p=>!p[0].every(v=>v[1]<18)),project)};
fs.writeFileSync('frontend/src/components/partner/distribution/china-map-paths.json', JSON.stringify(output));
console.log(`Projected ${regions.length} provincial regions, ${mainPolys.length} main polygons, ${southPolys.length} inset polygons.`);
