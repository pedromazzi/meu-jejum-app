import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Protocol {
  hours: number;
  eating: number;
  name: string;
}

interface ProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProtocol: Protocol;
  onSave: (protocol: Protocol) => void;
}

const ProtocolModal: React.FC<ProtocolModalProps> = ({
  isOpen,
  onClose,
  currentProtocol,
  onSave,
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState(currentProtocol.name);

  const protocols: Protocol[] = [
    { hours: 16, eating: 8, name: '16:8' },
    { hours: 18, eating: 6, name: '18:6' },
    { hours: 20, eating: 4, name: '20:4' },
    { hours: 23, eating: 1, name: 'OMAD' },
  ];

  const handleSave = () => {
    const protocol = protocols.find(p => p.name === selectedProtocol);
    if (protocol) {
      onSave(protocol);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Escolha seu Protocolo</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="protocol-options">
            {protocols.map((protocol) => (
              <div
                key={protocol.name}
                className={`protocol-option ${selectedProtocol === protocol.name ? 'selected' : ''}`}
                onClick={() => setSelectedProtocol(protocol.name)}
              >
                <div className="protocol-option-header">
                  <span className="protocol-name">{protocol.name}</span>
                  {selectedProtocol === protocol.name && (
                    <span className="protocol-checkmark">✓</span>
                  )}
                </div>
                <p className="protocol-description">
                  {protocol.hours}h jejum / {protocol.eating}h alimentação
                </p>
              </div>
            ))}
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

export default ProtocolModal;
