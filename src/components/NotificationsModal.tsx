import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  requestNotificationPermission, 
  scheduleWaterNotifications,
  scheduleDailyReminder 
} from '../utils/notifications';
import { registerPushNotifications, scheduleWaterReminder } from '../utils/pushNotifications';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const { notificationSettings, updateNotificationSettings } = useApp();
  
  const [settings, setSettings] = useState(notificationSettings);
  
  useEffect(() => {
    if (isOpen && notificationSettings) {
      setSettings(notificationSettings);
    }
  }, [notificationSettings, isOpen]);
  
  const handleToggle = (category: 'fasting' | 'water', key: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }));
  };
  
  const handleValueChange = (category: 'fasting' | 'water', key: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };
  
  const handleSave = async () => {
    const permission = await requestNotificationPermission();
    
    if (permission !== 'granted') {
      alert('Permissão de notificações negada. Ative nas configurações do navegador para receber alertas.');
      return;
    }
    
    // Registrar push notifications primeiro
    console.log('🔔 Registrando Web Push Notifications...');
    const subscription = await registerPushNotifications();
    
    if (!subscription) {
      console.warn('⚠️ Push notifications não registradas, usando fallback local');
      // Continuar mesmo sem push, usar notificações locais como fallback
    } else {
      console.log('✅ Push notifications registradas com sucesso!');
      
      // Se lembretes de água ativos, agendar no backend
      if (settings.water.enabled) {
        await scheduleWaterReminder(settings.water.interval);
      }
    }
    
    // Salvar configurações
    updateNotificationSettings(settings);
    
    // Agendar notificações de água via Service Worker (fallback local)
    scheduleWaterNotifications({
      enabled: settings.water.enabled,
      interval: settings.water.interval,
      startTime: settings.water.startTime,
      endTime: settings.water.endTime
    });
    
    // Agendar lembrete diário via Service Worker
    scheduleDailyReminder({
      dailyReminder: settings.fasting.dailyReminder,
      reminderTime: settings.fasting.reminderTime
    });
    
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="notifications-modal" onClick={e => e.stopPropagation()}>
        
        {/* Header do modal */}
        <div className="modal-header">
          <h2>🔔 Notificações</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        {/* Body do modal com scroll */}
        <div className="modal-body">
          
          {/* Seção Jejum */}
          <div className="notification-section">
            <h3 className="section-title">Notificações de Jejum</h3>
            
            <div className="notification-options">
              <label className="notification-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.fasting.started}
                  onChange={() => handleToggle('fasting', 'started')}
                />
                <span className="toggle-label">Jejum iniciado</span>
              </label>
              
              <label className="notification-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.fasting.halfway}
                  onChange={() => handleToggle('fasting', 'halfway')}
                />
                <span className="toggle-label">50% do jejum</span>
              </label>
              
              <label className="notification-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.fasting.threeQuarters}
                  onChange={() => handleToggle('fasting', 'threeQuarters')}
                />
                <span className="toggle-label">75% do jejum</span>
              </label>
              
              <label className="notification-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.fasting.completed}
                  onChange={() => handleToggle('fasting', 'completed')}
                />
                <span className="toggle-label">Jejum completo</span>
              </label>
              
              <label className="notification-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.fasting.dailyReminder}
                  onChange={() => handleToggle('fasting', 'dailyReminder')}
                />
                <span className="toggle-label">Lembrete diário</span>
              </label>
              
              {settings.fasting.dailyReminder && (
                <div className="time-input-group">
                  <span className="input-label">📅 Todo dia às</span>
                  <input 
                    type="time" 
                    className="time-input"
                    value={settings.fasting.reminderTime}
                    onChange={(e) => handleValueChange('fasting', 'reminderTime', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Seção Água */}
          <div className="notification-section">
            <h3 className="section-title">Notificações de Água</h3>
            
            <div className="notification-options">
              <label className="notification-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.water.enabled}
                  onChange={() => handleToggle('water', 'enabled')}
                />
                <span className="toggle-label">Lembretes de água</span>
              </label>
              
              {settings.water.enabled && (
                <>
                  <div className="time-input-group">
                    <span className="input-label">⏰ A cada</span>
                    <select 
                      className="select-input"
                      value={settings.water.interval}
                      onChange={(e) => handleValueChange('water', 'interval', parseInt(e.target.value))}
                    >
                      <option value="60">1 hora</option>
                      <option value="120">2 horas</option>
                      <option value="180">3 horas</option>
                    </select>
                  </div>
                  
                  <div className="time-range-group">
                    <span className="input-label">Horário:</span>
                    <div className="time-range-inputs">
                      <input 
                        type="time" 
                        className="time-input"
                        value={settings.water.startTime}
                        onChange={(e) => handleValueChange('water', 'startTime', e.target.value)}
                      />
                      <span>até</span>
                      <input 
                        type="time" 
                        className="time-input"
                        value={settings.water.endTime}
                        onChange={(e) => handleValueChange('water', 'endTime', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
              
              <label className="notification-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.water.goalReached}
                  onChange={() => handleToggle('water', 'goalReached')}
                />
                <span className="toggle-label">Meta de água atingida</span>
              </label>
              
              <label className="notification-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.water.lowWaterAlert}
                  onChange={() => handleToggle('water', 'lowWaterAlert')}
                />
                <span className="toggle-label">Alerta de pouca água no jejum</span>
              </label>
            </div>
          </div>
          
        </div>
        
        {/* Footer com botão */}
        <div className="modal-footer">
          <button className="btn-save" onClick={handleSave}>
            SALVAR CONFIGURAÇÕES
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default NotificationsModal;
