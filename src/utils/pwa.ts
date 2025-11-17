// Utilitários para PWA

export const getPlatform = (): 'ios' | 'android' | 'desktop' | 'other' => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }
  
  if (/android/.test(userAgent)) {
    return 'android';
  }
  
  if (/win|mac|linux/.test(userAgent)) {
    return 'desktop';
  }
  
  return 'other';
};

export const isAppInstalled = (): boolean => {
  // Verifica se o app está rodando em modo standalone (instalado)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Verifica no iOS
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  return false;
};

export const isSafariBrowser = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /safari/.test(userAgent) && !/chrome/.test(userAgent);
};

export const canInstallPWA = (): boolean => {
  // Verifica se o navegador suporta instalação de PWA
  return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
};
