import React, { useState } from 'react';

// Interface para o protocolo de jejum
interface FastingProtocol {
  hours: number;
  eating: number;
  name: string;
}

// Props para o componente ProtocolModal
interface ProtocolModalProps {
  currentProtocol: FastingProtocol; // Protocolo atualmente ativo
  onClose: () => void; // Função para fechar o modal
  onConfirm: (protocol: FastingProtocol) => void; // Função para confirmar a seleção
}

// Lista de protocolos de jejum disponíveis
const protocols: FastingProtocol[] = [
  { hours: 16, eating: 8, name: "16:8 Iniciante" },
  { hours: 18, eating: 6, name: "18:6 Intermediário" },
  { hours: 20, eating: 4, name: "20:4 Avançado" },
  { hours: 23, eating: 1, name: "OMAD Especialista" },
  // O protocolo "Personalizado" pode ser adicionado em uma etapa futura, se necessário.
];

const ProtocolModal: React.FC<ProtocolModalProps> = ({ currentProtocol, onClose, onConfirm }) => {
  const [selectedProtocol, setSelectedProtocol] = useState<FastingProtocol>(currentProtocol);

  // Lida com a seleção de um protocolo
  const handleSelect = (protocol: FastingProtocol) => {
    setSelectedProtocol(protocol);
  };

  // Lida com a confirmação do protocolo selecionado
  const handleConfirm = () => {
    onConfirm(selectedProtocol);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="protocol-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Selecionar Protocolo</h2>
        <div className="protocol-options-list">
          {protocols.map((protocol) => (
            <div
              key={protocol.name}
              className={`protocol-option ${selectedProtocol.name === protocol.name ? 'active' : ''}`}
              onClick={() => handleSelect(protocol)}
            >
              <span>{protocol.name}</span>
              {protocol.name === "16:8 Iniciante" && <span className="protocol-badge">⭐</span>}
              {protocol.name === "OMAD Especialista" && <span className="protocol-badge">🔥</span>}
            </div>
          ))}
        </div>
        <button className="modal-confirm-button" onClick={handleConfirm}>
          Confirmar
        </button>
      </div>
    </div>
  );
};

export default ProtocolModal;
