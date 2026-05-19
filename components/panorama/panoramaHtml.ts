import { PANNELLUM_CSS } from './pannellumBundle';

export function getPanoramaHtml(imageUrl: string, pannellumJs: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <style>${PANNELLUM_CSS}</style>
  <style>*{margin:0;padding:0}html,body,#panorama{width:100%;height:100%;overflow:hidden;background:#000}.pnlm-load-box,.pnlm-lbar,.pnlm-load-msg{display:none!important}</style>
</head>
<body>
  <div id="panorama"></div>
  <script>${pannellumJs}<\/script>
  <script>
    function post(msg) {
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
    }

    function launchViewer(src) {
      try {
        window.viewer = pannellum.viewer('panorama', {
          type: 'equirectangular',
          panorama: src,
          autoLoad: true,
          showControls: false,
          mouseZoom: false,
          hfov: 100,
          minHfov: 50,
          maxHfov: 120,
        });
        window.viewer.on('load', function() { post('ready'); });
        window.viewer.on('error', function(err) {
          post('error:viewer:' + JSON.stringify(err));
        });
      } catch(e) {
        post('error:init:' + (e && (e.type || e.message || JSON.stringify(e))));
      }
    }

    // Downscale the image to fit Android WebGL MAX_TEXTURE_SIZE before
    // passing it to Pannellum, preventing the "image too big" WebGL error.
    function loadWithDownscale(url) {
      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      var maxSize = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 2048;

      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function() {
        var w = img.naturalWidth;
        var h = img.naturalHeight;
        // Pannellum equirectangular check: max(w/2, h) must be <= maxSize
        var limit = Math.max(w / 2, h);
        if (limit <= maxSize) {
          launchViewer(url);
          return;
        }
        // Scale down so the image fits within the GPU limit
        var scale = maxSize / limit;
        var dw = Math.floor(w * scale);
        var dh = Math.floor(h * scale);
        post('info:downscale:' + w + 'x' + h + '->' + dw + 'x' + dh);
        var c = document.createElement('canvas');
        c.width = dw;
        c.height = dh;
        c.getContext('2d').drawImage(img, 0, 0, dw, dh);
        launchViewer(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = function() {
        post('error:imgload');
        // Fall back to passing the URL directly; Pannellum will show its own error
        launchViewer(url);
      };
      img.src = url;
    }

    loadWithDownscale('${imageUrl.replace(/'/g, "\\'")}');

    var startX, startY, startTime;
    document.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    });
    document.addEventListener('touchend', function(e) {
      var dx = Math.abs(e.changedTouches[0].clientX - startX);
      var dy = Math.abs(e.changedTouches[0].clientY - startY);
      var dt = Date.now() - startTime;
      if (dx < 10 && dy < 10 && dt < 300) {
        post('tap');
      }
    });
  <\/script>
</body>
</html>`;
}
