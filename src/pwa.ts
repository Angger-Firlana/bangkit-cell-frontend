import { registerSW } from 'virtual:pwa-register';

// Keep it minimal: auto-update the SW in the background.
// For debugging you can attach UI to onNeedRefresh/onOfflineReady.
export const registerPWA = () => {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl: string, r?: ServiceWorkerRegistration) {
      // Best-effort update check every hour (only when browser keeps the page alive).
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000);
      }
    },
  });
};
