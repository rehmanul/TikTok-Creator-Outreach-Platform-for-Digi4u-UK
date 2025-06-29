// Application data
const geminiModels = {
  "gemini-2.0-flash": {
    name: "Gemini 2.0 Flash",
    status: "Generally Available",
    pricing: { input: 0.075, output: 0.30 },
    features: ["Fast inference", "Multimodal", "Tool use", "1M context"],
    bestFor: "General automation tasks, fast responses"
  },
  "gemini-2.0-flash-lite": {
    name: "Gemini 2.0 Flash Lite",
    status: "Generally Available",
    pricing: { input: 0.0375, output: 0.15 },
    features: ["Ultra-fast inference", "Cost-effective", "High volume"],
    bestFor: "High-volume operations, cost optimization"
  },
  "gemini-2.5-flash": {
    name: "Gemini 2.5 Flash",
    status: "Generally Available",
    pricing: { input: 0.30, output: 2.50 },
    features: ["Hybrid reasoning", "Thinking mode", "Advanced performance"],
    bestFor: "Complex reasoning, strategic analysis"
  },
  "gemini-2.5-pro": {
    name: "Gemini 2.5 Pro",
    status: "Generally Available",
    pricing: { input: 7.00, output: 28.00 },
    features: ["Highest intelligence", "Deep reasoning", "Complex problems"],
    bestFor: "Advanced AI assistance, complex decision making"
  },
  "gemini-2.5-flash-lite": {
    name: "Gemini 2.5 Flash Lite",
    status: "Preview",
    pricing: { input: 0.075, output: 0.30 },
    features: ["Cost-efficient 2.5", "Fastest 2.5 model", "High throughput"],
    bestFor: "Cost-sensitive high-volume tasks"
  }
};

const useCasePrompts = {
  creator_analysis: "Analyze this TikTok creator profile for potential collaboration on mobile phone accessories. Creator: @techreview_uk, 50K followers, focuses on tech reviews and gadget unboxings. Recent videos average 10K views with high engagement on phone-related content.",
  message_optimization: "Optimize this collaboration message for better response rates: 'Hi! I work with Digi4u and we sell phone repair accessories. Would you like to promote our products for commission?'",
  campaign_strategy: "Develop a strategic campaign approach for promoting mobile phone repair accessories to UK TikTok creators. Focus on targeting tech reviewers and lifestyle creators.",
  market_insights: "Generate insights about UK mobile repair market trends based on TikTok engagement patterns and creator content preferences."
};

// Application state
let currentConfig = {
  apiKey: '',
  projectId: '',
  primaryModel: 'gemini-2.0-flash',
  fallbackModel: 'gemini-2.0-flash-lite'
};

// DOM elements
const navTabs = document.querySelectorAll('.nav__tab');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  initializeApiConfiguration();
  initializeMigrationTool();
  initializeTestingInterface();
  initializeModelComparison();
  initializeCostCalculator();
  initializeAiAssistant();
});

// Navigation functionality
function initializeNavigation() {
  navTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.dataset.tab;
      switchTab(targetTab);
    });
  });
}

function switchTab(targetTab) {
  // Update navigation
  navTabs.forEach(tab => {
    tab.classList.remove('nav__tab--active');
  });
  document.querySelector(`[data-tab="${targetTab}"]`).classList.add('nav__tab--active');

  // Update content
  tabContents.forEach(content => {
    content.classList.remove('tab-content--active');
  });
  document.querySelector(`[data-content="${targetTab}"]`).classList.add('tab-content--active');
}

// API Configuration functionality
function initializeApiConfiguration() {
  const saveCredentialsBtn = document.getElementById('save-credentials');
  const testConnectionBtn = document.getElementById('test-connection');
  const credentialsStatus = document.getElementById('credentials-status');

  saveCredentialsBtn.addEventListener('click', function() {
    const apiKey = document.getElementById('api-key').value;
    const projectId = document.getElementById('project-id').value;
    const primaryModel = document.getElementById('model-select').value;
    const fallbackModel = document.getElementById('fallback-model').value;

    if (!apiKey.trim()) {
      showStatus(credentialsStatus, 'Please enter a valid API key', 'error');
      return;
    }

    currentConfig = { apiKey, projectId, primaryModel, fallbackModel };
    showStatus(credentialsStatus, 'Credentials saved successfully', 'success');
  });

  testConnectionBtn.addEventListener('click', function() {
    if (!currentConfig.apiKey) {
      showStatus(credentialsStatus, 'Please save credentials first', 'error');
      return;
    }

    testConnectionBtn.textContent = 'Testing...';
    testConnectionBtn.disabled = true;

    // Simulate API test
    setTimeout(() => {
      showStatus(credentialsStatus, 'Connection successful! Model is available', 'success');
      testConnectionBtn.textContent = 'Test Connection';
      testConnectionBtn.disabled = false;
    }, 2000);
  });
}

// Migration Tool functionality
function initializeMigrationTool() {
  const openaiInputs = ['openai-model', 'openai-temperature', 'openai-max-tokens', 'openai-top-p'];
  const applyMigrationBtn = document.getElementById('apply-migration');

  openaiInputs.forEach(inputId => {
    document.getElementById(inputId).addEventListener('input', updateMigrationPreview);
  });

  applyMigrationBtn.addEventListener('click', function() {
    const recommendedModel = document.getElementById('recommended-model').textContent;
    const temperature = document.getElementById('migrated-temperature').textContent;
    const maxTokens = document.getElementById('migrated-max-tokens').textContent;
    const topP = document.getElementById('migrated-top-p').textContent;

    // Apply to configuration
    document.getElementById('model-select').value = getModelKey(recommendedModel);
    
    alert(`Migration applied successfully!\nModel: ${recommendedModel}\nSettings transferred to API Configuration.`);
  });

  updateMigrationPreview();
}

function updateMigrationPreview() {
  const openaiModel = document.getElementById('openai-model').value;
  const temperature = parseFloat(document.getElementById('openai-temperature').value);
  const maxTokens = parseInt(document.getElementById('openai-max-tokens').value);
  const topP = parseFloat(document.getElementById('openai-top-p').value);

  // Map OpenAI models to Gemini equivalents
  let recommendedModel;
  switch (openaiModel) {
    case 'gpt-4':
    case 'gpt-4-turbo':
      recommendedModel = 'Gemini 2.5 Flash';
      break;
    case 'gpt-3.5-turbo':
      recommendedModel = 'Gemini 2.0 Flash';
      break;
    default:
      recommendedModel = 'Gemini 2.0 Flash';
  }

  document.getElementById('recommended-model').textContent = recommendedModel;
  document.getElementById('migrated-temperature').textContent = temperature.toString();
  document.getElementById('migrated-max-tokens').textContent = maxTokens.toString();
  document.getElementById('migrated-top-p').textContent = topP.toString();
}

function getModelKey(modelName) {
  for (const [key, model] of Object.entries(geminiModels)) {
    if (model.name === modelName) {
      return key;
    }
  }
  return 'gemini-2.0-flash';
}

// Testing Interface functionality
function initializeTestingInterface() {
  const runTestBtn = document.getElementById('run-test');
  const testResults = document.getElementById('test-results');
  const testMetrics = document.getElementById('test-metrics');

  document.getElementById('test-scenario').addEventListener('change', function() {
    const scenario = this.value;
    document.getElementById('test-prompt').value = useCasePrompts[scenario] || '';
  });

  runTestBtn.addEventListener('click', function() {
    const model = document.getElementById('test-model').value;
    const scenario = document.getElementById('test-scenario').value;
    const customPrompt = document.getElementById('test-prompt').value;

    if (!customPrompt.trim()) {
      testResults.textContent = 'Please enter a prompt to test.';
      return;
    }

    runTestBtn.textContent = 'Running Test...';
    runTestBtn.disabled = true;
    testResults.textContent = 'Processing your request...';

    // Simulate API call
    setTimeout(() => {
      const mockResponse = generateMockResponse(scenario, model);
      displayTestResults(mockResponse, model);
      runTestBtn.textContent = 'Run Test';
      runTestBtn.disabled = false;
    }, 3000);
  });
}

function generateMockResponse(scenario, model) {
  const responses = {
    creator_analysis: `Based on the analysis of @techreview_uk:

**Collaboration Potential: HIGH (8.5/10)**

**Profile Insights:**
- Strong tech focus aligns perfectly with mobile accessories
- High engagement rate (12.3%) indicates active audience
- Demographics: 68% male, 25-34 age group (ideal for tech products)
- Peak posting times: 6-8 PM GMT (optimal for UK audience)

**Recommendations:**
1. Offer exclusive early access to new phone repair tools
2. Create content around "phone repair myths vs reality"
3. Propose commission rate of 8-12% based on engagement metrics
4. Suggest collaboration timeline: 2-week campaign with 4-5 posts

**Estimated Performance:**
- Expected reach: 25,000-35,000 viewers
- Projected conversion rate: 2.3-3.1%
- Estimated revenue impact: £450-680`,

    message_optimization: `**Optimized Message:**

"Hi [Creator Name] 👋

I've been following your tech reviews and love your authentic approach to product testing! Your recent video on phone screen protectors really resonated with your audience.

I'm [Your Name] from Digi4u, and we specialize in premium mobile repair accessories that I think would be perfect for your tech-focused content. 

**What we're offering:**
✅ Exclusive early access to our latest repair tools
✅ Competitive commission structure (8-12%)
✅ Full creative freedom - no scripted content
✅ High-quality products your audience will actually love

Would you be interested in a quick 15-minute call this week to discuss a potential collaboration? I have some exciting product launches that could align perfectly with your content calendar.

Looking forward to potentially working together!

Best regards,
[Your Name]
Digi4u Partnership Team"

**Key Improvements:**
- Personalized opening shows genuine interest
- Clear value proposition
- Professional but friendly tone
- Specific benefits listed
- Clear call-to-action
- 73% higher response rate potential`,

    campaign_strategy: `**UK Mobile Repair Accessories Campaign Strategy**

**Campaign Overview:**
"RepairTech Creators" - 90-day influencer campaign targeting UK TikTok tech creators

**Phase 1: Foundation (Days 1-30)**
- Identify 50 top tech creators (10K-500K followers)
- Segment by: Tech reviewers, DIY enthusiasts, Lifestyle tech
- Create tiered commission structure: 8-15% based on follower count

**Phase 2: Launch (Days 31-60)**
- Onboard 15-20 creators per tier
- Provide exclusive product bundles for authentic reviews
- Launch hashtag: #RepairLikeAPro
- Cross-platform amplification (Instagram, YouTube Shorts)

**Phase 3: Scale (Days 61-90)**
- Performance-based tier upgrades
- User-generated content contests
- Micro-influencer expansion (1K-10K followers)

**Budget Allocation:**
- Creator fees: 60% (£12,000)
- Products/samples: 25% (£5,000)
- Platform advertising: 10% (£2,000)
- Management/tools: 5% (£1,000)

**Expected Results:**
- Reach: 2.5M+ UK users
- Engagement: 180K+ interactions
- Conversions: 1,200-1,800 sales
- ROI: 280-340%`,

    market_insights: `**UK Mobile Repair Market - TikTok Insights**

**Market Trends (Q4 2024 - Q1 2025):**

**1. Content Performance Metrics:**
- "Phone repair hacks" videos: +340% engagement vs. general tech
- DIY repair content: 2.3M UK views monthly
- Tool reviews: 85% higher click-through rates
- Peak engagement: Thursday-Sunday, 6-9 PM

**2. Audience Demographics:**
- Primary: Males 25-34 (42%)
- Secondary: Females 18-24 (31%)
- Income: £25K-45K annually (67%)
- Location hotspots: London, Manchester, Birmingham

**3. Popular Content Themes:**
- "Budget repair vs professional" comparisons
- "Common phone problems solved"
- "Repair tool unboxing and testing"
- "Before/after transformation videos"

**4. Competitive Landscape:**
- iFixit: Dominant in educational content
- Local repair shops: Growing TikTok presence
- Chinese tool manufacturers: Price-focused messaging

**5. Opportunity Gaps:**
- Premium tool reviews (underserved)
- Female-focused repair content (untapped)
- Business/commercial repair solutions
- Sustainability angle (eco-friendly repairs)

**Recommendations:**
1. Focus on premium tool differentiation
2. Develop female creator partnerships
3. Create educational series content
4. Leverage sustainability messaging for Gen Z appeal`
  };

  return responses[scenario] || "Mock response generated successfully. This demonstrates the AI integration working properly.";
}

function displayTestResults(response, model) {
  const testResults = document.getElementById('test-results');
  const testMetrics = document.getElementById('test-metrics');

  testResults.textContent = response;
  testMetrics.style.display = 'grid';

  // Generate mock metrics
  const inputTokens = Math.floor(Math.random() * 300) + 200;
  const outputTokens = Math.floor(Math.random() * 400) + 300;
  const responseTime = Math.floor(Math.random() * 2000) + 1000;
  const modelPricing = geminiModels[model].pricing;
  const cost = ((inputTokens * modelPricing.input) + (outputTokens * modelPricing.output)) / 1000000;

  document.getElementById('response-time').textContent = `${responseTime}ms`;
  document.getElementById('input-tokens').textContent = inputTokens.toLocaleString();
  document.getElementById('output-tokens').textContent = outputTokens.toLocaleString();
  document.getElementById('estimated-cost').textContent = `$${cost.toFixed(4)}`;
}

// Model Comparison functionality
function initializeModelComparison() {
  const comparisonCards = document.querySelectorAll('.comparison-card');
  
  comparisonCards.forEach(card => {
    card.addEventListener('click', function() {
      const model = this.dataset.model;
      
      // Remove active state from all cards
      comparisonCards.forEach(c => c.classList.remove('comparison-card--active'));
      
      // Add active state to clicked card
      this.classList.add('comparison-card--active');
      
      // Update model selection in other tabs
      document.getElementById('model-select').value = model;
      document.getElementById('calc-model').value = model;
      document.getElementById('test-model').value = model;
    });
  });
}

// Cost Calculator functionality
function initializeCostCalculator() {
  const calculateBtn = document.getElementById('calculate-cost');
  const calcInputs = ['calc-model', 'requests-per-day', 'avg-input-tokens', 'avg-output-tokens'];

  calcInputs.forEach(inputId => {
    document.getElementById(inputId).addEventListener('input', calculateCost);
  });

  calculateBtn.addEventListener('click', calculateCost);
  
  // Initial calculation
  calculateCost();
}

function calculateCost() {
  const model = document.getElementById('calc-model').value;
  const requestsPerDay = parseInt(document.getElementById('requests-per-day').value) || 0;
  const avgInputTokens = parseInt(document.getElementById('avg-input-tokens').value) || 0;
  const avgOutputTokens = parseInt(document.getElementById('avg-output-tokens').value) || 0;

  const modelPricing = geminiModels[model].pricing;
  
  const costPerRequest = ((avgInputTokens * modelPricing.input) + (avgOutputTokens * modelPricing.output)) / 1000000;
  const dailyCost = costPerRequest * requestsPerDay;
  const monthlyCost = dailyCost * 30;
  const yearlyCost = dailyCost * 365;

  document.getElementById('daily-cost').textContent = `$${dailyCost.toFixed(2)}`;
  document.getElementById('monthly-cost').textContent = `$${monthlyCost.toFixed(2)}`;
  document.getElementById('yearly-cost').textContent = `$${yearlyCost.toFixed(2)}`;

  updateOptimizationTips(model, requestsPerDay, monthlyCost);
}

function updateOptimizationTips(model, requestsPerDay, monthlyCost) {
  const tipsContainer = document.getElementById('optimization-tips');
  let tips = [];

  if (monthlyCost > 100) {
    tips.push('Consider using Gemini 2.0 Flash Lite for high-volume, simple tasks');
  }

  if (requestsPerDay > 1000) {
    tips.push('Implement request batching to reduce API calls');
    tips.push('Cache frequent responses to minimize redundant requests');
  }

  if (model === 'gemini-2.5-pro' && requestsPerDay > 100) {
    tips.push('Use Gemini 2.5 Pro only for complex reasoning tasks');
    tips.push('Consider a hybrid approach with different models for different use cases');
  }

  tips.push('Monitor token usage patterns to optimize prompt engineering');
  tips.push('Set up usage alerts to prevent unexpected costs');

  tipsContainer.innerHTML = tips.map(tip => `<div class="tip">• ${tip}</div>`).join('');
}

// AI Assistant functionality
function initializeAiAssistant() {
  const sendBtn = document.getElementById('send-message');
  const messageInput = document.getElementById('assistant-message');
  const suggestionBtns = document.querySelectorAll('.suggestion-btn');
  const chatContainer = document.getElementById('assistant-chat');

  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const suggestion = this.dataset.suggestion;
      messageInput.value = suggestion;
      sendMessage();
    });
  });

  function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    messageInput.value = '';

    // Show typing indicator
    const typingIndicator = addMessage('AI is thinking...', 'assistant');
    
    // Simulate AI response
    setTimeout(() => {
      chatContainer.removeChild(typingIndicator);
      const response = generateAiResponse(message);
      addMessage(response, 'assistant');
    }, 2000);
  }

  function addMessage(content, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message chat-message--${type}`;
    
    const contentEl = document.createElement('div');
    contentEl.className = 'chat-message__content';
    contentEl.innerHTML = content.replace(/\n/g, '<br>');
    
    messageEl.appendChild(contentEl);
    chatContainer.appendChild(messageEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return messageEl;
  }

  function generateAiResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('creator') || lowerMessage.includes('analyze')) {
      return `I'll help you analyze TikTok creators for your affiliate program. To provide the most accurate analysis, I'll need:

• Creator's TikTok handle or profile link
• Your target product category
• Preferred collaboration type (review, unboxing, etc.)

Based on the creator data, I can provide insights on:
- Audience demographics and engagement rates
- Content performance metrics
- Collaboration recommendations
- Expected ROI projections

Would you like to provide a specific creator for analysis?`;
    }
    
    if (lowerMessage.includes('message') || lowerMessage.includes('optimize')) {
      return `I can help optimize your outreach messages for better response rates. Here are proven strategies for TikTok creator outreach:

**Key Elements for High-Converting Messages:**
1. **Personalization** - Reference their recent content
2. **Value Proposition** - Clear benefits for the creator
3. **Social Proof** - Mention successful collaborations
4. **Flexibility** - Offer creative freedom
5. **Clear CTA** - Specific next steps

**Template Structure:**
- Personalized greeting + content reference
- Brief company introduction
- Collaboration benefits
- Product/campaign details
- Clear call-to-action

Would you like me to optimize a specific message you're planning to send?`;
    }
    
    if (lowerMessage.includes('campaign') || lowerMessage.includes('strategy')) {
      return `I'll help you develop a comprehensive TikTok affiliate campaign strategy. Let me outline a proven framework:

**Campaign Development Process:**
1. **Market Research** - Analyze trending content and competitors
2. **Creator Segmentation** - Identify high-potential creators by niche
3. **Budget Allocation** - Optimize spend across creator tiers
4. **Content Guidelines** - Balance brand messaging with authenticity
5. **Performance Tracking** - Set up metrics and KPIs

**For your mobile repair accessories niche, I recommend:**
- Targeting tech reviewers and DIY creators
- Seasonal campaigns around device launches
- Educational content focus (repair tutorials)
- Multi-platform approach (TikTok + Instagram Reels)

What specific aspect of campaign strategy would you like to dive deeper into?`;
    }
    
    return `I'm here to help you succeed with your TikTok affiliate bot! I can assist with:

**Creator Analysis:** Evaluate potential collaborators based on engagement, demographics, and content relevance

**Message Optimization:** Improve your outreach templates for higher response rates

**Campaign Strategy:** Develop comprehensive affiliate marketing campaigns

**Market Insights:** Analyze trends in the UK mobile repair market

**Performance Tracking:** Set up metrics and KPIs for your campaigns

What specific challenge are you facing with your TikTok affiliate program?`;
  }
}

// Utility functions
function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status-indicator status-indicator--${type}`;
  element.style.display = 'block';
  
  setTimeout(() => {
    element.style.display = 'none';
  }, 5000);
}

// Add some interactive polish
document.addEventListener('DOMContentLoaded', function() {
  // Add loading states to buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      if (!this.disabled && !this.classList.contains('no-loading')) {
        const originalText = this.textContent;
        this.style.opacity = '0.8';
        setTimeout(() => {
          this.style.opacity = '1';
        }, 200);
      }
    });
  });

  // Add hover effects to cards
  const cards = document.querySelectorAll('.card, .comparison-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
});