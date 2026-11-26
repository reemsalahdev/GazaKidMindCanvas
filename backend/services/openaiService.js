const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const User = require('../models/User');

/**
 * Convert image file to base64 data URL
 */
async function imageToBase64(imageUrl) {
  try {
    // Handle local file paths vs URLs
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Download image from URL
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      const mimeType = response.headers['content-type'] || 'image/jpeg';
      return `data:${mimeType};base64,${buffer.toString('base64')}`;
    } else {
      // Read local file
      let filePath = imageUrl;
      
      // If imageUrl is relative, make it absolute
      if (!path.isAbsolute(filePath)) {
        // Remove leading slash if present
        if (filePath.startsWith('/')) {
          filePath = filePath.substring(1);
        }
        filePath = path.join(__dirname, '..', filePath);
      }
      
      const buffer = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' :
                       ext === '.gif' ? 'image/gif' :
                       ext === '.webp' ? 'image/webp' : 'image/jpeg';
      
      return `data:${mimeType};base64,${buffer.toString('base64')}`;
    }
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to convert image to base64');
  }
}

class OpenAIService {
  constructor() {
    this.systemPrompt = `أنت أخصائي نفسي للأطفال متخصص في تحليل رسومات الأطفال. 
    قم بتحليل هذه الرسمة وتقديم تقرير شامل باللغة العربية يتضمن:
    1. التقييم العام للرسمة
    2. المؤشرات العاطفية
    3. استخدام الألوان ودلالاتها
    4. الأشكال والرموز المستخدمة
    5. مستوى النمو والتطور
    6. نقاط القلق (إن وجدت)
    7. نقاط القوة
    8. التوصيات العلاجية والتربوية
    
    يجب أن يكون التحليل مهنياً ومفصلاً ومناسباً للمختصين في مجال الصحة النفسية للأطفال.`;
  }

  /**
   * Get OpenAI configuration from user database
   */
  async getOpenAIConfig(userId) {
    const user = await User.findById(userId).select('+openaiConfig.baseUrl +openaiConfig.apiKey');
    if (!user || !user.openaiConfig.baseUrl || !user.openaiConfig.apiKey) {
      throw new Error('OpenAI configuration not found. Please configure your OpenAI settings.');
    }
    return user.openaiConfig;
  }

  /**
   * Analyze a child's drawing using OpenAI Vision API
   */
  async analyzeDrawing(imageUrl, childInfo, userId) {
    try {
      // Get OpenAI config from database
      const config = await this.getOpenAIConfig(userId);

      // Convert image to base64
      const base64Image = await imageToBase64(imageUrl);

      // Prepare the request
      const requestBody = {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: this.systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `تحليل رسمة طفل:
                اسم الطفل: ${childInfo.name}
                العمر: ${childInfo.age} سنوات
                الجنس: ${childInfo.gender === 'male' ? 'ذكر' : 'أنثى'}
                
                الرجاء تحليل هذه الرسمة وتقديم تقرير مفصل.`
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.7
      };

      // Make API request
      const response = await axios.post(
        `${config.baseUrl}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 seconds timeout
        }
      );

      // Parse the response
      const analysisText = response.data.choices[0].message.content;
      const parsedAnalysis = this.parseAnalysisResponse(analysisText);

      return {
        success: true,
        analysis: parsedAnalysis,
        rawResponse: analysisText
      };

    } catch (error) {
      console.error('OpenAI analysis error:', error);
      
      if (error.response) {
        // API error
        if (error.response.status === 401) {
          throw new Error('Invalid OpenAI API key');
        } else if (error.response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded');
        } else if (error.response.status === 404) {
          throw new Error('Invalid OpenAI base URL or model not found');
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - the analysis took too long');
      }

      throw new Error(error.message || 'Failed to analyze drawing');
    }
  }

  /**
   * Quick analysis for recommendations - lightweight version
   */
  async analyzeDrawingForRecommendations(imageUrl, childInfo, userId) {
    try {
      // Get OpenAI config from database
      const config = await this.getOpenAIConfig(userId);

      // Convert image to base64
      const base64Image = await imageToBase64(imageUrl);

      // Simplified prompt for recommendations
      const quickPrompt = `أنت أخصائي نفسي للأطفال. قم بتحليل سريع لهذه الرسمة لإنشاء توصيات.
      قدم تحليل مختصر يتضمن:
      1. انطباع عام عن الرسمة
      2. المؤشرات العاطفية الرئيسية
      3. أهم النقاط التي تحتاج انتباه
      4. نقاط القوة الواضحة`;

      // Prepare the request
      const requestBody = {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: quickPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `تحليل سريع لرسمة الطفل:
                اسم الطفل: ${childInfo.name}
                العمر: ${childInfo.age} سنوات
                الجنس: ${childInfo.gender === 'male' ? 'ذكر' : 'أنثى'}
                
                الرجاء تقديم تحليل مختصر لإنشاء التوصيات.`
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                  detail: "low"
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.5
      };

      // Make API request
      const response = await axios.post(
        `${config.baseUrl}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      // Parse the response
      const analysisText = response.data.choices[0].message.content;
      const parsedAnalysis = this.parseAnalysisResponse(analysisText);

      return {
        success: true,
        analysis: parsedAnalysis,
        rawResponse: analysisText,
        summary: this.extractSummary(analysisText)
      };

    } catch (error) {
      console.error('OpenAI quick analysis error:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Invalid OpenAI API key');
        } else if (error.response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded');
        } else if (error.response.status === 404) {
          throw new Error('Invalid OpenAI base URL or model not found');
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - the analysis took too long');
      }

      throw new Error(error.message || 'Failed to analyze drawing for recommendations');
    }
  }

  /**
   * Extract a one-sentence summary from analysis text
   */
  extractSummary(analysisText) {
    const lines = analysisText.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      // Return first meaningful line as summary
      const firstLine = lines[0].replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim();
      return firstLine.length > 10 ? firstLine : analysisText.substring(0, 100) + '...';
    }
    return analysisText.substring(0, 100) + '...';
  }

  /**
   * Parse the AI response into structured data
   */
  parseAnalysisResponse(responseText) {
    try {
      // Extract sections from the response
      const sections = {
        overallAssessment: '',
        emotionalIndicators: '',
        colorUsage: '',
        shapes: '',
        symbolism: '',
        developmentalLevel: '',
        concerns: [],
        strengths: [],
        recommendations: []
      };

      // Split response into sections
      const lines = responseText.split('\n');
      let currentSection = '';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Identify sections
        if (trimmedLine.includes('التقييم العام') || trimmedLine.includes('تقييم عام')) {
          currentSection = 'overallAssessment';
          continue;
        } else if (trimmedLine.includes('المؤشرات العاطفية') || trimmedLine.includes('الحالة العاطفية')) {
          currentSection = 'emotionalIndicators';
          continue;
        } else if (trimmedLine.includes('استخدام الألوان') || trimmedLine.includes('الألوان')) {
          currentSection = 'colorUsage';
          continue;
        } else if (trimmedLine.includes('الأشكال') || trimmedLine.includes('الرموز')) {
          currentSection = 'shapes';
          continue;
        } else if (trimmedLine.includes('الرمزية') || trimmedLine.includes('الدلالات')) {
          currentSection = 'symbolism';
          continue;
        } else if (trimmedLine.includes('مستوى النمو') || trimmedLine.includes('التطور')) {
          currentSection = 'developmentalLevel';
          continue;
        } else if (trimmedLine.includes('نقاط القلق') || trimmedLine.includes('المخاوف')) {
          currentSection = 'concerns';
          continue;
        } else if (trimmedLine.includes('نقاط القوة') || trimmedLine.includes('الإيجابيات')) {
          currentSection = 'strengths';
          continue;
        } else if (trimmedLine.includes('التوصيات') || trimmedLine.includes('المقترحات')) {
          currentSection = 'recommendations';
          continue;
        }

        // Add content to sections
        if (trimmedLine && currentSection) {
          if (['concerns', 'strengths'].includes(currentSection)) {
            if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
              sections[currentSection].push(trimmedLine.substring(1).trim());
            }
          } else if (currentSection === 'recommendations') {
            if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
              const recommendation = trimmedLine.substring(1).trim();
              sections.recommendations.push({
                title: recommendation.split(':')[0] || recommendation.substring(0, 50),
                description: recommendation,
                priority: 'medium',
                category: this.categorizeRecommendation(recommendation)
              });
            }
          } else {
            sections[currentSection] += (sections[currentSection] ? '\n' : '') + trimmedLine;
          }
        }
      }

      // If parsing failed, use the raw response
      if (!sections.overallAssessment) {
        sections.overallAssessment = responseText;
      }

      return sections;
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      // Return a basic structure with the raw response
      return {
        overallAssessment: responseText,
        emotionalIndicators: '',
        colorUsage: '',
        shapes: '',
        symbolism: '',
        developmentalLevel: '',
        concerns: [],
        strengths: [],
        recommendations: []
      };
    }
  }

  /**
   * Categorize recommendation based on keywords
   */
  categorizeRecommendation(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('علاج') || lowerText.includes('جلسات') || lowerText.includes('نفسي')) {
      return 'therapeutic';
    } else if (lowerText.includes('تعليم') || lowerText.includes('مدرسة') || lowerText.includes('تعلم')) {
      return 'educational';
    } else if (lowerText.includes('سلوك') || lowerText.includes('تصرف')) {
      return 'behavioral';
    } else if (lowerText.includes('اجتماع') || lowerText.includes('أصدقاء') || lowerText.includes('تواصل')) {
      return 'social';
    } else if (lowerText.includes('أسرة') || lowerText.includes('والد') || lowerText.includes('أهل')) {
      return 'family';
    }
    
    return 'therapeutic';
  }

  /**
   * Generate emotional state scores based on analysis
   */
  generateEmotionalScores(analysisText) {
    const scores = {
      happiness: 50,
      sadness: 50,
      anger: 50,
      fear: 50,
      anxiety: 50
    };

    const lowerText = analysisText.toLowerCase();

    // Adjust scores based on keywords in the analysis
    // Happiness indicators
    if (lowerText.includes('سعيد') || lowerText.includes('مرح') || lowerText.includes('إيجابي') || 
        lowerText.includes('مشرق') || lowerText.includes('فرح')) {
      scores.happiness = Math.min(scores.happiness + 20, 100);
    }

    // Sadness indicators  
    if (lowerText.includes('حزن') || lowerText.includes('كئيب') || lowerText.includes('كآبة') ||
        lowerText.includes('وحيد') || lowerText.includes('منعزل')) {
      scores.sadness = Math.min(scores.sadness + 20, 100);
      scores.happiness = Math.max(scores.happiness - 10, 0);
    }

    // Anger indicators
    if (lowerText.includes('غضب') || lowerText.includes('عدوان') || lowerText.includes('عنف') ||
        lowerText.includes('غاضب') || lowerText.includes('عصبي')) {
      scores.anger = Math.min(scores.anger + 20, 100);
    }

    // Fear indicators
    if (lowerText.includes('خوف') || lowerText.includes('خائف') || lowerText.includes('مخاوف') ||
        lowerText.includes('رعب') || lowerText.includes('قلق من')) {
      scores.fear = Math.min(scores.fear + 20, 100);
    }

    // Anxiety indicators
    if (lowerText.includes('قلق') || lowerText.includes('توتر') || lowerText.includes('اضطراب') ||
        lowerText.includes('ضغط') || lowerText.includes('مضطرب')) {
      scores.anxiety = Math.min(scores.anxiety + 20, 100);
    }

    return scores;
  }

  /**
   * Calculate confidence score based on analysis completeness
   */
  calculateConfidenceScore(analysis) {
    let score = 0;
    const maxScore = 100;

    // Check each section with weighted scoring
    if (analysis.overallAssessment && analysis.overallAssessment.length > 50) {
      score += 15;
    }
    if (analysis.emotionalIndicators && analysis.emotionalIndicators.length > 30) {
      score += 15;
    }
    if (analysis.colorUsage && analysis.colorUsage.length > 30) {
      score += 10;
    }
    if (analysis.shapes && analysis.shapes.length > 30) {
      score += 10;
    }
    if (analysis.symbolism && analysis.symbolism.length > 30) {
      score += 10;
    }
    if (analysis.developmentalLevel && analysis.developmentalLevel.length > 30) {
      score += 10;
    }
    if (analysis.concerns && analysis.concerns.length > 0) {
      score += 10;
    }
    if (analysis.strengths && analysis.strengths.length > 0) {
      score += 10;
    }
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      score += 10;
    }

    // Ensure score never exceeds 100
    return Math.min(score, maxScore);
  }

  /**
   * Generate smart recommendations based on child's analysis history
   */
  async generateRecommendations(childInfo, analysisHistory, userId, count = 4, drawingSummaries = []) {
    try {
      console.log(`Generating ${count} recommendations for child:`, childInfo.name);
      
      // Get OpenAI config from database
      const config = await this.getOpenAIConfig(userId);
      console.log('OpenAI config loaded successfully');

      // Prepare context from analysis history and drawing summaries (if available)
      let context = [];
      let contextDescription = '';
      
      if (analysisHistory && analysisHistory.length > 0) {
        context = analysisHistory.map(drawing => ({
          date: drawing.createdAt,
          concerns: drawing.analysis?.aiAnalysis?.concerns || [],
          strengths: drawing.analysis?.aiAnalysis?.strengths || [],
          emotionalState: drawing.analysis?.psychologicalState || {},
          overallAssessment: drawing.analysis?.aiAnalysis?.overallAssessment || ''
        }));
        
        console.log(`Analyzing ${analysisHistory.length} drawings for context`);
        contextDescription = `سجل التحليلات السابقة:\n${JSON.stringify(context, null, 2)}\n\n`;
        
        // Add drawing summaries if available
        if (drawingSummaries && drawingSummaries.length > 0) {
          contextDescription += `ملخصات الرسومات:\n`;
          drawingSummaries.forEach((summary, index) => {
            contextDescription += `${index + 1}. ${summary.drawingTitle} (${new Date(summary.drawingDate).toLocaleDateString('ar-EG')}): ${summary.summary}\n`;
          });
          contextDescription += '\n';
          console.log(`Including ${drawingSummaries.length} drawing summaries in recommendations context`);
        }
      } else {
        console.log('No analyzed drawings available, generating general recommendations');
        contextDescription = 'لا توجد رسومات محللة حالياً، لذا ستكون التوصيات عامة مناسبة للعمر والجنس.\n\n';
      }

      // Create comprehensive prompt that works with or without drawings
      const prompt = `بناءً على معلومات الطفل ${childInfo.name} (${childInfo.age} سنوات، ${childInfo.gender === 'male' ? 'ذكر' : 'أنثى'})، قم بإنشاء ${count} توصيات ذكية وعملية.

${contextDescription}المطلوب:
1. قم بإنشاء ${count} توصيات جديدة ومفيدة
2. يجب أن تكون التوصيات عملية وقابلة للتطبيق
3. يجب أن تراعي عمر الطفل وجنسه
4. ${analysisHistory && analysisHistory.length > 0 ? 'يجب أن تكون مبنية على الأنماط الملاحظة في الرسومات وملخصاتها المذكورة أعلاه' : 'يجب أن تكون مناسبة للتطوير العام للطفل في هذا العمر'}
5. ${drawingSummaries && drawingSummaries.length > 0 ? 'استخدم ملخصات الرسومات المذكورة أعلاه لفهم محتوى الرسومات وتقديم توصيات مناسبة' : ''}
6. يجب تصنيف كل توصية (therapeutic, educational, behavioral, social, family)
7. يجب تحديد أولوية كل توصية (high, medium, low)
8. أذكر تفاصيل الصور المهمة في المقترحات المنتجة

قم بإرجاع التوصيات بتنسيق JSON التالي:
{
  "recommendations": [
    {
      "title": "عنوان التوصية",
      "description": "وصف تفصيلي للتوصية",
      "category": "therapeutic/educational/behavioral/social/family",
      "priority": "high/medium/low",
      "type": "positive/warning/action"
    }
  ]
}`;

      console.log('Sending request to OpenAI...');
      
      // Make API request
      const response = await axios.post(
        `${config.baseUrl}/chat/completions`,
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "أنت أخصائي نفسي للأطفال متخصص في تقديم التوصيات العلاجية والتربوية بناءً على تحليل رسومات الأطفال. قدم توصيات عملية ومحددة باللغة العربية. يجب أن تكون إجابتك بتنسيق JSON صالح فقط."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      console.log('OpenAI response received');

      // Parse the response with error handling
      let recommendationsData;
      try {
        let responseContent = response.data.choices[0].message.content;
        console.log('Raw OpenAI response:', responseContent);
        
        // Clean the response - remove markdown code blocks if present
        responseContent = this.cleanJSONResponse(responseContent);
        console.log('Cleaned response:', responseContent);
        
        recommendationsData = JSON.parse(responseContent);
        console.log('Parsed recommendations:', recommendationsData);
      } catch (parseError) {
        console.error('Failed to parse recommendations JSON:', parseError);
        console.error('Raw response:', response.data.choices[0].message.content);
        
        // Fallback: try to extract recommendations manually
        const fallbackRecommendations = this.extractRecommendationsFromText(response.data.choices[0].message.content);
        console.log('Fallback recommendations:', fallbackRecommendations);
        
        return {
          success: true,
          recommendations: fallbackRecommendations
        };
      }
      
      const finalRecommendations = recommendationsData.recommendations || [];
      console.log(`Generated ${finalRecommendations.length} recommendations`);
      
      return {
        success: true,
        recommendations: finalRecommendations
      };

    } catch (error) {
      console.error('OpenAI recommendations error:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Invalid OpenAI API key');
        } else if (error.response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded');
        }
      }

      throw new Error(error.message || 'Failed to generate recommendations');
    }
  }

  /**
   * Extract recommendations from text when JSON parsing fails
   */
  extractRecommendationsFromText(text) {
    const recommendations = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentRecommendation = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for numbered items or bullet points
      if (trimmedLine.match(/^\d+[\.\-\)]/) || trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        if (currentRecommendation) {
          recommendations.push(currentRecommendation);
        }
        
        const cleanedLine = trimmedLine.replace(/^[\d\.\-\)\•\*]+\s*/, '');
        currentRecommendation = {
          title: cleanedLine.substring(0, 50) + (cleanedLine.length > 50 ? '...' : ''),
          description: cleanedLine,
          category: 'therapeutic',
          priority: 'medium',
          type: 'action'
        };
      } else if (currentRecommendation && trimmedLine) {
        // Add to current recommendation description
        currentRecommendation.description += ' ' + trimmedLine;
      }
    }
    
    // Add the last recommendation
    if (currentRecommendation) {
      recommendations.push(currentRecommendation);
    }
    
    // If no recommendations found, return empty array
    // Let OpenAI handle all recommendations
    
    return recommendations;
  }

  /**
   * Generate a one-sentence summary for a drawing
   */
  async generateDrawingSummary(imageUrl, childInfo, userId) {
    try {
      // Get OpenAI config from database
      const config = await this.getOpenAIConfig(userId);

      // Convert image to base64
      const base64Image = await imageToBase64(imageUrl);

      // Prepare the request
      const requestBody = {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "أنت أخصائي نفسي للأطفال متخصص في تحليل رسومات الأطفال. قم بتلخيص هذه الرسمة في جملة واحدة فقط باللغة العربية تصف المحتوى والحالة العاطفية الظاهرة."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `قم بتلخيص رسمة الطفل ${childInfo.name} (${childInfo.age} سنوات، ${childInfo.gender === 'male' ? 'ذكر' : 'أنثى'}) في جملة واحدة فقط.`
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                  detail: "low"
                }
              }
            ]
          }
        ],
        max_tokens: 150,
        temperature: 0.5
      };

      // Make API request
      const response = await axios.post(
        `${config.baseUrl}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 45000 // 45 seconds timeout for summary generation
        }
      );

      // Extract the summary
      const summary = response.data.choices[0].message.content.trim();

      return {
        success: true,
        summary: summary
      };

    } catch (error) {
      console.error('OpenAI summary generation error:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Invalid OpenAI API key');
        } else if (error.response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded');
        } else if (error.response.status === 404) {
          throw new Error('Invalid OpenAI base URL or model not found');
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - summary generation took too long');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to OpenAI service');
      }

      throw new Error(error.message || 'Failed to generate summary');
    }
  }

  /**
   * Clean JSON response by removing markdown code blocks
   */
  cleanJSONResponse(response) {
    if (!response) return response;
    
    // Trim whitespace
    response = response.trim();
    
    // Remove markdown code blocks
    if (response.startsWith('```json')) {
      response = response.substring(7); // Remove ```json
    } else if (response.startsWith('```')) {
      response = response.substring(3); // Remove ```
    }
    
    // Remove closing code block
    if (response.endsWith('```')) {
      response = response.substring(0, response.length - 3);
    }
    
    // Trim again after removing code blocks
    return response.trim();
  }
}

module.exports = new OpenAIService();