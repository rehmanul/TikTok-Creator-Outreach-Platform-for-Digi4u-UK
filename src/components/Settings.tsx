import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bot, 
  Key, 
  Globe, 
  Shield, 
  Bell, 
  Database,
  Zap,
  Save,
  TestTube,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('bot');
  const [settings, setSettings] = useState({
    // Bot Configuration
    botEnabled: true,
    maxInvitesPerDay: 50,
    delayBetweenInvites: 30,
    gmvThreshold: 1000,
    responseTimeout: 24,
    autoRetry: true,
    retryAttempts: 3,
    
    // TikTok API
    tiktokApiKey: '',
    tiktokSecret: '',
    shopRegion: 'GB',
    
    // Gemini AI
    geminiApiKey: '',
    geminiModel: 'gemini-2.0-flash',
    aiEnabled: true,
    
    // Filters
    minFollowers: 10000,
    maxFollowers: 500000,
    minEngagement: 2.0,
    targetCategories: ['Technology', 'DIY & Repair'],
    targetLocations: ['UK'],
    
    // Notifications
    emailNotifications: true,
    responseAlerts: true,
    dailyReports: true,
    errorAlerts: true
  });

  const sections = [
    { id: 'bot', label: 'Bot Configuration', icon: Bot },
    { id: 'api', label: 'API Settings', icon: Key },
    { id: 'ai', label: 'AI Assistant', icon: Zap },
    { id: 'filters', label: 'Creator Filters', icon: Target },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const handleSave = () => {
    // Simulate saving settings
    alert('Settings saved successfully!');
  };

  const testConnection = async (type: string) => {
    // Simulate API testing
    alert(`Testing ${type} connection...`);
  };

  const renderBotConfiguration = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bot Automation Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.botEnabled}
                onChange={(e) => setSettings({...settings, botEnabled: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Enable Bot Automation</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Invites Per Day</label>
            <input
              type="number"
              value={settings.maxInvitesPerDay}
              onChange={(e) => setSettings({...settings, maxInvitesPerDay: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delay Between Invites (seconds)</label>
            <input
              type="number"
              value={settings.delayBetweenInvites}
              onChange={(e) => setSettings({...settings, delayBetweenInvites: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GMV Threshold (£)</label>
            <input
              type="number"
              value={settings.gmvThreshold}
              onChange={(e) => setSettings({...settings, gmvThreshold: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Bot stops when reaching creators below this GMV</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Response Timeout (hours)</label>
            <input
              type="number"
              value={settings.responseTimeout}
              onChange={(e) => setSettings({...settings, responseTimeout: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.autoRetry}
                onChange={(e) => setSettings({...settings, autoRetry: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Auto-retry failed invitations</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">TikTok API Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">TikTok API Key</label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={settings.tiktokApiKey}
                onChange={(e) => setSettings({...settings, tiktokApiKey: e.target.value})}
                placeholder="Enter your TikTok API key"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => testConnection('TikTok API')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">TikTok Secret</label>
            <input
              type="password"
              value={settings.tiktokSecret}
              onChange={(e) => setSettings({...settings, tiktokSecret: e.target.value})}
              placeholder="Enter your TikTok secret"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shop Region</label>
            <select
              value={settings.shopRegion}
              onChange={(e) => setSettings({...settings, shopRegion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
              <option value="EU">European Union</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAiSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gemini AI Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={settings.aiEnabled}
                onChange={(e) => setSettings({...settings, aiEnabled: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Enable AI Assistant</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API Key</label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={settings.geminiApiKey}
                onChange={(e) => setSettings({...settings, geminiApiKey: e.target.value})}
                placeholder="Enter your Gemini API key"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => testConnection('Gemini AI')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Test
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
            <select
              value={settings.geminiModel}
              onChange={(e) => setSettings({...settings, geminiModel: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (Cost-effective)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Advanced)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Premium)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Creator Targeting Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Followers</label>
            <input
              type="number"
              value={settings.minFollowers}
              onChange={(e) => setSettings({...settings, minFollowers: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Followers</label>
            <input
              type="number"
              value={settings.maxFollowers}
              onChange={(e) => setSettings({...settings, maxFollowers: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Engagement Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.minEngagement}
              onChange={(e) => setSettings({...settings, minEngagement: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Categories</label>
            <div className="space-y-2">
              {['Technology', 'DIY & Repair', 'Gaming', 'Lifestyle'].map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.targetCategories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSettings({...settings, targetCategories: [...settings.targetCategories, category]});
                      } else {
                        setSettings({...settings, targetCategories: settings.targetCategories.filter(c => c !== category)});
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Email Notifications</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.responseAlerts}
              onChange={(e) => setSettings({...settings, responseAlerts: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Creator Response Alerts</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.dailyReports}
              onChange={(e) => setSettings({...settings, dailyReports: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Daily Performance Reports</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.errorAlerts}
              onChange={(e) => setSettings({...settings, errorAlerts: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Error & System Alerts</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Privacy</h3>
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Security Best Practices</h4>
            </div>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>• Keep your API keys secure and never share them</li>
              <li>• Regularly rotate your API credentials</li>
              <li>• Monitor bot activity for unusual patterns</li>
              <li>• Use strong, unique passwords for all accounts</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-800">Data Protection</h4>
            </div>
            <p className="mt-2 text-sm text-green-700">
              All creator data is encrypted and stored securely. We comply with GDPR and UK data protection regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'bot': return renderBotConfiguration();
      case 'api': return renderApiSettings();
      case 'ai': return renderAiSettings();
      case 'filters': return renderFilters();
      case 'notifications': return renderNotifications();
      case 'security': return renderSecurity();
      default: return renderBotConfiguration();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your TikTok affiliate bot and AI assistant</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4">
              <div className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;