import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Settings, Droplet, Download } from 'lucide-react'; // Importar Download icon
import CircularProgress from '../components/CircularProgress';
import ProtocolModal from '../components/ProtocolModal';
import NotificationsModal from '../components/NotificationsModal'; // Importar o modal de notificações
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '../utils/toast'; // Importar para notificações
import { isAppInstalled, isSafariBrowser } from '../utils/pwa'; // Importar utilitários PWA

// Define tipos para melhor segurança de tipo
interface FastingProtocol {
  hours: number;
  eating: number;
  name: string;
}

// Interface para o registro de jejum no histórico (importado do AppContext)
interface FastRecord {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // em horas
  goal: number; // meta em horas
  completed: boolean; // atingiu meta?
  protocol: string; // nome do protocolo
}

// Função para obter o número de pessoas jejuando com base na hora do dia
const getFastingCommunityCount = () => {
  const hour = new Date().getHours();
  
  let min, max;
  if (hour >= 6 && hour < 9) {
    min = 800; max = 1500;
  } else if (hour >= 9 && hour < 12) {
    min = 1200; max = 2000;
  } else if (hour >= 12 && hour < 14) {
    min = 600; max = 1000;
  } else if (hour >= 14 && hour < 18) {
    min = 1500; max = 2500;
  } else { // 22h-06h
    min = 2500; max = 4000;
  }
  
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const Jejum = () => {
  const {
    appData,
    fastStartTime,
    setFastStartTime,
    updateFastingProtocol,
    addFastEntry,
    getWaterProgressPercentage,
    getCurrentStreak, // Necessário para a mensagem de sucesso
    sendFastingNotification, // Nova função para enviar notificações de jejum
    sendWaterNotification, // Nova função para enviar notificações de água
    notificationSettings, // Configurações de notificação
    deferredPrompt, // PWA
    platform, // PWA
    setDeferredPrompt, // PWA
  } = useApp();

  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showProtocolModal, setShowProtocolModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false); // Estado para o modal de notificações
  const [communityCount, setCommunityCount] = useState<number>(getFastingCommunityCount());
  const [fastCompletedGoal, setFastCompletedGoal] = useState<boolean>(false); // Novo estado para controlar se a meta foi atingida
  const [showInstallButton, setShowInstallButton] = useState(false); // Estado para o botão de instalação permanente

  // Refs para controlar se as notificações de progresso já foram enviadas
  const halfwayNotifiedRef = useRef(false);
  const threeQuartersNotifiedRef = useRef(false);
  const lowWaterAlertNotifiedRef = useRef(false); // Para alerta de pouca água durante o jejum

  const navigate = useNavigate();

  const { fastingProtocol, waterData } = appData;

  const isFasting = fastStartTime !== null && fastStartTime > 0;
  const fastDurationMs = fastingProtocol.hours * 60 * 60 * 1000;

  // Efeito para controlar a visibilidade do botão de instalação
  useEffect(() => {
    // Só mostra o botão se o app não estiver instalado e houver um prompt ou for iOS Safari
    if (!isAppInstalled() && (deferredPrompt || (platform === 'ios' && isSafariBrowser()))) {
      setShowInstallButton(true);
    } else {
      setShowInstallButton(false);
    }
  }, [deferredPrompt, platform]);

  // Efeito do timer e notificações de progresso
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isFasting) {
      interval = setInterval(() => {
        const currentElapsedTime = Date.now() - fastStartTime!;
        setElapsedTime(currentElapsedTime);

        const elapsedHours = currentElapsedTime / (1000 * 60 * 60);
        const totalHours = fastingProtocol.hours;

        // Notificação de 50%
        if (elapsedHours >= totalHours * 0.5 && !halfwayNotifiedRef.current) {
          const remainingMs = fastDurationMs - currentElapsedTime;
          const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
          const remainingMinutes = Math.round((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          sendFastingNotification('progress50', { remaining: `${remainingHours}h ${remainingMinutes}m` });
          halfwayNotifiedRef.current = true;
        }

        // Notificação de 75%
        if (elapsedHours >= totalHours * 0.75 && !threeQuartersNotifiedRef.current) {
          const remainingMs = fastDurationMs - currentElapsedTime;
          const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
          const remainingMinutes = Math.round((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          sendFastingNotification('progress75', { remaining: `${remainingHours}h ${remainingMinutes}m` });
          threeQuartersNotifiedRef.current = true;
        }

        // Alerta de pouca água durante o jejum
        if (notificationSettings.water.lowWaterAlert && !lowWaterAlertNotifiedRef.current &&
            elapsedHours >= 2 && // Apenas após 2h de jejum
            waterData.consumed < waterData.goal * 0.3 && // Menos de 30% da meta de água
            waterData.goal > 0 // Para evitar divisão por zero
        ) {
          sendWaterNotification('lowWater');
          lowWaterAlertNotifiedRef.current = true; // Notificar apenas uma vez
        }

      }, 1000);
    } else {
      setElapsedTime(0);
      // Resetar refs de notificação de progresso quando o jejum não está ativo
      halfwayNotifiedRef.current = false;
      threeQuartersNotifiedRef.current = false;
      lowWaterAlertNotifiedRef.current = false;
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isFasting, fastStartTime, fastDurationMs, fastingProtocol.hours, sendFastingNotification, sendWaterNotification, notificationSettings.water.lowWaterAlert, waterData.consumed, waterData.goal]);

  // Efeito para atualizar o contador da comunidade a cada 2 minutos
  useEffect(() => {
    const updateCount = () => {
      setCommunityCount(getFastingCommunityCount());
    };

    updateCount();
    const interval = setInterval(updateCount, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Calcula o horário de término do jejum
  const calculateEndTime = useCallback(() => {
    if (!fastStartTime) return null;
    const endTimeMs = fastStartTime + fastDurationMs;
    const endDate = new Date(endTimeMs);
    return endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }, [fastStartTime, fastDurationMs]);

  // Função central para finalizar e salvar o jejum
  const completeFastAndSave = useCallback((isGoalMet: boolean) => {
    if (!fastStartTime) return;

    const endTime = Date.now();
    const durationMs = endTime - fastStartTime;
    const durationHours = durationMs / (1000 * 60 * 60);

    const fastRecord: FastRecord = {
      id: fastStartTime.toString(),
      startTime: fastStartTime,
      endTime: endTime,
      duration: parseFloat(durationHours.toFixed(1)),
      goal: fastingProtocol.hours,
      completed: isGoalMet, // Define se o jejum foi completado ou não
      protocol: fastingProtocol.name,
    };

    addFastEntry(fastRecord); // Adicionar ao histórico via AppContext
    setFastStartTime(null); // Resetar o jejum atual
    setElapsedTime(0); // Resetar tempo decorrido
    setFastCompletedGoal(false); // Resetar estado de meta completa

    // 🗑️ Jejum removido do localStorage
    console.log('🗑️ Jejum removido do localStorage (via setFastStartTime(null))');

    // Enviar notificação de jejum completo
    if (isGoalMet) {
      sendFastingNotification('completed');
    }
    
    // Resetar refs de notificação de progresso
    halfwayNotifiedRef.current = false;
    threeQuartersNotifiedRef.current = false;
    lowWaterAlertNotifiedRef.current = false;

    if (isGoalMet) {
      const currentStreak = getCurrentStreak(); // Obter a sequência atualizada
      showSuccess(`🎉 Parabéns! Você completou seu jejum de ${fastingProtocol.hours}h!\n\n🔥 Sequência: ${currentStreak} ${currentStreak === 1 ? 'dia' : 'dias'}`);
    }
  }, [fastStartTime, fastingProtocol, addFastEntry, getCurrentStreak, setFastStartTime, sendFastingNotification]);

  // Efeito para verificar automaticamente a conclusão do jejum
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isFasting && !fastCompletedGoal) {
      const checkCompletion = () => {
        const now = Date.now();
        const elapsedHours = (now - fastStartTime!) / (1000 * 60 * 60);

        if (elapsedHours >= fastingProtocol.hours) {
          setFastCompletedGoal(true); // Marca que a meta foi atingida
          completeFastAndSave(true); // Salva automaticamente como completo
        }
      };

      // Verifica imediatamente ao montar/atualizar
      checkCompletion();

      // Verifica a cada minuto
      interval = setInterval(checkCompletion, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFasting, fastStartTime, fastingProtocol.hours, fastCompletedGoal, completeFastAndSave]);

  // Inicia o jejum
  const handleStartFast = () => {
    // 🔥 INICIANDO JEJUM
    console.log('🔥 INICIANDO JEJUM: Chamando setFastStartTime com Date.now()');
    setFastStartTime(Date.now()); // Isso aciona o useEffect em AppContext para salvar
    setFastCompletedGoal(false); // Garante que o estado de meta completa seja falso ao iniciar
    sendFastingNotification('started'); // Enviar notificação de jejum iniciado
  };

  // Termina o jejum (chamado pelo botão)
  const handleEndFast = () => {
    if (!fastStartTime) return;

    const now = Date.now();
    const elapsedHours = (now - fastStartTime) / (1000 * 60 * 60);

    if (elapsedHours >= fastingProtocol.hours) {
      // Se já completou a meta (ou clicou após a auto-conclusão)
      console.log('🛑 TERMINANDO JEJUM: Meta atingida, salvando como completo.');
      completeFastAndSave(true);
    } else {
      // Se não completou a meta, pede confirmação
      const hours = Math.floor(elapsedHours);
      const minutes = Math.round((elapsedHours - hours) * 60);

      const confirmed = window.confirm(
        `Você jejuou ${hours}h ${minutes}min de ${fastingProtocol.hours}h.\n\nDeseja realmente terminar o jejum agora?`
      );

      if (confirmed) {
        console.log('🛑 TERMINANDO JEJUM: Usuário confirmou término antecipado, salvando como incompleto.');
        completeFastAndSave(false); // Salva como incompleto
      } else {
        console.log('🛑 TERMINANDO JEJUM: Usuário cancelou o término, jejum continua.');
      }
      // Se não confirmado, o jejum continua
    }
  };

  // Abre o modal de seleção de protocolo
  const handleOpenProtocolModal = () => {
    setShowProtocolModal(true);
  };

  // Confirma o protocolo selecionado no modal
  const handleConfirmProtocol = (protocol: FastingProtocol) => {
    updateFastingProtocol(protocol);
    setShowProtocolModal(false);
  };

  // Lida com o clique no botão de instalação permanente
  const handleInstallClick = async () => {
    if (platform === 'android' || platform === 'desktop') {
      if (!deferredPrompt) return;
      
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} instalar`);
      
      if (outcome === 'accepted') {
        setShowInstallButton(false); // Esconder botão após instalação
      }
      
      setDeferredPrompt(null); // Limpar o prompt após uso
    } else if (platform === 'ios') {
      // Para iOS, redirecionar para a página de instruções
      navigate('/aprender#instalacao-pwa');
    }
  };

  // Calcula a porcentagem de progresso para o círculo
  const progressPercentage = isFasting ? Math.min(100, (elapsedTime / fastDurationMs) * 100) : 0;

  // Dados de água do contexto
  const waterDrank = waterData.consumed;
  const waterGoal = waterData.goal;
  const waterProgressPercentage = getWaterProgressPercentage();

  return (
    <div className="page-container jejum-page">
      <div className="jejum-header">
        <h1 className="jejum-title">MeuJejum</h1>
        <div className="header-icons">
          {showInstallButton && (
            <button 
              className="install-header-button"
              onClick={handleInstallClick}
              aria-label="Instalar app"
              title={platform === 'ios' ? 'Ver como instalar' : 'Instalar na tela inicial'}
            >
              <Download size={24} />
            </button>
          )}
          <button 
            className="icon-button-visuals"
            onClick={() => setShowNotificationsModal(true)}
            aria-label="Configurar notificações"
          >
            <Bell size={24} />
          </button>
        </div>
      </div>

      <div className="protocol-card" onClick={handleOpenProtocolModal}>
        <div>
          <span className="protocol-label">Protocolo Atual</span>
          <p className="protocol-name">{fastingProtocol.name} {fastingProtocol.name === "16:8 Iniciante" && "⭐"}</p>
        </div>
        <button 
          className="icon-button-visuals"
          onClick={handleOpenProtocolModal}
          aria-label="Configurar protocolo de jejum"
        >
          <Settings size={20} />
        </button>
      </div>

      <CircularProgress 
        progress={isFasting ? Math.min(100, (elapsedTime / fastDurationMs) * 100) : 0}
        duration={fastDurationMs}
        elapsedTime={elapsedTime}
        endTime={isFasting ? new Date(fastStartTime + fastDurationMs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null}
        isFasting={isFasting}
      />

      <p className="community-counter">🔥 {communityCount.toLocaleString('pt-BR')} jejuando agora</p>

      <button
        className={`main-action-button ${isFasting ? 'destructive' : ''}`}
        onClick={isFasting ? handleEndFast : handleStartFast}
      >
        {isFasting ? 'TERMINAR JEJUM' : 'INICIAR JEJUM'}
      </button>

      <div className="water-card" onClick={() => navigate('/agua')}>
        <div className="water-card-header">
          <Droplet size={20} className="water-icon" />
          <span className="water-label">Água Hoje</span>
        </div>
        <p className="water-progress-text">{waterDrank / 1000}L / {waterGoal / 1000}L ({Math.round(waterProgressPercentage)}%)</p>
        <div className="water-progress-bar-container">
          <div
            className="water-progress-bar"
            style={{ width: `${waterProgressPercentage}%` }}
          ></div>
        </div>
      </div>

      {showProtocolModal && (
        <ProtocolModal
          currentProtocol={fastingProtocol}
          onClose={() => setShowProtocolModal(false)}
          onConfirm={handleConfirmProtocol}
        />
      )}

      {showNotificationsModal && (
        <NotificationsModal
          isOpen={showNotificationsModal}
          onClose={() => setShowNotificationsModal(false)}
        />
      )}
    </div>
  );
};

export default Jejum;