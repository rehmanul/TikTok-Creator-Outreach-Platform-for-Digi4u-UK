import axios from 'axios';
import { Creator, Campaign } from '@shared/schema';

interface AIAnalysisResult {
  relevanceScore: number;
  strengths: string[];
  concerns: string[];
  estimatedResponseRate: number;
  recommendedMessage: string;
  reasoning: string;
}

interface MarketInsight {
  trend: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export class AIService {
  private apiKey: string;
  private model: string = 'gemini-2.0-flash-exp';
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  // Analyze creator for campaign fit
  async analyzeCreator(creator: Creator, campaign: Campaign): Promise<AIAnalysisResult> {
    const prompt = `
    Analyze this TikTok creator for a potential affiliate collaboration:
    
    Creator Profile:
    - Username: ${creator.username}
    - Followers: ${creator.followerCount.toLocaleString()}
    - Engagement Rate: ${creator.engagementRate || 'Unknown'}%
    - Average Views: ${creator.avgViews?.toLocaleString() || 'Unknown'}
    - Categories: ${creator.categories?.join(', ') || 'Unknown'}
    - Location: ${creator.location || 'Unknown'}
    - Bio: ${creator.bio || 'No bio available'}
    - GMV: £${creator.gmv || '0'}
    - Verified: ${creator.isVerified ? 'Yes' : 'No'}
    
    Campaign Details:
    - Name: ${campaign.name}
    - Description: ${campaign.description}
    - Product Categories: ${campaign.targetCategories?.join(', ')}
    - Budget: £${campaign.budget}
    - Target Locations: ${campaign.targetLocations?.join(', ')}
    
    Please provide:
    1. A relevance score (0-100) for how well this creator matches the campaign
    2. Top 3 strengths of this creator for the campaign
    3. Any concerns or risks
    4. Estimated response rate percentage
    5. A personalized outreach message (max 200 characters)
    6. Brief reasoning for your assessment
    
    Format as JSON.
    `;

    try {
      const response = await axios.post(
        `${this.baseURL}/models/${this.model}:generateContent`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            responseMimeType: "application/json"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: this.apiKey
          }
        }
      );

      const result = JSON.parse(response.data.candidates[0].content.parts[0].text);
      
      return {
        relevanceScore: result.relevanceScore,
        strengths: result.strengths,
        concerns: result.concerns || [],
        estimatedResponseRate: result.estimatedResponseRate,
        recommendedMessage: result.personalizedMessage,
        reasoning: result.reasoning
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      throw new Error('Failed to analyze creator');
    }
  }

  // Optimize campaign message template
  async optimizeMessage(template: string, targetAudience: string, productType: string): Promise<string> {
    const prompt = `
    Optimize this TikTok affiliate outreach message template for better response rates:
    
    Current Template:
    "${template}"
    
    Target Audience: ${targetAudience}
    Product Type: ${productType}
    
    Requirements:
    - Keep it under 200 characters
    - Sound genuine and personal, not salesy
    - Include placeholders like {creator_name} for personalization
    - Focus on mutual benefit
    - Match TikTok's casual communication style
    
    Return only the optimized message template.
    `;

    try {
      const response = await axios.post(
        `${this.baseURL}/models/${this.model}:generateContent`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 200
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: this.apiKey
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('Message optimization error:', error);
      throw new Error('Failed to optimize message');
    }
  }

  // Generate campaign strategy
  async generateCampaignStrategy(
    productCategory: string,
    budget: number,
    targetMarket: string
  ): Promise<{
    strategy: string;
    targetCreatorProfile: {
      followerRange: { min: number; max: number };
      categories: string[];
      engagementRate: number;
    };
    estimatedResults: {
      invitations: number;
      responses: number;
      collaborations: number;
      revenue: number;
    };
    recommendations: string[];
  }> {
    const prompt = `
    Create a TikTok affiliate marketing campaign strategy:
    
    Product Category: ${productCategory}
    Budget: £${budget}
    Target Market: ${targetMarket}
    
    Provide:
    1. Overall strategy approach
    2. Ideal creator profile (follower range, categories, min engagement rate)
    3. Estimated campaign results (invitations, responses, collaborations, revenue)
    4. Top 5 actionable recommendations
    
    Format as JSON.
    `;

    try {
      const response = await axios.post(
        `${this.baseURL}/models/${this.model}:generateContent`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
            responseMimeType: "application/json"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: this.apiKey
          }
        }
      );

      return JSON.parse(response.data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error('Strategy generation error:', error);
      throw new Error('Failed to generate campaign strategy');
    }
  }

  // Get market insights
  async getMarketInsights(category: string, region: string = 'UK'): Promise<MarketInsight[]> {
    const prompt = `
    Provide current TikTok affiliate marketing insights for:
    Category: ${category}
    Region: ${region}
    
    Include:
    1. Top 5 current trends
    2. Impact level (high/medium/low)
    3. Actionable recommendations
    
    Focus on: content trends, creator preferences, audience behavior, and seasonal factors.
    
    Format as JSON array.
    `;

    try {
      const response = await axios.post(
        `${this.baseURL}/models/${this.model}:generateContent`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            responseMimeType: "application/json"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: this.apiKey
          }
        }
      );

      return JSON.parse(response.data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error('Market insights error:', error);
      throw new Error('Failed to get market insights');
    }
  }

  // Analyze response sentiment
  async analyzeResponse(responseText: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    intent: 'interested' | 'not_interested' | 'needs_info' | 'negotiating';
    suggestedReply?: string;
  }> {
    const prompt = `
    Analyze this creator's response to an affiliate collaboration invitation:
    
    Response: "${responseText}"
    
    Determine:
    1. Sentiment (positive/negative/neutral)
    2. Intent (interested/not_interested/needs_info/negotiating)
    3. If follow-up needed, suggest a brief reply
    
    Format as JSON.
    `;

    try {
      const response = await axios.post(
        `${this.baseURL}/models/${this.model}:generateContent`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 300,
            responseMimeType: "application/json"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: this.apiKey
          }
        }
      );

      return JSON.parse(response.data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error('Response analysis error:', error);
      throw new Error('Failed to analyze response');
    }
  }

  // Generate performance report
  async generatePerformanceReport(campaignData: any): Promise<{
    summary: string;
    keyMetrics: { metric: string; value: string; trend: string }[];
    insights: string[];
    recommendations: string[];
  }> {
    const prompt = `
    Generate a performance report for this TikTok affiliate campaign:
    
    Campaign Data: ${JSON.stringify(campaignData, null, 2)}
    
    Provide:
    1. Executive summary (2-3 sentences)
    2. Key metrics with trends
    3. Top 3 insights
    4. Top 3 recommendations for improvement
    
    Format as JSON.
    `;

    try {
      const response = await axios.post(
        `${this.baseURL}/models/${this.model}:generateContent`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1000,
            responseMimeType: "application/json"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: this.apiKey
          }
        }
      );

      return JSON.parse(response.data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error('Failed to generate performance report');
    }
  }
}

export const aiService = new AIService();