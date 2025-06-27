# Create a simple setup and testing script

setup_script = """
// Gemini AI Setup and Testing Script for TikTok Bot
// File: setup-gemini.js

import TikTokGeminiAI from './tiktok-gemini-integration.js';

class GeminiSetup {
  constructor() {
    this.apiKey = null;
    this.geminiAI = null;
  }

  async initialize(apiKey) {
    console.log('🚀 Initializing Gemini AI for TikTok Bot...');
    
    try {
      this.apiKey = apiKey;
      this.geminiAI = new TikTokGeminiAI({
        apiKey: apiKey,
        model: 'gemini-2.0-flash' // Recommended starting model
      });

      console.log('✅ Gemini AI initialized successfully!');
      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      return false;
    }
  }

  async testConnection() {
    console.log('🔍 Testing Gemini API connection...');
    
    const testResult = await this.geminiAI.getQuickAdvice(
      "What makes a good TikTok creator for mobile phone accessories?",
      { testMode: true }
    );

    if (testResult.success) {
      console.log('✅ API Connection Test: PASSED');
      console.log('Response:', testResult.advice);
      return true;
    } else {
      console.log('❌ API Connection Test: FAILED');
      console.log('Error:', testResult.error);
      return false;
    }
  }

  async testCreatorAnalysis() {
    console.log('🎯 Testing Creator Analysis...');
    
    const mockCreator = {
      username: '@techreview_uk',
      followerCount: 75000,
      category: 'Technology',
      engagementRate: 4.2,
      recentTopics: ['iPhone reviews', 'Android tutorials', 'Phone accessories'],
      location: 'London, UK'
    };

    const campaignGoals = {
      budget: 5000,
      timeline: '3 months',
      metrics: ['engagement', 'conversions', 'brand_awareness']
    };

    const analysis = await this.geminiAI.analyzeCreatorFit(mockCreator, campaignGoals);
    
    if (analysis.success) {
      console.log('✅ Creator Analysis Test: PASSED');
      console.log(`Fit Score: ${analysis.fitScore}/10`);
      console.log(`Estimated ROI: ${analysis.estimatedROI}x`);
      return true;
    } else {
      console.log('❌ Creator Analysis Test: FAILED');
      console.log('Error:', analysis.error);
      return false;
    }
  }

  async testMessageOptimization() {
    console.log('📝 Testing Message Optimization...');
    
    const mockCreator = {
      username: '@phonerepair_pro',
      followerCount: 45000,
      category: 'DIY & Repair',
      engagementRate: 5.8,
      recentTopics: ['Screen repair tutorials', 'Battery replacement', 'Tool reviews'],
      location: 'Manchester, UK'
    };

    const originalMessage = "Hi! We sell phone parts. Want to collaborate?";

    const optimization = await this.geminiAI.optimizeInvitationMessage(
      mockCreator, 
      originalMessage
    );

    if (optimization.success) {
      console.log('✅ Message Optimization Test: PASSED');
      console.log('Original:', originalMessage);
      console.log('Optimized:', optimization.optimizedMessage);
      console.log(`Response Probability: ${optimization.responseProbability}%`);
      return true;
    } else {
      console.log('❌ Message Optimization Test: FAILED');
      console.log('Error:', optimization.error);
      return false;
    }
  }

  async runFullTestSuite() {
    console.log('🧪 Running Complete Gemini AI Test Suite\\n');
    
    const tests = [
      { name: 'API Connection', test: () => this.testConnection() },
      { name: 'Creator Analysis', test: () => this.testCreatorAnalysis() },
      { name: 'Message Optimization', test: () => this.testMessageOptimization() }
    ];

    let passed = 0;
    const total = tests.length;

    for (const test of tests) {
      console.log(`\\n--- ${test.name} Test ---`);
      const result = await test.test();
      if (result) passed++;
    }

    console.log(`\\n📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Gemini AI is ready for production.');
      return true;
    } else {
      console.log('⚠️  Some tests failed. Please check your configuration.');
      return false;
    }
  }

  generateEnvironmentTemplate() {
    return `
# Gemini AI Configuration for TikTok Bot
# Add these to your .env file

# Required: Your Gemini API Key from Google AI Studio
GEMINI_API_KEY=your_gemini_api_key_here

# Recommended: Starting model (change based on needs)
GEMINI_MODEL=gemini-2.0-flash

# Optional: Rate limiting (requests per minute)
GEMINI_RATE_LIMIT=60

# Optional: Cost monitoring
GEMINI_MONTHLY_BUDGET=100

# Model Selection Guide:
# gemini-2.0-flash-lite -> High volume, cost-effective ($0.0375/$0.15 per M tokens)
# gemini-2.0-flash -> Balanced performance ($0.075/$0.30 per M tokens)  
# gemini-2.5-flash -> Advanced reasoning ($0.30/$2.50 per M tokens)
# gemini-2.5-pro -> Highest intelligence ($7.00/$28.00 per M tokens)
`;
  }

  printSetupInstructions() {
    console.log(`
🚀 GEMINI AI SETUP INSTRUCTIONS FOR TIKTOK BOT

1. GET YOUR API KEY:
   - Visit: https://ai.google.dev/gemini-api/docs/api-key
   - Sign in with your Google account
   - Click "Get API Key" → "Create API Key"
   - Copy your API key (starts with "AIza...")

2. INSTALL DEPENDENCIES:
   npm install @google/generative-ai

3. CONFIGURE ENVIRONMENT:
   Create a .env file with your API key:
   GEMINI_API_KEY=your_api_key_here
   GEMINI_MODEL=gemini-2.0-flash

4. TEST INTEGRATION:
   node setup-gemini.js test

5. MIGRATE FROM OPENAI:
   - Replace OpenAI imports with Gemini imports
   - Update prompt templates for Gemini format
   - Test thoroughly before production deployment

RECOMMENDED MODELS BY USE CASE:
- High-volume invitations: gemini-2.0-flash-lite
- Creator analysis: gemini-2.0-flash
- Strategic planning: gemini-2.5-flash
- Complex decisions: gemini-2.5-pro

COST COMPARISON (per 1M tokens):
- 2.0 Flash Lite: $0.19 total
- 2.0 Flash: $0.375 total  
- 2.5 Flash: $2.80 total
- 2.5 Pro: $35.00 total

Need help? Check the complete guide: gemini-migration-guide.md
`);
  }
}

// CLI interface for easy setup
async function main() {
  const setup = new GeminiSetup();
  const args = process.argv.slice(2);
  
  if (args.includes('help')) {
    setup.printSetupInstructions();
    return;
  }

  if (args.includes('env')) {
    console.log(setup.generateEnvironmentTemplate());
    return;
  }

  // Get API key from environment or command line
  const apiKey = process.env.GEMINI_API_KEY || args.find(arg => arg.startsWith('--key='))?.split('=')[1];
  
  if (!apiKey) {
    console.log('❌ No API key provided.');
    console.log('Use: node setup-gemini.js --key=YOUR_API_KEY');
    console.log('Or set GEMINI_API_KEY environment variable');
    console.log('\\nFor help: node setup-gemini.js help');
    return;
  }

  // Initialize and test
  const initialized = await setup.initialize(apiKey);
  if (!initialized) {
    console.log('Setup failed. Please check your API key and try again.');
    return;
  }

  if (args.includes('test')) {
    await setup.runFullTestSuite();
  } else {
    console.log('✅ Gemini AI setup complete!');
    console.log('Run "node setup-gemini.js test" to run tests');
  }
}

// Export for use as module
export { GeminiSetup };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
"""

# Save the setup script
with open('setup-gemini.js', 'w') as f:
    f.write(setup_script)

print("✅ Gemini setup and testing script created!")
print("\nSetup Instructions:")
print("1. Get your Gemini API key from https://ai.google.dev/gemini-api/docs/api-key")
print("2. Run: node setup-gemini.js --key=YOUR_API_KEY")
print("3. Test with: node setup-gemini.js test")
print("\nFiles created:")
print("- setup-gemini.js (setup and testing)")
print("- tiktok-gemini-integration.js (main integration)")
print("- gemini-migration-guide.md (complete documentation)")