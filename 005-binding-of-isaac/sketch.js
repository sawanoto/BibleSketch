'use strict';
const $=s=>document.querySelector(s);
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sound=new IsaacSound(()=>message('#notice','音を開始できません。音なしでも体験できます。','Sound unavailable. You can continue without sound.'));
const sceneInfo={pair:['1. 親と子','Parent and child'],command:['2. 神の命令','The command'],choice:['3. 二つの選択肢','The choice'],raised:['4. 振り上げる剣','The raised sword'],stopped:['5. 制止','The interruption'],together:['6. 親子が残る','Both remain'],lowered:['7. 剣を下ろす','Lowering the sword'],fallen:['8. 倒れた親','The fallen parent'],watching:['9. 親を見つめる子','The child looks on']};
let canvas,marpan,phase='initial',branch=null,elapsed=0,clock=0,records={},exporting=false,imageURL,exportBlob;
const clamp=n=>Math.max(0,Math.min(1,n));const ease=n=>{n=clamp(n);return n*n*(3-2*n)};
function message(s,ja,en){const span=document.createElement('span');span.className='en';span.lang='en';span.textContent=en;$(s).replaceChildren(document.createTextNode(ja),span)}
function frame(){return{phase,branch,elapsed,clock}}
function remember(key,f=frame()){records[key]={...f};$('#scene').replaceChildren(...Object.entries(sceneInfo).map(([id,t])=>{const o=new Option(t.join(' / '),id);o.disabled=!records[id];return o}));$('#scene').value=key}
function sync(){const active=sound.enabled&&sound.context?.state==='running';message('#sound',active?'音 ON':'音 OFF',active?'Sound ON':'Sound OFF');$('#sound').setAttribute('aria-pressed',String(active));$('#reset').disabled=phase==='animating';for(const b of $('#people').children)b.disabled=phase!=='initial'}
function setup(){const st=$('#stage');canvas=createCanvas(st.clientWidth,st.clientHeight);canvas.parent(st);canvas.attribute('role','img');canvas.attribute('aria-label','剣を持つ親と、小さな子 / A parent holding a sword beside a smaller child');pixelDensity(Math.min(devicePixelRatio,2));frameRate(30);marpan=new Marpan25D({bodyColor:'#f4f0e4',autoBlink:false});remember('pair',{phase:'initial',elapsed:0,clock:0,hideCommand:true});remember('command');new ResizeObserver(()=>{if(!exporting){resizeCanvas(st.clientWidth,st.clientHeight,true);place()}}).observe(st);place();sync()}
function place(){for(const b of $('#people').children){const child=b.dataset.person==='child';Object.assign(b.style,{left:child?'65%':'40%',top:child?'68.2%':'64%',width:child?'16%':'24%',height:child?'17.4%':'26.1%'})}}
async function openChoice(){if(phase!=='initial')return;phase='choice';sound.phase='choice';await sound.unlock();sound.tone(260,240,.09,.05);remember('choice');$('#choice').showModal();document.activeElement?.blur();$('#choice').focus();sync()}
for(const b of $('#people').children)b.onclick=openChoice;
$('#choice').tabIndex=-1;
$('#choice').addEventListener('cancel',()=>{phase='initial';sound.phase='initial';sync()});
function choose(value){if(phase!=='choice')return;branch=value;elapsed=0;phase='animating';$('#choice').close();sound.stop();sound.phase='animating';sound.tone(220,190,.08,.045);message('#hint','','');sync()}
$('#yes').onclick=()=>choose('yes');$('#no').onclick=()=>choose('no');
function milestones(before){const marks=branch==='yes'?[[1,'raised'],[2.55,'stopped'],[5.5,'together']]:[[1.8,'lowered'],[4.7,'fallen'],[6,'watching']];for(const[t,key]of marks)if(before<t&&elapsed>=t){remember(key,{phase:'animating',branch,elapsed:t,clock});if(key==='raised')sound.tone(140,230,.5,.035);if(key==='stopped')sound.tone(880,880,.5,.065);if(key==='lowered')sound.tone(180,100,.2,.035);if(key==='fallen')sound.tone(75,48,.24,.05)}if(elapsed>=6.5){phase='ended';sound.stop();sound.phase='ended';sync()}}
function draw(){if(exporting||document.hidden||$('#preview').open)return;const dt=Math.min(deltaTime/1000,.06);clock+=dt;if(phase==='animating'){const before=elapsed;elapsed+=dt;milestones(before)}renderScene(frame());sound.tick()}
function renderScene(f){const ctx=drawingContext;push();scale(width/1000,height/625);noStroke();const sky=ctx.createLinearGradient(0,0,0,625);sky.addColorStop(0,'#8798a2');sky.addColorStop(1,'#d6d1bf');ctx.fillStyle=sky;ctx.fillRect(0,0,1000,625);
fill('#9ba3a1');triangle(-70,460,210,240,580,475);fill('#aeb2a9');triangle(560,470,840,280,1120,475);fill('#b2a18b');beginShape();vertex(0,477);vertex(180,455);vertex(390,470);vertex(620,454);vertex(830,468);vertex(1000,447);vertex(1000,625);vertex(0,625);endShape(CLOSE);fill('#8e887a');quad(84,505,112,482,148,494,157,516);quad(818,505,847,489,878,502,874,513);
const active=f.phase==='animating'||f.phase==='ended',t=f.elapsed||0,yes=f.branch==='yes',no=f.branch==='no';let parentX=400,rotation=0,angle=.42;
if(active&&yes){angle=.42+(-2.5-.42)*ease(t/2);if(t>2.35)angle=-2.5+.38*ease((t-2.35)/.2);if(t>3.25)angle=-2.12+(-3.58+2.12)*ease((t-3.25)/1.6)}
if(active&&no){angle=.42-3.9*ease(t/1.7);parentX+=36*ease(t/1.8);rotation=-Math.PI/2*ease((t-3.7)/1);}
const beam=active&&yes?ease((t-2.48)/.08)*(1-ease((t-3.6)/.7)):0;if(beam>0){fill(250,242,210,beam*85);quad(440,0,530,0,590,330,420,330);stroke(255,247,214,beam*200);strokeWeight(3);line(450,240,542,240);noStroke()}
fill(66,58,49,28);ellipse(parentX,488,245,23);ellipse(650,485,160,17);
const breath=reducedMotion||f.phase==='ended'?0:Math.sin(f.clock*1.1)*1.1;
push();translate(parentX,481-120*ease((t-3.7)/1)*(active&&no?1:0));rotate(rotation);marpan.drawAt(0,-81.6+breath,{bodyWidth:240,yaw:0,lookX:180,lookY:-50});
// A small hand holds the sword; the blade stops well outside the child's body.
push();translate(103,-68);rotate(angle);stroke('#514d45');strokeWeight(3);fill('#cad2d0');beginShape();vertex(-7,-31);vertex(-8,-137);vertex(0,-154);vertex(8,-137);vertex(7,-31);endShape(CLOSE);stroke('#f2f1df');strokeWeight(2);line(0,-38,0,-140);stroke('#625744');strokeWeight(8);line(-20,-27,20,-27);stroke('#534d43');strokeWeight(11);line(0,-23,0,4);fill('#f4f0e4');stroke('#121212');strokeWeight(3);ellipse(0,5,21,18);pop();pop();
const lookParent=active&&no&&t>3.5;marpan.drawAt(650,426+breath*.6,{bodyWidth:160,yaw:0,lookX:lookParent?parentX:400,lookY:lookParent?465:390});
if(!f.hideCommand&&(!active||t<1)){fill('#38454b');textAlign(CENTER,CENTER);textSize(36);textFont('sans-serif');text('あなたの子を捧げなさい。',500,92);textSize(24);text('Offer your child.',500,125)}
if(f.phase==='choice'&&exporting)drawPrintedChoice();pop()}
function drawPrintedChoice(){noStroke();fill(0,0,0,115);rect(0,0,1000,625);fill('#10232a');rect(225,190,550,240,12);fill('#e8e4d8');textAlign(CENTER,CENTER);textSize(22);text('神の命令に従い、子を捧げますか？',500,241);textSize(15);text('Will you obey God’s command and offer your child?',500,276);for(const[x,ja,en]of[[365,'はい','Yes'],[635,'いいえ','No']]){fill('#263b42');rect(x-113,317,226,76,25);fill('#e8e4d8');textSize(23);text(ja,x,341);textSize(16);text(en,x,371)}}
$('#reset').onclick=()=>{if(phase==='animating')return;phase='initial';branch=null;elapsed=0;sound.stop();sound.phase='initial';message('#hint','親か子をタップしてください。','Tap either the parent or the child.');sync()};
$('#sound').onclick=async()=>{sound.setEnabled(!sound.enabled||!sound.context);if(sound.enabled)await sound.unlock();sync()};
document.addEventListener('visibilitychange',()=>{sound.stop();if(document.hidden)sound.context?.suspend().catch(()=>{});else if(sound.enabled&&sound.context)sound.unlock().then(sync)});

$('#export').onclick=()=>{
  const key=$('#scene').value,saved=records[key];if(!saved||exporting)return;
  exporting=true;$('#export').disabled=true;const w=width,h=height,density=pixelDensity();
  try{
    pixelDensity(1);const size=Number($('#resolution').value);resizeCanvas(size,size*.625,true);renderScene(saved);
    canvas.elt.toBlob(blob=>{
      if(!blob){message('#notice','書き出せませんでした。低い解像度をお試しください。','Could not export. Try a lower resolution.');return;}
      if(imageURL)URL.revokeObjectURL(imageURL);imageURL=URL.createObjectURL(blob);exportBlob=blob;
      $('#image').src=imageURL;$('#download').href=imageURL;$('#download').download=`bible-sketch-005-${key}.png`;$('#export-notice').replaceChildren();
      sound.stop();if(!$('#preview').open)$('#preview').showModal();
    },'image/png');
  }catch(_){message('#notice','書き出しに失敗しました。低い解像度をお試しください。','Export failed. Try a lower resolution.');}
  finally{pixelDensity(density);resizeCanvas(w,h,true);exporting=false;renderScene(frame());$('#export').disabled=false;place();}
};
$('#share').onclick=async()=>{
  if(!exportBlob)return;const file=new File([exportBlob],$('#download').download,{type:'image/png'});
  try{if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'イサクの燔祭 / The Binding of Isaac'});else message('#export-notice','PNGを保存、または画像を長押ししてください。','Use Save PNG, or touch and hold the image.');}
  catch(error){if(error.name!=='AbortError')message('#export-notice','共有できませんでした。画像の長押し保存をお試しください。','Could not share. Touch and hold the image to save it.');}
};
$('#close').onclick=()=>$('#preview').close();
