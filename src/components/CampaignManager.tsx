import React, { useState } from 'react';
import { 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Users, 
  Target, 
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

const CampaignManager: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Mobile Repair Accessories Q1',
      status: 'active',
      budget: 5000,
      spent: 2340,
      targetInvites: 200,
      sentInvites: 147,
      responses: 34,
      collaborations: 12,
      revenue: 8450,
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      categories: ['Technology', 'DIY & Repair'],
      followerRange: { min: 10000, max: 500000 },
      description: 'Targeting tech reviewers and DIY repair creators for mobile accessories promotion'
    },
    {
      id: 2,
      name: 'Gaming Accessories Winter',
      status: 'paused',
      budget: 3000,
      spent: 1200,
      targetInvites: 150,
      sentInvites: 89,
      responses: 18,
      collaborations: 7,
      revenue: 4200,
      startDate: '2024-12-01',
      endDate: '2025-02-28',
      categories: ['Gaming', 'Technology'],
      followerRange: { min: 25000, max: 300000 },
      description: 'Focus on gaming creators for mobile gaming accessories'
    },
    {
      id: 3,
      name: 'Screen Protection Campaign',
      status: 'completed',
      budget: 2500,
      spent: 2500,
      targetInvites: 100,
      sentInvites: 100,
      responses: 28,
      collaborations: 15,
      revenue: 6800,
      startDate: '2024-10-01',
      endDate: '2024-12-31',
      categories: ['Technology', 'Lifestyle'],
      followerRange: { min: 15000, max: 200000 },
      description: 'Promoting screen protectors and phone cases'
    }
  ]);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    budget: 0,
    targetInvites: 0,
    startDate: '',
    endDate: '',
    categories: [],
    followerMin: 10000,
    followerMax: 500000,
    description: '',
    gmvThreshold: 1000
  });

  const toggleCampaignStatus = (campaignId: number) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' }
        : campaign
    ));
  };

  const createCampaign = () => {
    const campaign = {
      id: campaigns.length + 1,
      name: newCampaign.name,
      status: 'active' as const,
      budget: newCampaign.budget,
      spent: 0,
      targetInvites: newCampaign.targetInvites,
      sentInvites: 0,
      responses: 0,
      collaborations: 0,
      revenue: 0,
      startDate: newCampaign.startDate,
      endDate: newCampaign.endDate,
      categories: newCampaign.categories,
      followerRange: { min: newCampaign.followerMin, max: newCampaign.followerMax },
      description: newCampaign.description
    };

    setCampaigns([...campaigns, campaign]);
    setShowCreateModal(false);
    setNewCampaign({
      name: '',
      budget: 0,
      targetInvites: 0,
      startDate: '',
      endDate: '',
      categories: [],
      followerMin: 10000,
      followerMax: 500000,
      description: '',
      gmvThreshold: 1000
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Manager</h1>
          <p className="text-gray-600">Create and manage your TikTok affiliate campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {getStatusIcon(campaign.status)}
                  <span className="capitalize">{campaign.status}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleCampaignStatus(campaign.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{campaign.description}</p>

            {/* Progress Bars */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Budget Progress</span>
                  <span className="font-medium">£{campaign.spent.toLocaleString()} / £{campaign.budget.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Invitations</span>
                  <span className="font-medium">{campaign.sentInvites} / {campaign.targetInvites}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(campaign.sentInvites / campaign.targetInvites) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{campaign.responses}</p>
                <p className="text-xs text-gray-500">Responses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{campaign.collaborations}</p>
                <p className="text-xs text-gray-500">Collaborations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">£{campaign.revenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{((campaign.responses / campaign.sentInvites) * 100).toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Response Rate</p>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Categories:</span>
                <span>{campaign.categories.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Followers:</span>
                <span>{campaign.followerRange.min.toLocaleString()} - {campaign.followerRange.max.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Campaign</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter campaign name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget (£)</label>
                  <input
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({...newCampaign, budget: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Invitations</label>
                  <input
                    type="number"
                    value={newCampaign.targetInvites}
                    onChange={(e) => setNewCampaign({...newCampaign, targetInvites: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Categories</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Technology', 'DIY & Repair', 'Gaming', 'Lifestyle'].map((category) => (
                    <label key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newCampaign.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewCampaign({...newCampaign, categories: [...newCampaign.categories, category]});
                          } else {
                            setNewCampaign({...newCampaign, categories: newCampaign.categories.filter(c => c !== category)});
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follower Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min followers"
                    value={newCampaign.followerMin}
                    onChange={(e) => setNewCampaign({...newCampaign, followerMin: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max followers"
                    value={newCampaign.followerMax}
                    onChange={(e) => setNewCampaign({...newCampaign, followerMax: parseInt(e.target.value) || 1000000})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GMV Threshold (£)</label>
                <input
                  type="number"
                  value={newCampaign.gmvThreshold}
                  onChange={(e) => setNewCampaign({...newCampaign, gmvThreshold: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1000"
                />
                <p className="text-xs text-gray-500 mt-1">Bot will stop when reaching creators below this GMV threshold</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your campaign goals and target audience..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCampaign}
                disabled={!newCampaign.name || !newCampaign.budget || !newCampaign.targetInvites}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;