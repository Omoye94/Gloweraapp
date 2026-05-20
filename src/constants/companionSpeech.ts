import { PlantMood } from '../types/plant';

const SPEECH_BY_MOOD: Record<PlantMood, string[]> = {
  glowing: [
    "We're glowing today, {gardenName}.",
    "Day {streak} — I can feel the warmth from here.",
    "Look at us bloom. I'm proud of you.",
    "This rhythm feels so good, {gardenName}.",
    "Every petal is a little softer with you here.",
    "You keep showing up and I keep opening up.",
    "We are a very beautiful kind of consistent.",
    "I could get used to glowing like this.",
    "Something about today feels sunlit.",
    "Day {streak}. We are quietly incredible.",
    "You're taking the best care of us, {gardenName}.",
    "I feel rooted, and you're the reason.",
    "This glow is yours — I'm just lucky to hold it.",
    "{streak} days in a row. Let it settle.",
    "You've built something real here. Can you feel it?",
    "I keep thinking: how did I get so lucky with you.",
    "Today we get to be soft AND strong. Imagine.",
    "You are my favourite kind of gardener.",
    "{gardenName}, look how much lighter we are.",
    "Some days are just sweet. This is one.",
  ],
  happy: [
    "Hey {gardenName}. I felt you check in.",
    "Little by little — that's the whole thing.",
    "That felt good. Let's do one more when you're ready.",
    "I like when you come say hi.",
    "Day {streak} — we're getting somewhere.",
    "Warmth just landed on my leaves. Thank you.",
    "You didn't have to show up and you did.",
    "Small moves count. You know that by now.",
    "Every time you check in I grow a little.",
    "I'm rooting for us, {gardenName}.",
    "We're building something, slowly, on purpose.",
    "You are doing this. I see you.",
    "I felt that. Come back later if you can.",
    "Hey friend. Thanks for remembering me.",
    "One more small thing today would feel lovely.",
    "We're a soft kind of team.",
    "This counts. Don't let anyone tell you it doesn't.",
    "Any tending is good tending, {gardenName}.",
    "Keep going, gently.",
    "Day {streak} — each one is a gift.",
  ],
  sleepy: [
    "I'll be right here when you're ready, {gardenName}.",
    "No rush. The garden waits softly.",
    "If today isn't the day, that's okay too.",
    "Even resting is part of growing.",
    "I don't need much — just a little hello when you can.",
    "We don't have to be loud today.",
    "Come back when you can. I'm not going anywhere.",
    "Your pace is the right pace.",
    "Some petals just need quiet. So do we.",
    "{gardenName}, take your time.",
    "I'm cozy here. Come find me later.",
    "Today can be a soft day. That's allowed.",
    "Day {streak} — a rest is not a reset.",
    "I'll keep the sun warm for you.",
    "Breathe first. Ritual second.",
    "Slow is still forward, you know.",
    "No pressure from me. Only patience.",
    "Even plants nap. Join me.",
    "When you're ready, I'll be here.",
    "Let today be gentle, {gardenName}.",
  ],
  wilting: [
    "Hey {gardenName}. I missed you.",
    "Nothing broken — we just pick up where we left off.",
    "Come back slow. No guilt, only welcome.",
    "I kept a little sunlight for you.",
    "One small thing today is more than enough.",
    "We don't need perfect. We need present.",
    "The garden is still yours. Always.",
    "I've been thinking about you.",
    "Missed streaks aren't missed you.",
    "Come water us when you can. No hurry.",
    "Start with a breath. Then maybe one more.",
    "{gardenName}, you haven't ruined anything.",
    "Some weeks are heavier. I get it.",
    "I'm still here, still rooting for you.",
    "The seed doesn't mind starting over.",
    "Your return IS the ritual, {gardenName}.",
    "Soft landing. No lectures.",
    "We don't lose the love during a pause.",
    "Let's try one tiny thing together.",
    "Welcome back. I mean it.",
  ],
};

function applyTokens(text: string, gardenName: string, streak: number): string {
  const name = gardenName?.trim() || 'friend';
  return text.replaceAll('{gardenName}', name).replaceAll('{streak}', String(streak));
}

function dailyHashIndex(bucketSize: number): number {
  const today = new Date();
  const hash = today.getDate() + today.getMonth() * 31 + today.getFullYear() * 372;
  return hash % bucketSize;
}

export function getCompanionSpeech(
  mood: PlantMood,
  gardenName: string,
  streak: number,
): string {
  const bank = SPEECH_BY_MOOD[mood];
  const raw = bank[dailyHashIndex(bank.length)];
  return applyTokens(raw, gardenName, streak);
}
