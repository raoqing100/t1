import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { getThemeMode, setThemeMode } from './styles/theme';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import ChatRoom from './pages/ChatRoom';
import AgentConfig from './components/AgentConfig';
import AccountSettings from './pages/AccountSettings';
import './styles/App.css';

// 智能体配置的包装组件，用于处理导航
function AgentConfigWrapper({ configuredAgents, setConfiguredAgents }) {
  const navigate = useNavigate();
  
  const handleAgentsConfigured = (agents) => {
    setConfiguredAgents(agents);
    console.log('智能体配置完成:', agents);
    // 导航到聊天室
    navigate('/chat');
  };
  
  return <AgentConfig onAgentsConfigured={handleAgentsConfigured} />;
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(getThemeMode() === 'dark');
  const [configuredAgents, setConfiguredAgents] = useState([]);
  
  // 切换主题
  const toggleTheme = () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setThemeMode(newMode);
    setIsDarkMode(!isDarkMode);
  };
  
  return (
    <Router>
      <div className={`app ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <NavBar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<ChatRoom agents={configuredAgents} />} />
            <Route path="/config" element={
              <AgentConfigWrapper 
                configuredAgents={configuredAgents}
                setConfiguredAgents={setConfiguredAgents}
              />
            } />
            <Route path="/account" element={<AccountSettings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;