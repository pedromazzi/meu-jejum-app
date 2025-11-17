import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { isAppInstalled, isSafariBrowser } from '../utils/pwa';
import { Download, X } from 'lucide-react'; // Ícones para o banner

const InstallBanner = () => {
  const { deferredPrompt, platform, setDeferredPrompt } = useApp();
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    // Não mostrar se já está instalado ou se o usuário já dispensou
    const bannerDismissed = localStorage.getItem('installBannerDismissed');
    if (isAppInstalled() || bannerDismissed) {
      setShowBanner(false);
      return;
    }

    // Mostrar o banner após 3 segundos se houver um prompt disponível (Android/Desktop)
    // ou se for iOS (onde não há prompt, mas queremos mostrar as instruções)
    if (deferredPrompt || (platform === 'ios' && isSafariBrowser())) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000); // Atraso para não ser intrusivo
      return () => clearTimeout(timer);
    }
  }, [deferredPrompt, platform]);

  const handleInstall = async () => {
    if (platform === 'android' || platform === 'desktop') {
      if (!deferredPrompt) return;
      
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} instalar`);
      
      if (outcome === 'accepted') {
        setShowBanner(false);
        localStorage.setItem('installBannerDismissed', 'true');
      }
      
      setDeferredPrompt(null); // Limpar o prompt após uso
    } else if (platform === 'ios') {
      // Para iOS, redirecionar para a página de instruções
      setShowBanner(false);
      localStorage.setItem('installBannerDismissed', 'true'); // Dispensar o banner
      window.location.href = '/aprender#instalacao-pwa'; // Redirecionar para a seção de instruções
    }
  };
  
  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('installBannerDismissed', 'true');
  };
  
  if (!showBanner) return null;
  
  return (
    <div className="install-banner">
      <button className="install-banner-close" onClick={handleDismiss}>
        <X size={20} />
      </button>
      
      <div className="install-banner-content">
        <div className="install-banner-icon">
          <Download size={32} />
        </div>
        <div className="install-banner-text">
          <h3>Instale o MeuJejum!</h3>
          <p>
            {platform === 'ios' 
              ? 'Adicione à tela inicial para usar como app' 
              : 'Acesse mais rápido e receba notificações'}
          </p>
        </div>
      </div>
      
      <button className="install-banner-button" onClick={handleInstall}>
        {platform === 'ios' ? 'Ver como instalar' : 'Instalar agora'}
      </button>
    </div>
  );
};

export default InstallBanner;