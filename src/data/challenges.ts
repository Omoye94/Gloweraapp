export interface Challenge {
  id: string;
  name: string;
  icon: string;
  duration: number;
  description: string;
  tasks: string[];
  reflectionPrompt: string;
  completionMessage: string;
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'soft-reset',
    name: 'The Soft Reset',
    icon: '🌿',
    duration: 7,
    description:
      'A gentle week of returning to basics. Drink water, step outside, and breathe — nothing more, nothing less.',
    tasks: [
      'Drink a full glass of water first thing in the morning',
      'Step outside for at least 5 minutes of fresh air',
      'Eat one meal without screens',
    ],
    reflectionPrompt: 'What felt different about today when you slowed down?',
    completionMessage:
      'You gave yourself a whole week of softness. That takes real strength.',
  },
  {
    id: 'evening-wind-down',
    name: 'Evening Wind-Down',
    icon: '🌙',
    duration: 5,
    description:
      'Five nights of easing into rest. No screens, soft lighting, and a moment to let the day go.',
    tasks: [
      'Put your phone away 30 minutes before bed',
      'Do one calming thing: stretch, read, breathe, or journal',
      'Dim the lights or light a candle',
      'Write down 3 things from today',
    ],
    reflectionPrompt: 'How did your body feel as you wound down tonight?',
    completionMessage:
      'Five nights of choosing rest. Your future self is grateful.',
  },
  {
    id: 'gentle-mornings',
    name: 'Gentle Mornings',
    icon: '🌅',
    duration: 7,
    description:
      'A week of mornings without rushing. Wake up and give yourself a few quiet minutes before the world gets loud.',
    tasks: [
      'Wait 10 minutes before checking your phone',
      'Do one grounding thing: stretch, breathe, or sit quietly',
      'Make your bed mindfully',
      'Eat breakfast slowly, without rushing',
    ],
    reflectionPrompt: 'What did you notice when your morning started slowly?',
    completionMessage:
      'Seven mornings of choosing calm. You set the tone beautifully.',
  },
  {
    id: 'glow-from-within',
    name: 'Glow From Within',
    icon: '✨',
    duration: 7,
    description:
      'A week focused on nourishing your skin and body from the inside out. Simple rituals, real glow.',
    tasks: [
      'Drink at least 6 glasses of water today',
      'Complete your morning skincare routine',
      'Complete your evening skincare routine',
      'Take your daily supplements',
      'Apply sunscreen before heading out',
    ],
    reflectionPrompt: 'How did it feel to care for yourself on purpose today?',
    completionMessage:
      'A week of glow, inside and out. You are radiant.',
  },
  {
    id: 'calm-challenge',
    name: 'The Calm Challenge',
    icon: '🧘',
    duration: 5,
    description:
      'Five days of micro-calm. A few minutes of stillness a day — that is all it takes to begin.',
    tasks: [
      'Sit still for 2 minutes and focus on your breathing',
      'Write down one thing you are grateful for',
      'Take a slow, mindful walk',
      'Do a 3-minute body scan',
    ],
    reflectionPrompt: 'What came to mind during your moments of stillness?',
    completionMessage:
      'Five days of stillness. You proved that calm is always within reach.',
  },
  {
    id: 'future-self',
    name: 'Future Self',
    icon: '🔮',
    duration: 14,
    description:
      'Two weeks of becoming. Each day, you\'ll nurture your body, write to the person you\'re growing into, and build a vision worth believing in.',
    tasks: [
      'Write one sentence to your future self',
      'Do one thing today that your future self will thank you for',
      'Move your body for at least 10 minutes',
      'Drink 6+ glasses of water',
      'Spend 5 minutes visualizing where you want to be',
    ],
    reflectionPrompt: 'What did your future self need to hear from you today?',
    completionMessage:
      'Two weeks of showing up for the person you\'re becoming. She\'s already proud of you.',
  },
  {
    id: 'digital-detox',
    name: 'Digital Detox',
    icon: '📵',
    duration: 7,
    description:
      'A week of reclaiming your attention. Less scrolling, more living — your mind will thank you.',
    tasks: [
      'Limit social media to 30 minutes total today',
      'Turn off non-essential notifications',
      'Spend 20 minutes doing something offline you enjoy',
      'No screens during meals',
    ],
    reflectionPrompt: 'What did you do with the time you gained back today?',
    completionMessage:
      'A whole week of choosing presence over pixels. You are more free than you know.',
  },
  {
    id: 'nourish-challenge',
    name: 'Nourish & Flourish',
    icon: '🥗',
    duration: 7,
    description:
      'A week of eating with intention. No diets, no rules — just listening to your body and feeding it well.',
    tasks: [
      'Eat at least one serving of fruits or vegetables',
      'Drink 8 glasses of water throughout the day',
      'Prepare one meal at home with care',
      'Eat one meal slowly, savoring each bite',
    ],
    reflectionPrompt: 'How did your body feel when you nourished it intentionally?',
    completionMessage:
      'Seven days of nourishing yourself with love. Your body heard every bit of it.',
  },
  {
    id: 'movement-joy',
    name: 'Joyful Movement',
    icon: '💃',
    duration: 7,
    description:
      'A week of moving your body — not to punish it, but to celebrate it. Dance, walk, stretch, play.',
    tasks: [
      'Move your body for at least 15 minutes in a way that feels good',
      'Stretch for 5 minutes when you wake up',
      'Take a walk outside, even if it is short',
      'Do one thing that makes your body feel strong',
    ],
    reflectionPrompt: 'What kind of movement brought you the most joy today?',
    completionMessage:
      'A week of moving with joy. Your body is your home — and you honored it.',
  },
  {
    id: 'gratitude-glow',
    name: 'Gratitude Glow',
    icon: '🙏',
    duration: 10,
    description:
      'Ten days of noticing the good. Gratitude is quiet, but it changes everything.',
    tasks: [
      'Write down 3 things you are grateful for this morning',
      'Tell someone you appreciate them today',
      'Notice one small beautiful thing around you',
      'End the day by writing what went well',
    ],
    reflectionPrompt: 'What surprised you when you looked for things to be grateful for?',
    completionMessage:
      'Ten days of seeing the light in everything. That light was always you.',
  },
  {
    id: 'boundary-setting',
    name: 'Soft Boundaries',
    icon: '🛡️',
    duration: 7,
    description:
      'A week of practicing gentle but firm boundaries. Saying no is an act of self-love.',
    tasks: [
      'Identify one boundary you need to set or reinforce',
      'Say no to one thing that drains your energy',
      'Protect 30 minutes of alone time today',
      'Check in with yourself: are you doing this out of love or obligation?',
    ],
    reflectionPrompt: 'How did it feel to honor your own limits today?',
    completionMessage:
      'A week of choosing yourself. Your boundaries are a gift to everyone around you.',
  },
  {
    id: 'creative-spark',
    name: 'Creative Spark',
    icon: '🎨',
    duration: 7,
    description:
      'A week of letting creativity flow. No pressure, no perfection — just play and expression.',
    tasks: [
      'Spend 15 minutes on something creative (draw, write, sing, build)',
      'Try something you have never done before, even if it is small',
      'Take a photo of something that inspires you',
      'Let yourself daydream for 5 minutes without guilt',
    ],
    reflectionPrompt: 'What did you create or discover about yourself today?',
    completionMessage:
      'A week of creative courage. You reminded yourself that you are more than your routine.',
  },
  {
    id: 'sleep-sanctuary',
    name: 'Sleep Sanctuary',
    icon: '😴',
    duration: 7,
    description:
      'A week of building a bedtime ritual that actually works. Better sleep starts with better habits.',
    tasks: [
      'Go to bed at the same time tonight',
      'Avoid caffeine after 2 PM',
      'Make your bedroom cool, dark, and quiet',
      'Do a relaxing activity 30 minutes before sleep (no screens)',
      'Write tomorrow\'s to-do list before bed to clear your mind',
    ],
    reflectionPrompt: 'How did the quality of your sleep affect your day?',
    completionMessage:
      'Seven nights of prioritizing rest. You deserve every peaceful dream.',
  },
  {
    id: 'self-love-letters',
    name: 'Self-Love Letters',
    icon: '💌',
    duration: 7,
    description:
      'A week of writing to yourself with kindness. Words matter — especially the ones you say to you.',
    tasks: [
      'Write one kind thing about yourself today',
      'Replace one negative self-thought with a compassionate one',
      'Look in the mirror and say something encouraging',
      'Forgive yourself for one thing you have been holding onto',
    ],
    reflectionPrompt: 'What was it like to speak to yourself with love?',
    completionMessage:
      'Seven days of being your own best friend. You are worthy of every kind word.',
  },
  {
    id: 'nature-reconnect',
    name: 'Nature Reconnect',
    icon: '🌳',
    duration: 5,
    description:
      'Five days of stepping outside and remembering you are part of something bigger. Nature heals.',
    tasks: [
      'Spend at least 15 minutes outside in nature',
      'Notice 3 things in nature you usually overlook',
      'Leave your phone behind for part of your time outside',
      'Sit or stand somewhere with sunlight on your skin',
    ],
    reflectionPrompt: 'What did nature show you today that you needed to see?',
    completionMessage:
      'Five days of returning to the earth. You remembered where your peace lives.',
  },
  {
    id: 'mindful-connections',
    name: 'Mindful Connections',
    icon: '💛',
    duration: 7,
    description:
      'A week of deepening your relationships. Real connection starts with being fully present.',
    tasks: [
      'Have one conversation today without looking at your phone',
      'Reach out to someone you have not spoken to in a while',
      'Give someone a genuine compliment',
      'Listen fully without planning your response',
    ],
    reflectionPrompt: 'What did you learn about someone when you truly listened?',
    completionMessage:
      'Seven days of real connection. The people around you felt your presence — and it mattered.',
  },
  {
    id: 'declutter-mind',
    name: 'Clear Mind Reset',
    icon: '🧹',
    duration: 5,
    description:
      'Five days of mental and physical decluttering. A clear space makes room for a clear mind.',
    tasks: [
      'Declutter one small area of your space (a drawer, desk, or shelf)',
      'Unsubscribe from 3 emails or unfollow accounts that drain you',
      'Write a brain dump: everything on your mind onto paper',
      'Delete or organize 10 photos or files on your phone',
    ],
    reflectionPrompt: 'What felt lighter after you let go of something today?',
    completionMessage:
      'Five days of letting go. You made space for what truly matters.',
  },
  {
    id: 'hydration-hero',
    name: 'Hydration Hero',
    icon: '💧',
    duration: 10,
    description:
      'Ten days of making water your best friend. Clear skin, more energy, better mood — it all starts here.',
    tasks: [
      'Drink a glass of water within 10 minutes of waking up',
      'Carry a water bottle with you all day',
      'Drink at least 8 glasses of water today',
      'Replace one sugary or caffeinated drink with water',
    ],
    reflectionPrompt: 'How did staying hydrated change the way you felt today?',
    completionMessage:
      'Ten days of choosing water, choosing yourself. Your body is glowing from the inside.',
  },
  {
    id: 'confidence-boost',
    name: 'Confidence Boost',
    icon: '👑',
    duration: 7,
    description:
      'A week of stepping into your power. Confidence is not about being perfect — it is about being present.',
    tasks: [
      'Wear something that makes you feel amazing',
      'Do one thing that scares you a little',
      'Stand tall and take up space — practice power posture for 2 minutes',
      'Write down one achievement you are proud of',
    ],
    reflectionPrompt: 'What did you do today that made you feel powerful?',
    completionMessage:
      'Seven days of owning who you are. The confidence was always inside you — you just let it out.',
  },
];

export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}
