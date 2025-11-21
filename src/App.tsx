import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider } from './context/AppContext';
import Jejum from './pages/Jejum';
import Agua from './pages/Agua';
import Progresso from './pages/Progresso';
import Conquistas from './pages/Conquistas';
import Aprender from './pages/Aprender';
import NotFound from './pages/NotFound';
import NotificationTest from './pages/NotificationTest';
import BottomNav from './components/BottomNav';
import Onboarding from './components/Onboarding';
import InstallBanner from './components/InstallBanner';

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
            <Route path="/notification-test" element={<NotificationTest />} />
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
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
