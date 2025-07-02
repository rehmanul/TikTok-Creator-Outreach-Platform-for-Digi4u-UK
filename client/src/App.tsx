import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings as SettingsIcon, 
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
  Activity,
  LogOut
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import CreatorDiscovery from './components/CreatorDiscovery';
import CampaignManager from './components/CampaignManager';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import AIAssistant from './components/AIAssistant';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [campaignStats, setCampaignStats] = useState({
    totalInvites: 0,
    responseRate: 0,
    activeCollaborations: 0,
    totalRevenue: 0
  });
  const [botStatus, setBotStatus] = useState('inactive');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tiktokConnected = urlParams.get('tiktok_connected');
    const tiktokError = urlParams.get('tiktok_error');
    
    if (tiktokConnected === 'true') {
      console.log('TikTok authentication successful');
      setTiktokConnected(true);
      setIsAuthenticated(true);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    
    
    if (tiktokError) {
      console.error('TikTok authentication error:', tiktokError);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      let errorMessage = 'TikTok authentication failed. Please try again.';
      
      switch (tiktokError) {
        case 'code_expired':
          errorMessage = 'Authorization code expired. Please try authenticating again.';
          break;
        case 'validation_failed':
          errorMessage = 'TikTok connection validation failed. Please authenticate again.';
        case 'auth_failed':
          errorMessage = 'TikTok authentication failed. Please check your credentials.';
          break;
        case 'invalid_grant':
          errorMessage = 'Invalid authorization. Please start the authentication process again.';
          break;
      }
      
      console.log(errorMessage);
      alert(errorMessage);
    }

    // Check for TikTok authentication or redirect to TikTok auth
    const checkTikTokAuth = async () => {
      try {
        // Check if we have TikTok session
        const response = await fetch('/api/tiktok/auth/status');
        const data = await response.json();

        if (data.connected) {
          console.log('TikTok connection verified:', data.isDemoMode ? 'demo mode' : 'live mode');
          setTiktokConnected(true);
          setUser(data.userInfo);
          setAuthToken(data.accessToken);
          setIsAuthenticated(true);
        } else {
          console.log('No TikTok connection, redirecting to auth');
          // Redirect to TikTok authentication
          try {
            const authResponse = await fetch('/api/tiktok/auth/url');
            if (!authResponse.ok) {
              throw new Error(`Auth URL request failed: ${authResponse.status}`);
            }
            const authData = await authResponse.json();
            console.log('Redirecting to TikTok auth URL');
            window.location.href = authData.authUrl;
          } catch (authError) {
            console.error('Failed to get auth URL:', authError);
            alert('TikTok authentication is required to use this application. Please try again.');
          }
        }
      } catch (error) {
        console.error('TikTok auth check failed:', error);
        alert('Failed to check TikTok authentication. Please refresh and try again.');
      }
    };

    // Only check auth if we don't have error parameters
    if (!tiktokError) {
      checkTikTokAuth();
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token is invalid, log out
        handleLogout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      handleLogout();
    }
  };

  const fetchCampaignStats = async () => {
    try {
      const response = await fetch('/api/analytics/campaign-stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const stats = await response.json();
        setCampaignStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch campaign stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBotStatus = async () => {
    try {
      const response = await fetch('/api/campaigns/bot-status', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const { status } = await response.json();
        setBotStatus(status);
      }
    } catch (error) {
      console.error('Failed to check bot status:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCampaignStats();
      checkBotStatus();
    }
  }, [isAuthenticated, authToken]);


  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setTiktokConnected(false);
    // Redirect to TikTok logout or re-auth
    window.location.href = '/api/tiktok/auth/logout';
  };

  // Add auth token to all API requests
  useEffect(() => {
    if (authToken) {
      // Store token globally for API calls
      window.authToken = authToken;
    }
  }, [authToken]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'discovery', label: 'Creator Discovery', icon: Search },
    { id: 'campaigns', label: 'Campaign Manager', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
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

  if (!user || !tiktokConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-2.84v5.79a2.1 2.1 0 01-2.8 1.96V8.59a4.83 4.83 0 01-3.77-4.25V2H3.85v5.79a2.1 2.1 0 01-2.8 1.96V8.59a4.83 4.83 0 01-3.77-4.25V2H-2.28v5.79a2.1 2.1 0 01-2.8 1.96V8.59a4.83 4.83 0 01-3.77-4.25V2H-8.42v5.79a2.1 2.1 0 01-2.8 1.96z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connecting to TikTok</h1>
          <p className="text-gray-600 mb-6">Please wait while we connect you to your TikTok Seller account...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

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
              {user && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.companyName}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
              )}
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
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
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