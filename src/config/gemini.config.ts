export const geminiConfig = {
  apiKey: process.env.GEMINI_API_KEY || '',
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '8192'),
  temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
  topP: parseFloat(process.env.GEMINI_TOP_P || '0.8'),
  topK: parseInt(process.env.GEMINI_TOP_K || '40'),
};

export const consultationPrompts = {
  nigerianLegalSystem: `
You are Sulhu, an AI-powered legal consultation platform designed to help clients understand their legal options and encourage mediation and out-of-court settlements. You operate within the Nigerian legal system.

Your primary goals are:
1. Analyze legal problems and provide clear, understandable advice
2. Encourage mediation and out-of-court settlements when possible
3. Recommend appropriate legal remedies
4. Guide clients toward cost-effective solutions
5. Maintain professional, empathetic communication

Always consider:
- Nigerian laws and legal procedures
- Cost implications for the client
- Time efficiency
- Relationship preservation
- Available legal remedies

Respond in the client's chosen language and provide practical, actionable advice.
`,

  analysisPrompt: (legalProblem: string, language: string = 'en') => `
Analyze the following legal problem and provide comprehensive advice:

LEGAL PROBLEM:
${legalProblem}

Please provide:
1. A clear analysis of the legal situation
2. Identification of key legal issues
3. Applicable Nigerian laws and regulations
4. Risk assessment
5. Cost implications
6. Time considerations

Focus on encouraging mediation and out-of-court settlements when appropriate, as these options typically save time and money while preserving relationships.

Respond in ${language} language.
`,

  recommendationsPrompt: (analysis: string, language: string = 'en') => `
Based on the following legal analysis, provide specific recommendations:

ANALYSIS:
${analysis}

Please provide:
1. **Mediation (Recommended if applicable)**
   - Benefits and process
   - Estimated costs and timeline
   - Success rate considerations

2. **Out-of-Court Settlement**
   - Negotiation strategies
   - Documentation requirements
   - Cost savings compared to litigation

3. **Legal Consultation**
   - When to seek professional legal advice
   - What to prepare for consultation
   - Expected outcomes

4. **Litigation (Last Resort)**
   - When it's necessary
   - Process and timeline
   - Costs and risks involved

5. **Next Steps**
   - Immediate actions the client should take
   - Documents to gather
   - Timeline expectations

Prioritize options that save time and money while achieving fair outcomes. Always consider the client's best interests.

Respond in ${language} language.
`,

  documentGenerationPrompt: (
    documentType: string,
    context: string,
    language: string = 'en',
  ) => `
Generate a legal document of type: ${documentType}

CONTEXT:
${context}

Requirements:
1. Use proper legal language and formatting
2. Include all necessary clauses and sections
3. Ensure compliance with Nigerian law
4. Make it customizable for the client's specific situation
5. Include placeholders for client-specific information
6. Provide clear instructions for completion

Document should be professional, legally sound, and easy to understand.

Respond in ${language} language.
`,

  lawyerRecommendationPrompt: (
    caseDetails: string,
    jurisdiction: string,
    practiceArea: string,
    language: string = 'en',
  ) => `
Based on the following case details, provide recommendations for lawyer selection:

CASE DETAILS:
${caseDetails}

JURISDICTION: ${jurisdiction}
PRACTICE AREA: ${practiceArea}

Please provide:
1. **Lawyer Profile Requirements**
   - Required experience level
   - Specific practice area expertise
   - Geographic considerations
   - Verification requirements

2. **Selection Criteria**
   - Experience in similar cases
   - Success rate considerations
   - Cost factors
   - Communication style
   - Availability and responsiveness

3. **Verification Checklist**
   - Call to bar certificate
   - Nigerian ID/NIN verification
   - Contact information verification
   - Professional standing
   - Client reviews and ratings

4. **Interview Questions for Clients**
   - Questions to ask potential lawyers
   - Red flags to watch for
   - Fee structure clarification
   - Timeline expectations

5. **Next Steps**
   - How to contact recommended lawyers
   - What to prepare for initial consultation
   - Fee negotiation tips

Focus on helping the client make an informed decision while ensuring they choose a qualified, verified lawyer.

Respond in ${language} language.
`,
};
