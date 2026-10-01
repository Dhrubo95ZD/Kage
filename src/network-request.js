// Bound both connection and body reads; keep the caller's pending save batch for retry.
export async function gameRequest(path,body,{fetcher=fetch,timeoutMs=12000}={}){
 const controller=new AbortController();let timer;
 const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('Connection timed out. Your pending actions are kept. Tap Retry Save to reconnect.'));},timeoutMs);});
 try{return await Promise.race([timeout,(async()=>{const response=await fetcher('/api/'+path,{method:body?'POST':'GET',credentials:'same-origin',signal:controller.signal,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const result=await response.json();if(!response.ok)throw Object.assign(new Error(result.error||'Account service is unavailable'),{status:response.status});return result;})()]);}finally{clearTimeout(timer);}
}
