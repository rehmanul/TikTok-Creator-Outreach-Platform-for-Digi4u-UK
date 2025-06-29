import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('invitations');

  const performanceData = [
    { date: '2025-01-01', invitations: 45, responses: 12, collaborations: 3, revenue: 450 },
    { date: '2025-01-02', invitations: 52, responses: 15, collaborations: 4, revenue: 680 },
    { date: '2025-01-03', invitations: 38, responses: 9, collaborations: 2, revenue: 320 },
    { date: '2025-01-04', invitations: 61, responses: 18, collaborations: 5, revenue: 890 },
    { date: '2025-01-05', invitations: 55, responses: 16, collaborations: 4, revenue: 720 },
    { date: '2025-01-06', invitations: 42, responses: 11, collaborations: 3, revenue: 540 },
    { date: '2025-01-07', invitations: 35, responses: 8, collaborations: 2, revenue: 380 }
  ];

  const categoryPerformance = [
    { category: 'Technology', invitations: 156, responses: 42, responseRate: 26.9, revenue: 3450 },
    { category: 'DIY & Repair', invitations: 89, responses: 28, responseRate: 31.5, revenue: 2180 },
    { category: 'Gaming', invitations: 67, responses: 15, responseRate: 22.4, revenue: 1890 },
    { category: 'Lifestyle', invitations: 43, responses: 9, responseRate: 20.9, revenue: 980 }
  ];

  const creatorTierData = [
    { tier: 'Micro (10K-50K)', count: 45, responseRate: 34.2, avgRevenue: 280 },
    { tier: 'Mid (50K-100K)', count: 28, responseRate: 28.6, avgRevenue: 520 },
    { tier: 'Macro (100K-500K)', count: 18, responseRate: 22.1, avgRevenue: 890 },
    { tier: 'Mega (500K+)', count: 6, responseRate: 16.7, avgRevenue: 1450 }
  ];

  const conversionFunnel = [
    { stage: 'Invitations Sent', count: 1247, percentage: 100 },
    { stage: 'Responses Received', count: 292, percentage: 23.4 },
    { stage: 'Positive Responses', count: 156, percentage: 12.5 },
    { stage: 'Collaborations Started', count: 89, percentage: 7.1 },
    { stage: 'Active Collaborations', count: 67, percentage: 5.4 }
  ];

  const topPerformingCreators = [
    { name: '@techreview_uk', category: 'Technology', revenue: 2450, collaborations: 3, responseTime: '2h' },
    { name: '@phonerepair_pro', category: 'DIY & Repair', revenue: 1890, collaborations: 2, responseTime: '4h' },
    { name: '@gadget_guru', category: 'Technology', revenue: 3120, collaborations: 4, responseTime: '1h' },
    { name: '@mobile_master', category: 'Gaming', revenue: 1560, collaborations: 2, responseTime: '6h' }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const kpiCards = [
    {
      title: 'Total Invitations',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: MessageSquare,
      color: 'blue'
    },
    {
      title: 'Response Rate',
      value: '23.4%',
      change: '+3.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Active Collaborations',
      value: '67',
      change: '+8',
      trend: 'up',
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Total Revenue',
      value: '£12,450',
      change: '+18.7%',
      trend: 'up',
      icon: DollarSign,
      color: 'yellow'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your TikTok affiliate campaigns</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            yellow: 'bg-yellow-100 text-yellow-600'
          };

          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[kpi.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {kpi.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ml-1 ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs last period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
          <div className="flex space-x-2">
            {['invitations', 'responses', 'collaborations', 'revenue'].map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedMetric === metric
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke="#3B82F6" 
              fill="#3B82F6" 
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Performance & Creator Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Category</h3>
          <div className="space-y-4">
            {categoryPerformance.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{category.category}</h4>
                  <p className="text-sm text-gray-600">{category.invitations} invitations • {category.responses} responses</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{category.responseRate}%</p>
                  <p className="text-sm text-gray-600">£{category.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Creator Tier Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={creatorTierData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tier" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="responseRate" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel & Top Creators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            {conversionFunnel.map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                  <span className="text-sm text-gray-600">{stage.count.toLocaleString()} ({stage.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Creators</h3>
          <div className="space-y-4">
            {topPerformingCreators.map((creator, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{creator.name[1]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{creator.name}</p>
                    <p className="text-sm text-gray-600">{creator.category} • {creator.collaborations} collabs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">£{creator.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{creator.responseTime} avg response</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;