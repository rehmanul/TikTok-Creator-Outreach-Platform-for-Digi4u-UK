
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';

interface AutomationFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export default function AutomationForm({ onSubmit, onCancel }: AutomationFormProps) {
  const [formData, setFormData] = useState({
    dailyInviteLimit: 25,
    delayBetweenInvites: 120,
    categories: '',
    minFollowers: 1000,
    maxFollowers: 100000,
    minEngagementRate: 3,
    locations: '',
    verified: false,
    messageTemplate: 'Hi! I\'d love to collaborate with you on our latest product. Would you be interested in a partnership?',
    scheduleEnabled: false,
    scheduleTime: '09:00',
    timezone: 'GMT'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const automationRule = {
      dailyInviteLimit: formData.dailyInviteLimit,
      delayBetweenInvites: formData.delayBetweenInvites * 60000, // Convert to milliseconds
      creatorCriteria: {
        categories: formData.categories.split(',').map(c => c.trim()).filter(c => c),
        minFollowers: formData.minFollowers,
        maxFollowers: formData.maxFollowers,
        minEngagementRate: formData.minEngagementRate,
        locations: formData.locations.split(',').map(l => l.trim()).filter(l => l),
        verified: formData.verified
      },
      messageTemplate: formData.messageTemplate,
      schedule: {
        enabled: formData.scheduleEnabled,
        time: formData.scheduleTime,
        timezone: formData.timezone
      }
    };

    onSubmit(automationRule);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dailyLimit">Daily Invite Limit</Label>
          <Input
            id="dailyLimit"
            type="number"
            value={formData.dailyInviteLimit}
            onChange={(e) => setFormData(prev => ({ ...prev, dailyInviteLimit: parseInt(e.target.value) }))}
            min={1}
            max={50}
          />
        </div>
        <div>
          <Label htmlFor="delay">Delay Between Invites (minutes)</Label>
          <Input
            id="delay"
            type="number"
            value={formData.delayBetweenInvites}
            onChange={(e) => setFormData(prev => ({ ...prev, delayBetweenInvites: parseInt(e.target.value) }))}
            min={30}
            max={1440}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="categories">Target Categories (comma-separated)</Label>
        <Input
          id="categories"
          value={formData.categories}
          onChange={(e) => setFormData(prev => ({ ...prev, categories: e.target.value }))}
          placeholder="fashion, lifestyle, beauty"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minFollowers">Min Followers</Label>
          <Input
            id="minFollowers"
            type="number"
            value={formData.minFollowers}
            onChange={(e) => setFormData(prev => ({ ...prev, minFollowers: parseInt(e.target.value) }))}
            min={0}
          />
        </div>
        <div>
          <Label htmlFor="maxFollowers">Max Followers</Label>
          <Input
            id="maxFollowers"
            type="number"
            value={formData.maxFollowers}
            onChange={(e) => setFormData(prev => ({ ...prev, maxFollowers: parseInt(e.target.value) }))}
            min={0}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="engagementRate">Min Engagement Rate (%)</Label>
        <Input
          id="engagementRate"
          type="number"
          step="0.1"
          value={formData.minEngagementRate}
          onChange={(e) => setFormData(prev => ({ ...prev, minEngagementRate: parseFloat(e.target.value) }))}
          min={0}
          max={100}
        />
      </div>

      <div>
        <Label htmlFor="locations">Target Locations (comma-separated)</Label>
        <Input
          id="locations"
          value={formData.locations}
          onChange={(e) => setFormData(prev => ({ ...prev, locations: e.target.value }))}
          placeholder="US, UK, CA"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.verified}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, verified: checked }))}
        />
        <Label>Verified creators only</Label>
      </div>

      <div>
        <Label htmlFor="messageTemplate">Message Template</Label>
        <Textarea
          id="messageTemplate"
          value={formData.messageTemplate}
          onChange={(e) => setFormData(prev => ({ ...prev, messageTemplate: e.target.value }))}
          rows={4}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.scheduleEnabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, scheduleEnabled: checked }))}
          />
          <Label>Enable scheduled sending</Label>
        </div>

        {formData.scheduleEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduleTime">Send Time</Label>
              <Input
                id="scheduleTime"
                type="time"
                value={formData.scheduleTime}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduleTime: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                placeholder="GMT, PST, EST"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Automation Rule
        </Button>
      </div>
    </form>
  );
}
