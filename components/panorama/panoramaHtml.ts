export function getPanoramaHtml(imageUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
  <script src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"><\/script>
  <style>*{margin:0;padding:0}html,body,#panorama{width:100%;height:100%;overflow:hidden;background:#000}.pnlm-load-box,.pnlm-lbar,.pnlm-load-msg{display:none!important}</style>
</head>
<body>
  <div id="panorama"></div>
  <script>
    window.viewer = pannellum.viewer('panorama', {
      type: 'equirectangular',
      panorama: '${imageUrl}',
      autoLoad: true,
      showControls: false,
      mouseZoom: false,
      hfov: 100,
      minHfov: 50,
      maxHfov: 120,
    });
    window.viewer.on('load', function() {
      window.ReactNativeWebView.postMessage('ready');
    });
    var startX, startY, startTime;
    document.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    });
    document.addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && Date.now() - startTime < 300) {
        window.ReactNativeWebView.postMessage('tap');
      }
    });
  <\/script>
</body>
</html>`;
}
