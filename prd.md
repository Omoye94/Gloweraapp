# Glowera - Product Requirements Document

## Overview

**Glowera** is a mobile habit-tracking and wellness app designed for Gen Z and Millennial women. The app focuses on gentle, shame-free habit building with care-based gamification through a virtual plant garden.

---

## Product Requirements

### Target Audience
- Gen Z and Millennial women
- Users seeking a gentle, non-judgmental approach to wellness
- People who want to build habits without pressure or guilt

### Core Philosophy
- **No streaks** - Missing a day doesn't reset progress
- **No penalties** - Points never decrease, plant never regresses
- **No calorie counting** - Focus on holistic wellness, not numbers
- **No competitive leaderboards** - Personal growth only
- **Gentle encouragement** - Supportive, not pushy

---

## Feature Requirements

### 1. Onboarding Flow (4 screens)

#### Welcome Screen
- App logo and branding
- Tagline: "Grow at your own pace"
- "Get Started" button

#### Philosophy Screen
- Swipeable carousel explaining the gentle approach
- 3 cards covering core principles
- Skip option available

#### Habit Selection Screen
- 6 habit categories with 4 habits each (24 total default habits)
- Users select 3-5 habits to start
- Categories:
  - **Nutrition**: Water intake, Vegetables, Balanced breakfast, Mindful eating
  - **Movement**: 10-min walk, Stretching, 15-min workout, Dance break
  - **Supplements**: Daily vitamins, Probiotics, Omega-3, Herbal tea
  - **Hobbies**: Read 20 mins, Creative time, Learn something, Play music
  - **Self-care**: Skincare routine, 7+ hours sleep, Digital detox, Relaxing bath
  - **Reflection**: Morning gratitude, Meditation, Journaling, Evening reflection

#### Garden Naming Screen
- User names their personal garden
- See initial seed plant
- Complete onboarding

### 2. Home Screen (Main Dashboard)

- Time-based greeting (Good Morning/Afternoon/Evening)
- Current date display
- **Glow Meter** - Circular progress indicator for daily completion
- Plant preview with current stage
- List of active habits with completion buttons
- Two completion states per habit:
  - "Did it gently" (partial) - 5 points
  - "Did it fully" (complete) - 10 points
- Celebration banner when all habits completed

### 3. Glow Garden

- Animated plant visualization
- 5 growth stages: Seed → Sprout → Bud → Bloom → Glow
- Growth thresholds (cumulative, never decrease):
  - Seed: 0 points
  - Sprout: 50 points
  - Bud: 150 points
  - Bloom: 350 points
  - Glow: 700 points
- Progress bar to next stage
- Total lifetime points display
- Plant style customization (unlockable)

### 4. Journal

- Journal entry list with dates
- Create new entries with free-form text
- Optional mood picker: Radiant, Calm, Neutral, Low, Struggling
- Weekly reflection prompts
- Search functionality

### 5. Challenges

- Weekly themed challenges
- Challenge categories matching habit categories
- Challenge structure:
  - Duration: 7 days
  - Daily tasks to complete
  - Bonus points for completion (50 points)
- Challenge states: Available, Active, Completed

### 6. Profile & Settings

- Garden name display
- Plant visualization
- Stats overview:
  - Total points
  - Journal entries count
  - Completed challenges
- Active habits list
- Settings:
  - Notification preferences
  - Theme selection
  - Data export
- Reset app data option
- About section

---

## Points System

| Action | Points |
|--------|--------|
| Habit completed gently | 5 |
| Habit completed fully | 10 |
| Full day bonus (all habits fully) | 15 |
| Journal entry | 8 |
| Weekly reflection | 12 |
| Challenge day complete | 10 |
| Challenge fully complete | 50 |

**Critical Rule**: Points NEVER decrease. Plant NEVER regresses.

---

## UI/UX Requirements

### Visual Design
- Feminine, soft aesthetic
- Pastel color palette
- Rounded corners throughout
- Soft shadows
- Gentle animations

### Color Palette
```
Primary:     #FF99B5 (Soft pink)
Secondary:   #C9ADFF (Lavender)
Accent:      #66EFC7 (Mint)
Background:  #FFFDFB (Warm cream)
Surface:     #FFFFFF (White)
Text:        #4A4458 (Soft dark)
```

### Typography
- Clean, readable fonts
- Hierarchy: H1, H2, H3, H4, Body, Caption
- Comfortable line heights

### Spacing
- Consistent spacing scale: xs(4), sm(8), md(12), lg(16), xl(24), xxl(32)
- Border radius: sm(8), md(16), lg(24)

### Interactions
- Haptic feedback on completions
- Smooth transitions between screens
- Pull-to-refresh where applicable
- Loading states for async operations

---

## Technical Requirements

### Platform
- iOS and Android (React Native)
- Expo managed workflow
- Expo Go compatible for development

### Tech Stack
```
Framework:        React Native with Expo SDK 54
Navigation:       Expo Router (file-based routing)
State Management: Zustand with persistence
Storage:          AsyncStorage (local, no backend)
Animations:       Lottie + React Native Reanimated
Haptics:          Expo Haptics
Icons:            Emoji-based + @expo/vector-icons
```

### Project Structure
```
glowera/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout
│   ├── index.tsx                 # Entry redirect
│   ├── (auth)/                   # Onboarding screens
│   │   ├── welcome.tsx
│   │   ├── philosophy.tsx
│   │   ├── select-habits.tsx
│   │   └── name-garden.tsx
│   └── (tabs)/                   # Main app tabs
│       ├── _layout.tsx
│       ├── index.tsx             # Home
│       ├── garden.tsx
│       ├── journal.tsx
│       ├── challenges.tsx
│       └── profile.tsx
├── src/
│   ├── components/
│   │   ├── ui/                   # Button, Card, ProgressBar
│   │   ├── habits/               # HabitCard
│   │   └── garden/               # PlantDisplay, GlowMeter
│   ├── stores/                   # Zustand stores
│   │   ├── useUserStore.ts
│   │   ├── useHabitStore.ts
│   │   ├── usePlantStore.ts
│   │   ├── useJournalStore.ts
│   │   └── useChallengeStore.ts
│   ├── utils/
│   │   ├── storage.ts            # AsyncStorage wrapper
│   │   ├── pointsCalculator.ts
│   │   └── dateUtils.ts
│   ├── constants/
│   │   ├── habits.ts
│   │   ├── challenges.ts
│   │   └── reflectionPrompts.ts
│   ├── types/                    # TypeScript interfaces
│   └── theme/                    # Colors, typography, spacing
└── assets/
```

### Data Models

#### User
```typescript
interface User {
  id: string;
  gardenName: string;
  createdAt: string;
  onboardingCompleted: boolean;
  totalPoints: number;
  selectedTheme: string;
  notificationSettings: NotificationSettings;
}
```

#### Habit
```typescript
interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  icon: string;
  isCustom: boolean;
  isActive: boolean;
  order: number;
}

type HabitCategory = 'nutrition' | 'movement' | 'supplements' | 'hobbies' | 'self-care' | 'reflection';
```

#### Habit Completion
```typescript
interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;  // YYYY-MM-DD
  completionType: 'gentle' | 'full';
  pointsEarned: number;
}
```

#### Plant State
```typescript
interface PlantState {
  currentStage: GrowthStage;
  totalLifetimePoints: number;
  plantStyle: string;
}

type GrowthStage = 'seed' | 'sprout' | 'bud' | 'bloom' | 'glow';
```

#### Journal Entry
```typescript
interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: 'radiant' | 'calm' | 'neutral' | 'low' | 'struggling';
}
```

### Dependencies
```json
{
  "expo": "~54.0.31",
  "expo-router": "^6.0.21",
  "zustand": "^5.0.9",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "react-native-reanimated": "~4.1.1",
  "react-native-gesture-handler": "~2.28.0",
  "lottie-react-native": "^7.3.4",
  "date-fns": "^4.1.0",
  "uuid": "^13.0.0",
  "expo-haptics": "^15.0.8",
  "react-native-get-random-values": "^2.0.0"
}
```

### Storage Strategy
- All data stored locally using AsyncStorage
- Zustand persist middleware for automatic state persistence
- No backend/server requirements
- Data exportable from Profile screen

### Performance Considerations
- Lazy loading for screens
- Memoization for expensive calculations
- Optimized re-renders with Zustand selectors
- Image/animation optimization

---

## Future Considerations (Out of Scope v1)

- Cloud sync / backup
- Social features (optional sharing)
- Custom habit creation
- Widgets for iOS/Android
- Apple Health / Google Fit integration
- Push notifications
- Dark mode theme
- Multiple plant types
- Achievement badges

---

## Success Metrics

- User completes onboarding
- User logs at least one habit per day
- User returns to app 3+ days per week
- Plant reaches Bloom stage (350 points)
- User creates journal entries

---

*Document Version: 1.0*
*Last Updated: January 2026*
