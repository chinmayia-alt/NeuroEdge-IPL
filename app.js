const $ = (id) => document.getElementById(id);
const canvas = $('eegCanvas');
const ctx = canvas.getContext('2d');
let running = true;
let seconds = 0;
let risk = 8;
let phase = 0;
let toastTimer;
const channels = {'Fp1-F7':1,'F7-T7':1.15,'T7-P7':.88,'P7-O1':1.08};

function resizeCanvas(){
  const rect=canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
  canvas.width=Math.max(1,Math.floor(rect.width*dpr)); canvas.height=Math.max(1,Math.floor(rect.height*dpr));
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
function drawEEG(){
  const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
  ctx.clearRect(0,0,w,h);
  ctx.strokeStyle='rgba(111,145,166,.22)';ctx.setLineDash([4,5]);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();const scale=channels[$('channelSelect').value]||1;
  for(let x=0;x<w;x++){
    const t=x/w*10+phase;
    const noise=Math.sin(t*23)*5+Math.sin(t*43)*2.4+Math.sin(t*8)*7+Math.sin(t*2.1)*3;
    const wave=(noise*scale)*.85;
    const y=h/2+wave;
    if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.strokeStyle='#48d6c2';ctx.lineWidth=1.7;ctx.shadowColor='#48d6c2';ctx.shadowBlur=5;ctx.stroke();ctx.shadowBlur=0;
}
function setRisk(value){
  risk=value;$('riskValue').innerHTML=String(value).padStart(2,'0')+'<span>%</span>';$('orbPercent').textContent=String(value).padStart(2,'0')+'%';
  $('riskBar').style.width=value+'%';$('predictionOrb').style.background='conic-gradient('+(value>=70?'#ff858b':value>=35?'#f3c66d':'#6ed8a6')+' '+value+'%,#25394a '+value+'%)';
  const label=value>=70?'High estimated risk':value>=35?'Elevated estimated risk':'Low estimated risk';
  $('riskLabel').textContent='● '+label;$('riskLabel').style.color=value>=70?'#ff9298':value>=35?'#f3c66d':'#6ed8a6';
  $('predictionState').textContent=value>=70?'High-risk pattern flagged':value>=35?'Elevated pattern — keep monitoring':'No elevated risk detected';
  $('predictionDescription').textContent=value>=70?'The demo has triggered a high-risk pattern. Review the alert and follow the person’s clinician-approved safety plan.':'The demo is showing an illustrative score. Connect a validated model to display real predictions.';
}
function showToast(message){const t=$('toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600)}
function addEvent(title,detail,status='ALERT'){
 const row=document.createElement('div');row.className='timeline-row';
 const dot=document.createElement('span');dot.className='timeline-dot '+(status==='ALERT'?'':'teal-dot');
 const copy=document.createElement('div');const strong=document.createElement('strong');strong.textContent=title;const small=document.createElement('small');small.textContent=detail;copy.append(strong,small);
 const tag=document.createElement('span');tag.className='event-status';tag.textContent=status;row.append(dot,copy,tag);$('eventList').prepend(row);
}
function openAlert(){
 setRisk(87);$('alertScore').textContent='87%';$('alertModal').hidden=false;addEvent('Possible seizure pattern flagged','Just now · Demo alert','ALERT');$('sessionState').textContent='Alert active';
}
function closeAlert(){ $('alertModal').hidden=true;showToast('Alert acknowledged in prototype.');$('sessionState').textContent='Running'; }
$('testAlertBtn').addEventListener('click',openAlert);
$('closeAlert').addEventListener('click',closeAlert);
$('ackAlert').addEventListener('click',closeAlert);
$('alertModal').addEventListener('click',e=>{if(e.target===$('alertModal'))closeAlert()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('alertModal').hidden)closeAlert()});
$('channelSelect').addEventListener('change',drawEEG);
$('connectBtn').addEventListener('click',()=>{
 running=!running;$('connectBtn').textContent=running?'Pause demo':'Resume demo';$('connectionText').textContent=running?'SIMULATION':'PAUSED';$('deviceStatus').textContent=running?'Streaming simulated EEG values · Not connected to a physical wristband':'Demo stream paused · No live sensor connection';$('sessionState').textContent=running?'Running':'Paused';showToast(running?'Demo stream resumed':'Demo stream paused');
});
$('helpBtn').addEventListener('click',()=>showToast('Demo mode only. See README for model integration notes.'));
window.addEventListener('resize',()=>{resizeCanvas();drawEEG()});
resizeCanvas();drawEEG();
setInterval(()=>{
 if(!running)return;seconds++;phase+=.12;
 const mm=String(Math.floor(seconds/60)).padStart(2,'0'),ss=String(seconds%60).padStart(2,'0');$('durationValue').innerHTML=mm+':'+ss+'<span class="unit">min</span>';
 $('heartValue').innerHTML=(70+Math.round(3*Math.sin(seconds/7)))+'<span class="unit">bpm</span>';
 // Deliberately synthetic values: these are not CHB-MIT model outputs or patient measurements.
 if(seconds%5===0){setRisk(6+Math.round(Math.abs(Math.sin(seconds/19))*9));$('lastUpdate').textContent='Just now';}
 drawEEG();
},1000);
