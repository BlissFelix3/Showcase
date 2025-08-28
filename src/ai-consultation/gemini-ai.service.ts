import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { geminiConfig, consultationPrompts } from '../config/gemini.config';

export interface AIConsultationRequest {
  legalProblem: string;
  language: string;
  context?: Record<string, any>;
}

export interface AIConsultationResponse {
  analysis: string;
  recommendations: string;
  chosenOption?: string;
  estimatedCosts?: Record<string, any>;
  timeline?: Record<string, any>;
  nextSteps?: string[];
  metadata?: Record<string, any>;
}

export interface DocumentGenerationRequest {
  documentType: string;
  context: string;
  language: string;
  customizations?: Record<string, any>;
}

export interface DocumentGenerationResponse {
  document: string;
  instructions: string;
  placeholders: string[];
  legalNotes: string;
}

export interface LawyerRecommendationRequest {
  caseDetails: string;
  jurisdiction: string;
  practiceArea: string;
  language: string;
  clientPreferences?: Record<string, any>;
}

export interface LawyerRecommendationResponse {
  requirements: Record<string, any>;
  selectionCriteria: Record<string, any>;
  verificationChecklist: string[];
  interviewQuestions: string[];
  nextSteps: string[];
}

@Injectable()
export class GeminiAIService {
  private readonly logger = new Logger(GeminiAIService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: GenerativeModel;

  constructor() {
    if (!geminiConfig.apiKey) {
      this.logger.error('GEMINI_API_KEY is not configured');
      throw new BadRequestException('AI service is not properly configured');
    }

    this.genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: geminiConfig.model,
      generationConfig: {
        maxOutputTokens: geminiConfig.maxTokens,
        temperature: geminiConfig.temperature,
        topP: geminiConfig.topP,
        topK: geminiConfig.topK,
      },
    });

    this.logger.log('Gemini AI service initialized successfully');
  }

  async generateLegalConsultation(
    request: AIConsultationRequest,
  ): Promise<AIConsultationResponse> {
    try {
      this.logger.log(
        `Generating legal consultation for language: ${request.language}`,
      );

      // Generate legal analysis
      const analysisPrompt = consultationPrompts.analysisPrompt(
        request.legalProblem,
        request.language,
      );

      const analysisResult = await this.generateContent(analysisPrompt);
      const analysis = this.extractAnalysis(analysisResult);

      // Generate recommendations based on analysis
      const recommendationsPrompt = consultationPrompts.recommendationsPrompt(
        analysis,
        request.language,
      );

      const recommendationsResult = await this.generateContent(
        recommendationsPrompt,
      );
      const recommendations = this.extractRecommendations(
        recommendationsResult,
      );

      // Extract additional information
      const chosenOption = this.extractChosenOption(recommendationsResult);
      const estimatedCosts = this.extractEstimatedCosts(recommendationsResult);
      const timeline = this.extractTimeline(recommendationsResult);
      const nextSteps = this.extractNextSteps(recommendationsResult);

      const response: AIConsultationResponse = {
        analysis,
        recommendations,
        chosenOption,
        estimatedCosts,
        timeline,
        nextSteps,
        metadata: {
          model: geminiConfig.model,
          timestamp: new Date().toISOString(),
          language: request.language,
          context: request.context,
        },
      };

      this.logger.log('Legal consultation generated successfully');
      return response;
    } catch (error) {
      this.logger.error('Error generating legal consultation:', error);
      throw new BadRequestException(
        'Failed to generate legal consultation. Please try again.',
      );
    }
  }

  async generateLegalDocument(
    request: DocumentGenerationRequest,
  ): Promise<DocumentGenerationResponse> {
    try {
      this.logger.log(`Generating legal document: ${request.documentType}`);

      const prompt = consultationPrompts.documentGenerationPrompt(
        request.documentType,
        request.context,
        request.language,
      );

      const result = await this.generateContent(prompt);

      const response: DocumentGenerationResponse = {
        document: this.extractDocument(result),
        instructions: this.extractInstructions(result),
        placeholders: this.extractPlaceholders(result),
        legalNotes: this.extractLegalNotes(result),
      };

      this.logger.log('Legal document generated successfully');
      return response;
    } catch (error) {
      this.logger.error('Error generating legal document:', error);
      throw new BadRequestException(
        'Failed to generate legal document. Please try again.',
      );
    }
  }

  async generateLawyerRecommendations(
    request: LawyerRecommendationRequest,
  ): Promise<LawyerRecommendationResponse> {
    try {
      this.logger.log(
        `Generating lawyer recommendations for practice area: ${request.practiceArea}`,
      );

      const prompt = consultationPrompts.lawyerRecommendationPrompt(
        request.caseDetails,
        request.jurisdiction,
        request.practiceArea,
        request.language,
      );

      const result = await this.generateContent(prompt);

      const response: LawyerRecommendationResponse = {
        requirements: this.extractRequirements(result),
        selectionCriteria: this.extractSelectionCriteria(result),
        verificationChecklist: this.extractVerificationChecklist(result),
        interviewQuestions: this.extractInterviewQuestions(result),
        nextSteps: this.extractRecommendationNextSteps(result),
      };

      this.logger.log('Lawyer recommendations generated successfully');
      return response;
    } catch (error) {
      this.logger.error('Error generating lawyer recommendations:', error);
      throw new BadRequestException(
        'Failed to generate lawyer recommendations. Please try again.',
      );
    }
  }

  async generateLawReports(
    topic: string,
    jurisdiction: string,
    language: string = 'en',
  ): Promise<string> {
    try {
      this.logger.log(`Generating law reports for topic: ${topic}`);

      const prompt = `
Generate recent and relevant law reports for the following topic in ${jurisdiction}:

TOPIC: ${topic}

Please provide:
1. Recent case law developments
2. Legislative changes
3. Judicial interpretations
4. Practical implications
5. Recommendations for legal practitioners

Focus on cases and developments from the last 2-3 years that are most relevant to this topic.

Respond in ${language} language.
`;

      const result = await this.generateContent(prompt);
      this.logger.log('Law reports generated successfully');

      return result;
    } catch (error) {
      this.logger.error('Error generating law reports:', error);
      throw new BadRequestException(
        'Failed to generate law reports. Please try again.',
      );
    }
  }

  private async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Error calling Gemini AI:', error);
      throw new Error('AI service temporarily unavailable');
    }
  }

  // Content extraction methods
  private extractAnalysis(content: string): string {
    // Extract the analysis section from AI response
    const analysisMatch = content.match(
      /ANALYSIS:(.*?)(?=RECOMMENDATIONS:|$)/s,
    );
    if (analysisMatch) {
      return analysisMatch[1].trim();
    }

    // Fallback: return first few paragraphs
    const paragraphs = content
      .split('\n\n')
      .filter((p) => p.trim().length > 50);
    return paragraphs.slice(0, 3).join('\n\n');
  }

  private extractRecommendations(content: string): string {
    // Extract recommendations section
    const recommendationsMatch = content.match(
      /RECOMMENDATIONS:(.*?)(?=NEXT STEPS:|$)/s,
    );
    if (recommendationsMatch) {
      return recommendationsMatch[1].trim();
    }

    // Fallback: return content after "Based on the analysis"
    const basedOnMatch = content.match(/Based on.*?analysis(.*)/s);
    if (basedOnMatch) {
      return basedOnMatch[1].trim();
    }

    return content;
  }

  private extractChosenOption(content: string): string | undefined {
    const mediationMatch = content.match(/mediation.*?recommended/i);
    const outOfCourtMatch = content.match(/out.*?court.*?settlement/i);
    const litigationMatch = content.match(/litigation.*?last.*?resort/i);

    if (mediationMatch) return 'mediation';
    if (outOfCourtMatch) return 'out_of_court';
    if (litigationMatch) return 'litigation';

    return undefined;
  }

  private extractEstimatedCosts(
    content: string,
  ): Record<string, any> | undefined {
    const costMatch = content.match(/cost.*?(\d+.*?naira|₦\d+)/i);
    if (costMatch) {
      return {
        estimated: costMatch[1],
        currency: 'NGN',
        source: 'AI estimation',
      };
    }
    return undefined;
  }

  private extractTimeline(content: string): Record<string, any> | undefined {
    const timelineMatch = content.match(
      /timeline.*?(\d+.*?(days|weeks|months))/i,
    );
    if (timelineMatch) {
      return {
        estimated: timelineMatch[1],
        unit: timelineMatch[2],
        source: 'AI estimation',
      };
    }
    return undefined;
  }

  private extractNextSteps(content: string): string[] | undefined {
    const nextStepsMatch = content.match(/next steps:(.*?)(?=\n\n|$)/s);
    if (nextStepsMatch) {
      return nextStepsMatch[1]
        .split('\n')
        .filter((step) => step.trim().length > 0)
        .map((step) => step.replace(/^\d+\.\s*/, '').trim());
    }
    return undefined;
  }

  private extractDocument(content: string): string {
    // Extract the main document content
    const documentMatch = content.match(/DOCUMENT:(.*?)(?=INSTRUCTIONS:|$)/s);
    if (documentMatch) {
      return documentMatch[1].trim();
    }
    return content;
  }

  private extractInstructions(content: string): string {
    const instructionsMatch = content.match(
      /INSTRUCTIONS:(.*?)(?=PLACEHOLDERS:|$)/s,
    );
    if (instructionsMatch) {
      return instructionsMatch[1].trim();
    }
    return 'Please review and customize this document according to your specific needs.';
  }

  private extractPlaceholders(content: string): string[] {
    const placeholdersMatch = content.match(
      /PLACEHOLDERS:(.*?)(?=LEGAL NOTES:|$)/s,
    );
    if (placeholdersMatch) {
      return placeholdersMatch[1]
        .split('\n')
        .filter((placeholder) => placeholder.trim().length > 0)
        .map((placeholder) => placeholder.replace(/^\d+\.\s*/, '').trim());
    }
    return [];
  }

  private extractLegalNotes(content: string): string {
    const notesMatch = content.match(/LEGAL NOTES:(.*?)(?=\n\n|$)/s);
    if (notesMatch) {
      return notesMatch[1].trim();
    }
    return 'This document is generated for informational purposes. Please consult with a qualified legal professional for specific legal advice.';
  }

  private extractRequirements(content: string): Record<string, any> {
    const requirementsMatch = content.match(
      /LAWYER PROFILE REQUIREMENTS:(.*?)(?=SELECTION CRITERIA:|$)/s,
    );
    if (requirementsMatch) {
      const requirements = requirementsMatch[1].trim();
      return {
        experience: this.extractTextAfter(requirements, 'experience'),
        expertise: this.extractTextAfter(requirements, 'expertise'),
        geographic: this.extractTextAfter(requirements, 'geographic'),
        verification: this.extractTextAfter(requirements, 'verification'),
      };
    }
    return {};
  }

  private extractSelectionCriteria(content: string): Record<string, any> {
    const criteriaMatch = content.match(
      /SELECTION CRITERIA:(.*?)(?=VERIFICATION CHECKLIST:|$)/s,
    );
    if (criteriaMatch) {
      const criteria = criteriaMatch[1].trim();
      return {
        experience: this.extractTextAfter(criteria, 'experience'),
        success: this.extractTextAfter(criteria, 'success'),
        cost: this.extractTextAfter(criteria, 'cost'),
        communication: this.extractTextAfter(criteria, 'communication'),
        availability: this.extractTextAfter(criteria, 'availability'),
      };
    }
    return {};
  }

  private extractVerificationChecklist(content: string): string[] {
    const checklistMatch = content.match(
      /VERIFICATION CHECKLIST:(.*?)(?=INTERVIEW QUESTIONS:|$)/s,
    );
    if (checklistMatch) {
      return checklistMatch[1]
        .split('\n')
        .filter((item) => item.trim().length > 0)
        .map((item) => item.replace(/^\d+\.\s*/, '').trim());
    }
    return [];
  }

  private extractInterviewQuestions(content: string): string[] {
    const questionsMatch = content.match(
      /INTERVIEW QUESTIONS:(.*?)(?=NEXT STEPS:|$)/s,
    );
    if (questionsMatch) {
      return questionsMatch[1]
        .split('\n')
        .filter((question) => question.trim().length > 0)
        .map((question) => question.replace(/^\d+\.\s*/, '').trim());
    }
    return [];
  }

  private extractRecommendationNextSteps(content: string): string[] {
    const nextStepsMatch = content.match(/NEXT STEPS:(.*?)(?=\n\n|$)/s);
    if (nextStepsMatch) {
      return nextStepsMatch[1]
        .split('\n')
        .filter((step) => step.trim().length > 0)
        .map((step) => step.replace(/^\d+\.\s*/, '').trim());
    }
    return [];
  }

  private extractTextAfter(text: string, keyword: string): string {
    const regex = new RegExp(`${keyword}.*?[:\\-]\\s*(.*?)(?=\\n|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.generateContent(
        'Hello, please respond with "OK" if you are working.',
      );
      return result.toLowerCase().includes('ok');
    } catch (error) {
      this.logger.error('AI service health check failed:', error);
      return false;
    }
  }
}
