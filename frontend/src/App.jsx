import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import SettingsModal from './components/SettingsModal';
import FAQModal from './components/FAQModal';
import { getSessions, createSession, deleteSession, updateSession, getHistory, sendMessage } from './services/api';

function App() {
  // State
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  // Settings State with localStorage persistence
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('chatbot-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
    return {
      botName: 'Time Series Agent',
      botDescription: 'Your AI assistant for time series data analysis.',
      logoUrl: '',
      contactLink: ''
    };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatbot-settings', JSON.stringify(settings));
  }, [settings]);

  // Initial Load
  useEffect(() => {
    loadSessions();
  }, []);

  // Load History when Session Changes
  useEffect(() => {
    if (currentSessionId) {
      loadHistory(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  const loadSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
      if (data.length > 0 && !currentSessionId) {
        setCurrentSessionId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadHistory = async (sessionId) => {
    try {
      const history = await getHistory(sessionId);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleNewSession = async () => {
    try {
      const newSession = await createSession(`Chat ${sessions.length + 1}`);
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(newSession.id);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleRenameSession = async (id, newName) => {
    try {
      await updateSession(id, newName);
      setSessions(sessions.map(s => s.id === id ? { ...s, name: newName } : s));
    } catch (error) {
      console.error('Failed to rename session:', error);
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await deleteSession(id);
      const newSessions = sessions.filter(s => s.id !== id);
      setSessions(newSessions);
      if (currentSessionId === id) {
        setCurrentSessionId(newSessions.length > 0 ? newSessions[0].id : null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleSendMessage = async (text) => {
    if (!currentSessionId) {
      // Create session first if none exists
      try {
        const newSession = await createSession(`Chat ${sessions.length + 1}`);
        setSessions([newSession, ...sessions]);
        setCurrentSessionId(newSession.id);
        // Continue to send message with new ID
        await sendToBackend(newSession.id, text);
      } catch (error) {
        console.error('Error creating initial session:', error);
      }
    } else {
      await sendToBackend(currentSessionId, text);
    }
  };

  const sendToBackend = async (sessionId, text) => {
    // Optimistic Update
    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString(), ocs_data: null };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await sendMessage(sessionId, text);
      // Replace messages with fresh history from server to ensure sync
      setMessages(response.history);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Error: Could not connect to the backend service. Please ensure both backend services are running (port 8000 and 8002).',
        timestamp: new Date().toISOString(),
        ocs_data: null
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!messages || messages.length === 0) {
      alert('No messages to export. Start a conversation first!');
      return;
    }
    const chatText = messages.map(m => `[${m.role.toUpperCase()}] ${m.timestamp}: ${m.content}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${currentSessionId || 'new'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFAQ={() => setIsFAQOpen(true)}
      />

      <div className="flex-1 flex flex-col h-full">
        <Header
          botName={settings.botName}
          botDescription={settings.botDescription}
          logoUrl={settings.logoUrl}
          onExport={handleExport}
        />

        <ChatArea
          messages={messages}
          loading={loading}
          botLogo={settings.logoUrl}
        />

        <InputArea
          onSendMessage={handleSendMessage}
          disabled={loading}
        />
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />

      <FAQModal
        isOpen={isFAQOpen}
        onClose={() => setIsFAQOpen(false)}
      />
    </div>
  );
}

export default App;
