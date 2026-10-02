package com.kage.shadowfall;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.app.AlertDialog;
import androidx.webkit.WebViewAssetLoader;
import java.io.ByteArrayInputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/** Bundled game. No browser intents, web server or internet permission. */
public final class MainActivity extends Activity {
 private static final String START = "https://appassets.androidplatform.net/assets/game/index.html";
 private static final int IMPORT = 41, EXPORT = 42;
 private WebView game;
 private ValueCallback<Uri[]> fileCallback;
 private String pendingExport;
 public WebView getGameView() { return game; }
 private boolean local(Uri url) { return "https".equals(url.getScheme()) && "appassets.androidplatform.net".equals(url.getHost()) && url.getPath()!=null && url.getPath().startsWith("/assets/game/"); }
 @SuppressLint("SetJavaScriptEnabled")
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
  game = new WebView(this); game.setId(View.generateViewId()); setContentView(game);
  WebSettings settings=game.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);
  settings.setAllowFileAccess(false);settings.setAllowContentAccess(true);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  settings.setBlockNetworkLoads(true);settings.setMediaPlaybackRequiresUserGesture(true);settings.setSupportMultipleWindows(false);
  WebViewAssetLoader loader=new WebViewAssetLoader.Builder().addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this)).build();
  game.setWebViewClient(new WebViewClient(){
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
    if(local(request.getUrl())){WebResourceResponse resource=loader.shouldInterceptRequest(request.getUrl());if(resource!=null)return resource;}
    return new WebResourceResponse("text/plain","UTF-8",403,"Blocked",null,new ByteArrayInputStream(new byte[0]));
   }
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){return !local(request.getUrl());}
   @Override public void onPageFinished(WebView view,String url){immersive();}
  });
  game.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
    if(fileCallback!=null)fileCallback.onReceiveValue(null);fileCallback=callback;
    Intent pick=new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/json");
    try{startActivityForResult(pick,IMPORT);}catch(Exception e){callback.onReceiveValue(null);fileCallback=null;Toast.makeText(MainActivity.this,"No file picker available",Toast.LENGTH_LONG).show();}return true;
   }
   @Override public boolean onJsConfirm(WebView view,String url,String message,JsResult result){new AlertDialog.Builder(MainActivity.this).setMessage(message).setPositiveButton("Continue",(d,w)->result.confirm()).setNegativeButton("Cancel",(d,w)->result.cancel()).setOnCancelListener(d->result.cancel()).show();return true;}
  });
  game.addJavascriptInterface(new SaveFiles(),"KageAndroid");
  if(Build.VERSION.SDK_INT>=33)getOnBackInvokedDispatcher().registerOnBackInvokedCallback(android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT,this::pauseGame);
  game.loadUrl(START);immersive();
 }
 private void immersive(){getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_LAYOUT_STABLE|View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);}
 private void pauseGame(){if(game!=null)game.evaluateJavascript("window.pauseCombat?.();window.saveKageNow?.();",null);}
 @Override public void onBackPressed(){pauseGame();}
 @Override protected void onPause(){pauseGame();if(game!=null)game.onPause();super.onPause();}
 @Override protected void onResume(){super.onResume();if(game!=null)game.onResume();immersive();}
 @Override public void onWindowFocusChanged(boolean focus){super.onWindowFocusChanged(focus);if(focus)immersive();}
 public final class SaveFiles {
  @JavascriptInterface public void exportSave(String json){if(json==null||json.length()>4*1024*1024)return;runOnUiThread(()->{if(!local(Uri.parse(game.getUrl()))||pendingExport!=null)return;pendingExport=json;Intent out=new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/json").putExtra(Intent.EXTRA_TITLE,"Kage-character.json");try{startActivityForResult(out,EXPORT);}catch(Exception e){pendingExport=null;Toast.makeText(MainActivity.this,"Could not open file picker",Toast.LENGTH_LONG).show();}});}
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);
  if(request==IMPORT&&fileCallback!=null){fileCallback.onReceiveValue(result==RESULT_OK&&data!=null&&data.getData()!=null?new Uri[]{data.getData()}:null);fileCallback=null;}
  if(request==EXPORT){String json=pendingExport;pendingExport=null;if(result==RESULT_OK&&data!=null&&data.getData()!=null&&json!=null){Uri uri=data.getData();new Thread(()->{try(OutputStream out=getContentResolver().openOutputStream(uri)){if(out==null)throw new IllegalStateException();out.write(json.getBytes(StandardCharsets.UTF_8));runOnUiThread(()->Toast.makeText(this,"Character backup exported",Toast.LENGTH_SHORT).show());}catch(Exception e){runOnUiThread(()->Toast.makeText(this,"Export failed. Your device save is unchanged.",Toast.LENGTH_LONG).show());}}).start();}}
 }
 @Override protected void onDestroy(){if(fileCallback!=null)fileCallback.onReceiveValue(null);if(game!=null){game.removeJavascriptInterface("KageAndroid");game.destroy();game=null;}super.onDestroy();}
}
