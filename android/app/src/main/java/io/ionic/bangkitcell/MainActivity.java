package io.ionic.bangkitcell;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import androidx.core.view.WindowCompat;

import io.ionic.bangkitcell.plugins.BluetoothNativePlugin;
import io.ionic.bangkitcell.plugins.SystemUiNativePlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BluetoothNativePlugin.class);
        registerPlugin(SystemUiNativePlugin.class);
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}
