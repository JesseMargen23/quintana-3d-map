import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#c9e0df');
scene.fog = new THREE.Fog('#c9e0df', 38, 85);
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 150);
camera.position.set(24, 25, 31);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.querySelector('#scene').appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0); controls.enableDamping = true; controls.maxPolarAngle = Math.PI * .48; controls.minDistance = 12; controls.maxDistance = 55;

const hemi = new THREE.HemisphereLight(0xe8f6ff, 0x78927a, 2.1); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d5, 3.2); sun.position.set(-12, 24, 13); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-35; sun.shadow.camera.right=35; sun.shadow.camera.top=35; sun.shadow.camera.bottom=-35; scene.add(sun);
const ambient = new THREE.AmbientLight(0xffffff,.25); scene.add(ambient);

const mats = {
 grass: new THREE.MeshStandardMaterial({color:'#8eb58c',roughness:1}), path:new THREE.MeshStandardMaterial({color:'#d9c9a8',roughness:1}),
 concrete:new THREE.MeshStandardMaterial({color:'#d5d8cb',roughness:1}), water:new THREE.MeshPhysicalMaterial({color:'#36b9cf',roughness:.2,metalness:.05,transparent:true,opacity:.88,clearcoat:1}),
 edge:new THREE.MeshStandardMaterial({color:'#f5f1df',roughness:.8}), wood:new THREE.MeshStandardMaterial({color:'#a9784f',roughness:.9}), roof:new THREE.MeshStandardMaterial({color:'#557d69',roughness:1}), wall:new THREE.MeshStandardMaterial({color:'#f1e7d2',roughness:1}),
 accent:new THREE.MeshStandardMaterial({color:'#d7a96c',roughness:.8}), dark:new THREE.MeshStandardMaterial({color:'#315b50',roughness:1})
};
const ground = new THREE.Mesh(new THREE.BoxGeometry(48,.35,38),mats.grass); ground.position.y=-.25; ground.receiveShadow=true; scene.add(ground);
const resort = new THREE.Group(); scene.add(resort);
function box(name,w,h,d,x,y,z,mat,parent=resort,opts={}){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function cylinder(name,r,h,x,y,z,mat,parent=resort,segments=20){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function label(text,x,z){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='rgba(20,55,53,.82)';ctx.roundRect(8,8,496,112,24);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 42px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);const tex=new THREE.CanvasTexture(c);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));sprite.position.set(x,3.5,z);sprite.scale.set(5.4,1.35,1);resort.add(sprite);return sprite}
// A simple walkway connecting the three pool zones.
box('Main walkway',2,.12,31,0,.02,0,mats.path);
box('Entrance patio',10,.13,4,0,.04,15,mats.concrete);
// Pools are intentionally arranged as a sample layout, not a surveyed resort plan.
const pools = [
 {id:'pool1',name:'Pool 1',subtitle:'Pool 1',x:-11,z:-5,w:10,d:6,depth:'1.2 m – 1.5 m',size:'10 m × 6 m',features:['Wide swimming area','Poolside loungers','Shaded seating'],items:[['🛟','Life ring'],['🪑','Pool loungers'],['☂','Umbrella'],['🚿','Outdoor shower']]},
 {id:'pool2',name:'Pool 2',subtitle:'Pool 2',x:10,z:-5,w:11,d:7,depth:'1.2 m – 1.8 m',size:'11 m × 7 m',features:['Open leisure swimming','Poolside deck','Tropical landscaping'],items:[['🏀','Pool basketball hoop'],['🪑','Deck chairs'],['🛟','Life ring'],['🌴','Palm trees']]},
 {id:'pool3',name:'Pool 3',subtitle:'Pool 3',x:0,z:10,w:8,d:5,depth:'0.5 m – 0.8 m',size:'8 m × 5 m',features:['Shallow water area','Small slide','Family seating nearby'],items:[['🛝','Small slide'],['🦩','Pool float'],['🪑','Family bench'],['🚿','Outdoor shower']]}
];
const clickable=[]; const poolGroups={}; const itemObjects={};
function addPool(p){const g=new THREE.Group();g.position.set(p.x,0,p.z);g.userData={type:'pool',poolId:p.id};resort.add(g);poolGroups[p.id]=g;
 const deck=box(p.id+' deck',p.w+1.5,.35,p.d+1.5,0,.12,0,mats.edge,g);
 const water=box(p.id+' water',p.w,.12,p.d,0,.35,0,mats.water,g);water.userData={type:'pool',poolId:p.id};clickable.push(water);
 const rim=box(p.id+' coping',p.w+.2,.12,p.d+.2,0,.34,0,mats.concrete,g);rim.position.y=.27;
 const title=label(p.subtitle,p.x,p.z);title.position.y=3.2;
 // pool steps
 for(let i=0;i<3;i++){const s=box(p.id+' step '+i,.9,.12,.55,-p.w/2+.7,.38+i*.1,-p.d/2+.65+i*.35,mats.edge,g);s.userData={type:'item',poolId:p.id,item:'Pool steps'};clickable.push(s)}
 // ladders: twin rails and rungs
 const ladderX=p.w/2-.5;for(const dx of [-.22,.22]){const rail=box(p.id+' ladder rail',.08,.9,.08,ladderX+dx,.72,p.d/2-.2,mats.accent,g);rail.userData={type:'item',poolId:p.id,item:'Pool ladder'};clickable.push(rail)}
 for(let i=0;i<3;i++)box('ladder rung',.52,.07,.09,ladderX,.42+i*.2,p.d/2-.2,mats.accent,g);
 // loungers on one side
 for(let i=0;i<2;i++){const lx=-p.w/2+1.4+i*1.8;const bed=box(p.id+' lounger',1.25,.22,.58,lx,.38,p.d/2+1.15,mats.wood,g);bed.rotation.x=-.12;bed.userData={type:'item',poolId:p.id,item:'Pool loungers'};clickable.push(bed);}
 clickable.push(water);}
pools.forEach(addPool);
// Facilities: reception, changing rooms, snack kiosk and shaded pergolas.
function building(name,x,z,w,d,wallMat=mats.wall){const g=new THREE.Group();g.position.set(x,0,z);resort.add(g);box(name+' building',w,2.5,d,0,1.25,0,wallMat,g);const roof=box(name+' roof',w+0.5,.35,d+0.5,0,2.65,0,mats.roof,g);roof.userData={type:'item',poolId:'all',item:name};clickable.push(roof);box(name+' door',.9,1.7,.08,0,.9,d/2+.05,mats.wood,g);label(name,x,z).position.y=4.1;return g}
building('Reception',-17,12,5,4);building('Changing Rooms',17,12,6,4);building('Snack',0,-15,5,3);
// Pergolas with posts and slatted roofs
function pergola(x,z,name){const g=new THREE.Group();g.position.set(x,0,z);resort.add(g);for(const dx of [-1.5,1.5])for(const dz of [-1,1])box(name+' post',.18,2.2,.18,dx,1.1,dz,mats.wood,g);box(name+' roof',3.5,.18,2.5,0,2.3,0,mats.wood,g);const obj=g.children[4];obj.userData={type:'item',poolId:'all',item:name};clickable.push(obj);box(name+' table',1.1,.2,.8,0,.9,0,mats.wood,g);return g}
pergola(-17,-7,'Shaded Gazebo');pergola(18,-7,'Family Pergola');
// Palms and decorative planters
function palm(x,z){const g=new THREE.Group();g.position.set(x,0,z);resort.add(g);cylinder('palm trunk',.22,3.2,0,1.6,0,mats.wood,g);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const leaf=box('palm leaf',.22,.12,2.1,Math.cos(a)*.75,3.1+Math.sin(i)*.12,Math.sin(a)*.75,new THREE.MeshStandardMaterial({color:'#3e855e'}),g);leaf.rotation.y=-a;leaf.rotation.x=-.35;}const selectable=box('Palm tree marker',.6,.3,.6,0,3.3,0,mats.dark,g);selectable.material= new THREE.MeshStandardMaterial({color:'#3e855e',transparent:true,opacity:.01});selectable.userData={type:'item',poolId:'all',item:'Palm trees'};clickable.push(selectable)}
[[-22,-14],[-22,3],[22,-14],[22,3],[-7,17],[8,17]].forEach(([x,z])=>palm(x,z));
// Decorative path lamps
const lampMat=new THREE.MeshStandardMaterial({color:'#384d49'});for(const [x,z] of [[-2,-12],[-2,7],[2,-12],[2,7]]){cylinder('Path lamp post',.07,1.6,x,.8,z,lampMat);const bulb=cylinder('Path lamp light',.16,.12,x,1.65,z,new THREE.MeshStandardMaterial({color:'#ffe6a3',emissive:'#ffc65b',emissiveIntensity:.4}));}
// Soft garden planters
for(const [x,z] of [[-6,-11],[6,-11],[-18,5],[18,5]]){cylinder('Planter',.8,.35,x,.18,z,mats.concrete);cylinder('Shrub',.62,.8,x,.7,z,new THREE.MeshStandardMaterial({color:'#54875e'}));}

const itemCatalog=[['🏊','Pool water','pool water'],['🪜','Pool ladder','Pool ladder'],['🪑','Pool loungers','Pool loungers'],['🛟','Life ring','Life ring'],['☂','Umbrella','Umbrella'],['🛝','Small slide','Small slide'],['🏀','Pool basketball hoop','Pool basketball hoop'],['🌴','Palm trees','Palm trees'],['🏠','Reception','Reception'],['🚿','Outdoor shower','Outdoor shower'],['⛱','Shaded Gazebo','Shaded Gazebo'],['🍹','Snack Kiosk','Snack Kiosk']];
// Add extra selectable sample accessories around each pool.
for(const p of pools){const g=poolGroups[p.id];const umbrella=cylinder(p.id+' umbrella pole',.06,2.1,-p.w/2+1,.0,p.d/2+2.4,mats.accent,g);umbrella.position.y=1.05;umbrella.userData={type:'item',poolId:p.id,item:'Umbrella'};clickable.push(umbrella);const top=cylinder(p.id+' umbrella canopy',1.05,.12,-p.w/2+1,2.15,p.d/2+2.4,new THREE.MeshStandardMaterial({color:'#e8c68b',side:THREE.DoubleSide}),g,12);top.userData={type:'item',poolId:p.id,item:'Umbrella'};clickable.push(top);}
// Basketball hoop beside leisure pool
const hoopGroup=new THREE.Group();hoopGroup.position.set(17,0,-1);resort.add(hoopGroup);box('hoop pole',.12,2.6,.12,0,1.3,0,mats.accent,hoopGroup);const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.06,8,24),new THREE.MeshStandardMaterial({color:'#e6a84f'}));ring.position.set(0,2.4,-.45);ring.rotation.x=Math.PI/2;ring.userData={type:'item',poolId:'pool2',item:'Pool basketball hoop'};hoopGroup.add(ring);clickable.push(ring);box('hoop backboard',1.1,.75,.12,0,2.8,-.55,mats.edge,hoopGroup);
// Small slide beside kids pool
const slideGroup=new THREE.Group();slideGroup.position.set(5,0,13);resort.add(slideGroup);box('slide ladder',.25,1.5,.25,0,.75,0,mats.accent,slideGroup);const slide=new THREE.Mesh(new THREE.BoxGeometry(1.3,.12,2.5),new THREE.MeshStandardMaterial({color:'#ed8b63',side:THREE.DoubleSide}));slide.position.set(0,1.35,1);slide.rotation.x=-.35;slide.userData={type:'item',poolId:'pool3',item:'Small slide'};slideGroup.add(slide);clickable.push(slide);
// Shower markers
for(const [x,z,pid] of [[-5,-1,'pool1'],[14,0,'pool2'],[5,14,'pool3']]){const sh=box('Outdoor shower',.16,2,.16,x,1,z,mats.accent);sh.userData={type:'item',poolId:pid,item:'Outdoor shower'};clickable.push(sh);}

let currentPool=null;let selectedObject=null;const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
const panel=document.querySelector('#infoPanel');const openPanelBtn=document.querySelector('#openPanel');const titleEl=document.querySelector('#panelTitle');const descEl=document.querySelector('#panelDescription');const details=document.querySelector('#poolDetails');const itemList=document.querySelector('#itemList');const featureList=document.querySelector('#featureList');
function toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1700)}
function clearHighlight(){if(selectedObject){selectedObject.traverse?.(o=>{if(o.material?.emissive)o.material.emissive.set(0x000000)});if(selectedObject.material?.emissive)selectedObject.material.emissive.set(0x000000);selectedObject=null}}
function highlightByName(name){clearHighlight();let found=null;resort.traverse(o=>{if(!found&&o.name.toLowerCase().includes(name.toLowerCase())&&o.isMesh)found=o});if(found){selectedObject=found;if(found.material?.emissive)found.material.emissive.set('#ffe05c');else if(found.material){found.material=found.material.clone();found.material.emissive=new THREE.Color('#665000');found.material.emissiveIntensity=.65;}controls.target.copy(found.getWorldPosition(new THREE.Vector3()));toast(`${name} highlighted`)}else toast(`${name} is shown as a sample feature`)}
function renderItems(pool){itemList.innerHTML='';const names=pool?pool.items.map(i=>i[1]):[['🪜','Pool ladder'],['🪑','Pool loungers'],['☂','Umbrella'],['🛝','Small slide'],['🏀','Pool basketball hoop'],['🌴','Palm trees'],['🏠','Reception'],['⛱','Shaded Gazebo'],['🍹','Snack Kiosk']].map(i=>i[1]);const unique=[...new Set(names)];unique.forEach(name=>{const match=itemCatalog.find(i=>i[1]===name);const b=document.createElement('button');b.className='item-btn';b.innerHTML=`<span class="item-icon">${match?.[0]||'•'}</span><span>${name}</span>`;b.onclick=()=>{document.querySelectorAll('.item-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');highlightByName(name)};itemList.appendChild(b)});}
function setPanelOpen(open){panel.classList.toggle('collapsed',!open);openPanelBtn.classList.toggle('visible',!open);openPanelBtn.setAttribute('aria-expanded',String(open));}
function showOverview(){setPanelOpen(true);currentPool=null;clearHighlight();titleEl.textContent='Resort Overview';descEl.textContent='This sample resort map shows three separate pool zones, a central walkway, reception, changing rooms, a snack kiosk, and shaded seating areas. Select a pool to view its sample details.';details.classList.add('hidden');renderItems(null);document.querySelectorAll('.pool-switcher button').forEach(b=>b.classList.remove('active'));}
function selectPool(id,focus=true){const p=pools.find(x=>x.id===id);if(!p)return;setPanelOpen(true);currentPool=id;clearHighlight();titleEl.textContent=p.name;descEl.textContent=`Explore the ${p.subtitle.toLowerCase()} area and its nearby sample facilities. Click an item below to highlight it in the 3D scene.`;details.classList.remove('hidden');document.querySelector('#poolSize').textContent=p.size;document.querySelector('#poolDepth').textContent=p.depth;featureList.innerHTML=p.features.map(f=>`<div class="feature-pill">✓ ${f}</div>`).join('');renderItems(p);document.querySelectorAll('.pool-switcher button').forEach(b=>b.classList.toggle('active',b.dataset.pool===id));if(focus){const target=new THREE.Vector3(p.x,0,p.z);controls.target.copy(target);camera.position.set(p.x+13,17,p.z+17);} }

document.querySelectorAll('.pool-switcher button').forEach(b=>b.addEventListener('click',()=>selectPool(b.dataset.pool)));
document.querySelector('#showAllBtn').addEventListener('click',()=>{showOverview();camera.position.set(24,25,31);controls.target.set(0,0,0)});
document.querySelector('#closePanel').addEventListener('click',()=>setPanelOpen(false));
openPanelBtn.addEventListener('click',()=>setPanelOpen(true));
document.querySelector('#enterBtn').addEventListener('click',()=>{document.querySelector('#welcome').classList.add('hide');showOverview();toast('Welcome! Select any pool to begin.')});
function setMode(mode){const night=mode==='night';scene.background.set(night?'#101d32':'#c9e0df');scene.fog.color.set(night?'#101d32':'#c9e0df');hemi.intensity=night?.42:2.1;sun.intensity=night?.15:3.2;sun.color.set(night?'#8aa9ff':'#fff0d5');ambient.intensity=night?.55:.25;renderer.toneMappingExposure=night?.72:1.05;document.querySelector('#dayBtn').classList.toggle('active',!night);document.querySelector('#nightBtn').classList.toggle('active',night);toast(night?'Night view enabled':'Day view enabled')}
document.querySelector('#dayBtn').onclick=()=>setMode('day');document.querySelector('#nightBtn').onclick=()=>setMode('night');
renderer.domElement.addEventListener('pointerdown',e=>{pointer.x=(e.clientX/innerWidth)*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(clickable,true);if(!hits.length)return;let obj=hits[0].object;while(obj&&!obj.userData.type&&obj.parent)obj=obj.parent;if(!obj?.userData.type)return;if(obj.userData.type==='pool')selectPool(obj.userData.poolId);else if(obj.userData.type==='item'){if(obj.userData.poolId!=='all'&&obj.userData.poolId!==currentPool)selectPool(obj.userData.poolId,false);highlightByName(obj.userData.item);}});
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
showOverview();
