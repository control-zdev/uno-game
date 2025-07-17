// Profanity filter for chat moderation
const profanityWords = [
  // Basic profanity
  'damn', 'hell', 'shit', 'fuck', 'bitch', 'asshole', 'bastard', 'crap',
  // Cyberbullying terms
  'stupid', 'idiot', 'retard', 'loser', 'ugly', 'fat', 'dumb', 'worthless',
  'kill yourself', 'kys', 'noob', 'trash', 'garbage', 'pathetic',
  // Discriminatory language
  'gay', 'fag', 'homo', 'lesbian', 'trans', 'queer',
  // Racial slurs (abbreviated for safety)
  'n***', 'ch***', 'sp**', 'we***',
  // Other inappropriate content
  'sex', 'porn', 'nude', 'naked', 'rape', 'drug', 'cocaine', 'weed'
];

export function containsProfanity(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  return profanityWords.some(word => {
    // Check for exact word matches and common variations
    const wordPattern = new RegExp(`\\b${word.replace(/\*/g, '.')}\\b`, 'i');
    return wordPattern.test(lowerMessage) || 
           lowerMessage.includes(word.replace(/\*/g, '')) ||
           // Check for letter substitutions (e.g., @ for a, 3 for e)
           lowerMessage.includes(word.replace(/a/g, '@').replace(/e/g, '3').replace(/o/g, '0'));
  });
}

export function filterProfanity(message: string): string {
  let filteredMessage = message;
  
  profanityWords.forEach(word => {
    const wordPattern = new RegExp(`\\b${word.replace(/\*/g, '.')}\\b`, 'gi');
    filteredMessage = filteredMessage.replace(wordPattern, '*'.repeat(word.length));
  });
  
  return filteredMessage;
}

export function isMessageAppropriate(message: string): boolean {
  // Check message length
  if (message.length > 200) return false;
  
  // Check for excessive caps
  const capsCount = (message.match(/[A-Z]/g) || []).length;
  if (capsCount > message.length * 0.5 && message.length > 10) return false;
  
  // Check for spam (repeated characters)
  const repeatedPattern = /(.)\1{4,}/;
  if (repeatedPattern.test(message)) return false;
  
  // Check for profanity
  if (containsProfanity(message)) return false;
  
  return true;
}