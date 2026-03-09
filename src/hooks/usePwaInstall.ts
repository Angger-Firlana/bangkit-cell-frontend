import { useCallback, useEffect, useMemo, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const isStandalone = () => {
  const mql = window.matchMedia?.('(display-mode: standalone)');
  const iosStandalone = (navigator as any).standalone === true;
  return Boolean(mql?.matches || iosStandalone);
};

export const usePwaInstall = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => (typeof window !== 'undefined' ? isStandalone() : false));
  const [lastOutcome, setLastOutcome] = useState<'accepted' | 'dismissed' | null>(null);

  useEffect(() => {
    const onBip = (e: Event) => {
      // Chrome fires this when install criteria is met.
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBip as any);
    window.addEventListener('appinstalled', onInstalled);

    const t = setInterval(() => setInstalled(isStandalone()), 1500);
    return () => {
      clearInterval(t);
      window.removeEventListener('beforeinstallprompt', onBip as any);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const canInstall = useMemo(() => Boolean(deferred) && !installed, [deferred, installed]);

  const install = useCallback(async () => {
    if (!deferred) return null;
    await deferred.prompt();
    const choice = await deferred.userChoice.catch(() => null);
    if (choice?.outcome) setLastOutcome(choice.outcome);
    setDeferred(null);
    return choice;
  }, [deferred]);

  return { canInstall, installed, install, lastOutcome };
};

