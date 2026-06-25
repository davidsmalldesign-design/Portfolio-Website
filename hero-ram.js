// David Small Design — hero 3D ram scene (v4: bottom-right, slow spin)
import * as THREE from 'https://esm.sh/three@0.160.0';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/DRACOLoader.js';

(function () {
  var MODEL = 'https://cdn.jsdelivr.net/gh/davidsmalldesign-design/Portfolio-Website@main/neon_ram.glb';

  function init() {
    var hero = document.querySelector('.hero');
    if (!hero) { console.warn('[ram] no .hero found'); return; }
    try {
      var tc = document.createElement('canvas');
      if (!(tc.getContext('webgl') || tc.getContext('experimental-webgl'))) { console.warn('[ram] no webgl'); return; }
    } catch (e) { return; }

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var holder = document.createElement('div');
    holder.className = 'hero-3d-canvas';
    hero.insertBefore(holder, hero.firstChild);

    var w = hero.clientWidth, h = hero.clientHeight;
    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    holder.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    camera.position.set(0, 0, 6);

    var key = new THREE.DirectionalLight(0xc6ff3a, 3.2); key.position.set(-3, 2, 4); scene.add(key);
    var rim = new THREE.DirectionalLight(0x9ae600, 1.6); rim.position.set(4, 1, -3); scene.add(rim);
    var fill = new THREE.DirectionalLight(0x223018, 1.0); fill.position.set(0, -3, 2); scene.add(fill);
    scene.add(new THREE.AmbientLight(0x141414, 1.0));

    // pivot holds the model; we offset the pivot to park it bottom-right
    var pivot = new THREE.Group(); scene.add(pivot);

    // how far right/down to push, in world units (recomputed on resize for responsiveness)
    function placePivot() {
      var aspect = hero.clientWidth / hero.clientHeight;
      pivot.position.x = 2.1;            // push right
      pivot.position.y = -1.2;           // push down
      if (aspect < 1) { pivot.position.x = 1.0; pivot.position.y = -1.8; } // portrait: less right, more down
    }
    placePivot();

    var draco = new DRACOLoader();
    draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/');
    var loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    loader.load(MODEL, function (gltf) {
      var model = gltf.scene;
      var box = new THREE.Box3().setFromObject(model);
      var size = box.getSize(new THREE.Vector3());
      var center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      var maxd = Math.max(size.x, size.y, size.z) || 1;
      model.scale.setScalar(2.6 / maxd);   // smaller: corner accent, not centerpiece
      pivot.add(model);
      holder.classList.add('is-ready');

      var mx = 0, my = 0, tx = 0, ty = 0, t = 0, raf;
      if (!reduce) window.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5);
        ty = ((e.clientY - r.top) / r.height - 0.5);
      }, { passive: true });

      function tick() {
        raf = requestAnimationFrame(tick);
        t += 0.0007;                         // 5x slower spin
        mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
        model.rotation.y = (reduce ? 0 : t) + mx * 0.6;
        model.rotation.x = my * 0.4;
        renderer.render(scene, camera);
      }
      tick();

      window.addEventListener('resize', function () {
        var nw = hero.clientWidth, nh = hero.clientHeight;
        camera.aspect = nw / nh; camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
        placePivot();
      }, { passive: true });

      console.log('[ram] loaded ok — v4 bottom-right');
    }, function (p) {}, function (err) {
      console.error('[ram] model load failed', err);
      holder.remove();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
