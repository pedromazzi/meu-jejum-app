import React, { useState, useEffect } from 'react';

const NotificationTest = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [swStatus, setSwStatus] = useState('checking...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    setLogs(prev => [...prev, log]);
    console.log(log);
  };

  useEffect(() => {
    // Informações do ambiente ao carregar
    addLog(`URL: ${window.location.href}`, 'info');
    addLog(`Protocol: ${window.location.protocol}`, 'info');
    addLog(`HTTPS: ${window.location.protocol === 'https:' ? 'SIM ✅' : 'NÃO ❌'}`, window.location.protocol === 'https:' ? 'success' : 'error');
    addLog(`User Agent: ${navigator.userAgent}`, 'info');
    addLog(`Notification API: ${'Notification' in window ? 'Suportada ✅' : 'Não suportada ❌'}`, 'Notification' in window ? 'success' : 'error');
    addLog(`Service Worker: ${'serviceWorker' in navigator ? 'Suportado ✅' : 'Não suportado ❌'}`, 'serviceWorker' in navigator ? 'success' : 'error');
    
    checkServiceWorker();
  }, []);

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const state = registration.active?.state || 'unknown';
        setSwStatus(`Active (${state}) ✅`);
        addLog(`Service Worker: ${state}`, 'success');
      } catch (error: any) {
        setSwStatus('Error ❌');
        addLog(`Erro ao verificar SW: ${error.message}`, 'error');
      }
    } else {
      setSwStatus('Not Supported ❌');
      addLog('Service Worker não suportado', 'error');
    }
  };

  const requestPermission = async () => {
    addLog('Solicitando permissão...', 'info');
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      addLog(`Permissão: ${result}`, result === 'granted' ? 'success' : 'error');
    } catch (error: any) {
      addLog(`Erro ao solicitar permissão: ${error.message}`, 'error');
    }
  };

  const testImmediateNotification = async () => {
    addLog('=== TESTE IMEDIATO INICIADO ===', 'info');
    
    // 1. Verificar suporte
    if (!('Notification' in window)) {
      addLog('❌ Notification API não suportada', 'error');
      return;
    }
    addLog('✅ Notification API suportada', 'success');
    
    // 2. Verificar permissão
    addLog(`Permissão atual: ${Notification.permission}`, 'info');
    if (Notification.permission !== 'granted') {
      addLog('⚠️ Solicitando permissão...', 'info');
      const result = await Notification.requestPermission();
      setPermission(result);
      addLog(`Resultado: ${result}`, result === 'granted' ? 'success' : 'error');
      if (result !== 'granted') {
        addLog('❌ Permissão negada', 'error');
        return;
      }
    }
    addLog('✅ Permissão concedida', 'success');
    
    // 3. Verificar Service Worker
    if (!('serviceWorker' in navigator)) {
      addLog('❌ Service Worker não suportado', 'error');
      return;
    }
    addLog('✅ Service Worker suportado', 'success');
    
    try {
      addLog('⏳ Aguardando Service Worker...', 'info');
      const registration = await navigator.serviceWorker.ready;
      addLog(`✅ Service Worker pronto! Estado: ${registration.active?.state}`, 'success');
      
      // 4. Enviar notificação
      addLog('📤 Enviando notificação via SW...', 'info');
      await registration.showNotification('🧪 Teste Imediato', {
        body: 'Se você viu isso, notificação via SW funcionou! ✅',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test-immediate',
        requireInteraction: false,
      });
      addLog('✅✅✅ NOTIFICAÇÃO ENVIADA COM SUCESSO! ✅✅✅', 'success');
      
    } catch (error: any) {
      addLog(`❌ ERRO: ${error.message}`, 'error');
      addLog(`Stack: ${error.stack}`, 'error');
      console.error('Erro completo:', error);
    }
  };

  const testDelayedWaterNotification = async () => {
    if (Notification.permission !== 'granted') {
      addLog('❌ Permissão não concedida', 'error');
      await requestPermission();
      return;
    }

    addLog('💧 Lembrete de água agendado para 10 segundos...', 'info');
    addLog('⏰ FECHE O APP AGORA e aguarde!', 'info');

    setTimeout(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        await registration.showNotification('💧 Hora de beber água!', {
          body: 'Hidrate-se! Já bebeu água?',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'test-water',
          requireInteraction: true,
        });
        
        addLog('✅ Notificação de água enviada!', 'success');
      } catch (error: any) {
        addLog(`❌ Erro: ${error.message}`, 'error');
      }
    }, 10000);
  };

  const testFastingNotification = async () => {
    if (Notification.permission !== 'granted') {
      addLog('❌ Permissão não concedida', 'error');
      await requestPermission();
      return;
    }

    addLog('⏰ Notificação de jejum agendada para 10 segundos...', 'info');
    addLog('⏰ FECHE O APP AGORA e aguarde!', 'info');

    setTimeout(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        await registration.showNotification('⏰ Jejum 50%!', {
          body: 'Você está na metade do jejum! Continue firme! 💪',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'test-fasting',
          requireInteraction: true,
        });
        
        addLog('✅ Notificação de jejum enviada!', 'success');
      } catch (error: any) {
        addLog(`❌ Erro: ${error.message}`, 'error');
      }
    }, 10000);
  };

  const testWithoutSW = async () => {
    addLog('=== TESTE SEM SERVICE WORKER ===', 'info');
    
    if (Notification.permission !== 'granted') {
      addLog('⚠️ Solicitando permissão...', 'info');
      await requestPermission();
      return;
    }
    
    try {
      addLog('📤 Enviando notificação direta (sem SW)...', 'info');
      new Notification('🧪 Teste Direto', {
        body: 'Notificação SEM Service Worker',
        icon: '/icon-192.png',
      });
      addLog('✅ Notificação direta enviada!', 'success');
    } catch (error: any) {
      addLog(`❌ Erro: ${error.message}`, 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs limpos', 'info');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🧪 Teste de Notificações</h1>
      
      {/* Status */}
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>📊 Status do Sistema</h3>
        <p><strong>Permissão:</strong> <span style={{ color: permission === 'granted' ? 'green' : 'red' }}>{permission}</span></p>
        <p><strong>Service Worker:</strong> {swStatus}</p>
        <p><strong>URL:</strong> {window.location.href}</p>
        <p><strong>HTTPS:</strong> {window.location.protocol === 'https:' ? '✅ Sim' : '❌ Não'}</p>
        {permission !== 'granted' && (
          <button 
            onClick={requestPermission} 
            style={{ 
              marginTop: '10px', 
              padding: '10px 20px', 
              background: '#00ff9d', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔔 Solicitar Permissão
          </button>
        )}
      </div>

      {/* Botões de Teste */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={testImmediateNotification}
          style={{ padding: '15px', fontSize: '16px', cursor: 'pointer', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
        >
          ⚡ Testar Notificação Imediata (COM SW)
        </button>
        
        <button 
          onClick={testWithoutSW}
          style={{ padding: '15px', fontSize: '16px', cursor: 'pointer', background: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
        >
          🔔 Testar Notificação Direta (SEM SW)
        </button>
        
        <button 
          onClick={testDelayedWaterNotification}
          style={{ padding: '15px', fontSize: '16px', cursor: 'pointer', background: '#00bcd4', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
        >
          💧 Simular Lembrete de Água (10s)
        </button>
        
        <button 
          onClick={testFastingNotification}
          style={{ padding: '15px', fontSize: '16px', cursor: 'pointer', background: '#ff9800', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
        >
          ⏰ Simular 50% Jejum (10s)
        </button>
        
        <button 
          onClick={checkServiceWorker}
          style={{ padding: '15px', fontSize: '16px', cursor: 'pointer', background: '#9c27b0', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
        >
          🔄 Verificar Service Worker
        </button>
      </div>

      {/* Logs */}
      <div style={{ background: '#1a1a1a', color: '#00ff00', padding: '15px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', maxHeight: '400px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ color: '#00ff00', margin: 0 }}>📝 Logs em Tempo Real</h3>
          <button 
            onClick={clearLogs}
            style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer', background: '#ff5722', color: 'white', border: 'none', borderRadius: '3px' }}
          >
            🗑️ Limpar
          </button>
        </div>
        {logs.length === 0 ? (
          <p style={{ color: '#888' }}>Nenhum log ainda... Clique nos botões acima para testar!</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} style={{ 
              color: log.includes('ERROR') ? '#ff5252' : log.includes('SUCCESS') ? '#00ff00' : '#ffffff',
              marginBottom: '5px',
              lineHeight: '1.5'
            }}>
              {log}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '8px', fontSize: '14px' }}>
        <strong>⚠️ INSTRUÇÕES DE TESTE:</strong>
        <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>Primeiro, conceda permissão de notificação</li>
          <li>Teste "Notificação Imediata" - deve aparecer AGORA</li>
          <li>Teste "Notificação Direta" - deve aparecer AGORA (sem SW)</li>
          <li>Para testes com delay: clique no botão, FECHE O APP, aguarde 10 segundos</li>
          <li>Android: funciona 100% | iOS: muito limitado | Desktop: parcial</li>
          <li>Mantenha os logs abertos para ver erros</li>
        </ol>
      </div>
    </div>
  );
};

export default NotificationTest;
