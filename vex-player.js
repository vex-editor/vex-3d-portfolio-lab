/* VEX mini video player: small bottom controls, tap video to hide/show them while playing. */
(function(){
  const fmt=t=>{if(!isFinite(t))return'0:00';t=Math.floor(t);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');};
  const I={play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',vol:'<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zm11 .5a4 4 0 0 1 0 5v-5zm0-3.2a7 7 0 0 1 0 11.4"/></svg>',mute:'<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zm12 1l5 5m0-5l-5 5" stroke="#fff" stroke-width="2" fill="none"/></svg>',full:'<svg viewBox="0 0 24 24"><path d="M5 5h5v2H7v3H5zm9 0h5v5h-2V7h-3zM5 14h2v3h3v2H5zm12 0h2v5h-5v-2h3z"/></svg>'};
  window.vexPlayer=function(src,label,onFail,poster){
    const box=document.createElement('div');box.className='vxp is-paused show-ui';
    const v=document.createElement('video');v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.preload='metadata';v.disableRemotePlayback=true;v.setAttribute('x-webkit-airplay','deny');if(poster)v.poster=poster;v.src=src;v.setAttribute('aria-label',label||'video');
    const big=document.createElement('button');big.type='button';big.className='vxp-big';big.setAttribute('aria-label','Play');big.innerHTML=I.play;
    const bar=document.createElement('div');bar.className='vxp-bar';
    const pb=document.createElement('button');pb.type='button';pb.className='vxp-btn';pb.setAttribute('aria-label','Play/Pause');pb.innerHTML=I.play;
    const cur=document.createElement('span');cur.className='vxp-time';cur.textContent='0:00';
    const seek=document.createElement('input');seek.type='range';seek.min=0;seek.max=1000;seek.value=0;seek.className='vxp-seek';seek.setAttribute('aria-label','Seek');
    const dur=document.createElement('span');dur.className='vxp-time';dur.textContent='0:00';
    const mb=document.createElement('button');mb.type='button';mb.className='vxp-btn';mb.setAttribute('aria-label','Mute');mb.innerHTML=I.vol;
    const fb=document.createElement('button');fb.type='button';fb.className='vxp-btn';fb.setAttribute('aria-label','Fullscreen');fb.innerHTML=I.full;
    bar.append(pb,cur,seek,dur,mb,fb);box.append(v,big,bar);
    let hideT,seeking=false,started=false,ok=false;
    const showUI=()=>{box.classList.add('show-ui');clearTimeout(hideT);if(!v.paused&&!seeking)hideT=setTimeout(()=>box.classList.remove('show-ui'),2800);};
    const toggle=()=>{if(v.paused){const p=v.play();p&&p.catch(()=>{});}else v.pause();};
    v.addEventListener('play',()=>{started=true;box.classList.remove('is-paused');box.classList.add('is-started');pb.innerHTML=I.pause;showUI();});
    v.addEventListener('pause',()=>{box.classList.add('is-paused');pb.innerHTML=I.play;clearTimeout(hideT);box.classList.add('show-ui');});
    v.addEventListener('ended',()=>{box.classList.add('show-ui');});
    v.addEventListener('loadedmetadata',()=>{ok=true;dur.textContent=fmt(v.duration);});
    v.addEventListener('timeupdate',()=>{if(!seeking&&v.duration)seek.value=v.currentTime/v.duration*1000;cur.textContent=fmt(v.currentTime);});
    v.addEventListener('error',()=>{if(!started&&onFail)onFail();});
    if(onFail)setTimeout(()=>{if(!ok&&!started&&v.readyState===0)onFail();},12000);
    // Tap on the video: paused -> play; playing -> hide/show controls.
    v.addEventListener('click',()=>{if(v.paused){toggle();}else if(box.classList.contains('show-ui')){clearTimeout(hideT);box.classList.remove('show-ui');}else showUI();});
    big.addEventListener('click',e=>{e.stopPropagation();toggle();});
    pb.addEventListener('click',e=>{e.stopPropagation();toggle();showUI();});
    bar.addEventListener('click',e=>e.stopPropagation());
    seek.addEventListener('input',()=>{seeking=true;if(v.duration)v.currentTime=seek.value/1000*v.duration;});
    seek.addEventListener('change',()=>{seeking=false;showUI();});
    mb.addEventListener('click',()=>{v.muted=!v.muted;mb.innerHTML=v.muted?I.mute:I.vol;showUI();});
    fb.addEventListener('click',()=>{const el=box;if(document.fullscreenElement||document.webkitFullscreenElement){(document.exitFullscreen||document.webkitExitFullscreen).call(document);}else if(el.requestFullscreen){el.requestFullscreen().catch(()=>{});}else if(v.webkitEnterFullscreen){v.webkitEnterFullscreen();}showUI();});
    box.addEventListener('mousemove',()=>{if(!v.paused)showUI();});
    return box;
  };
})();
