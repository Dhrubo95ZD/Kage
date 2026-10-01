// Android hardware/browser Back should pause an active expedition, not navigate away.
export function createBackPauseGuard(win,onPause,isStarted,isRunning){
 let armed=false;
 const pushSentinel=()=>win.history.pushState({kagePauseGuard:true},'');
 const arm=()=>{if(armed)return;pushSentinel();armed=true;};
 const onPop=()=>{if(!armed||!isStarted())return;pushSentinel();if(isRunning())onPause();};
 win.addEventListener('popstate',onPop);
 return {arm,dispose(){win.removeEventListener('popstate',onPop);armed=false;}};
}
