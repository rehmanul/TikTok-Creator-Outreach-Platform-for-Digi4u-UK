import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  Heart, 
  Eye, 
  TrendingUp,
  MapPin,
  Calendar,
  Star,
  Send,
  MoreHorizontal,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

const CreatorDiscovery: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    followerMin: 10000,
    followerMax: 500000,
    category: 'all',
    location: 'UK',
    engagementMin: 2.0,
    gmvMin: 1000
  });
  const [selectedCreators, setSelectedCreators] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const mockCreators = [
    {
      id: 1,
      username: '@techreview_uk',
      displayName: 'Tech Review UK',
      followers: 125000,
      engagement: 8.4,
      avgViews: 45000,
      category: 'Technology',
      location: 'London, UK',
      gmv: 15000,
      recentTopics: ['iPhone 15 Review', 'Android vs iOS', 'Phone Accessories'],
      profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: true,
      lastActive: '2 hours ago',
      responseRate: 85,
      avgResponseTime: '4 hours'
    },
    {
      id: 2,
      username: '@phonerepair_pro',
      displayName: 'Phone Repair Pro',
      followers: 89000,
      engagement: 6.2,
      avgViews: 32000,
      category: 'DIY & Repair',
      location: 'Manchester, UK',
      gmv: 12000,
      recentTopics: ['Screen Repair Tutorial', 'Battery Replacement', 'Tool Reviews'],
      profileImage: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: false,
      lastActive: '1 day ago',
      responseRate: 72,
      avgResponseTime: '8 hours'
    },
    {
      id: 3,
      username: '@gadget_guru',
      displayName: 'Gadget Guru',
      followers: 156000,
      engagement: 5.8,
      avgViews: 58000,
      category: 'Technology',
      location: 'Birmingham, UK',
      gmv: 18500,
      recentTopics: ['Latest Gadgets', 'Tech Unboxing', 'Product Comparisons'],
      profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: true,
      lastActive: '5 hours ago',
      responseRate: 91,
      avgResponseTime: '2 hours'
    },
    {
      id: 4,
      username: '@mobile_master',
      displayName: 'Mobile Master',
      followers: 67000,
      engagement: 9.1,
      avgViews: 28000,
      category: 'Technology',
      location: 'Edinburgh, UK',
      gmv: 8500,
      recentTopics: ['Mobile Gaming', 'Phone Cases', 'Charging Solutions'],
      profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: false,
      lastActive: '3 hours ago',
      responseRate: 68,
      avgResponseTime: '12 hours'
    },
    {
      id: 5,
      username: '@repair_wizard',
      displayName: 'Repair Wizard',
      followers: 43000,
      engagement: 7.3,
      avgViews: 19000,
      category: 'DIY & Repair',
      location: 'Liverpool, UK',
      gmv: 6200,
      recentTopics: ['DIY Repairs', 'Tool Recommendations', 'Troubleshooting'],
      profileImage: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=150',
      verified: false,
      lastActive: '6 hours ago',
      responseRate: 79,
      avgResponseTime: '6 hours'
    }
  ];

  const filteredCreators = mockCreators.filter(creator => {
    const matchesSearch = creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         creator.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFollowers = creator.followers >= filters.followerMin && creator.followers <= filters.followerMax;
    const matchesCategory = filters.category === 'all' || creator.category.toLowerCase().includes(filters.category.toLowerCase());
    const matchesEngagement = creator.engagement >= filters.engagementMin;
    const matchesGMV = creator.gmv >= filters.gmvMin;
    
    return matchesSearch && matchesFollowers && matchesCategory && matchesEngagement && matchesGMV;
  });

  const toggleCreatorSelection = (creatorId: number) => {
    setSelectedCreators(prev => 
      prev.includes(creatorId) 
        ? prev.filter(id => id !== creatorId)
        : [...prev, creatorId]
    );
  };

  const sendBulkInvitations = () => {
    if (selectedCreators.length === 0) return;
    
    // Simulate sending invitations
    alert(`Sending invitations to ${selectedCreators.length} creators...`);
    setSelectedCreators([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Creator Discovery</h1>
          <p className="text-gray-600">Find and connect with TikTok creators for your affiliate campaigns</p>
        </div>
        {selectedCreators.length > 0 && (
          <button
            onClick={sendBulkInvitations}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Send Invitations ({selectedCreators.length})</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search creators by username or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follower Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.followerMin}
                    onChange={(e) => setFilters({...filters, followerMin: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.followerMax}
                    onChange={(e) => setFilters({...filters, followerMax: parseInt(e.target.value) || 1000000})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="technology">Technology</option>
                  <option value="diy">DIY & Repair</option>
                  <option value="gaming">Gaming</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Engagement Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={filters.engagementMin}
                  onChange={(e) => setFilters({...filters, engagementMin: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min GMV (£)</label>
                <input
                  type="number"
                  value={filters.gmvMin}
                  onChange={(e) => setFilters({...filters, gmvMin: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="UK">United Kingdom</option>
                  <option value="London">London</option>
                  <option value="Manchester">Manchester</option>
                  <option value="Birmingham">Birmingham</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Found {filteredCreators.length} creators
            </h3>
            <div className="text-sm text-gray-500">
              Sorted by GMV (highest first)
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredCreators.map((creator) => (
            <div key={creator.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedCreators.includes(creator.id)}
                  onChange={() => toggleCreatorSelection(creator.id)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                
                <img
                  src={creator.profileImage}
                  alt={creator.displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{creator.displayName}</h4>
                    <span className="text-gray-500">{creator.username}</span>
                    {creator.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{creator.followers.toLocaleString()} followers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{creator.engagement}% engagement</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{creator.avgViews.toLocaleString()} avg views</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">£{creator.gmv.toLocaleString()} GMV</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{creator.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Active {creator.lastActive}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600">{creator.responseRate}% response rate</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Recent topics: </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {creator.recentTopics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Send className="w-4 h-4" />
                    <span>Invite</span>
                  </button>
                  <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatorDiscovery;