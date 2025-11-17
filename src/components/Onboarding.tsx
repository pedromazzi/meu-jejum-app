import React, { useState, useEffect } from 'react';
import { defaultAppData } from '../utils/localStorage'; // Importar defaultAppData para consistência

// Ícones SVG profissionais
const ClockIcon = ({ size = 80, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const TimerIcon = ({ size = 32, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8"/>
    <path d="M12 9v4l2 2"/>
    <path d="m5 3 14 0"/>
    <path d="m12 3 0 2"/>
  </svg>
);

const WaterDropIcon = ({ size = 80, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
  </svg>
);

const WaterDropsIcon = ({ size = 32, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
    <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>
  </svg>
);

const ChartIcon = ({ size = 32, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const TargetIcon = ({ size = 32, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const ZapIcon = ({ size = 20, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const ArrowRightIcon = ({ size = 20, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const ArrowLeftIcon = ({ size = 20, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const AlertIcon = ({ size = 80, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const CheckCircleIcon = ({ size = 20, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false); // Novo estado para o disclaimer
  const [selectedProtocolName, setSelectedProtocolName] = useState('16:8');
  const [selectedWaterGoalValue, setSelectedWaterGoalValue] = useState<number | 'custom'>(2000);
  const [customWaterGoalInput, setCustomWaterGoalInput] = useState('');
  
  // ADICIONAR useEffect para garantir que os estilos sejam aplicados
  useEffect(() => {
    // Forçar scroll no body
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
  }, []);

  const protocols = [
    { 
      name: '16:8', 
      hours: 16, 
      eating: 8,
      label: '16:8 (Iniciante)', 
      description: '16h jejum, 8h alimentação' 
    },
    { 
      name: '18:6', 
      hours: 18, 
      eating: 6,
      label: '18:6 (Intermediário)', 
      description: '18h jejum, 6h alimentação' 
    },
    { 
      name: '20:4', 
      hours: 20, 
      eating: 4,
      label: '20:4 (Avançado)', 
      description: '20h jejum, 4h alimentação' 
    },
    { 
      name: 'OMAD', 
      hours: 23, 
      eating: 1,
      label: 'OMAD (Especialista)', 
      description: 'Uma refeição por dia' 
    }
  ];
  
  const waterGoals = [
    { value: 2000, label: '2.0L (Padrão)' },
    { value: 2500, label: '2.5L' },
    { value: 3000, label: '3.0L' },
    { value: 'custom', label: 'Personalizado' }
  ];
  
  const handleNext = () => {
    // Bloquear avanço do slide 0 se não concordou
    if (currentSlide === 0 && !agreedToDisclaimer) {
      alert('Por favor, leia e concorde com o aviso médico para continuar.');
      return;
    }

    if (currentSlide < 3) { // Agora temos 4 slides (0, 1, 2, 3)
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };
  
  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  
  const handleComplete = () => {
    // Salvar protocolo escolhido
    const selectedProtocolObj = protocols.find(p => p.name === selectedProtocolName);
    const finalProtocol = selectedProtocolObj ? {
      hours: selectedProtocolObj.hours,
      eating: selectedProtocolObj.eating,
      name: selectedProtocolObj.name
    } : defaultAppData.fastingProtocol; // Fallback to default if not found

    // Salvar meta de água
    let finalWaterGoal: number;
    if (selectedWaterGoalValue === 'custom') {
      const parsedCustomGoal = parseFloat(customWaterGoalInput);
      finalWaterGoal = !isNaN(parsedCustomGoal) && parsedCustomGoal > 0 ? parsedCustomGoal * 1000 : 2000; // Default to 2000ml if invalid
    } else {
      finalWaterGoal = selectedWaterGoalValue;
    }

    // Construir o objeto appData inicial para salvar no localStorage
    const initialAppData = {
      ...defaultAppData,
      fastingProtocol: finalProtocol,
      waterData: {
        ...defaultAppData.waterData,
        goal: finalWaterGoal,
        cupSize: 250, // Manter cupSize padrão ou permitir seleção futura
        consumed: 0,
        entries: []
      }
    };

    localStorage.setItem('meujejum_app_data', JSON.stringify(initialAppData));
    localStorage.setItem('onboardingCompleted', 'true');
    
    onComplete();
  };
  
  return (
    <div className="onboarding-overlay">
      <div className="onboarding-container">
        
        {/* BOTÕES NO TOPO */}
        <div className="onboarding-buttons-top">
          {currentSlide > 0 && (
            <button className="btn-onboarding-secondary" onClick={handleBack}>
              <ArrowLeftIcon size={20} />
              <span>VOLTAR</span>
            </button>
          )}
          
          <button 
            className="btn-onboarding-primary"
            onClick={handleNext}
            disabled={currentSlide === 0 && !agreedToDisclaimer}
          >
            <span>{currentSlide === 3 ? 'COMEÇAR' : 'PRÓXIMO'}</span>
            {currentSlide === 3 ? (
              <ZapIcon size={20} />
            ) : (
              <ArrowRightIcon size={20} />
            )}
          </button>
        </div>

        {/* SLIDE INDICATORS ABAIXO DOS BOTÕES */}
        <div className="slide-indicators">
          {[0, 1, 2, 3].map(index => (
            <div 
              key={index}
              className={`slide-dot ${currentSlide === index ? 'active' : ''}`}
            />
          ))}
        </div>
        
        {/* SLIDE 0: Aviso Importante */}
        {currentSlide === 0 && (
          <div className="onboarding-slide fade-in">
            <div className="onboarding-icon disclaimer-icon" style={{ marginBottom: '16px' }}> {/* Reduced margin */}
              <AlertIcon size={64} />
            </div>
            <h2 className="onboarding-title" style={{ fontSize: '24px', marginBottom: '12px' }}>⚠️ Aviso</h2> {/* Reduced font size and margin */}
            {/* Removed: <p className="onboarding-description">Antes de começar, leia atentamente:</p> */}
            
            <div className="disclaimer-content">
              <div className="disclaimer-box" style={{ padding: '14px', marginBottom: '14px' }}> {/* Reduced padding and margin */}
                <p className="disclaimer-text" style={{ marginBottom: '12px' }}> {/* Reduced margin */}
                  ⚠️ Este app é uma ferramenta de acompanhamento e não substitui orientação médica.
                </p>
                
                <div className="disclaimer-list" style={{ gap: '8px', marginBottom: '12px' }}> {/* Reduced gap and margin */}
                  <div className="disclaimer-item">
                    <span className="disclaimer-bullet">•</span>
                    <span>Consulte um médico antes de iniciar jejum intermitente</span>
                  </div>
                  <div className="disclaimer-item">
                    <span className="disclaimer-bullet">•</span>
                    <span>Não recomendado para menores de 18 anos, grávidas ou lactantes</span>
                  </div>
                  <div className="disclaimer-item">
                    <span className="disclaimer-bullet">•</span>
                    <span>Pessoas com condições médicas devem ter acompanhamento profissional</span>
                  </div>
                  {/* Removed: 4th item */}
                </div>
                
                <div className="disclaimer-warning" style={{ padding: '8px' }}> {/* Reduced padding */}
                  <strong>⚕️ Em caso de dúvidas, procure um profissional.</strong>
                </div>
              </div>
              
              <label className="disclaimer-checkbox" style={{ padding: '12px' }}> {/* Reduced padding */}
                <input 
                  type="checkbox"
                  checked={agreedToDisclaimer}
                  onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
                />
                <span>Li e aceito que este app não substitui orientação médica</span> {/* Shortened text */}
              </label>
            </div>
          </div>
        )}

        {/* SLIDE 1: Boas-vindas (antigo slide 0) */}
        {currentSlide === 1 && (
          <div className="onboarding-slide fade-in">
            <div className="onboarding-icon">
              <ClockIcon size={80} />
            </div>
            <h1 className="onboarding-title">Bem-vindo ao<br/>MeuJejum</h1>
            <p className="onboarding-description">
              Seu companheiro para jejum intermitente e hidratação
            </p>
            
            <div className="onboarding-features">
              <div className="feature-item">
                <span className="feature-icon">
                  <TimerIcon size={32} />
                </span>
                <span>Timer de jejum</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">
                  <WaterDropsIcon size={32} />
                </span>
                <span>Tracking de água</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">
                  <ChartIcon size={32} />
                </span>
                <span>Progresso e streak</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">
                  <TargetIcon size={32} />
                </span>
                <span>Conquistas</span>
              </div>
            </div>
          </div>
        )}
        
        {/* SLIDE 2: Protocolo (antigo slide 1) */}
        {currentSlide === 2 && (
          <div className="onboarding-slide fade-in">
            <div className="onboarding-icon">
              <TimerIcon size={80} />
            </div>
            <h2 className="onboarding-title">Seu Protocolo</h2>
            <p className="onboarding-description">
              Escolha seu protocolo de jejum inicial:
            </p>
            
            <div className="protocol-options">
              {protocols.map(protocol => (
                <label 
                  key={protocol.name}
                  className={`protocol-option ${selectedProtocolName === protocol.name ? 'selected' : ''}`}
                >
                  <input 
                    type="radio"
                    name="protocol"
                    value={protocol.name}
                    checked={selectedProtocolName === protocol.name}
                    onChange={() => setSelectedProtocolName(protocol.name)}
                  />
                  <div className="protocol-info">
                    <div className="protocol-label">{protocol.label}</div>
                    <div className="protocol-description">{protocol.description}</div>
                  </div>
                </label>
              ))}
            </div>
            
            <p className="onboarding-hint">
              💡 Você pode mudar depois nas configurações
            </p>
          </div>
        )}
        
        {/* SLIDE 3: Hidratação (antigo slide 2) */}
        {currentSlide === 3 && (
          <div className="onboarding-slide fade-in">
            <div className="onboarding-icon">
              <WaterDropIcon size={80} />
            </div>
            <h2 className="onboarding-title">Hidratação</h2>
            <p className="onboarding-description">
              Qual sua meta diária de água?
            </p>
            
            <div className="water-options">
              {waterGoals.map(goal => (
                <label 
                  key={goal.value}
                  className={`water-option ${selectedWaterGoalValue === goal.value ? 'selected' : ''}`}
                >
                  <input 
                    type="radio"
                    name="water"
                    value={goal.value}
                    checked={selectedWaterGoalValue === goal.value}
                    onChange={() => {
                      setSelectedWaterGoalValue(goal.value as number | "custom");
                      if (goal.value !== 'custom') setCustomWaterGoalInput('');
                    }}
                  />
                  <span>{goal.label}</span>
                </label>
              ))}
              
              {selectedWaterGoalValue === 'custom' && (
                <div className="custom-water-input">
                  <input 
                    type="number"
                    min="0.5"
                    max="5"
                    step="0.5"
                    placeholder="Ex: 2.5"
                    value={customWaterGoalInput}
                    onChange={(e) => setCustomWaterGoalInput(e.target.value)}
                  />
                  <span>litros</span>
                </div>
              )}
            </div>
            
            <p className="onboarding-hint">
              💡 Recomendado: 2-3 litros por dia
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;