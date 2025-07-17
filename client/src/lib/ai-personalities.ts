export interface AIPersonality {
  id: string;
  name: string;
  displayName: string;
  emoji: string;
  description: string;
  playStyle: 'aggressive' | 'defensive' | 'random' | 'strategic';
  traits: {
    riskTolerance: number; // 0-1, how likely to take risks
    wildCardUsage: number; // 0-1, how often to use wild cards
    unoCallTiming: number; // 0-1, how reliable at calling UNO
    cardHolding: number; // 0-1, tendency to hold onto special cards
  };
  voiceLines: {
    gameStart: string[];
    playCard: string[];
    drawCard: string[];
    uno: string[];
    win: string[];
    lose: string[];
  };
}

export const AI_PERSONALITIES: { [key: string]: AIPersonality } = {
  spongebob: {
    id: 'spongebob',
    name: 'SpongeBob',
    displayName: 'SpongeBob SquarePants',
    emoji: '🧽',
    description: 'Optimistic and enthusiastic, sometimes makes risky plays',
    playStyle: 'random',
    traits: {
      riskTolerance: 0.8,
      wildCardUsage: 0.7,
      unoCallTiming: 0.9,
      cardHolding: 0.3,
    },
    voiceLines: {
      gameStart: ['I\'m ready!', 'Let\'s make some Krabby Patties!', 'Gary, we\'re gonna win!'],
      playCard: ['Barnacles!', 'I\'m on fire!', 'Patrick would be proud!'],
      drawCard: ['Aw, shucks!', 'More cards for me!', 'That\'s okay, I love cards!'],
      uno: ['UNO! I only have one card!', 'Almost there!', 'One card left!'],
      win: ['I won! I won!', 'Gary\'s gonna be so proud!', 'Best day ever!'],
      lose: ['Good game everyone!', 'That was fun!', 'Maybe next time!'],
    },
  },
  
  patrick: {
    id: 'patrick',
    name: 'Patrick',
    displayName: 'Patrick Star',
    emoji: '⭐',
    description: 'Unpredictable and random, often makes surprising moves',
    playStyle: 'random',
    traits: {
      riskTolerance: 0.9,
      wildCardUsage: 0.8,
      unoCallTiming: 0.3,
      cardHolding: 0.1,
    },
    voiceLines: {
      gameStart: ['Is this the Krusty Krab?', 'I love games!', 'What are we doing again?'],
      playCard: ['Uh... this one?', 'Pretty colors!', 'I like this card!'],
      drawCard: ['More cards? Cool!', 'Ooh, what\'s this one?', 'I collect these!'],
      uno: ['UNO? What\'s that?', 'Oh right... UNO!', 'I have one thingy!'],
      win: ['I won? How?', 'Patrick Star wins!', 'That was easy!'],
      lose: ['What happened?', 'Can we play again?', 'That was confusing...'],
    },
  },
  
  squidward: {
    id: 'squidward',
    name: 'Squidward',
    displayName: 'Squidward Tentacles',
    emoji: '🎵',
    description: 'Strategic and defensive, prefers safe plays',
    playStyle: 'defensive',
    traits: {
      riskTolerance: 0.2,
      wildCardUsage: 0.3,
      unoCallTiming: 0.95,
      cardHolding: 0.8,
    },
    voiceLines: {
      gameStart: ['This is so annoying...', 'Let\'s get this over with', 'I have better things to do'],
      playCard: ['Fine, whatever', 'This should work', 'Calculated move'],
      drawCard: ['Of course...', 'Typical', 'This is irritating'],
      uno: ['UNO. Obviously.', 'One card left, naturally', 'Finally...'],
      win: ['Finally, some competence', 'As expected', 'About time'],
      lose: ['This game is rigged', 'I don\'t care anyway', 'Whatever...'],
    },
  },
  
  krabs: {
    id: 'krabs',
    name: 'Mr. Krabs',
    displayName: 'Eugene Krabs',
    emoji: '🦀',
    description: 'Aggressive and competitive, plays to win at all costs',
    playStyle: 'aggressive',
    traits: {
      riskTolerance: 0.6,
      wildCardUsage: 0.5,
      unoCallTiming: 0.85,
      cardHolding: 0.4,
    },
    voiceLines: {
      gameStart: ['Time to make some money!', 'I\'m feeling it now!', 'Ar ar ar ar!'],
      playCard: ['Take that!', 'Money money money!', 'Ar ar ar!'],
      drawCard: ['Barnacles!', 'This is costing me!', 'Ar, not good for business!'],
      uno: ['UNO! One card to victory!', 'Almost rich!', 'Ar ar! UNO!'],
      win: ['I\'m rich! Rich!', 'Money wins again!', 'Ar ar ar! Victory!'],
      lose: ['This is bad for business!', 'I want a refund!', 'Ar, what a waste!'],
    },
  },
  
  sandy: {
    id: 'sandy',
    name: 'Sandy',
    displayName: 'Sandy Cheeks',
    emoji: '🐿️',
    description: 'Calculated and logical, uses science-based strategy',
    playStyle: 'strategic',
    traits: {
      riskTolerance: 0.4,
      wildCardUsage: 0.6,
      unoCallTiming: 0.9,
      cardHolding: 0.7,
    },
    voiceLines: {
      gameStart: ['Let\'s do this scientifically!', 'Time for some Texas strategy!', 'Y\'all ready for this?'],
      playCard: ['Calculated move!', 'Science wins!', 'That\'s how we do it in Texas!'],
      drawCard: ['Hypothesis incorrect', 'Recalculating...', 'Dang nabbit!'],
      uno: ['UNO! According to my calculations!', 'One card remaining!', 'Almost there, y\'all!'],
      win: ['Science prevails!', 'That\'s Texas ingenuity!', 'Yeehaw! Victory!'],
      lose: ['Back to the drawing board', 'Good game, y\'all', 'Time to analyze the data'],
    },
  },
  
  plankton: {
    id: 'plankton',
    name: 'Plankton',
    displayName: 'Sheldon Plankton',
    emoji: '🦠',
    description: 'Sneaky and tactical, always has a secret plan',
    playStyle: 'strategic',
    traits: {
      riskTolerance: 0.7,
      wildCardUsage: 0.9,
      unoCallTiming: 0.8,
      cardHolding: 0.6,
    },
    voiceLines: {
      gameStart: ['Time for Plan Z!', 'I will dominate!', 'Prepare for my evil plan!'],
      playCard: ['All according to plan!', 'Mwahaha!', 'Genius move!'],
      drawCard: ['Curse you, cards!', 'This wasn\'t in the plan!', 'Computer, analyze!'],
      uno: ['UNO! Victory is mine!', 'One card to world domination!', 'Almost there!'],
      win: ['I am the winner!', 'Plan successful!', 'World domination achieved!'],
      lose: ['Curse you all!', 'I\'ll be back!', 'This isn\'t over!'],
    },
  },
};

export function getRandomPersonality(): string {
  const personalities = Object.keys(AI_PERSONALITIES);
  return personalities[Math.floor(Math.random() * personalities.length)];
}

export function getPersonalityDisplayName(personalityId: string): string {
  return AI_PERSONALITIES[personalityId]?.displayName || personalityId;
}

export function getPersonalityEmoji(personalityId: string): string {
  return AI_PERSONALITIES[personalityId]?.emoji || '🤖';
}

export function getRandomVoiceLine(personalityId: string, category: keyof AIPersonality['voiceLines']): string {
  const personality = AI_PERSONALITIES[personalityId];
  if (!personality) return '';
  
  const lines = personality.voiceLines[category];
  return lines[Math.floor(Math.random() * lines.length)];
}

export function getAllPersonalities(): AIPersonality[] {
  return Object.values(AI_PERSONALITIES);
}

export function getPersonalityById(id: string): AIPersonality | undefined {
  return AI_PERSONALITIES[id];
}
