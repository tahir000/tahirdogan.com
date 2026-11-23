const fallback=document.querySelector('#fallback');
try {
const THREE=await import('three');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;
document.querySelector('#scene').appendChild(renderer.domElement);
const scene=new THREE.Scene();const dark=new THREE.Color('#0b171d'),light=new THREE.Color('#e9ede8');scene.background=dark.clone();
const camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,100);camera.position.z=10;
const group=new THREE.Group();scene.add(group);
const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(1.5,0),new THREE.MeshBasicMaterial({color:'#a8cbc7',wireframe:true,transparent:true,opacity:.78}));
group.add(outer);
const artLoader=new THREE.TextureLoader();
const artTextures=await Promise.all(['scales','ai','horomania'].map(name=>artLoader.loadAsync('/assets/intro-'+name+'.svg?v=thin-horo1')));
const symbols=artTextures.map(texture=>{texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,depthTest:false,opacity:0}));sprite.renderOrder=5;group.add(sprite);return sprite});

scene.add(new THREE.HemisphereLight('#e0f6ff','#234c54',2));const key=new THREE.DirectionalLight('#fff0d8',3);key.position.set(3,4,5);scene.add(key);const rim=new THREE.DirectionalLight('#62b9bd',2);rim.position.set(-4,-1,2);scene.add(rim);
const count=900,spread=new Float32Array(count*3),sphere=new Float32Array(count*3),positions=new Float32Array(count*3);let seed=47;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
for(let i=0;i<count;i++){const j=i*3;spread[j]=(random()-.5)*18;spread[j+1]=(random()-.5)*13;spread[j+2]=(random()-.5)*12;const y=1-2*(i+.5)/count,a=i*Math.PI*(3-Math.sqrt(5)),r=Math.sqrt(1-y*y);sphere[j]=2.2*Math.cos(a)*r;sphere[j+1]=2.2*y;sphere[j+2]=2.2*Math.sin(a)*r;}positions.set(spread);
const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));const particles=new THREE.Points(geometry,new THREE.PointsMaterial({color:'#a5c5c1',size:.024,transparent:true,opacity:.65,depthWrite:false}));scene.add(particles);
particles.frustumCulled=false;
function updateParticleDisplay(){const mobile=innerWidth<700;particles.material.sizeAttenuation=!mobile;particles.material.size=mobile?2.6:.024;particles.material.opacity=mobile?.9:.65;particles.material.needsUpdate=true;}
updateParticleDisplay();
const captions=[...document.querySelectorAll('.caption')],finish=document.querySelector('#finish'),progress=document.querySelector('#progress-fill'),chapter=document.querySelector('#chapter'),note=document.querySelector('.scroll-note');
let target=0,current=0,previous=performance.now();const clamp=x=>Math.min(1,Math.max(0,x));const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
function readScroll(){target=clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight))}addEventListener('scroll',readScroll,{passive:true});
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);updateParticleDisplay();readScroll()}addEventListener('resize',resize);readScroll();
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback.hidden=false});
const textDark=new THREE.Color('#e9eeeb'),textLight=new THREE.Color('#122d35'),color=new THREE.Color();
function frame(now){const dt=Math.min((now-previous)/1000,.05);previous=now;current=THREE.MathUtils.lerp(current,target,1-Math.exp(-7*dt));const p=current,blend=smooth(0,1,p);scene.background.copy(dark).lerp(light,blend);color.copy(textDark).lerp(textLight,smooth(.35,.7,p));document.body.style.setProperty('--text','#'+color.getHexString());
const mobile=innerWidth<700;camera.position.z=THREE.MathUtils.lerp(mobile?12:10,mobile?8:6.5,p);camera.lookAt(0,0,0);group.position.y=particles.position.y=mobile?.65:0;
const speed=(.12+p*.95)*(reduced?.12:1);outer.rotation.y+=dt*speed;outer.rotation.x+=dt*speed*.42;particles.rotation.y+=dt*speed*.13;
outer.material.color.set('#a8cbc7').lerp(new THREE.Color('#234e57'),p);particles.material.color.set('#a5c5c1').lerp(new THREE.Color('#34565c'),p);
for(let j=0;j<positions.length;j++){const spreadScale=mobile?(j%3===0?.42:j%3===2?.65:1):1;positions[j]=THREE.MathUtils.lerp(spread[j]*spreadScale,sphere[j],blend);}geometry.attributes.position.needsUpdate=true;
const weights=[1-smooth(.205,.25,p),smooth(.205,.25,p)*(1-smooth(.445,.49,p)),smooth(.445,.49,p)];
const together=smooth(.685,.745,p);
const cycle=(now*.00035)%3,cycleIndex=Math.floor(cycle),cycleBlend=smooth(.68,1,cycle-cycleIndex);
symbols.forEach((sprite,i)=>{const cycleWeight=(i===cycleIndex?1-cycleBlend:0)+(i===(cycleIndex+1)%3?cycleBlend:0);sprite.material.color.copy(color);sprite.material.opacity=.5*THREE.MathUtils.lerp(weights[i],cycleWeight,together);sprite.position.x=0;sprite.position.y=reduced?0:Math.sin(now*.0006)*.055;sprite.scale.setScalar(2.35);sprite.material.rotation=reduced?0:Math.sin(now*.00025)*.045;});
captions.forEach((el,i)=>{const start=i*.24,end=start+.23;const opacity=(i===0?1:smooth(start,start+.035,p))*(1-smooth(end-.045,end,p));el.style.opacity=opacity;el.style.transform=`translateY(${(1-opacity)*18}px)`;el.setAttribute('aria-hidden',String(opacity<.15))});
finish.hidden=p<.96;progress.style.transform=`scaleX(${p})`;chapter.textContent=String(Math.min(4,Math.floor(p/.24)+1)).padStart(2,'0');note.style.opacity=String(1-smooth(.02,.12,p));renderer.render(scene,camera);requestAnimationFrame(frame)}requestAnimationFrame(frame);
}catch(error){fallback.hidden=false;console.error('3B giriş yüklenemedi:',error)}
