import * as THREE from './three.module.min.js';

// This scene is decorative; no real business or review information is displayed.
export function mountProfile3D(host) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);
  camera.position.set(0, 0, 7.6);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(canvas);
  scene.add(new THREE.AmbientLight(0xffffff, 1.4));
  const pinkLight = new THREE.DirectionalLight(0xff95cb, 3.0);
  pinkLight.position.set(3, 4, 6);
  scene.add(pinkLight);
  const blueLight = new THREE.DirectionalLight(0x9c8bff, 1.4);
  blueLight.position.set(-5, -2, 4);
  scene.add(blueLight);

  const card = new THREE.Group();
  scene.add(card);
  const shape = new THREE.Shape();
  const width = 3.5, height = 2.2, radius = .18;
  const x = -width / 2, y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  const cardGeometry = new THREE.ExtrudeGeometry(shape, { depth: .15, bevelEnabled: true, bevelSize: .055, bevelThickness: .05, bevelSegments: 4, curveSegments: 12 });
  const cardMaterial = new THREE.MeshStandardMaterial({ color: 0x563949, metalness: .62, roughness: .28 });
  card.add(new THREE.Mesh(cardGeometry, cardMaterial));

  const surface = document.createElement('canvas');
  surface.width = 1050; surface.height = 660;
  const ctx = surface.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 1050, 660);
  grad.addColorStop(0, '#413044'); grad.addColorStop(.55, '#271f30'); grad.addColorStop(1, '#251a29');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 1050, 660);
  ctx.fillStyle = '#1c1724'; ctx.fillRect(0, 0, 1050, 105);
  ['#ef9abb', '#be87a2', '#806d82'].forEach((colour, i) => { ctx.fillStyle = colour; ctx.beginPath(); ctx.arc(55 + i * 32, 54, 9, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = '#625166'; ctx.roundRect(195, 45, 280, 17, 9); ctx.fill();
  ctx.fillStyle = '#e4a1bf'; ctx.font = '600 24px Arial, sans-serif'; ctx.fillText('YOUR BUSINESS PROFILE', 67, 178);
  ctx.fillStyle = '#fff5fb'; ctx.font = 'bold 56px Arial, sans-serif'; ctx.fillText('Great experiences.', 67, 258);
  ctx.fillText('Better reviews.', 67, 324);
  ctx.fillStyle = '#c8b6c6'; ctx.font = '29px Arial, sans-serif'; ctx.fillText('Make every voice count.', 69, 383);
  ctx.fillStyle = '#ffc1d9'; ctx.font = '42px Arial, sans-serif'; ctx.fillText('★★★★★', 67, 474);
  ctx.fillStyle = '#d98aaf'; ctx.roundRect(68, 529, 240, 48, 24); ctx.fill();
  ctx.fillStyle = '#fff3f8'; ctx.font = 'bold 23px Arial, sans-serif'; ctx.fillText('REVIEWFLOW', 105, 561);
  ctx.fillStyle = '#ffffff18'; ctx.roundRect(740, 182, 205, 12, 6); ctx.fill();
  ctx.roundRect(740, 212, 160, 12, 6); ctx.fill();
  ctx.roundRect(740, 242, 185, 12, 6); ctx.fill();
  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  const faceMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(width - .06, height - .06), faceMaterial);
  face.position.z = .205;
  card.add(face);

  const pinShape = new THREE.Shape();
  pinShape.moveTo(0, -.9);
  pinShape.bezierCurveTo(-.13, -.65, -.63, -.22, -.63, .18);
  pinShape.bezierCurveTo(-.63, .53, -.35, .82, 0, .82);
  pinShape.bezierCurveTo(.35, .82, .63, .53, .63, .18);
  pinShape.bezierCurveTo(.63, -.22, .13, -.65, 0, -.9);
  const pinHole = new THREE.Path();
  pinHole.absellipse(0, .18, .22, .22, 0, Math.PI * 2, true, 0);
  pinShape.holes.push(pinHole);
  const pinGeometry = new THREE.ExtrudeGeometry(pinShape, { depth: .22, bevelEnabled: true, bevelSize: .07, bevelThickness: .07, bevelSegments: 5, curveSegments: 24 });
  const pinMaterial = new THREE.MeshStandardMaterial({ color: 0xef87b1, metalness: .35, roughness: .25 });
  const pin = new THREE.Mesh(pinGeometry, pinMaterial);
  pin.position.set(1.34, -.12, .58);
  pin.rotation.z = -.15;
  pin.scale.setScalar(.76);
  card.add(pin);

  const orbit = new THREE.Group();
  orbit.rotation.set(.78, .18, -.27);
  scene.add(orbit);
  const ringMaterial = new THREE.MeshStandardMaterial({ color: 0xe98fbb, emissive: 0x70274e, emissiveIntensity: .65, metalness: .65, roughness: .28 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.24, .018, 10, 140), ringMaterial);
  ring.scale.y = .72;
  orbit.add(ring);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(.065, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe2f1 }));
  orbit.add(dot);
  const satellite = new THREE.Mesh(new THREE.IcosahedronGeometry(.13, 1), new THREE.MeshStandardMaterial({ color: 0xf6b2d3, metalness: .7, roughness: .2 }));
  scene.add(satellite);

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, pointerX = 0, pointerY = 0, visible = true, disposed = false;
  let bounds = null;
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 1.35 ? 7.1 : 5.8;
    camera.updateProjectionMatrix();
    if (motion.matches) draw(0);
  }
  function draw(ms) {
    if (disposed) return;
    const t = motion.matches ? 0 : ms / 1000;
    card.rotation.y = Math.sin(t * .55) * .32 + pointerX * .12;
    card.rotation.x = Math.sin(t * .42) * .09 - pointerY * .08;
    card.rotation.z = -.045 + Math.sin(t * .35) * .025;
    card.position.y = Math.sin(t * .7) * .12;
    pin.rotation.y = Math.sin(t * .8) * .2;
    const angle = t * .55 + .35;
    dot.position.set(Math.cos(angle) * 2.24, Math.sin(angle) * 2.24 * .72, .02);
    orbit.rotation.z = -.27 + Math.sin(t * .24) * .1;
    satellite.position.set(-1.95 + Math.sin(t * .65) * .13, .8 + Math.cos(t * .75) * .15, .75);
    satellite.rotation.set(t * .5, t * .7, t * .3);
    renderer.render(scene, camera);
    if (!motion.matches && !document.hidden && visible) frame = requestAnimationFrame(draw);
  }
  function start() { cancelAnimationFrame(frame); if (!document.hidden && visible) frame = requestAnimationFrame(draw); }
  function onPointerEnter() { bounds = host.getBoundingClientRect(); }
  function onPointerMove(event) {
    if (motion.matches || !bounds) return;
    pointerX = (event.clientX - bounds.left) / bounds.width - .5;
    pointerY = (event.clientY - bounds.top) / bounds.height - .5;
  }
  function onPointerLeave() { pointerX = 0; pointerY = 0; bounds = null; }
  function onMotionChange() { cancelAnimationFrame(frame); motion.matches ? draw(0) : start(); }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; visible ? start() : cancelAnimationFrame(frame); });
  visibilityObserver.observe(host);
  document.addEventListener('visibilitychange', start);
  motion.addEventListener('change', onMotionChange);
  host.addEventListener('pointerenter', onPointerEnter);
  host.addEventListener('pointermove', onPointerMove);
  host.addEventListener('pointerleave', onPointerLeave);
  resize();
  start();
  host.parentElement.classList.add('is-3d-ready');

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect(); visibilityObserver.disconnect();
    document.removeEventListener('visibilitychange', start);
    motion.removeEventListener('change', onMotionChange);
    host.removeEventListener('pointerenter', onPointerEnter);
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerleave', onPointerLeave);
    scene.traverse(object => {
      object.geometry?.dispose();
      if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());
    });
    texture.dispose(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
  };
}
