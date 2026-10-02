package com.kage.shadowfall;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.SystemClock;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import org.junit.Test;
import org.junit.runner.RunWith;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class OfflineGameTest {
 private String js(ActivityScenario<MainActivity> app,String code) throws Exception {
  CountDownLatch latch=new CountDownLatch(1);AtomicReference<String> value=new AtomicReference<>();
  app.onActivity(a->a.getGameView().evaluateJavascript(code,result->{value.set(result);latch.countDown();}));
  assertTrue("JavaScript responded: "+code,latch.await(60,TimeUnit.SECONDS));return value.get();
 }
 private void until(ActivityScenario<MainActivity> app,String expression) throws Exception {
  long end=SystemClock.elapsedRealtime()+120000;
  while(SystemClock.elapsedRealtime()<end){if("true".equals(js(app,"Boolean("+expression+")")))return;SystemClock.sleep(300);}
  fail("Timed out: "+expression+"; page="+js(app,"document.body.innerText.slice(-2000)"));
 }
 @Test public void bundledGameCreatesSavesReloadsAndPausesWithoutNetwork() throws Exception {
  try(ActivityScenario<MainActivity> app=ActivityScenario.launch(MainActivity.class)){
   app.onActivity(a->{assertEquals(PackageManager.PERMISSION_DENIED,a.checkSelfPermission(Manifest.permission.INTERNET));assertTrue(a.getGameView().getUrl().startsWith("https://appassets.androidplatform.net/assets/game/"));});
   until(app,"document.querySelector('#createCharacter')");
   js(app,"document.querySelector('#characterName').value='OfflineTest';document.querySelector('#createCharacter').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));");
   until(app,"window.combatSnapshot?.().running");
   assertEquals("false",js(app,"document.body.innerText.includes('Game paused after an error')"));
   js(app,"window.dispatchEvent(new KeyboardEvent('keydown',{key:'j',code:'KeyJ',bubbles:true}));");SystemClock.sleep(800);
   js(app,"window.dispatchEvent(new KeyboardEvent('keyup',{key:'j',code:'KeyJ',bubbles:true}));window.saveKageNow().then(()=>window.testSaved=true);");
   until(app,"window.testSaved");
   app.onActivity(MainActivity::onBackPressed);until(app,"window.combatSnapshot?.().running===false");
   js(app,"location.reload()");until(app,"document.querySelector('[data-character]')");
   assertEquals("true",js(app,"document.body.innerText.includes('OfflineTest')"));
   js(app,"document.querySelector('[data-character]').click()");until(app,"window.combatSnapshot?.().running");
   assertEquals("false",js(app,"document.body.innerText.includes('Game paused after an error')"));
  }
 }
}
