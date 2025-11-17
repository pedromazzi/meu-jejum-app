import React, { useState } from 'react';
import { X, Bell, BellOff } from 'lucide-react';
import { requestNotificationPermission, checkNotificationSupport } from '../utils/notifications';

interface NotificationSettings {
  fasting: {
    started: boolean;
    halfway: boolean;
    threeQuarters: boolean;
    completed: boolean;
    dailyReminder: boolean;
    reminderTime: string;
  };
  water: {
    enabled: boolean;
    interval: number;
    startTime: string;
    endTime: string;
    goalReached: boolean;
    lowWaterAlert: boolean;
  };
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSave: (settings: NotificationSettings) => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);
  const [permissionGranted, setPermissionGranted] = useState(
    checkNotificationSupport() && Notification.permission === 'granted'
  );

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setPermissionGranted(permission === 'granted');
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const updateFastingSetting = (key: keyof NotificationSettings['fasting'], value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      fasting: {
        ...prev.fasting,
        [key]: value,
      },
    }));
  };

  const updateWaterSetting = (key: keyof NotificationSettings['water'], value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      water: {
        ...prev.water,
        [key]: value,
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content notifications-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Notificações</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {!permissionGranted ? (
            <div className="notification-permission">
              <BellOff size={48} className="permission-icon" />
              <p>Ative as notificações para receber lembretes</p>
              <button className="modal-button-primary" onClick={handleRequestPermission}>
                Ativar Notificações
              </button>
            </div>
          ) : (
            <>
              <div className="notification-section">
                <h3 className="notification-section-title">
                  <Bell size={20} /> Jejum
                </h3>
                
                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={localSettings.fasting.started}
                      onChange={(e) => updateFastingSetting('started', e.target.checked)}
                    />
                    <span>Jejum iniciado</span>
                  </label>
                </div>

                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={localSettings.fasting.halfway}
                      onChange={(e) => updateFastingSetting('halfway', e.target.checked)}
                    />
                    <span>50% completo</span>
                  </label>
                </div>

                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={localSettings.fasting.threeQuarters}
                      onChange={(e) => updateFastingSetting('threeQuarters', e.target.checked)}
                    />
                    <span>75% completo</span>
                  </label>
                </div>

                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={localSettings.fasting.completed}
                      onChange={(e) => updateFastingSetting('completed', e.target.checked)}
                    />
                    <span>Jejum concluído</span>
                  </label>
                </div>

                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={localSettings.fasting.dailyReminder}
                      onChange={(e) => updateFastingSetting('dailyReminder', e.target.checked)}
                    />
                    <span>Lembrete diário</span>
                  </label>
                  {localSettings.fasting.dailyReminder && (
                    <input
                      type="time"
                      value={localSettings.fasting.reminderTime}
                      onChange={(e) => updateFastingSetting('reminderTime', e.target.value)}
                      className="time-input"
                    />
                  )}
                </div>
              </div>

              <div className="notification-section">
                <h3 className="notification-section-title">
                  <Bell size={20} /> Água
                </h3>

                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={localSettings.water.enabled}
                      onChange={(e) => updateWaterSetting('enabled', e.target.checked)}
                    />
                    <span>Lembretes de hidratação</span>
                  </label>
                </div>

                {localSettings.water.enabled && (
                  <>
                    <div className="notification-item">
                      <label>
                        <span>Intervalo (minutos)</span>
                        <input
                          type="number"
                          value={localSettings.water.interval}
                          onChange={(e) => updateWaterSetting('interval', Number(e.target.value))}
                          min="30"
                          max="300"
                          step="30"
                          className="number-input"
                        />
                      </label>
                    </div>

                    <div className="notification-item">
                      <label>
                        <span>Hora inicial</span>
                        <input
                          type="time"
                          value={localSettings.water.startTime}
                          onChange={(e) => updateWaterSetting('startTime', e.target.value)}
                          className="time-input"
                        />
                      </label>
                    </div>

                    <div className="notification-item">
                      <label>
                        <span>Hora final</span>
                        <input
                          type="time"
                          value={localSettings.water.endTime}
                          onChange={(e) => updateWaterSetting('endTime', e.target.value)}
                          className="time-input"
                        />
                      </label>
                    </div>
                  </>
                )}

                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={localSettings.water.goalReached}
                      onChange={(e) => updateWaterSetting('goalReached', e.target.checked)}
                    />
                    <span>Meta diária atingida</span>
                  </label>
                </div>

                <div className="notification-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={localSettings.water.lowWaterAlert}
                      onChange={(e) => updateWaterSetting('lowWaterAlert', e.target.checked)}
                    />
                    <span>Alerta de pouca água</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-button-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-button-primary" onClick={handleSave}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
