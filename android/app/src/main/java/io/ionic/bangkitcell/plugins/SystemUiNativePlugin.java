package io.ionic.bangkitcell.plugins;

import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.Window;
import android.view.WindowInsetsController;
import android.view.WindowManager;

import androidx.core.view.WindowCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SystemUiNative")
public class SystemUiNativePlugin extends Plugin {

    @PluginMethod
    public void setStatusBar(PluginCall call) {
        String backgroundColor = call.getString("backgroundColor");
        String style = call.getString("style"); // "dark" (dark icons) | "light" (light icons)
        Boolean visible = call.getBoolean("visible");
        Boolean overlaysWebView = call.getBoolean("overlaysWebView");

        Window window = getActivity().getWindow();

        // Default: avoid drawing under system bars (prevents header/sidebar going under status bar).
        WindowCompat.setDecorFitsSystemWindows(window, overlaysWebView == null ? true : !overlaysWebView);

        if (backgroundColor != null && !backgroundColor.isEmpty()) {
            try {
                window.setStatusBarColor(Color.parseColor(backgroundColor));
            } catch (IllegalArgumentException e) {
                call.reject("Invalid backgroundColor. Use #RRGGBB or #AARRGGBB.");
                return;
            }
        }

        if (visible != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                if (window.getInsetsController() != null) {
                    if (visible) {
                        window.getInsetsController().show(android.view.WindowInsets.Type.statusBars());
                    } else {
                        window.getInsetsController().hide(android.view.WindowInsets.Type.statusBars());
                    }
                }
            } else {
                if (visible) {
                    window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
                } else {
                    window.addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
                }
            }
        }

        if (style != null) {
            boolean darkIcons = "dark".equalsIgnoreCase(style);
            setLightStatusBarIcons(window, darkIcons);
        }

        call.resolve(new JSObject().put("ok", true));
    }

    private void setLightStatusBarIcons(Window window, boolean darkIcons) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller = window.getInsetsController();
            if (controller == null) return;
            int appearance = darkIcons ? WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS : 0;
            controller.setSystemBarsAppearance(appearance, WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            View decorView = window.getDecorView();
            int flags = decorView.getSystemUiVisibility();
            if (darkIcons) {
                flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            } else {
                flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            }
            decorView.setSystemUiVisibility(flags);
        }
    }
}
