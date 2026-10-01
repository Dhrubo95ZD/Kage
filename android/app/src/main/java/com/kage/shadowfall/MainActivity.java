package com.kage.shadowfall;
import android.app.Activity;
import android.os.Bundle;
import android.net.Uri;
import android.widget.Button;
import androidx.browser.customtabs.CustomTabsIntent;
/** Online prototype shell. Browser-managed sign-in shares the device's secure session. */
public final class MainActivity extends Activity {
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  Button play=new Button(this);play.setText("PLAY KAGE ONLINE");
  play.setOnClickListener(v -> new CustomTabsIntent.Builder().setShowTitle(false).build()
   .launchUrl(this, Uri.parse("https://kage-shadowfall.ashd95.chatgpt.site")));
  setContentView(play);
 }
}
