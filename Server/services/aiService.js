const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function parseTransaction(input, recentTransactions = []) {
  try {
    console.log('Starting AI parsing for input:', input);
    
    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create context from recent transactions
    const contextTransactions = recentTransactions.slice(0, 5).map(t => 
      `${t.type}: ${t.description} - $${t.amount} (${t.category})`
    ).join('\n');

    // Create the prompt for Gemini AI
    const prompt = `
Parse this transaction into JSON with exact fields: amount, description, category, type, merchant, confidence.

Input: "${input}"
${contextTransactions ? `Recent patterns: ${contextTransactions}` : ''}

Categories must be one of: Food, Transportation, Shopping, Entertainment, Bills, Healthcare, Education, Travel, Electronics, Gas, Other
Types: income or expense

Return only valid JSON:
{"amount": number, "description": "string", "category": "string", "type": "string", "merchant": "string or null", "confidence": number}

Analyze the transaction intelligently and categorize appropriately.
`;

    console.log('Sending request to Gemini AI...');
    
    // Call Gemini AI
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    console.log('Gemini AI response received:', text);
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }
    
    const parsedData = JSON.parse(jsonMatch[0]);
    console.log('Parsed JSON data:', parsedData);

    // Validate categories
    const validCategories = [
      'Food', 'Transportation', 'Shopping', 'Entertainment', 
      'Bills', 'Healthcare', 'Education', 'Travel', 
      'Electronics', 'Gas', 'Income', 'Other'
    ];

    // Sanitize and validate the response
    const result_data = {
      amount: Math.abs(parseFloat(parsedData.amount) || 0),
      description: (parsedData.description || input).trim(),
      category: validCategories.includes(parsedData.category) ? parsedData.category : 'Other',
      type: ['income', 'expense'].includes(parsedData.type) ? parsedData.type : 'expense',
      merchant: parsedData.merchant || null,
      confidence: Math.max(0, Math.min(1, parseFloat(parsedData.confidence) || 0.7))
    };

    console.log('Final parsed result:', result_data);
    return result_data;

  } catch (error) {
    console.error('AI parsing failed:', error.message);
    
    // Fallback parsing - extract only amount if possible
    const amountMatch = input.match(/\$?(\d+(?:\.\d{1,2})?)/);
    const fallbackResult = {
      amount: amountMatch ? Math.abs(parseFloat(amountMatch[1])) : 0,
      description: input.trim(),
      category: 'Other',
      type: 'expense',
      merchant: null,
      confidence: 0.3
    };

    console.log('Using fallback result:', fallbackResult);
    return fallbackResult;
  }
}

module.exports = { 
  parseTransaction 
};