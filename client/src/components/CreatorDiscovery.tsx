import React, { useState, useEffect } from 'react';
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
  X,
  AlertCircle,
  Loader2,
  User
} from 'lucide-react';
import type { Creator } from '../../../shared/schema';

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
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch creators from API
  useEffect(() => {
    fetchCreators();
  }, [filters]);

  const fetchCreators = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        minFollowers: filters.followerMin.toString(),
        maxFollowers: filters.followerMax.toString(),
        location: filters.location,
        minEngagement: filters.engagementMin.toString(),
        minGmv: filters.gmvMin.toString(),
        ...(filters.category !== 'all' && { categories: filters.category })
      });
      
      const response = await fetch(`/api/creators/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch creators');
      }
      const data = await response.json();
      setCreators(data);
    } catch (err) {
      setError('Failed to load creators. Please try again later.');
      console.error('Error fetching creators:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter creators based on search query
  const filteredCreators = creators.filter(creator => {
    const matchesSearch = searchQuery === '' || 
      creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (creator.displayName && creator.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const toggleCreatorSelection = (creatorId: number) => {
    setSelectedCreators(prev => 
      prev.includes(creatorId) 
        ? prev.filter(id => id !== creatorId)
        : [...prev, creatorId]
    );
  };

  const sendBulkInvitations = async () => {
    if (selectedCreators.length === 0) return;
    
    try {
      const response = await fetch('/api/invitations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorIds: selectedCreators })
      });
      
      if (response.ok) {
        setSelectedCreators([]);
        fetchCreators(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to send invitations:', error);
    }
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
              {isLoading ? 'Loading...' : `Found ${filteredCreators.length} creators`}
            </h3>
            <div className="text-sm text-gray-500">
              Sorted by GMV (highest first)
            </div>
          </div>
        </div>

        {error && (
          <div className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {!isLoading && !error && filteredCreators.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No creators found matching your criteria.</p>
          </div>
        )}

        {!isLoading && !error && filteredCreators.length > 0 && (
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
                  
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {creator.displayName || creator.username}
                      </h4>
                      <span className="text-gray-500">@{creator.username}</span>
                      {creator.isVerified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {creator.followerCount.toLocaleString()} followers
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {creator.engagementRate || 'N/A'}% engagement
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {creator.avgViews ? creator.avgViews.toLocaleString() : 'N/A'} avg views
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          £{creator.gmv ? Number(creator.gmv).toLocaleString() : '0'} GMV
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      {creator.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{creator.location}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Last updated {new Date(creator.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {creator.categories && creator.categories.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Categories: </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {creator.categories.map((category, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
        )}
      </div>
    </div>
  );
};

export default CreatorDiscovery;