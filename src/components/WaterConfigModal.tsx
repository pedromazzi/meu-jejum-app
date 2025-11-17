import React, { useState } from 'react';
import { X } from 'lucide-react';

interface WaterConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: number;
  currentCupSize: number;
  onSave: (goal: number, cupSize: number) => void;
}

const WaterConfigModal: React.FC<WaterConfigModalProps> = ({
  isOpen,
  onClose,
  currentGoal,
  currentCupSize,
  onSave,
}) => {
  const [goal, setGoal] = useState(currentGoal);
  const [cupSize, setCupSize] = useState(currentCupSize);

  const goalOptions = [1500, 2000, 2500, 3000, 3500];
  const cupSizeOptions = [200, 250, 300, 350, 400, 500];

  const handleSave = () => {
    onSave(goal, cupSize);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Configurar Água</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="config-section">
            <label className="config-label">Meta Diária (ml)</label>
            <div className="config-options">
              {goalOptions.map((option) => (
                <button
                  key={option}
                  className={`config-option ${goal === option ? 'selected' : ''}`}
                  onClick={() => setGoal(option)}
                >
                  {option}ml ({(option / 1000).toFixed(1)}L)
                </button>
              ))}
            </div>
            <input
              type="number"
              className="config-input"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              min="500"
              max="5000"
              step="100"
            />
          </div>

          <div className="config-section">
            <label className="config-label">Tamanho do Copo (ml)</label>
            <div className="config-options">
              {cupSizeOptions.map((option) => (
                <button
                  key={option}
                  className={`config-option ${cupSize === option ? 'selected' : ''}`}
                  onClick={() => setCupSize(option)}
                >
                  {option}ml
                </button>
              ))}
            </div>
            <input
              type="number"
              className="config-input"
              value={cupSize}
              onChange={(e) => setCupSize(Number(e.target.value))}
              min="100"
              max="1000"
              step="50"
            />
          </div>
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

export default WaterConfigModal;
