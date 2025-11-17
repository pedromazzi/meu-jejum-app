import React, { useState, useEffect } from 'react';

interface WaterConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: number;
  currentCupSize: number;
  onSave: (newGoal: number, newCupSize: number) => void;
}

const predefinedGoals = [1500, 2000, 2500, 3000, 4000]; // em ml
const predefinedCupSizes = [200, 250, 500, 700]; // em ml

const WaterConfigModal: React.FC<WaterConfigModalProps> = ({
  isOpen,
  onClose,
  currentGoal,
  currentCupSize,
  onSave,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<number>(currentGoal);
  const [customGoal, setCustomGoal] = useState<string>('');
  const [selectedCupSize, setSelectedCupSize] = useState<number>(currentCupSize);
  const [customCupSize, setCustomCupSize] = useState<string>('');

  useEffect(() => {
    setSelectedGoal(currentGoal);
    setCustomGoal('');
    setSelectedCupSize(currentCupSize);
    setCustomCupSize('');
  }, [currentGoal, currentCupSize, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    let finalGoal = selectedGoal;
    if (customGoal) {
      const parsedCustomGoal = parseFloat(customGoal) * 1000; // Converter Litros para ml
      if (!isNaN(parsedCustomGoal) && parsedCustomGoal > 0) {
        finalGoal = parsedCustomGoal;
      }
    }

    let finalCupSize = selectedCupSize;
    if (customCupSize) {
      const parsedCustomCupSize = parseInt(customCupSize);
      if (!isNaN(parsedCustomCupSize) && parsedCustomCupSize > 0) {
        finalCupSize = parsedCustomCupSize;
      }
    }

    onSave(finalGoal, finalCupSize);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="water-config-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Configurações de Hidratação</h2>

        <div className="config-section">
          <h3 className="config-section-title">Meta Diária</h3>
          <div className="radio-group">
            {predefinedGoals.map((goal) => (
              <button
                key={goal}
                className={`radio-button ${selectedGoal === goal && !customGoal ? 'active' : ''}`}
                onClick={() => { setSelectedGoal(goal); setCustomGoal(''); }}
              >
                {(goal / 1000).toFixed(1)}L
              </button>
            ))}
          </div>
          <div className="custom-input-group">
            <input
              type="number"
              placeholder="Custom"
              value={customGoal}
              onChange={(e) => {
                setCustomGoal(e.target.value);
                setSelectedGoal(0); // Desseleciona os botões predefinidos
              }}
              className="custom-input"
            />
            <span className="custom-input-unit">L</span>
          </div>
        </div>

        <div className="config-section">
          <h3 className="config-section-title">Tamanho do Copo</h3>
          <div className="radio-group">
            {predefinedCupSizes.map((size) => (
              <button
                key={size}
                className={`radio-button ${selectedCupSize === size && !customCupSize ? 'active' : ''}`}
                onClick={() => { setSelectedCupSize(size); setCustomCupSize(''); }}
              >
                {size}ml
              </button>
            ))}
          </div>
          <div className="custom-input-group">
            <input
              type="number"
              placeholder="Custom"
              value={customCupSize}
              onChange={(e) => {
                setCustomCupSize(e.target.value);
                setSelectedCupSize(0); // Desseleciona os botões predefinidos
              }}
              className="custom-input"
            />
            <span className="custom-input-unit">ml</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-cancel-button" onClick={onClose}>
            CANCELAR
          </button>
          <button className="modal-confirm-button" onClick={handleSave}>
            SALVAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaterConfigModal;
