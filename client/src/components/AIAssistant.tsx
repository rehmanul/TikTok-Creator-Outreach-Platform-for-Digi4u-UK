import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  MessageSquare,
  Target,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: `Hello! I'm your TikTok Affiliate Bot AI Assistant powered by Gemini. I can help you with:

• **Creator Analysis**: Evaluate potential collaborators based on engagement, demographics, and content relevance
• **Message Optimization**: Improve your outreach templates for higher response rates  
• **Campaign Strategy**: Develop comprehensive affiliate marketing campaigns
• **Market Insights**: Analyze trends in the UK mobile repair market
• **Performance Tracking**: Set up metrics and KPIs for your campaigns

What would you like assistance with today?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestions = [
    {
      icon: Users,
      text: "Analyze creator @techreview_uk for phone case promotion",
      category: "Creator Analysis"
    },
    {
      icon: MessageSquare,
      text: "Optimize this message: Hey! Want to collab on promoting phone accessories?",
      category: "Message Optimization"
    },
    {
      icon: Target,
      text: "Create campaign strategy for UK mobile repair market",
      category: "Campaign Strategy"
    },
    {
      icon: TrendingUp,
      text: "What are the trending topics in mobile tech on TikTok?",
      category: "Market Insights"
    }
  ];

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(message);
      const assistantMessage = {
        id: messages.length + 2,
        type: 'assistant' as const,
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('creator') || lowerMessage.includes('analyze')) {
      return `I'll help you analyze TikTok creators for your affiliate program. To provide the most accurate analysis, I'll need:

**Creator Information:**
• Creator's TikTok handle or profile link
• Your target product category
• Preferred collaboration type (review, unboxing, etc.)

**Analysis I can provide:**
• **Audience Demographics**: Age, gender, location breakdown
• **Engagement Metrics**: Like rates, comment quality, share patterns
• **Content Performance**: Average views, trending topics, posting frequency
• **Collaboration Fit**: Brand alignment score and recommendations
• **ROI Projections**: Expected reach, conversion estimates, revenue potential

Would you like to provide a specific creator for analysis, or shall I walk you through our creator discovery process?`;
    }
    
    if (lowerMessage.includes('message') || lowerMessage.includes('optimize')) {
      return `I can help optimize your outreach messages for better response rates! Here are proven strategies for TikTok creator outreach:

**Key Elements for High-Converting Messages:**
1. **Personalization** - Reference their recent content specifically
2. **Value Proposition** - Clear benefits for the creator and their audience
3. **Social Proof** - Mention successful collaborations or testimonials
4. **Flexibility** - Offer creative freedom and collaboration options
5. **Clear CTA** - Specific next steps and timeline

**Template Structure:**
\`\`\`
Hi [Creator Name] 👋

I've been following your [specific content type] and loved your recent video about [specific topic]! 

I'm [Your Name] from Digi4u, and we specialize in [relevant products] that would be perfect for your [audience type] audience.

What we're offering:
✅ [Specific benefit 1]
✅ [Specific benefit 2]  
✅ [Specific benefit 3]

Would you be interested in a quick call this week to discuss a collaboration?

Best regards,
[Your Name]
\`\`\`

Would you like me to optimize a specific message you're planning to send?`;
    }
    
    if (lowerMessage.includes('campaign') || lowerMessage.includes('strategy')) {
      return `I'll help you develop a comprehensive TikTok affiliate campaign strategy! Here's a proven framework:

**Campaign Development Process:**

**1. Market Research & Analysis**
• Analyze trending content in mobile/tech space
• Identify competitor strategies and gaps
• Map seasonal opportunities and product launches

**2. Creator Segmentation Strategy**
• **Micro Influencers (10K-50K)**: High engagement, cost-effective
• **Mid-tier (50K-100K)**: Balanced reach and engagement
• **Macro (100K-500K)**: Broad reach, brand awareness
• **Mega (500K+)**: Maximum exposure, premium partnerships

**3. Budget Allocation Framework**
• Creator fees: 60% of budget
• Product samples: 25% of budget
• Platform advertising: 10% of budget
• Management tools: 5% of budget

**For Digi4u's mobile repair niche, I recommend:**
• Targeting tech reviewers and DIY creators
• Seasonal campaigns around device launches
• Educational content focus (repair tutorials)
• Multi-platform approach (TikTok + Instagram Reels)

What specific aspect of campaign strategy would you like to dive deeper into?`;
    }

    if (lowerMessage.includes('trend') || lowerMessage.includes('market')) {
      return `Here are the current trending topics and market insights for mobile tech on TikTok:

**🔥 Trending Content Categories:**
• **Phone Repair Hacks**: DIY tutorials, quick fixes (+340% engagement)
• **Device Comparisons**: iPhone vs Android, spec breakdowns
• **Accessory Reviews**: Cases, chargers, gaming accessories
• **Unboxing Videos**: New releases, budget alternatives

**📊 UK Market Insights:**
• **Peak Engagement**: Thursday-Sunday, 6-9 PM GMT
• **Top Demographics**: Males 25-34 (42%), Females 18-24 (31%)
• **High-Performing Hashtags**: #PhoneRepair, #TechReview, #DIYFix
• **Average Views**: Repair content gets 2.3M UK views monthly

**💡 Opportunity Gaps:**
• Premium tool reviews (underserved market)
• Female-focused repair content (untapped audience)
• Business/commercial repair solutions
• Sustainability angle (eco-friendly repairs)

**Recommendations for Digi4u:**
1. Focus on premium tool differentiation
2. Develop female creator partnerships
3. Create educational series content
4. Leverage sustainability messaging for Gen Z appeal

Would you like me to analyze specific trending hashtags or creator performance in any of these categories?`;
    }
    
    return `I'm here to help you succeed with your TikTok affiliate bot! I can assist with:

**🎯 Creator Analysis**: Evaluate potential collaborators based on engagement, demographics, and content relevance

**📝 Message Optimization**: Improve your outreach templates for higher response rates

**📊 Campaign Strategy**: Develop comprehensive affiliate marketing campaigns

**📈 Market Insights**: Analyze trends in the UK mobile repair market

**⚡ Performance Tracking**: Set up metrics and KPIs for your campaigns

**🤖 Bot Configuration**: Optimize your automation settings for better results

What specific challenge are you facing with your TikTok affiliate program? I'm here to provide detailed, actionable guidance!`;
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-600">Powered by Gemini AI for intelligent TikTok campaign optimization</p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl p-4 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.type === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">AI Assistant</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
              placeholder="Ask me anything about TikTok affiliate marketing..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-left"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{suggestion.category}</p>
                  <p className="text-sm text-gray-600 mt-1">{suggestion.text}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Capabilities */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Capabilities</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Smart Analysis</h4>
            <p className="text-sm text-gray-600">Advanced creator profiling and audience analysis using machine learning</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Message Optimization</h4>
            <p className="text-sm text-gray-600">AI-powered message personalization for higher response rates</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Predictive Insights</h4>
            <p className="text-sm text-gray-600">Forecast campaign performance and ROI with predictive analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;