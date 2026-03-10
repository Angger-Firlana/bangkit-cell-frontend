package io.ionic.bangkitcell.plugins;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Intent;
import android.os.Build;
import android.net.Uri;
import android.provider.Settings;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(
    name = "BluetoothNative",
    permissions = {
        @Permission(
            alias = BluetoothNativePlugin.PERMISSION_BLUETOOTH_CONNECT,
            strings = { Manifest.permission.BLUETOOTH_CONNECT }
        ),
        @Permission(
            alias = BluetoothNativePlugin.PERMISSION_BLUETOOTH_SCAN,
            strings = { Manifest.permission.BLUETOOTH_SCAN }
        )
    }
)
public class BluetoothNativePlugin extends Plugin {

    static final String PERMISSION_BLUETOOTH_CONNECT = "bluetoothConnect";
    static final String PERMISSION_BLUETOOTH_SCAN = "bluetoothScan";

    private static final String DEFAULT_SPP_UUID = "00001101-0000-1000-8000-00805F9B34FB";

    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    private BluetoothSocket socket;
    private OutputStream outputStream;
    private String connectedAddress;

    @PluginMethod
    public void isSupported(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("supported", BluetoothAdapter.getDefaultAdapter() != null);
        call.resolve(ret);
    }

    @PluginMethod
    public void isEnabled(PluginCall call) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null) {
            call.resolve(new JSObject().put("enabled", false));
            return;
        }
        call.resolve(new JSObject().put("enabled", adapter.isEnabled()));
    }

    @PluginMethod
    public void requestEnable(PluginCall call) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null) {
            call.reject("Bluetooth not supported on this device.");
            return;
        }
        if (adapter.isEnabled()) {
            call.resolve(new JSObject().put("enabled", true));
            return;
        }

        Intent enableIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
        startActivityForResult(call, enableIntent, "enableResult");
    }

    @PluginMethod
    public void openAppSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        Uri uri = Uri.fromParts("package", getContext().getPackageName(), null);
        intent.setData(uri);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve(new JSObject().put("opened", true));
    }

    @ActivityCallback
    private void enableResult(PluginCall call, ActivityResult result) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        boolean enabled = adapter != null && adapter.isEnabled();
        call.resolve(new JSObject().put("enabled", enabled));
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            call.resolve(new JSObject().put("granted", true));
            return;
        }

        boolean connectGranted = getPermissionState(PERMISSION_BLUETOOTH_CONNECT) == PermissionState.GRANTED;
        boolean scanGranted = getPermissionState(PERMISSION_BLUETOOTH_SCAN) == PermissionState.GRANTED;
        if (connectGranted && scanGranted) {
            call.resolve(new JSObject().put("granted", true).put("scanGranted", true));
            return;
        }

        requestPermissionForAliases(
            new String[] { PERMISSION_BLUETOOTH_CONNECT, PERMISSION_BLUETOOTH_SCAN },
            call,
            "permissionsCallback"
        );
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            call.resolve(new JSObject().put("granted", true).put("scanGranted", true));
            return;
        }

        boolean connectGranted = getPermissionState(PERMISSION_BLUETOOTH_CONNECT) == PermissionState.GRANTED;
        boolean scanGranted = getPermissionState(PERMISSION_BLUETOOTH_SCAN) == PermissionState.GRANTED;
        call.resolve(new JSObject().put("granted", connectGranted).put("scanGranted", scanGranted));
    }

    @PluginMethod
    public void listBondedDevices(PluginCall call) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null) {
            call.reject("Bluetooth not supported on this device.");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
            getPermissionState(PERMISSION_BLUETOOTH_CONNECT) != PermissionState.GRANTED
        ) {
            call.reject("Missing BLUETOOTH_CONNECT permission.");
            return;
        }

        JSArray devices = new JSArray();
        Set<BluetoothDevice> bondedDevices = adapter.getBondedDevices();
        if (bondedDevices != null) {
            for (BluetoothDevice device : bondedDevices) {
                JSObject d = new JSObject();
                d.put("name", device.getName());
                d.put("address", device.getAddress());
                devices.put(d);
            }
        }

        call.resolve(new JSObject().put("devices", devices));
    }

    @PluginMethod
    public void getConnection(PluginCall call) {
        JSObject ret = new JSObject();
        synchronized (this) {
            ret.put("connected", socket != null && socket.isConnected());
            ret.put("address", connectedAddress);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void connect(PluginCall call) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null) {
            call.reject("Bluetooth not supported on this device.");
            return;
        }
        if (!adapter.isEnabled()) {
            call.reject("Bluetooth is disabled.");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
            getPermissionState(PERMISSION_BLUETOOTH_CONNECT) != PermissionState.GRANTED
        ) {
            call.reject("Missing BLUETOOTH_CONNECT permission.");
            return;
        }

        String address = call.getString("address");
        String uuidString = call.getString("uuid", DEFAULT_SPP_UUID);
        boolean insecure = call.getBoolean("insecure", false);

        if (address == null || address.isEmpty()) {
            call.reject("Missing device address.");
            return;
        }

        notifyConnectionState("connecting", null, address);

        executor.execute(() -> {
            try {
                BluetoothDevice device = adapter.getRemoteDevice(address);
                UUID uuid = UUID.fromString(uuidString);
                BluetoothSocket newSocket = insecure
                    ? device.createInsecureRfcommSocketToServiceRecord(uuid)
                    : device.createRfcommSocketToServiceRecord(uuid);

                try {
                    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S ||
                        getPermissionState(PERMISSION_BLUETOOTH_SCAN) == PermissionState.GRANTED
                    ) {
                        adapter.cancelDiscovery();
                    }
                } catch (SecurityException ignored) {}
                newSocket.connect();

                OutputStream os = newSocket.getOutputStream();

                synchronized (BluetoothNativePlugin.this) {
                    closeQuietly();
                    socket = newSocket;
                    outputStream = os;
                    connectedAddress = address;
                }

                notifyConnectionState("connected", null, address);
                getBridge().executeOnMainThread(() ->
                    call.resolve(new JSObject().put("connected", true).put("address", address))
                );
            } catch (Exception e) {
                synchronized (BluetoothNativePlugin.this) {
                    closeQuietly();
                    connectedAddress = null;
                }
                notifyConnectionState("error", e.getMessage(), address);
                getBridge().executeOnMainThread(() ->
                    call.reject("Failed to connect: " + e.getMessage(), e)
                );
            }
        });
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        String address;
        synchronized (this) {
            address = connectedAddress;
            closeQuietly();
            connectedAddress = null;
        }
        notifyConnectionState("disconnected", null, address);
        call.resolve(new JSObject().put("disconnected", true));
    }

    @PluginMethod
    public void write(PluginCall call) {
        String data = call.getString("data");
        String encoding = call.getString("encoding", "utf8");
        if (data == null) {
            call.reject("Missing data.");
            return;
        }

        OutputStream os;
        synchronized (this) {
            os = outputStream;
        }
        if (os == null) {
            call.reject("Not connected.");
            return;
        }

        byte[] bytes;
        try {
            if ("base64".equalsIgnoreCase(encoding)) {
                bytes = android.util.Base64.decode(data, android.util.Base64.DEFAULT);
            } else {
                bytes = data.getBytes(StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            call.reject("Invalid data/encoding: " + e.getMessage(), e);
            return;
        }

        executor.execute(() -> {
            try {
                os.write(bytes);
                os.flush();
                getBridge().executeOnMainThread(() ->
                    call.resolve(new JSObject().put("bytesWritten", bytes.length))
                );
            } catch (IOException e) {
                notifyConnectionState("error", e.getMessage(), connectedAddress);
                getBridge().executeOnMainThread(() ->
                    call.reject("Write failed: " + e.getMessage(), e)
                );
            }
        });
    }

    private void notifyConnectionState(String state, String message, String address) {
        JSObject payload = new JSObject();
        payload.put("state", state);
        if (message != null) payload.put("message", message);
        if (address != null) payload.put("address", address);
        getBridge().executeOnMainThread(() ->
            notifyListeners("connectionState", payload)
        );
    }

    private void closeQuietly() {
        if (outputStream != null) {
            try {
                outputStream.close();
            } catch (Exception ignored) {}
            outputStream = null;
        }
        if (socket != null) {
            try {
                socket.close();
            } catch (Exception ignored) {}
            socket = null;
        }
    }
}
