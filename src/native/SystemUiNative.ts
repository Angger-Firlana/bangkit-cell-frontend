import { registerPlugin } from '@capacitor/core';

export type StatusBarStyle = 'dark' | 'light';

export interface SetStatusBarOptions {
  backgroundColor?: string; // #RRGGBB | #AARRGGBB
  style?: StatusBarStyle; // "dark" -> dark icons, "light" -> light icons
  visible?: boolean;
  overlaysWebView?: boolean;
}

export interface SystemUiNativePlugin {
  setStatusBar(options: SetStatusBarOptions): Promise<{ ok: boolean }>;
}

export const SystemUiNative = registerPlugin<SystemUiNativePlugin>('SystemUiNative');
