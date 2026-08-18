// Penitenciária da Treta: pátio central exposto, celas transitáveis e flancos de serviço.
import * as THREE from 'three';

const HALF_X = 38;
const HALF_Z = 48;

export function buildPenitenciaria(scene) {
  const root = new THREE.Group();
  root.name = 'penitenciaria-da-treta';
  scene.add(root);
  const colliders = [], occluders = [], pickups = [];
  const geometryCache = new Map();
  const boxGeo = (w, h, d) => {
    const key = `b:${w}:${h}:${d}`;
    if (!geometryCache.has(key)) geometryCache.set(key, new THREE.BoxGeometry(w, h, d));
    return geometryCache.get(key);
  };
  const cylGeo = (r, h, segments = 12) => {
    const key = `c:${r}:${h}:${segments}`;
    if (!geometryCache.has(key)) geometryCache.set(key, new THREE.CylinderGeometry(r, r, h, segments));
    return geometryCache.get(key);
  };
  const planeGeo = (w, h) => {
    const key = `p:${w}:${h}`;
    if (!geometryCache.has(key)) geometryCache.set(key, new THREE.PlaneGeometry(w, h));
    return geometryCache.get(key);
  };
  const torusGeo = (r, tube, radial = 8, tubular = 18) => {
    const key = `o:${r}:${tube}:${radial}:${tubular}`;
    if (!geometryCache.has(key)) geometryCache.set(key, new THREE.TorusGeometry(r, tube, radial, tubular));
    return geometryCache.get(key);
  };
  const taperedGeo = (wb, wt, h, db, dt, topZ = 0) => {
    const key = `t:${wb}:${wt}:${h}:${db}:${dt}:${topZ}`;
    if (!geometryCache.has(key)) {
      const xb = wb / 2, xt = wt / 2, zb = db / 2, zt = dt / 2;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute([
        -xb, -h/2, -zb, xb, -h/2, -zb, xb, -h/2, zb, -xb, -h/2, zb,
        -xt, h/2, topZ-zt, xt, h/2, topZ-zt, xt, h/2, topZ+zt, -xt, h/2, topZ+zt,
      ], 3));
      geometry.setIndex([0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7]);
      geometry.computeVertexNormals();
      geometryCache.set(key, geometry);
    }
    return geometryCache.get(key);
  };
  function proceduralTexture(name, base, detail, mode, repeatX = 4, repeatY = repeatX) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = base; ctx.fillRect(0, 0, 128, 128);
    let seed = [...name].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 1977);
    const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    if (mode === 'concrete') {
      for (let i = 0; i < 700; i++) { const a = .025 + rand() * .08; ctx.fillStyle = rand() > .5 ? `rgba(255,255,255,${a})` : `rgba(15,20,22,${a})`; ctx.fillRect(rand() * 128, rand() * 128, 1 + rand() * 3, 1 + rand() * 2); }
      ctx.strokeStyle = detail; ctx.globalAlpha = .25; for (let y = 32; y < 128; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(128, y); ctx.stroke(); }
      ctx.globalAlpha = .42; ctx.lineWidth = .8;
      for (let i = 0; i < 9; i++) { let x = rand()*128, y = rand()*128; ctx.beginPath(); ctx.moveTo(x,y); for (let j=0;j<4;j++){x+=rand()*18-9;y+=rand()*15;ctx.lineTo(x,y);} ctx.stroke(); }
      ctx.globalAlpha = .12; for (let i=0;i<18;i++){ctx.fillStyle=rand()>.5?'#28332c':'#141716';ctx.beginPath();ctx.ellipse(rand()*128,rand()*128,3+rand()*13,1+rand()*5,rand()*Math.PI,0,Math.PI*2);ctx.fill();}
    } else if (mode === 'metal') {
      const gradient = ctx.createLinearGradient(0, 0, 128, 0); gradient.addColorStop(0, base); gradient.addColorStop(.45, detail); gradient.addColorStop(.55, base); gradient.addColorStop(1, detail); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(92,45,23,${.08 + rand() * .2})`; ctx.fillRect(rand() * 128, rand() * 128, 1 + rand() * 8, 1 + rand() * 3); }
    } else {
      for (let i = 0; i < 500; i++) { ctx.fillStyle = `rgba(30,22,12,${.025 + rand() * .09})`; ctx.fillRect(rand() * 128, rand() * 128, 1 + rand() * 4, 1 + rand() * 4); }
    }
    const texture = new THREE.CanvasTexture(canvas); texture.name = name; texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(repeatX, repeatY); texture.anisotropy = 8; return texture;
  }
  function ammoCrateTexture() {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#58613d'); gradient.addColorStop(.52, '#73764b'); gradient.addColorStop(1, '#353d2a');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 256);
    let seed = 1977; const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    ctx.fillStyle = 'rgba(20,25,16,.32)';
    for (let i=0;i<170;i++) ctx.fillRect(rand()*256,rand()*256,1+rand()*9,1+rand()*3);
    ctx.strokeStyle = '#242a1c'; ctx.lineWidth = 11; ctx.strokeRect(8,8,240,240);
    ctx.strokeStyle = '#a39d6a'; ctx.lineWidth = 3; ctx.strokeRect(20,20,216,216);
    for (const y of [52,204]) { ctx.fillStyle='#252b1d'; ctx.fillRect(0,y,256,10); ctx.fillStyle='rgba(190,182,116,.45)'; ctx.fillRect(0,y+2,256,2); }
    ctx.fillStyle='rgba(25,29,20,.78)'; ctx.fillRect(31,82,194,96);
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#d6cc86';
    ctx.font='900 38px Arial,sans-serif'; ctx.fillText('MUNIÇÃO',128,112);
    ctx.font='bold 17px Arial,sans-serif'; ctx.fillText('7.62 MM · 120 CART.',128,151);
    for (const x of [48,208]) { ctx.fillStyle='#b39943'; ctx.fillRect(x-5,188,10,29); ctx.fillStyle='#d5bf68'; ctx.beginPath(); ctx.arc(x,188,5,Math.PI,0); ctx.fill(); }
    const texture = new THREE.CanvasTexture(canvas); texture.name='penitenciaria-caixa-municao'; texture.colorSpace=THREE.SRGBColorSpace;
    texture.wrapS=texture.wrapT=THREE.RepeatWrapping; texture.anisotropy=8; return texture;
  }
  function policeDecalTexture() {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,512,128);
    ctx.fillStyle='#102f5d'; ctx.fillRect(0,8,512,112); ctx.strokeStyle='#d9b855'; ctx.lineWidth=8; ctx.strokeRect(7,15,498,98);
    ctx.fillStyle='#d9b855'; ctx.beginPath(); ctx.moveTo(55,26);ctx.lineTo(86,40);ctx.lineTo(79,87);ctx.lineTo(55,106);ctx.lineTo(31,87);ctx.lineTo(24,40);ctx.closePath();ctx.fill();
    ctx.fillStyle='#102f5d';ctx.beginPath();ctx.arc(55,63,13,0,Math.PI*2);ctx.fill();ctx.fillRect(50,58,10,33);
    ctx.fillStyle='#f3ead0';ctx.textAlign='left';ctx.textBaseline='middle';ctx.font='900 43px Arial,sans-serif';ctx.fillText('POLÍCIA PENAL',106,59);
    ctx.fillStyle='#d9b855';ctx.font='900 25px Arial,sans-serif';ctx.fillText('190  ·  ESCOLTA',108,94);
    const texture = new THREE.CanvasTexture(canvas); texture.name='penitenciaria-carro-decal'; texture.colorSpace=THREE.SRGBColorSpace; texture.anisotropy=8; return texture;
  }
  const tex = {
    concrete: proceduralTexture('penitenciaria-concreto', '#777b78', '#343936', 'concrete', 6),
    darkConcrete: proceduralTexture('penitenciaria-concreto-escuro', '#343a3b', '#15191a', 'concrete', 5),
    yard: proceduralTexture('penitenciaria-patio-concreto-gasto', '#555957', '#262a29', 'concrete', 8),
    steel: proceduralTexture('penitenciaria-aco-enferrujado', '#565d5e', '#8b6b49', 'metal', 3),
    ammo: ammoCrateTexture(),
    policeDecal: policeDecalTexture(),
  };
  const MAT = {
    concrete: new THREE.MeshStandardMaterial({ map: tex.concrete, bumpMap: tex.concrete, bumpScale: .045, color: 0xb8bbb5, roughness: .93 }),
    darkConcrete: new THREE.MeshStandardMaterial({ map: tex.darkConcrete, bumpMap: tex.darkConcrete, bumpScale: .035, color: 0x747b7b, roughness: .97 }),
    yard: new THREE.MeshStandardMaterial({ map: tex.yard, bumpMap: tex.yard, bumpScale: .055, color: 0x8b8f89, roughness: 1 }),
    steel: new THREE.MeshStandardMaterial({ map: tex.steel, bumpMap: tex.steel, bumpScale: .025, color: 0x8a9292, metalness: .72, roughness: .5 }),
    rust: new THREE.MeshStandardMaterial({ color: 0x714529, metalness: .42, roughness: .82 }),
    white: new THREE.MeshStandardMaterial({ color: 0xe6e2cf, roughness: .75 }),
    yellow: new THREE.MeshStandardMaterial({ color: 0xe5a92f, roughness: .7 }),
    red: new THREE.MeshStandardMaterial({ color: 0xb42d25, roughness: .65 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x173f79, roughness: .5 }),
    black: new THREE.MeshStandardMaterial({ color: 0x111519, roughness: .66 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x8fb2c0, roughness: .2, metalness: .1, transparent: true, opacity: .68, side: THREE.DoubleSide }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x17191a, roughness: .96 }),
    grass: new THREE.MeshStandardMaterial({ color: 0x52643c, roughness: 1 }),
    ammo: new THREE.MeshStandardMaterial({ map: tex.ammo, bumpMap: tex.ammo, bumpScale: .035, color: 0xffffff, roughness: .76, metalness: .18 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xbac2c3, metalness: .9, roughness: .22 }),
    rim: new THREE.MeshStandardMaterial({ color: 0x939b9d, metalness: .82, roughness: .3 }),
    headlight: new THREE.MeshStandardMaterial({ color: 0xf2f1d5, emissive: 0xffe8a3, emissiveIntensity: .55, roughness: .25 }),
    taillight: new THREE.MeshStandardMaterial({ color: 0x991b18, emissive: 0x5f0907, emissiveIntensity: .45, roughness: .28 }),
    policeDecal: new THREE.MeshBasicMaterial({ map: tex.policeDecal, transparent: true, side: THREE.DoubleSide }),
  };
  function addBox(w, h, d, material, x, y, z, opts = {}) {
    const mesh = new THREE.Mesh(boxGeo(w, h, d), material); mesh.position.set(x, y + h / 2, z);
    if (opts.ry) mesh.rotation.y = opts.ry; if (opts.rx) mesh.rotation.x = opts.rx; if (opts.rz) mesh.rotation.z = opts.rz;
    mesh.castShadow = opts.cast !== false; mesh.receiveShadow = true; if (opts.name) mesh.name = opts.name; root.add(mesh);
    if (opts.collide !== false) {
      const hx = Math.abs(Math.cos(opts.ry || 0)) * w / 2 + Math.abs(Math.sin(opts.ry || 0)) * d / 2;
      const hz = Math.abs(Math.sin(opts.ry || 0)) * w / 2 + Math.abs(Math.cos(opts.ry || 0)) * d / 2;
      const collider = { minX: x - hx, maxX: x + hx, minY: y, maxY: y + h, minZ: z - hz, maxZ: z + hz, tag: opts.tag };
      colliders.push(collider); mesh.userData.collider = collider; if (h > 1.2) occluders.push(mesh);
    }
    return mesh;
  }
  function addCylinder(r, h, material, x, y, z, opts = {}) {
    const mesh = new THREE.Mesh(cylGeo(r, h, opts.segments || 12), material); mesh.position.set(x, y + h / 2, z);
    if (opts.rx) mesh.rotation.x = opts.rx; if (opts.rz) mesh.rotation.z = opts.rz; mesh.castShadow = true; mesh.receiveShadow = true; if (opts.name) mesh.name = opts.name; root.add(mesh);
    if (opts.collide) { const collider = { minX: x-r, maxX: x+r, minY: y, maxY: y+h, minZ: z-r, maxZ: z+r, tag: opts.tag }; colliders.push(collider); mesh.userData.collider = collider; }
    return mesh;
  }

  scene.background = new THREE.Color(0xa8b5b7); scene.fog = new THREE.Fog(0x9aa7a8, 82, 165);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(150, 175), MAT.darkConcrete); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; root.add(ground);

  // Muro maciço impede fuga; a tela metálica e o arame farpado dão a leitura prisional.
  addBox(76, 5.8, 1, MAT.concrete, 0, 0, -HALF_Z, { tag: 'muro-sul' });
  addBox(76, 5.8, 1, MAT.concrete, 0, 0, HALF_Z, { tag: 'muro-norte' });
  addBox(1, 5.8, 96, MAT.concrete, -HALF_X, 0, 0, { tag: 'muro-oeste' });
  addBox(1, 5.8, 96, MAT.concrete, HALF_X, 0, 0, { tag: 'muro-leste' });
  function fence(name, axis, fixed, from, to) {
    const group = new THREE.Group(); group.name = `penitenciaria-cerca-${name}`; root.add(group);
    for (let p = from; p <= to; p += 3) {
      const mesh = axis === 'x' ? addBox(.08, 2.5, .08, MAT.steel, p, 5.8, fixed, { collide: false }) : addBox(.08, 2.5, .08, MAT.steel, fixed, 5.8, p, { collide: false }); group.add(mesh); root.remove(mesh);
    }
    for (const y of [6.2, 7.25, 8.1]) {
      const rail = axis === 'x' ? addBox(to-from, .06, .06, MAT.steel, (from+to)/2, y, fixed, { collide: false }) : addBox(.06, .06, to-from, MAT.steel, fixed, y, (from+to)/2, { collide: false }); group.add(rail); root.remove(rail);
    }
    const wire = new THREE.Mesh(new THREE.TorusGeometry(.34, .025, 4, 10), MAT.rust); wire.rotation.y = axis === 'x' ? Math.PI / 2 : 0;
    for (let p = from + .5; p < to; p += .7) { const coil = wire.clone(); axis === 'x' ? coil.position.set(p, 8.45, fixed) : coil.position.set(fixed, 8.45, p); group.add(coil); }
  }
  fence('sul', 'x', -HALF_Z, -HALF_X, HALF_X); fence('norte', 'x', HALF_Z, -HALF_X, HALF_X);
  fence('oeste', 'z', -HALF_X, -HALF_Z, HALF_Z); fence('leste', 'z', HALF_X, -HALF_Z, HALF_Z);

  function guardTower(index, x, z) {
    const group = new THREE.Group(); group.name = `penitenciaria-guarita-${index}`; root.add(group);
    const sx = Math.sign(x), sz = Math.sign(z);
    for (const dx of [-1.8, 1.8]) for (const dz of [-1.8, 1.8]) addBox(.38, 7.2, .38, MAT.steel, x+dx, 0, z+dz, { tag: `guarita-${index}` });
    addBox(4.8, .45, 4.8, MAT.concrete, x, 6.5, z, { tag: `guarita-${index}` });
    addBox(4.2, 2.4, .25, MAT.steel, x, 6.95, z-sz*2, { tag: `guarita-${index}` });
    addBox(.25, 2.4, 4.2, MAT.steel, x-sx*2, 6.95, z, { tag: `guarita-${index}` });
    addBox(4.8, .4, 4.8, MAT.darkConcrete, x, 9.35, z, { collide: false });
    for (const side of [-1, 1]) addBox(.08, 5.8, .08, MAT.steel, x+sx*(2.25+side*.35), .2, z-sz*2.2, { collide: false });
  }
  guardTower(0, -33.5, -43.5); guardTower(1, 33.5, -43.5); guardTower(2, -33.5, 43.5); guardTower(3, 33.5, 43.5);

  function cell(side, index, z) {
    const faceX = side * 25, backX = side * 34.2, insideX = side * 29.3;
    const group = new THREE.Group(); group.name = `penitenciaria-cela-aberta-${side < 0 ? 'o' : 'l'}-${index}`;
    group.userData = { doorwayX: side * 24.8, doorwayZ: z, insideX, insideZ: z }; root.add(group);
    addBox(9.2, .35, 7.2, MAT.concrete, (faceX+backX)/2, 4.1, z, { collide: false });
    addBox(.5, 4.1, 7.2, MAT.concrete, backX, 0, z);
    addBox(9.2, 4.1, .42, MAT.concrete, (faceX+backX)/2, 0, z-3.6);
    addBox(9.2, 4.1, .42, MAT.concrete, (faceX+backX)/2, 0, z+3.6);
    const barX = faceX;
    for (const dz of [-3.25,-2.7,-2.15,2.15,2.7,3.25]) addBox(.12, 3.85, .12, MAT.steel, barX, 0, z+dz, { collide: false });
    for (const y of [.6,2,3.35]) { addBox(.12, .1, 2.9, MAT.steel, barX, y, z-2.15, { collide: false }); addBox(.12, .1, 2.9, MAT.steel, barX, y, z+2.15, { collide: false }); }
    addBox(.45, 1.1, 2.6, MAT.concrete, side*31.6, 0, z, { name: `penitenciaria-banco-${side}-${index}` });
    addBox(.1, .08, 1.5, MAT.white, backX-side*.27, 2.1, z, { collide: false });
  }
  [-30,-20,-10,10,20,30].forEach((z, i) => { cell(-1, i, z); cell(1, i, z); });

  // Pátio bruto: concreto remendado, manchas de umidade e drenagem, sem marcação esportiva.
  const yard = new THREE.Mesh(new THREE.PlaneGeometry(35, 43), MAT.yard); yard.name = 'penitenciaria-patio'; yard.rotation.x = -Math.PI/2; yard.position.y = .018; yard.receiveShadow = true; root.add(yard);
  for (const [x,z,sx,sz] of [[-11,-14,4,1.8],[9,-12,5,2.4],[-13,10,3,5],[11,14,5,2],[-2,17,7,1.4]]) {
    const stain = new THREE.Mesh(new THREE.CircleGeometry(1,18), new THREE.MeshBasicMaterial({color:0x252c27,transparent:true,opacity:.2,depthWrite:false}));
    stain.scale.set(sx,sz,1); stain.rotation.x=-Math.PI/2; stain.position.set(x,.032,z); root.add(stain);
  }
  for (const z of [-18,18]) { addBox(29,.055,.22,MAT.steel,0,.02,z,{collide:false,cast:false}); for(let x=-13;x<=13;x+=1.1)addBox(.06,.065,1.1,MAT.black,x,.025,z,{collide:false,cast:false}); }

  function ammoCrate(index, x, z, ry=0) {
    const group = new THREE.Group(); group.name = `penitenciaria-caixa-municao-${index}`; root.add(group);
    const body = addBox(2.2, 1.25, 1.55, MAT.ammo, x, 0, z, { ry, tag: `municao-${index}` }); group.userData.collider = body.userData.collider;
    for (const y of [.18,.92]) addBox(2.28,.1,1.63,MAT.steel,x,y,z,{ry,collide:false});
    for (const dx of [-.65,0,.65]) addBox(.08,.7,1.65,MAT.black,x+dx*Math.cos(ry),.27,z-dx*Math.sin(ry),{ry,collide:false});
  }
  [[-8,-7,.2],[8,-7,-.2],[-8,7,-.15],[8,7,.15],[-16,0,1.57],[16,0,1.57]].forEach((p,i)=>ammoCrate(i,...p));

  function centerObstacle(index, kind, x, z, ry=0) {
    const marker = new THREE.Group(); marker.name = `penitenciaria-obstaculo-centro-${index}-${kind}`; marker.position.set(x,0,z); root.add(marker);
    if (kind === 'barreira') {
      addBox(4.2,1.25,.75,MAT.concrete,x,0,z,{ry,tag:`centro-${index}`});
      addBox(3.7,.16,.82,MAT.yellow,x,1.04,z,{ry,collide:false});
      for(const side of [-1,1]) addBox(.55,.3,1.25,MAT.darkConcrete,x+side*Math.cos(ry)*1.65,.02,z-side*Math.sin(ry)*1.65,{ry});
    } else if (kind === 'barris') {
      for(const [dx,dz] of [[-.7,0],[.7,0],[0,.75]]) { addCylinder(.48,1.35,MAT.rust,x+dx,0,z+dz,{collide:true,tag:`centro-${index}`,segments:16}); addCylinder(.5,.06,MAT.steel,x+dx,1.28,z+dz,{segments:16}); }
    } else if (kind === 'gaiola') {
      addBox(3.1,.25,2.1,MAT.steel,x,0,z,{ry,tag:`centro-${index}`});
      for(const dx of [-1.4,1.4])for(const dz of [-.9,.9])addBox(.12,1.65,.12,MAT.steel,x+dx*Math.cos(ry)+dz*Math.sin(ry),.2,z-dx*Math.sin(ry)+dz*Math.cos(ry),{collide:false});
      addBox(3.1,.12,2.1,MAT.steel,x,1.72,z,{ry,collide:false}); addBox(2.5,.75,1.5,MAT.white,x,.27,z,{ry,collide:false});
    } else {
      addBox(3.5,.35,2.2,MAT.rust,x,0,z,{ry,tag:`centro-${index}`});
      addBox(2.8,.8,1.8,MAT.darkConcrete,x,.35,z,{ry}); addBox(2.3,.65,1.5,MAT.concrete,x,.95,z,{ry});
    }
  }
  [['barreira',-12,-16,.15],['barris',11,-16,0],['gaiola',-14,-2,-.2],['entulho',13,1,.25],['barreira',-11,16,-.18],['barris',12,16,0],['gaiola',-3,-13,.12],['entulho',4,13,-.2],['barreira',-2,7,1.45],['gaiola',3,-6,1.5]].forEach((p,i)=>centerObstacle(i,...p));

  function policeCar(x,z,ry) {
    const group = new THREE.Group(); group.name = 'penitenciaria-carro-policia'; group.position.set(x,0,z); group.rotation.y=ry; root.add(group);
    const mesh=(geometry,material,px,py,pz,name,rx=0,ry2=0,rz=0)=>{const object=new THREE.Mesh(geometry,material);object.name=name;object.position.set(px,py,pz);object.rotation.set(rx,ry2,rz);object.castShadow=true;object.receiveShadow=true;group.add(object);return object;};
    const box=(w,h,d,material,px,base,pz,name,rx=0,ry2=0,rz=0)=>mesh(boxGeo(w,h,d),material,px,base+h/2,pz,name,rx,ry2,rz);
    mesh(taperedGeo(2.82,2.58,.78,5.42,5.08),MAT.white,0,.94,0,'penitenciaria-carro-lataria');
    box(2.55,.17,2.05,MAT.blue,0,1.28,-1.66,'penitenciaria-carro-capo');
    box(2.52,.16,1.22,MAT.blue,0,1.26,2.03,'penitenciaria-carro-porta-malas');
    mesh(taperedGeo(2.42,1.84,1.04,3.12,2.18,.05),MAT.white,0,1.77,.13,'penitenciaria-carro-cabine');
    box(1.94,.12,2.18,MAT.white,0,2.24,.18,'penitenciaria-carro-teto');

    mesh(planeGeo(1.86,.73),MAT.glass,0,1.85,-1.17,'penitenciaria-carro-vidro-frente',-.39);
    mesh(planeGeo(1.86,.7),MAT.glass,0,1.84,1.44,'penitenciaria-carro-vidro-traseiro',.39);
    for(const sx of [-1,1]) {
      mesh(planeGeo(.94,.62),MAT.glass,sx*1.085,1.83,-.48,`penitenciaria-carro-vidro-lateral-${sx}-frente`,0,sx*Math.PI/2);
      mesh(planeGeo(.86,.62),MAT.glass,sx*1.085,1.83,.66,`penitenciaria-carro-vidro-lateral-${sx}-tras`,0,sx*Math.PI/2);
      box(.055,.72,.09,MAT.black,sx*1.09,1.47,.11,`penitenciaria-carro-pilar-${sx}`);
      box(.24,.13,.34,MAT.black,sx*1.42,1.5,-1.02,`penitenciaria-carro-retrovisor-${sx}`);
      for(const [doorZ,i] of [[-.42,0],[.72,1]]) {
        box(.035,.055,.34,MAT.chrome,sx*1.39,1.23,doorZ,`penitenciaria-carro-macaneta-${sx}-${i}`);
      }
      const decal=mesh(planeGeo(2.05,.5),MAT.policeDecal,sx*1.421,1.12,.18,`penitenciaria-carro-decal-${sx}`,0,sx*Math.PI/2,0);decal.castShadow=false;
    }

    for(const sx of [-1,1]) for(const [sz,axle] of [[-1.76,'dianteiro'],[1.78,'traseiro']]) {
      mesh(cylGeo(.5,.3,20),MAT.rubber,sx*1.38,.52,sz,`penitenciaria-carro-pneu-${sx}-${axle}`,0,0,Math.PI/2);
      mesh(cylGeo(.29,.315,16),MAT.rim,sx*1.385,.52,sz,`penitenciaria-carro-aro-${sx}-${axle}`,0,0,Math.PI/2);
      mesh(torusGeo(.52,.055),MAT.black,sx*1.405,.56,sz,`penitenciaria-carro-paralama-${sx}-${axle}`,0,Math.PI/2,0);
    }

    box(2.72,.23,.22,MAT.black,0,.47,-2.71,'penitenciaria-carro-parachoque-frente');
    box(2.72,.23,.22,MAT.black,0,.47,2.71,'penitenciaria-carro-parachoque-traseiro');
    for(const sx of [-1,1]) {
      box(.68,.28,.09,MAT.headlight,sx*.82,.85,-2.575,`penitenciaria-carro-farol-${sx}`);
      box(.58,.3,.09,MAT.taillight,sx*.87,.86,2.575,`penitenciaria-carro-lanterna-${sx}`);
    }
    box(1.25,.32,.08,MAT.black,0,.75,-2.59,'penitenciaria-carro-grade');
    for(const sx of [-.42,0,.42]) box(.06,.27,.035,MAT.chrome,sx,.77,-2.64,`penitenciaria-carro-grade-filete-${sx}`);
    box(.72,.19,.045,MAT.black,0,.52,-2.84,'penitenciaria-carro-placa-frente');
    box(.72,.19,.045,MAT.black,0,.52,2.84,'penitenciaria-carro-placa-traseira');

    box(1.55,.12,.34,MAT.black,0,2.29,.05,'penitenciaria-carro-giroflex-base');
    box(.68,.21,.31,MAT.red,-.4,2.39,.05,'penitenciaria-carro-giroflex-vermelho');
    box(.68,.21,.31,MAT.blue,.4,2.39,.05,'penitenciaria-carro-giroflex-azul');
    mesh(cylGeo(.025,.72,8),MAT.black,.73,2.58,.83,'penitenciaria-carro-antena',0,0,-.17);
    const hx=Math.abs(Math.cos(ry))*1.55+Math.abs(Math.sin(ry))*2.8,hz=Math.abs(Math.sin(ry))*1.55+Math.abs(Math.cos(ry))*2.8;
    const collider={minX:x-hx,maxX:x+hx,minY:0,maxY:2.5,minZ:z-hz,maxZ:z+hz,tag:'carro-policia'};colliders.push(collider);group.userData.collider=collider;occluders.push(group);
  }
  policeCar(17,-25,-.35);

  function punchingBag(index,x,z) {
    const group=new THREE.Group();group.name=`penitenciaria-saco-boxe-${index}`;root.add(group);
    addBox(3.6,.25,2.4,MAT.steel,x,3.4,z,{collide:false}); addBox(.22,3.5,.22,MAT.steel,x-1.55,0,z); addBox(.22,3.5,.22,MAT.steel,x+1.55,0,z);
    addCylinder(.08,.85,MAT.steel,x,2.9,z,{collide:false}); addCylinder(.48,1.9,MAT.red,x,1,z,{collide:true,tag:`saco-${index}`});
  }
  punchingBag(0,-18,38); punchingBag(1,-13,38);

  function dynamite(index,x,z,ry=0) {
    const group=new THREE.Group();group.name=`penitenciaria-dinamite-${index}`;group.position.set(x,0,z);group.rotation.y=ry;root.add(group);
    for(let i=0;i<6;i++){const stick=new THREE.Mesh(cylGeo(.11,1.25,8),MAT.red);stick.rotation.z=Math.PI/2;stick.position.set(0,.18+(i%2)*.2,(i-2.5)*.24);group.add(stick);} const band=new THREE.Mesh(boxGeo(.18,.65,1.65),MAT.black);band.position.y=.25;group.add(band);
  }
  dynamite(0,-19,-16,.2); dynamite(1,19,17,-.25); dynamite(2,4,23,1.1);

  // Bancos externos e barreiras quebram linhas longas sem fechar as três rotas.
  [[-18,-26],[18,27],[-18,24],[18,-20]].forEach(([x,z],i)=>{
    addBox(4.4,.38,1.05,MAT.concrete,x,.72,z,{name:`penitenciaria-banco-patio-${i}`});
    for(const dx of [-1.65,1.65]) addBox(.45,.72,.8,MAT.darkConcrete,x+dx,0,z);
  });

  const GM={dark:MAT.black,steel:MAT.steel,wood:MAT.rust};
  function gun(kind,x,z,yaw){const g=new THREE.Group();g.name=`arma-central-${kind}`;g.position.set(x,.1,z);g.rotation.y=yaw;root.add(g);const long=['awp','ak','m4','shotgun','mp5'].includes(kind);const body=new THREE.Mesh(boxGeo(.13,.13,long?1:.42),kind==='shotgun'?GM.wood:GM.dark);body.position.y=.1;g.add(body);if(long){const barrel=new THREE.Mesh(boxGeo(.08,.08,.55),GM.steel);barrel.position.set(0,.13,-.62);g.add(barrel);}const grip=new THREE.Mesh(boxGeo(.11,.25,.14),GM.wood);grip.position.set(0,-.02,long?.25:.12);g.add(grip);pickups.push({x,z,kind,weapon:kind,readyAt:0,mesh:g});}
  ['awp','ak','m4','shotgun','mp5','deagle','pistol','smg'].forEach((kind,i)=>gun(kind,-10+i*(20/7),i%2?-2.2:2.2,i*.42));
  ['ak','m4','shotgun','deagle'].forEach((kind,i)=>{gun(kind,-15+i*10,-41,0);gun(kind,15-i*10,41,Math.PI);});

  const hemi=new THREE.HemisphereLight(0xdbe8eb,0x343a36,1.35);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffe7c7,1.85);sun.position.set(-35,52,-22);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-50;sun.shadow.camera.right=50;sun.shadow.camera.top=58;sun.shadow.camera.bottom=-58;sun.shadow.camera.far=180;sun.shadow.bias=-.0004;scene.add(sun);
  const fill=new THREE.DirectionalLight(0x7897ba,.38);fill.position.set(28,24,35);scene.add(fill);

  const groundHeightAt=()=>0, slowAt=()=>false;
  const bounds={minX:-HALF_X+.9,maxX:HALF_X-.9,minZ:-HALF_Z+.9,maxZ:HALF_Z-.9};
  const blocked=(x,z,inflate=.44)=>colliders.some(c=>x>c.minX-inflate&&x<c.maxX+inflate&&z>c.minZ-inflate&&z<c.maxZ+inflate&&c.minY<1.7&&c.maxY>.1);
  const nodes=[],adj=[],step=3.2;
  for(let x=bounds.minX+1;x<=bounds.maxX-1;x+=step)for(let z=bounds.minZ+1;z<=bounds.maxZ-1;z+=step)if(!blocked(x,z))nodes.push({x,z});
  for(let i=0;i<nodes.length;i++)adj.push([]);
  const clear=(a,b)=>{for(let i=1;i<7;i++){const t=i/7;if(blocked(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,.25))return false;}return true;};
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const dx=nodes[i].x-nodes[j].x,dz=nodes[i].z-nodes[j].z;if(dx*dx+dz*dz<=step*step*2.3&&clear(nodes[i],nodes[j])){adj[i].push(j);adj[j].push(i);}}
  for(let i=0;i<nodes.length;i++)if(adj[i].length===0){let nearest=-1,distance=Infinity;for(let j=0;j<nodes.length;j++){if(i===j||!clear(nodes[i],nodes[j]))continue;const dx=nodes[i].x-nodes[j].x,dz=nodes[i].z-nodes[j].z,d=dx*dx+dz*dz;if(d<distance){distance=d;nearest=j;}}if(nearest>=0){adj[i].push(nearest);adj[nearest].push(i);}}
  function nearestWaypoint(x,z){let best=0,distance=Infinity;for(let i=0;i<nodes.length;i++){const dx=nodes[i].x-x,dz=nodes[i].z-z,d=dx*dx+dz*dz;if(d<distance){distance=d;best=i;}}return best;}
  function findPath(fromIdx,toIdx){if(fromIdx===toIdx)return[toIdx];const prev=new Int16Array(nodes.length).fill(-1),queue=[fromIdx];prev[fromIdx]=fromIdx;while(queue.length){const n=queue.shift();for(const next of adj[n])if(prev[next]<0){prev[next]=n;if(next===toIdx){const path=[next];let p=n;while(p!==fromIdx){path.unshift(p);p=prev[p];}path.unshift(fromIdx);return path;}queue.push(next);}}return[fromIdx];}
  return {root,colliders,occluders,decalSolids:[root],groundHeightAt,slowAt,pickups,sun,hemi,
    spawns:{E:[-15,-5,5,15].map(x=>({x,z:-42,yaw:0})),B:[15,5,-5,-15].map(x=>({x,z:42,yaw:Math.PI}))},
    ctfPoints:[{id:'E',label:'ALA SUL',x:0,z:-39},{id:'MID',label:'PÁTIO',x:0,z:0},{id:'B',label:'ALA NORTE',x:0,z:39}],
    waypoints:{nodes,adj},nearestWaypoint,findPath,bounds};
}
