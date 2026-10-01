export function guardedFrame(step,onError,schedule){
 let failed=false;
 function frame(time){if(failed)return;try{step(time);}catch(error){failed=true;onError(error);return;}schedule(frame);}
 return frame;
}
