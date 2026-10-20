import { SUNENG_CONTACT } from '@/constants/contact';

type BaiduMapDocument = { browserKey: string; point: { lng: number; lat: number }; href: string };

function scriptValue(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

// A separate document keeps the map SDK and its styles out of the surrounding page.
export function renderBaiduFactoryMap({ browserKey, point, href }: BaiduMapDocument) {
  const sdk = new URL('https://api.map.baidu.com/api');
  sdk.search = new URLSearchParams({ v: '4.0', ak: browserKey.trim(), callback: 'initSunengFactoryMap' }).toString();
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>苏能工业炉厂区 · 百度地图</title>
<style>
html,body,#map{width:100%;height:100%;margin:0}body{font:14px/1.6 system-ui,"PingFang SC",sans-serif;color:#153453;background:#f0f4f7}#map{position:absolute;inset:0}#status{position:absolute;z-index:5;left:12px;right:12px;top:12px;margin:0;padding:10px 14px;border:1px solid #dce5ef;border-radius:6px;background:#fffffff5;font-size:13px;pointer-events:none}#status[hidden],#fallback[hidden]{display:none}#fallback{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:20px;background:#f5f8fb}#fallback p{margin:0;color:#60758b}#fallback a{color:#21569c;padding:8px 12px;border:1px solid #ccd9ec;border-radius:6px;background:white;text-decoration:none}a:focus-visible{outline:2px solid #3266e9;outline-offset:3px}
</style></head><body><div id="map" role="region" aria-label="苏能工业炉厂区地图"></div><p id="status" role="status">正在显示厂区位置…</p><div id="fallback" hidden><strong>江苏苏能工业炉有限公司</strong><p>地图暂时无法显示，请在百度地图中查看厂区位置。</p><a id="open-map" target="_blank" rel="noopener noreferrer">在百度地图中查看</a></div>
<script>
(function(){
  var point = ${scriptValue(point)};
  var company = ${scriptValue(SUNENG_CONTACT.company)};
  var mapHref = ${scriptValue(href)};
  var status = document.getElementById('status');
  var fallback = document.getElementById('fallback');
  document.getElementById('open-map').href = mapHref;
  var map;
  var tileTimer;
  function failed(){
    clearTimeout(sdkTimer);
    clearTimeout(tileTimer);
    status.hidden = true;
    fallback.hidden = false;
    document.body.dataset.mapState = 'error';
  }
  var sdkTimer = setTimeout(failed, 15000);
  window.initSunengFactoryMap = function(){
    clearTimeout(sdkTimer);
    try {
      var location = new BMap.Point(point.lng, point.lat);
      map = new BMap.Map('map', {enableMapClick:false});
      map.addEventListener('tilesloaded', function(){
        clearTimeout(tileTimer);
        status.hidden = true;
        fallback.hidden = true;
        document.body.dataset.mapState = 'ready';
      });
      tileTimer = setTimeout(failed, 20000);
      map.centerAndZoom(location, 17);
      // Page scrolling remains available; use map controls or pinch to zoom.
      map.disableScrollWheelZoom();
      map.addOverlay(new BMap.Marker(location));
      var label = new BMap.Label(company, {position:location, offset:new BMap.Size(-102,-52)});
      label.setStyle({color:'#153453',backgroundColor:'#ffffff',border:'1px solid #d5e1ef',borderRadius:'6px',padding:'7px 10px',fontSize:'13px',lineHeight:'20px',whiteSpace:'nowrap'});
      map.addOverlay(label);
      map.addControl(new BMap.ZoomControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,offset:new BMap.Size(12,28)}));
      map.addControl(new BMap.ScaleControl());
      window.addEventListener('pagehide',function(){clearTimeout(tileTimer);if(map.destroy)map.destroy();},{once:true});
    } catch (error) { failed(); }
  };
  var script = document.createElement('script');
  script.src = ${scriptValue(sdk.href)};
  script.async = true;
  script.onerror = failed;
  document.head.appendChild(script);
})();
</script></body></html>`;
}
