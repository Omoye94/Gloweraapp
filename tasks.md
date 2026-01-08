# Glowera - Development Tasks

## Phase 2: Backend & Authentication

### 1. Apple Authentication
- [ ] Install `expo-apple-authentication` package
- [ ] Create Apple Developer account and configure App ID
- [ ] Add Sign in with Apple capability in Xcode
- [ ] Create login/signup screen with Apple Sign In button
- [ ] Handle authentication flow and token management
- [ ] Store user session securely
- [ ] Add logout functionality
- [ ] Handle authentication errors gracefully

### 2. Supabase Integration
- [ ] Create Supabase project
- [ ] Install `@supabase/supabase-js` package
- [ ] Configure Supabase client with environment variables
- [ ] Design database schema:
  - `users` table (id, email, apple_id, garden_name, created_at)
  - `habits` table (id, user_id, name, category, icon, is_active, order)
  - `habit_completions` table (id, user_id, habit_id, date, completion_type, points)
  - `journal_entries` table (id, user_id, date, content, mood, prompt_id)
  - `plant_state` table (id, user_id, current_stage, total_points, plant_style)
  - `challenges` table (id, user_id, challenge_id, started_at, completed_days, status)
- [ ] Set up Row Level Security (RLS) policies
- [ ] Migrate Zustand stores to sync with Supabase
- [ ] Implement offline-first with local cache + cloud sync
- [ ] Add sync status indicator in UI
- [ ] Handle sync conflicts gracefully

---

## Phase 3: UI & Functionality Improvements

### 3. Animations & Transitions
- [ ] Add React Native Reanimated animations to:
  - [ ] Screen transitions (fade, slide)
  - [ ] Habit card completion (scale, color change)
  - [ ] Glow meter progress animation
  - [ ] Plant growth animation when leveling up
  - [ ] Tab bar icon animations
- [ ] Add Lottie animations for:
  - [ ] Celebration confetti when all habits completed
  - [ ] Plant growth stages (animated plants instead of emojis)
  - [ ] Loading states
- [ ] Add haptic feedback refinements

### 4. Onboarding Improvements
- [ ] Make philosophy screen a swipeable carousel
- [ ] Add animated illustrations to onboarding
- [ ] Add progress indicator dots
- [ ] Improve habit selection UI with better category grouping
- [ ] Add "recommended" badges to starter habits

### 5. Journal Enhancements
- [ ] Implement search functionality for journal entries
- [ ] Add entry detail view (tap to expand)
- [ ] Add ability to edit/delete entries
- [ ] Add rich text formatting (bold, italic)
- [ ] Add photo attachments option
- [ ] Improve weekly reflection prompts rotation

### 6. Garden Enhancements
- [ ] Create animated plant visualizations (replace emoji)
- [ ] Add plant style customization (unlockable styles)
- [ ] Add particle effects (floating petals, sparkles)
- [ ] Add growth celebration animation
- [ ] Show historical growth timeline

### 7. Settings Functionality
- [ ] Implement notification preferences:
  - [ ] Daily reminder time picker
  - [ ] Enable/disable specific notification types
  - [ ] Install `expo-notifications` and configure
- [ ] Implement theme selection:
  - [ ] Add dark mode theme
  - [ ] Add additional color themes (Lavender, Sage, Sunset)
  - [ ] Persist theme preference
- [ ] Implement data export:
  - [ ] Export habits and completions as JSON/CSV
  - [ ] Share via system share sheet
- [ ] Add edit garden name functionality
- [ ] Add edit/manage habits from profile

### 8. Home Screen Improvements
- [ ] Add pull-to-refresh
- [ ] Add date picker to view past days
- [ ] Implement full day bonus (15 points when all habits fully completed)
- [ ] Add weekly summary card
- [ ] Add motivational quotes rotation

### 9. Challenges Improvements
- [ ] Add more challenge variety
- [ ] Add challenge reminders
- [ ] Add challenge sharing (optional)
- [ ] Show challenge streak/history

---

## Phase 4: Polish & Production

### 10. Performance Optimization
- [ ] Implement lazy loading for screens
- [ ] Add memoization for expensive calculations
- [ ] Optimize re-renders with Zustand selectors
- [ ] Add image/animation caching
- [ ] Profile and fix any performance bottlenecks

### 11. Error Handling & Edge Cases
- [ ] Add global error boundary
- [ ] Add network error handling with retry
- [ ] Add loading states for all async operations
- [ ] Add empty states for all lists
- [ ] Handle edge cases (no habits, no entries, etc.)

### 12. Testing
- [ ] Set up Jest for unit testing
- [ ] Write tests for Zustand stores
- [ ] Write tests for utility functions
- [ ] Set up Detox for E2E testing
- [ ] Test on multiple iOS devices/simulators

### 13. App Store Preparation
- [ ] Create app icon (all required sizes)
- [ ] Create splash screen
- [ ] Write App Store description and keywords
- [ ] Create App Store screenshots
- [ ] Set up App Store Connect
- [ ] Configure app privacy details
- [ ] Submit for App Store review

---

## Future Features (Post-Launch)

### Phase 5: Enhanced Features
- [ ] Push notifications with smart timing
- [ ] Multiple plant types to unlock
- [ ] Achievement badges system
- [ ] Custom habit creation
- [ ] Widgets for iOS home screen
- [ ] Apple Health integration
- [ ] Social features (optional sharing)
- [ ] Streak-free progress visualization
- [ ] Monthly/yearly insights dashboard

---

## Notes

### Priority Order
1. **High**: Apple Auth, Supabase (user accounts needed for cloud sync)
2. **High**: Animations & transitions (core UX improvement)
3. **Medium**: Settings functionality (expected features)
4. **Medium**: Journal search & enhancements
5. **Lower**: Garden visual enhancements
6. **Lower**: Additional themes

### Technical Decisions Needed
- Offline-first strategy: How to handle sync conflicts?
- Plant animations: Lottie vs custom SVG animations?
- Notification timing: Smart reminders based on usage patterns?

### Design Assets Needed
- Animated plant illustrations (5 stages)
- App icon
- Splash screen
- Onboarding illustrations
- Achievement badges
- Additional theme color palettes

---

*Last Updated: January 2026*
