import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Campaign } from '@shared/schema';
import { Play, Pause, Settings, BarChart3, Users, MessageCircle } from 'lucide-react';

interface AutomationRule {
  id: string;
  campaignId: string;
  isActive: boolean;
  dailyInviteLimit: number;
  delayBetweenInvites: number;
  creatorCriteria: {
    categories: string[];
    minFollowers: number;
    maxFollowers: number;
    minEngagementRate: number;
    locations: string[];
    verified?: boolean;
  };
  messageTemplate: string;
  schedule: {
    enabled: boolean;
    time: string;
    timezone: string;
  };
}

interface AutomationStats {
  totalInvitesSent: number;
  responseRate: number;
  acceptanceRate: number;
  campaignsActive: number;
  todayInvites: number;
  pendingResponses: number;
}

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [automationStats, setAutomationStats] = useState<AutomationStats | null>(null);
  const [showAutomationForm, setShowAutomationForm] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  // Load automation data
  useEffect(() => {
    if (selectedCampaign) {
      fetchAutomationRules(selectedCampaign.id);
    }
    fetchAutomationStats();
    checkTikTokConnection();
  }, [selectedCampaign]);

  const fetchAutomationRules = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/automation`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const rules = await response.json();
        setAutomationRules(rules);
      }
    } catch (error) {
      console.error('Failed to fetch automation rules:', error);
    }
  };

  const fetchAutomationStats = async () => {
    try {
      const response = await fetch('/api/campaigns/automation/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const stats = await response.json();
        setAutomationStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch automation stats:', error);
    }
  };

  const checkTikTokConnection = async () => {
    try {
      const response = await fetch('/api/campaigns/test-connection', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const status = await response.json();
        setConnectionStatus(status);
      }
    } catch (error) {
      console.error('Failed to check TikTok connection:', error);
    }
  };

  const startAutomation = async (ruleId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${selectedCampaign?.id}/automation/${ruleId}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        alert('Automation started successfully!');
        fetchAutomationStats();
      } else {
        const error = await response.json();
        alert(`Failed to start automation: ${error.message}`);
      }
    } catch (error) {
      alert('Failed to start automation');
    }
  };

  const stopAutomation = async (ruleId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${selectedCampaign?.id}/automation/${ruleId}/stop`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        alert('Automation stopped successfully!');
        fetchAutomationRules(selectedCampaign?.id || '');
        fetchAutomationStats();
      }
    } catch (error) {
      alert('Failed to stop automation');
    }
  };

  const createAutomationRule = async (formData: any) => {
    try {
      const response = await fetch(`/api/campaigns/${selectedCampaign?.id}/automation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Automation rule created successfully!');
        setShowAutomationForm(false);
        fetchAutomationRules(selectedCampaign?.id || '');
      } else {
        const error = await response.json();
        alert(`Failed to create automation: ${error.message}`);
      }
    } catch (error) {
      alert('Failed to create automation rule');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Campaign Manager</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateForm(true)}>
            Create Campaign
          </Button>
          {selectedCampaign && (
            <Button onClick={() => setShowAutomationForm(true)} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Setup Automation
            </Button>
          )}
        </div>
      </div>

      {/* TikTok Connection Status */}
      {connectionStatus && (
        <Card className={connectionStatus.connected ? "border-green-200" : "border-red-200"}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                TikTok API Status: {connectionStatus.connected ? 'Connected' : 'Disconnected'}
              </div>
              {connectionStatus.connected && (
                <Badge variant="secondary">
                  {connectionStatus.permissions?.join(', ')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automation Stats Dashboard */}
      {automationStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Invites</p>
                  <p className="text-2xl font-bold">{automationStats.totalInvitesSent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold">{automationStats.responseRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold">{automationStats.campaignsActive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Play className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Invites</p>
                  <p className="text-2xl font-bold">{automationStats.todayInvites}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedCampaign && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="automation">
            <Card>
              <CardHeader>
                <CardTitle>Automation Rules</CardTitle>
              </CardHeader>
              <CardContent>
                {automationRules.length === 0 ? (
                  <p className="text-gray-600">No automation rules configured.</p>
                ) : (
                  <div className="space-y-4">
                    {automationRules.map((rule) => (
                      <div key={rule.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">Daily Automation</h4>
                            <p className="text-sm text-gray-600">
                              {rule.dailyInviteLimit} invites/day, {rule.delayBetweenInvites}min delays
                            </p>
                            <p className="text-sm text-gray-600">
                              Categories: {rule.creatorCriteria.categories.join(', ')}
                            </p>
                            {rule.schedule.enabled && (
                              <p className="text-sm text-gray-600">
                                Scheduled: {rule.schedule.time} ({rule.schedule.timezone})
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {rule.isActive ? (
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => stopAutomation(rule.id)}
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Stop
                              </Button>
                            ) : (
                              <Button 
                                size="sm"
                                onClick={() => startAutomation(rule.id)}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Automation Rule Form */}
      {showAutomationForm && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create Automation Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <AutomationForm 
              onSubmit={createAutomationRule}
              onCancel={() => setShowAutomationForm(false)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}