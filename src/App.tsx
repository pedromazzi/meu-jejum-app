import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Placeholder components - serão substituídos pelos componentes completos
const Jejum = () => <div className="page-container"><h1 className="page-title">Jejum</h1></div>;
const Agua = () => <div className="page-container"><h1 className="page-title">Água</h1></div>;
const Progresso = () => <div className="page-container"><h1 className="page-title">Progresso</h1></div>;
const Conquistas = () => <div className="page-container"><h1 className="page-title">Conquistas</h1></div>;
const Aprender = () => <div className="page-container"><h1 className="page-title">Aprender</h1></div>;
const NotFound = () => <div className="page-container"><h1 className="page-title">404 - Página não encontrada</h1></div>;
const BottomNav = () => <nav className="bottom-nav">Navigation</nav>;
const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 100);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return <div>Carregando...</div>;
};
const InstallBanner = () => null;

// Componente AppContent para gerenciar a lógica de onboarding e o roteamento principal
const AppContent = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    const completed = localStorage.getItem('onboardingCompleted');
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);
  
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboardingCompleted', 'true');
  };
  
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/jejum" replace />} />
            <Route path="/jejum" element={<Jejum />} />
            <Route path="/agua" element={<Agua />} />
            <Route path="/progresso" element={<Progresso />} />
            <Route path="/conquistas" element={<Conquistas />} />
            <Route path="/aprender" element={<Aprender />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <BottomNav />
        <Toaster />
        <InstallBanner />
      </div>
    </BrowserRouter>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
