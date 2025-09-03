async function parseTransaction(input) {
  const text = input.toLowerCase().trim();
  const amountMatch = text.match(/\$?(\d+(?:\.\d{1,2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
  
  const incomeKeywords = ['salary', 'income', 'paid', 'received'];
  const isIncome = incomeKeywords.some(keyword => text.includes(keyword));
  
  let category = 'Other';
  if (text.includes('coffee') || text.includes('food')) category = 'Food';
  if (text.includes('gas') || text.includes('uber')) category = 'Transportation';
  
  return {
    amount,
    category,
    type: isIncome ? 'income' : 'expense',
    description: input.trim(),
    confidence: 0.8
  };
}

module.exports = { parseTransaction };