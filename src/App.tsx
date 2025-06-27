import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Play, 
  Pause, 
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Send,
  Eye,
  Heart,
  Share2,
  DollarSign,
  Globe,
  Zap,
  Shield,
  Award,
  Activity
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import CreatorDiscovery from './components/CreatorDiscovery';
import CampaignManager from './components/CampaignManager';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import AIAssistant from './components/AIAssistant';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [botStatus, setBotStatus] = useState('stopped');
  const [campaignStats, setCampaignStats] = useState({
    totalInvites: 1247,
    responseRate: 23.4,
    activeCollaborations: 18,
    totalRevenue: 12450
  });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'discovery', label: 'Creator Discovery', icon: Search },
    { id: 'campaigns', label: 'Campaign Manager', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const toggleBot = () => {
    setBotStatus(botStatus === 'running' ? 'stopped' : 'running');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard campaignStats={campaignStats} botStatus={botStatus} />;
      case 'discovery':
        return <CreatorDiscovery />;
      case 'campaigns':
        return <CampaignManager />;
      case 'analytics':
        return <Analytics />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard campaignStats={campaignStats} botStatus={botStatus} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Digi4u Creator Bot</h1>
                  <p className="text-sm text-gray-500">TikTok Affiliate Outreach Platform</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${botStatus === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  Bot {botStatus === 'running' ? 'Running' : 'Stopped'}
                </span>
              </div>
              
              <button
                onClick={toggleBot}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  botStatus === 'running'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {botStatus === 'running' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Stop Bot</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Bot</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Invites</span>
                <span className="text-sm font-semibold text-gray-900">{campaignStats.totalInvites.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span className="text-sm font-semibold text-green-600">{campaignStats.responseRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Collabs</span>
                <span className="text-sm font-semibold text-blue-600">{campaignStats.activeCollaborations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="text-sm font-semibold text-purple-600">£{campaignStats.totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;