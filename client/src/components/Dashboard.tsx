import React from 'react';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  DollarSign,
  Activity,
  Clock,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Play,
  Pause
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  campaignStats: {
    totalInvites: number;
    responseRate: number;
    activeCollaborations: number;
    totalRevenue: number;
  };
  botStatus: string;
}

const Dashboard: React.FC<DashboardProps> = ({ campaignStats, botStatus }) => {
  const [performanceData, setPerformanceData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topCreators, setTopCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real data from APIs
      const [performance, categories, activity, creators] = await Promise.all([
        fetch('/api/analytics/performance').then(res => res.json()),
        fetch('/api/analytics/categories').then(res => res.json()),
        fetch('/api/analytics/activity').then(res => res.json()),
        fetch('/api/creators/top-performers').then(res => res.json())
      ]);

      setPerformanceData(performance);
      setCategoryData(categories);
      setRecentActivity(activity);
      setTopCreators(creators);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Fallback to empty arrays
      setPerformanceData([]);
      setCategoryData([]);
      setRecentActivity([]);
      setTopCreators([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Dashboard</h1>
          <p className="text-gray-600">Monitor your TikTok affiliate outreach performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            botStatus === 'running' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {botStatus === 'running' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="font-medium">Bot {botStatus === 'running' ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Invites</p>
              <p className="text-2xl font-bold text-gray-900">{campaignStats.totalInvites.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">+12.5%</span>
            <span className="text-sm text-gray-500 ml-2">vs last week</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">{campaignStats.responseRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">+3.2%</span>
            <span className="text-sm text-gray-500 ml-2">vs last week</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Collaborations</p>
              <p className="text-2xl font-bold text-gray-900">{campaignStats.activeCollaborations}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">+5</span>
            <span className="text-sm text-gray-500 ml-2">new this week</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">£{campaignStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">+18.7%</span>
            <span className="text-sm text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-gray-500">Loading performance data...</div>
            </div>
          ) : performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="invites" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="responses" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="conversions" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-gray-500">No performance data available</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Creator Categories</h3>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-gray-500">Loading category data...</div>
            </div>
          ) : categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-gray-500">No category data available</div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity & Top Creators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'active' ? 'bg-blue-500' : 'bg-yellow-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.creator}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Creators</h3>
          <div className="space-y-4">
            {topCreators.map((creator, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{creator.name[1]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{creator.name}</p>
                    <p className="text-xs text-gray-500">{creator.followers} followers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{creator.revenue}</p>
                  <p className="text-xs text-gray-500">{creator.engagement} engagement</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;