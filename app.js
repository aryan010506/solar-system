// ========== PLANET DATA ==========
const PLANET_DATA = [
  { name:'Mercury', radius:0.38, distance:28, speed:4.15, rotSpeed:0.005, color:'#b5b5b5', emissive:'#3a3a3a', type:'Rocky Planet', moons:0, diameter:'4,879 km', dayLength:'59 days', yearLength:'88 days', temp:'167°C', desc:'The smallest planet and closest to the Sun. Mercury has no atmosphere and is covered in craters.' },
  { name:'Venus', radius:0.95, distance:44, speed:1.62, rotSpeed:0.003, color:'#e8cda0', emissive:'#8b6914', type:'Rocky Planet', moons:0, diameter:'12,104 km', dayLength:'243 days', yearLength:'225 days', temp:'464°C', desc:'The hottest planet with a thick toxic atmosphere. Venus rotates backwards compared to most planets.' },
  { name:'Earth', radius:1.0, distance:62, speed:1.0, rotSpeed:0.02, color:'#4a90d9', emissive:'#1a3a5c', type:'Rocky Planet', moons:1, diameter:'12,756 km', dayLength:'24 hrs', yearLength:'365 days', temp:'15°C', desc:'Our home planet—the only known world to harbor life. 71% of Earth\'s surface is covered in water.' },
  { name:'Mars', radius:0.53, distance:80, speed:0.53, rotSpeed:0.018, color:'#c1440e', emissive:'#5c2000', type:'Rocky Planet', moons:2, diameter:'6,792 km', dayLength:'24.6 hrs', yearLength:'687 days', temp:'-65°C', desc:'The Red Planet, home to Olympus Mons—the tallest volcano in the solar system.' },
  { name:'Jupiter', radius:3.5, distance:120, speed:0.084, rotSpeed:0.04, color:'#c88b3a', emissive:'#5c3a10', type:'Gas Giant', moons:95, diameter:'142,984 km', dayLength:'10 hrs', yearLength:'12 years', temp:'-110°C', desc:'The largest planet in our solar system. Jupiter\'s Great Red Spot is a storm larger than Earth.' },
  { name:'Saturn', radius:2.9, distance:170, speed:0.034, rotSpeed:0.038, color:'#e8d5a3', emissive:'#6b5c2e', type:'Gas Giant', moons:146, diameter:'120,536 km', dayLength:'10.7 hrs', yearLength:'29 years', temp:'-140°C', desc:'Famous for its stunning ring system made of ice and rock. Saturn is less dense than water.' },
  { name:'Uranus', radius:2.0, distance:220, speed:0.012, rotSpeed:0.03, color:'#73c2d6', emissive:'#1a4a5c', type:'Ice Giant', moons:28, diameter:'51,118 km', dayLength:'17 hrs', yearLength:'84 years', temp:'-195°C', desc:'An ice giant that rotates on its side. Uranus has faint rings and a blue-green color from methane.' },
  { name:'Neptune', radius:1.9, distance:260, speed:0.006, rotSpeed:0.028, color:'#3f54ba', emissive:'#0a1a4c', type:'Ice Giant', moons:16, diameter:'49,528 km', dayLength:'16 hrs', yearLength:'165 years', temp:'-200°C', desc:'The windiest planet with speeds over 2,000 km/h. Neptune is the farthest planet from the Sun.' }
];

// ========== GLOBALS ==========
let scene, camera, renderer, controls, clock;
let sun, planets = [], orbitLines = [], starField;
let activePlanet = null, isTransitioning = false;
let showOrbits = true, speedMultiplier = 1;
const speedOptions = [0.5, 1, 2, 5, 10];
let speedIndex = 1;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ========== INIT ==========
function init() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(80, 60, 120);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-canvas'), antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 500;
  controls.enablePan = false;

  createStarField();
  createGalaxyDust();
  createSun();
  createPlanets();
  createLights();
  buildUI();
  setupEvents();

  // Loading
  let prog = 0;
  const fill = document.getElementById('loader-fill');
  const iv = setInterval(() => {
    prog += Math.random() * 20 + 5;
    if (prog >= 100) { prog = 100; clearInterval(iv); setTimeout(() => document.getElementById('loading-screen').classList.add('fade-out'), 400); }
    fill.style.width = prog + '%';
  }, 200);

  animate();
}

// ========== STARS ==========
function createStarField() {
  const geo = new THREE.BufferGeometry();
  const count = 15000;
  const pos = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = 400 + Math.random() * 600;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = r * Math.cos(phi);
    const c = new THREE.Color().setHSL(0.55 + Math.random() * 0.15, 0.2 + Math.random() * 0.3, 0.7 + Math.random() * 0.3);
    colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
    sizes[i] = 0.3 + Math.random() * 1.5;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false });
  starField = new THREE.Points(geo, mat);
  scene.add(starField);
}

// ========== GALAXY DUST ==========
function createGalaxyDust() {
  // Create a circular sprite texture for soft particles
  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = 32; spriteCanvas.height = 32;
  const sctx = spriteCanvas.getContext('2d');
  const gradient = sctx.createRadialGradient(16,16,0,16,16,16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.6)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  sctx.fillStyle = gradient;
  sctx.fillRect(0,0,32,32);
  const spriteTexture = new THREE.CanvasTexture(spriteCanvas);

  const count = 12000;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const armOffset = (Math.floor(Math.random()*4)) * (Math.PI*2/4);
    const dist = 80 + Math.random() * 600;
    const spiral = angle + dist * 0.003;
    pos[i*3] = Math.cos(spiral + armOffset) * dist + (Math.random()-0.5)*50;
    pos[i*3+1] = (Math.random()-0.5) * 15;
    pos[i*3+2] = Math.sin(spiral + armOffset) * dist + (Math.random()-0.5)*50;
    const hue = 0.6 + Math.random()*0.3;
    const c = new THREE.Color().setHSL(hue, 0.5 + Math.random()*0.3, 0.12 + Math.random()*0.08);
    colors[i*3]=c.r; colors[i*3+1]=c.g; colors[i*3+2]=c.b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors,3));
  const mat = new THREE.PointsMaterial({ size:0.8, map:spriteTexture, vertexColors:true, transparent:true, opacity:0.5, blending:THREE.AdditiveBlending, depthWrite:false });
  scene.add(new THREE.Points(geo, mat));
}
// ========== SUN ==========
function createSunTexture() {
  const W=512, H=256;
  const c = document.createElement('canvas'); c.width=W; c.height=H;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(W,H);
  const d = img.data;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) {
    const i=(y*W+x)*4;
    const n1=Math.sin(x*0.02+y*0.015)*0.5+0.5;
    const n2=Math.sin(x*0.05-y*0.04)*0.5+0.5;
    const n3=Math.cos(x*0.03+y*0.07)*0.5+0.5;
    const v=n1*0.5+n2*0.3+n3*0.2;
    d[i]=200+v*55; d[i+1]=120+v*80; d[i+2]=20+v*30; d[i+3]=255;
  }
  ctx.putImageData(img,0,0);
  return new THREE.CanvasTexture(c);
}

function createSun() {
  const geo = new THREE.SphereGeometry(8, 64, 64);
  const tex = createSunTexture();
  const mat = new THREE.MeshBasicMaterial({ map: tex });
  sun = new THREE.Mesh(geo, mat);
  scene.add(sun);

  const glowColors = [0xffcc33, 0xff9900, 0xff6600, 0xff4400];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.SphereGeometry(9 + i*3, 32, 32);
    const m = new THREE.MeshBasicMaterial({ color: glowColors[i], transparent:true, opacity: 0.06/(i+1), side:THREE.BackSide, blending:THREE.AdditiveBlending, depthWrite:false });
    scene.add(new THREE.Mesh(g, m));
  }

  const sc = document.createElement('canvas'); sc.width=32; sc.height=32;
  const sctx = sc.getContext('2d');
  const grad = sctx.createRadialGradient(16,16,0,16,16,16);
  grad.addColorStop(0,'rgba(255,200,50,1)'); grad.addColorStop(1,'rgba(255,100,0,0)');
  sctx.fillStyle=grad; sctx.fillRect(0,0,32,32);
  const coronaTex = new THREE.CanvasTexture(sc);

  const cCount = 2000;
  const cGeo = new THREE.BufferGeometry();
  const cPos = new Float32Array(cCount*3);
  for(let i=0;i<cCount;i++){
    const r=9+Math.random()*8, t=Math.random()*Math.PI*2, p=Math.acos(2*Math.random()-1);
    cPos[i*3]=r*Math.sin(p)*Math.cos(t); cPos[i*3+1]=r*Math.sin(p)*Math.sin(t); cPos[i*3+2]=r*Math.cos(p);
  }
  cGeo.setAttribute('position',new THREE.BufferAttribute(cPos,3));
  const cMat = new THREE.PointsMaterial({ map:coronaTex, size:1.2, transparent:true, opacity:0.4, blending:THREE.AdditiveBlending, depthWrite:false });
  sun.coronaParticles = new THREE.Points(cGeo, cMat);
  scene.add(sun.coronaParticles);

  const sunLight = new THREE.PointLight(0xfff0d0, 2.5, 1000, 1);
  scene.add(sunLight);
}

// ========== PLANETS ==========
function noise(x,y,s){return Math.sin(x*s)*Math.cos(y*s*0.7)*0.5+Math.sin(x*s*1.3-y*s*0.5)*0.3+Math.cos(x*s*0.4+y*s*1.1)*0.2;}

function createPlanetTexture(data) {
  const W=512, H=256;
  const canvas = document.createElement('canvas'); canvas.width=W; canvas.height=H;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(W,H);
  const dd = img.data;
  const name = data.name;

  // Pixel-level texture via ImageData (fast)
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) {
    const i=(y*W+x)*4;
    let r=0,g=0,b=0;

    if(name==='Mercury'){
      const n=noise(x,y,0.03)*0.3+noise(x,y,0.08)*0.2+noise(x,y,0.15)*0.1;
      const v=130+n*120;
      const cx2=((x+50)%200-100), cy2=((y+30)%150-75);
      const cr=Math.sqrt(cx2*cx2+cy2*cy2)<20?-30:0;
      const f=Math.min(255,Math.max(0,v+cr));
      r=f; g=f-10; b=f-15;
    } else if(name==='Venus'){
      const n=noise(x,y,0.015)*0.4+noise(x,y,0.06)*0.2;
      r=210+n*40; g=175+n*50; b=100+n*40;
    } else if(name==='Earth'){
      const n=noise(x,y,0.02)*0.3+noise(x,y,0.05)*0.2;
      r=25+n*20; g=60+n*40; b=140+n*50;
    } else if(name==='Mars'){
      const n=noise(x,y,0.025)*0.3+noise(x,y,0.07)*0.2+noise(x,y,0.14)*0.1;
      r=170+n*50; g=80+n*40; b=40+n*30;
    } else if(name==='Jupiter'){
      const band=Math.sin(y*0.05)*0.3+Math.sin(y*0.12)*0.15+Math.sin(y*0.03+x*0.002)*0.1;
      const turb=noise(x,y,0.01)*0.1;
      const v=band+turb;
      r=200+v*50; g=150+v*60; b=80+v*40;
    } else if(name==='Saturn'){
      const band=Math.sin(y*0.04)*0.2+Math.sin(y*0.09)*0.1;
      const n=noise(x,y,0.008)*0.08;
      const v=band+n;
      r=220+v*30; g=200+v*30; b=150+v*30;
    } else if(name==='Uranus'){
      const n=noise(x,y,0.012)*0.15;
      r=150+n*30; g=210+n*20; b=230+n*20;
    } else if(name==='Neptune'){
      const n=noise(x,y,0.015)*0.2+noise(x,y,0.04)*0.1;
      const band=Math.sin(y*0.06)*0.08;
      const v=n+band;
      r=50+v*30; g=70+v*40; b=190+v*40;
    }
    dd[i]=Math.min(255,Math.max(0,r)); dd[i+1]=Math.min(255,Math.max(0,g)); dd[i+2]=Math.min(255,Math.max(0,b)); dd[i+3]=255;
  }
  ctx.putImageData(img,0,0);

  // Overlay details with canvas drawing (fast)
  if(name==='Earth'){
    ctx.fillStyle='rgba(40,110,40,0.7)';
    [[100,50,90,55],[260,55,75,50],[360,80,55,65],[180,125,50,35],[290,150,40,55],[420,60,50,40],[80,145,60,30]]
      .forEach(([cx,cy,w,h])=>{ctx.beginPath();ctx.ellipse(cx,cy,w,h,0.3,0,Math.PI*2);ctx.fill();});
    ctx.fillStyle='rgba(60,130,50,0.4)';
    [[130,70,40,25],[280,80,30,20],[380,95,25,30]]
      .forEach(([cx,cy,w,h])=>{ctx.beginPath();ctx.ellipse(cx,cy,w,h,0.5,0,Math.PI*2);ctx.fill();});
    ctx.fillStyle='rgba(240,245,255,0.7)';
    ctx.beginPath();ctx.ellipse(256,4,240,10,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(256,252,220,8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.1)';
    for(let j=0;j<20;j++){ctx.beginPath();ctx.ellipse(Math.random()*W,Math.random()*H,20+Math.random()*40,5+Math.random()*8,Math.random()*3,0,Math.PI*2);ctx.fill();}
  } else if(name==='Mars'){
    ctx.fillStyle='rgba(240,230,220,0.5)';
    ctx.beginPath();ctx.ellipse(256,4,200,8,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(256,252,180,6,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(100,50,20,0.3)';
    [[200,130,80,35],[400,100,60,30]].forEach(([cx,cy,w,h])=>{ctx.beginPath();ctx.ellipse(cx,cy,w,h,0.2,0,Math.PI*2);ctx.fill();});
  } else if(name==='Jupiter'){
    ctx.fillStyle='rgba(190,90,50,0.5)';
    ctx.beginPath();ctx.ellipse(350,180,30,16,0.1,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(170,70,40,0.4)';
    ctx.beginPath();ctx.ellipse(350,180,20,10,0.1,0,Math.PI*2);ctx.fill();
  } else if(name==='Neptune'){
    ctx.fillStyle='rgba(80,120,220,0.4)';
    ctx.beginPath();ctx.ellipse(300,160,18,10,0,0,Math.PI*2);ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function createPlanets() {
  PLANET_DATA.forEach((data, i) => {
    const scale = data.radius * 2.5;
    const geo = new THREE.SphereGeometry(scale, 48, 48);
    const texture = createPlanetTexture(data);
    const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, metalness: 0.05, emissive: new THREE.Color(data.emissive), emissiveIntensity: 0.08 });
    const mesh = new THREE.Mesh(geo, mat);

    // Atmosphere glow
    const atmosGeo = new THREE.SphereGeometry(scale * 1.12, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(data.color), transparent: true, opacity: 0.06, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const atmos = new THREE.Mesh(atmosGeo, atmosMat);
    mesh.add(atmos);

    // Pivot for orbit
    const pivot = new THREE.Object3D();
    pivot.add(mesh);
    mesh.position.x = data.distance;
    pivot.rotation.y = Math.random() * Math.PI * 2;
    scene.add(pivot);

    // Saturn rings - multi band with Cassini division
    if (data.name === 'Saturn') {
      const ringTexCanvas = document.createElement('canvas'); ringTexCanvas.width=512; ringTexCanvas.height=64;
      const rctx=ringTexCanvas.getContext('2d');
      for(let x=0;x<512;x++){
        const t=x/512;
        const gap1=Math.abs(t-0.4)<0.02?0:1; // Cassini division
        const gap2=Math.abs(t-0.15)<0.01?0:1;
        const density=gap1*gap2*(0.4+Math.sin(t*20)*0.15+Math.random()*0.05);
        const r=Math.floor(210*density), g=Math.floor(190*density), b=Math.floor(150*density);
        rctx.fillStyle=`rgba(${r},${g},${b},${density*0.7})`;
        rctx.fillRect(x,0,1,64);
      }
      const ringTex=new THREE.CanvasTexture(ringTexCanvas);
      const ringGeo = new THREE.RingGeometry(scale*1.3, scale*2.5, 128);
      const pos=ringGeo.attributes.position;
      const uv=ringGeo.attributes.uv;
      for(let i=0;i<uv.count;i++){
        const vx=pos.getX(i),vy=pos.getY(i);
        const d=Math.sqrt(vx*vx+vy*vy);
        uv.setXY(i,(d-scale*1.3)/(scale*1.2),0.5);
      }
      const ringMat = new THREE.MeshBasicMaterial({ map:ringTex, transparent:true, side:THREE.DoubleSide, depthWrite:false });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI * 0.45;
      mesh.add(ring);
    }

    // Uranus rings
    if (data.name === 'Uranus') {
      const ringGeo = new THREE.RingGeometry(scale*1.3, scale*1.8, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x73c2d6, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI * 0.1;
      mesh.add(ring);
    }

    // Earth moon
    if (data.name === 'Earth') {
      const moonGeo = new THREE.SphereGeometry(0.5, 24, 24);
      const moonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.9 });
      const moon = new THREE.Mesh(moonGeo, moonMat);
      const moonPivot = new THREE.Object3D();
      moonPivot.add(moon);
      moon.position.x = scale + 3;
      mesh.add(moonPivot);
      mesh.moonPivot = moonPivot;
    }

    // Orbit line
    const orbitGeo = new THREE.RingGeometry(data.distance - 0.05, data.distance + 0.05, 128);
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false });
    const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
    orbitMesh.rotation.x = -Math.PI / 2;
    scene.add(orbitMesh);
    orbitLines.push(orbitMesh);

    planets.push({ mesh, pivot, data, orbitMesh });
  });
}

// ========== LIGHTS ==========
function createLights() {
  // Very dim ambient - space is dark!
  scene.add(new THREE.AmbientLight(0x111122, 0.15));
}

// ========== UI ==========
function buildUI() {
  const list = document.getElementById('planet-list');
  PLANET_DATA.forEach((p, i) => {
    const li = document.createElement('li');
    li.id = `nav-planet-${i}`;
    li.innerHTML = `<span class="planet-dot" style="color:${p.color};background:${p.color}"></span><span class="planet-label">${p.name}</span><span class="planet-key">${i+1}</span>`;
    li.addEventListener('click', () => flyToPlanet(i));
    list.appendChild(li);
  });

  document.getElementById('btn-overview').addEventListener('click', flyToOverview);
  document.getElementById('btn-toggle-orbits').addEventListener('click', toggleOrbits);
  document.getElementById('btn-toggle-speed').addEventListener('click', cycleSpeed);
  document.getElementById('close-info').addEventListener('click', () => {
    document.getElementById('planet-info').classList.add('hidden');
    activePlanet = null;
    document.querySelectorAll('.planet-list li').forEach(l => l.classList.remove('active'));
  });
}

// ========== EVENTS ==========
function setupEvents() {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  renderer.domElement.addEventListener('dblclick', onDblClick);

  window.addEventListener('keydown', (e) => {
    const n = parseInt(e.key);
    if (n >= 1 && n <= 8) flyToPlanet(n - 1);
    if (e.key === 'Escape') flyToOverview();
  });
}

function onDblClick(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const meshes = planets.map(p => p.mesh);
  meshes.push(sun);
  const hits = raycaster.intersectObjects(meshes, true);
  if (hits.length > 0) {
    let obj = hits[0].object;
    while (obj.parent && !meshes.includes(obj)) obj = obj.parent;
    const idx = planets.findIndex(p => p.mesh === obj);
    if (idx >= 0) flyToPlanet(idx);
  }
}

// ========== CAMERA TRANSITIONS ==========
function flyToPlanet(index) {
  if (isTransitioning) return;
  isTransitioning = true;
  activePlanet = index;
  const p = planets[index];
  const d = p.data;

  // Update nav
  document.querySelectorAll('.planet-list li').forEach(l => l.classList.remove('active'));
  document.getElementById(`nav-planet-${index}`).classList.add('active');

  // Get world position of planet
  const worldPos = new THREE.Vector3();
  p.mesh.getWorldPosition(worldPos);

  const viewDist = d.radius * 8 + 5;
  const targetPos = new THREE.Vector3(
    worldPos.x + viewDist * 0.6,
    worldPos.y + viewDist * 0.4,
    worldPos.z + viewDist * 0.6
  );

  animateCamera(targetPos, worldPos, 2000, () => {
    isTransitioning = false;
    showPlanetInfo(index);
  });
}

function flyToOverview() {
  if (isTransitioning) return;
  isTransitioning = true;
  activePlanet = null;
  document.getElementById('planet-info').classList.add('hidden');
  document.querySelectorAll('.planet-list li').forEach(l => l.classList.remove('active'));

  const targetPos = new THREE.Vector3(80, 60, 120);
  const targetLook = new THREE.Vector3(0, 0, 0);
  animateCamera(targetPos, targetLook, 2000, () => { isTransitioning = false; });
}

function animateCamera(targetPos, targetLook, duration, onComplete) {
  const startPos = camera.position.clone();
  const startLook = controls.target.clone();
  const startTime = performance.now();

  function update() {
    const elapsed = performance.now() - startTime;
    let t = Math.min(elapsed / duration, 1);
    // Ease in-out cubic
    t = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2;

    camera.position.lerpVectors(startPos, targetPos, t);
    controls.target.lerpVectors(startLook, targetLook, t);
    controls.update();

    if (elapsed < duration) {
      requestAnimationFrame(update);
    } else {
      if (onComplete) onComplete();
    }
  }
  update();
}

// ========== PLANET INFO ==========
function showPlanetInfo(index) {
  const d = PLANET_DATA[index];
  const panel = document.getElementById('planet-info');

  document.getElementById('info-icon').style.background = `radial-gradient(circle at 35% 35%, ${d.color}, ${d.emissive})`;
  document.getElementById('info-name').textContent = d.name;
  document.getElementById('info-type').textContent = d.type;
  document.getElementById('info-description').textContent = d.desc;

  const stats = document.getElementById('info-stats');
  stats.innerHTML = [
    ['DIAMETER', d.diameter],
    ['DAY LENGTH', d.dayLength],
    ['YEAR', d.yearLength],
    ['TEMP', d.temp],
    ['MOONS', d.moons],
    ['DISTANCE', `${d.distance} AU`]
  ].map(([label, value]) => `<div class="stat-card"><div class="stat-label">${label}</div><div class="stat-value">${value}</div></div>`).join('');

  panel.classList.remove('hidden');
}

// ========== CONTROLS ==========
function toggleOrbits() {
  showOrbits = !showOrbits;
  orbitLines.forEach(o => o.visible = showOrbits);
  document.getElementById('btn-toggle-orbits').classList.toggle('active', showOrbits);
}

function cycleSpeed() {
  speedIndex = (speedIndex + 1) % speedOptions.length;
  speedMultiplier = speedOptions[speedIndex];
  document.getElementById('speed-label').textContent = speedMultiplier + 'x';
}

// ========== ANIMATE ==========
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();
  const sp = speedMultiplier;

  // Rotate sun
  if (sun) {
    sun.rotation.y += 0.002 * sp;
    if (sun.coronaParticles) sun.coronaParticles.rotation.y -= 0.001 * sp;
  }

  // Rotate star field slowly
  if (starField) starField.rotation.y += 0.00005 * sp;

  // Animate planets
  planets.forEach((p, i) => {
    // Orbit
    p.pivot.rotation.y += p.data.speed * 0.002 * sp;
    // Self rotation
    p.mesh.rotation.y += p.data.rotSpeed * sp;
    // Moon orbit (Earth)
    if (p.mesh.moonPivot) p.mesh.moonPivot.rotation.y += 0.03 * sp;

    // Hover glow
    p.mesh.children.forEach(child => {
      if (child.material && child.material.opacity !== undefined && child.geometry.type === 'SphereGeometry') {
        child.material.opacity = 0.06 + Math.sin(elapsed * 2 + i) * 0.03;
      }
    });
  });

  // Follow active planet
  if (activePlanet !== null && !isTransitioning) {
    const p = planets[activePlanet];
    const worldPos = new THREE.Vector3();
    p.mesh.getWorldPosition(worldPos);
    const viewDist = p.data.radius * 8 + 5;
    const offset = new THREE.Vector3(viewDist*0.6, viewDist*0.4, viewDist*0.6);
    
    camera.position.lerp(worldPos.clone().add(offset), 0.02);
    controls.target.lerp(worldPos, 0.02);
  }

  controls.update();
  renderer.render(scene, camera);
}

// ========== START ==========
window.addEventListener('DOMContentLoaded', init);
