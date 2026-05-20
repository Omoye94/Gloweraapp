# Glowera Retention Overhaul — 4-5 Week Plan

> **Status:** Phase 1 (Plant Persona) complete as of 2026-04-20. Companion card, mood model, speech bank, `gardenName` customization, and bloom-style name suggestions are shipped. Phase 2 (Streak Freezes) is next.

## Context

Glowera is a feature-complete wellness app (habits, supplements, journal, gratitude, beauty rituals, phone-down sessions, challenges, journey timeline) with a strong aesthetic and non-punitive philosophy. Research into top-retention peer apps (Finch 5M+, Fabulous 10M DL, Stoic 4M) plus Gen Z / millennial women wellness trends identified a clear pattern: **Glowera has all the surface-area of a companion app but none of the attachment mechanics that drive 30-day retention.**

The five highest-leverage gaps, in priority order:
1. The plant is silent decoration, not a companion — Finch's bird is the single biggest retention feature in the category
2. Streaks are counted but not defended (no freeze = loss-aversion anxiety with no escape valve)
3. Home screen is a content dump of ~8 stacked cards, not a dashboard with clear hierarchy
4. A fully-built community/pods feature is hidden (`href: null` in the tabs layout) — the single biggest unused asset
5. Notifications are generic, fixed-time, app-voice — not companion-voice, not personalized

This plan implements exactly those five in 4-5 weeks. AI reflection, cohort challenges, shareable story cards, referrals, and an onboarding upgrade (not compression — see deferred section) are explicitly pushed to a follow-up phase.

## Scope (In)

| # | Feature | Phase | Effort | Status |
|---|---------|-------|--------|--------|
| 1 | Plant persona: name (reuse `gardenName`) + mood state + speech bubble on home | 1 | ~1 week | ✅ done |
| 2 | Streak freezes (earn + optional Premium-gate extra) | 2 | ~1 week | ⏳ next |
| 3 | Home restructure: plant top-of-screen + collapse 8 cards into 3 pods | 3 | 3-4 days | — |
| 4 | Unhide community tab + seed pods + polish UX | 4 | ~1 week | — |
| 5 | Companion-voice notifications at user-chosen times, tied to plant mood | 5 | ~3 days | — |

## Scope (Deferred — not in this plan)

- AI journal reflection (route chosen: Supabase Edge Function calling Anthropic) — add in next phase
- Cohort-based challenges (backend schema changes needed)
- Shareable "week in my garden" story card
- Referral flow with RevenueCat coupon
- Onboarding upgrade — audit each screen (delete pure filler, keep the long quiz-style length; paywall stays post-quiz)
- Plant travel/postcard feature (Finch-style)

---

## Phase 1 — Plant Persona (Week 1) — ✅ SHIPPED

**Goal**: The plant becomes a named companion with a voice, visible on the home screen, whose mood reflects user activity.

### Shipped in Phase 1

- `src/types/plant.ts` — added `PlantMood = 'glowing' | 'happy' | 'sleepy' | 'wilting'`
- `src/utils/plantMood.ts` — pure function `getPlantMood({streak, todaysProgressPercent})`
- `src/constants/companionSpeech.ts` — 80 lines across 4 moods, daily-hash selection, `{gardenName}` / `{streak}` tokens
- `src/components/garden/GloweraPlant.tsx` — optional `mood` prop with subtle droop/opacity pose animation
- `src/components/home/CompanionCard.tsx` — hero card with plant + speech bubble, nameplate, tappable to `/garden`
- `app/(tabs)/index.tsx` — `<CompanionCard />` inserted after header
- `app/(onboarding)/solution.tsx` + `app/(auth)/name-garden.tsx` — bloom-style suggestions (Rose, Poppy, Luna, Clover, Willow, Honey, Petal, Fern)
- `app/(tabs)/profile.tsx` — added visible "Garden Name" row in Settings for ongoing customization

### Mood model (derived, not persisted)

- `glowing` — streak ≥ 7 AND today's progress ≥ 50%
- `happy` — today's progress > 0
- `sleepy` — no activity today AND lastActiveDate is today or yesterday
- `wilting` — lastActiveDate ≥ 2 days ago

---

## Phase 2 — Streak Defense (Week 2)

**Goal**: Users can earn and spend streak freezes. The companion explicitly references them in speech when relevant.

### Design decisions

- Freeze = a consumable that, when applied, prevents a streak reset for exactly one missed day. Applied automatically the moment `recordDailyActivity` detects a multi-day gap, if `availableFreezes > 0`.
- Earning: one freeze per 14 consecutive days (fold into existing `streakMilestonesHit` reward logic). Platinum tier (RevenueCat `isPremium` boolean already exists in `useSubscriptionStore`) grants +1/month via a dated-claim check.
- Users see freeze count in the streak card UI and get a gentle post-hoc notification ("Your bloom held your streak while you rested") rather than an upfront prompt.

### Files to modify

- `src/stores/usePlantStore.ts`:
  - Extend `StreakData` interface with `availableFreezes: number` and `freezesUsedThisMonth: number` and `lastFreezeClaimMonth: string` (YYYY-MM for Platinum monthly claim)
  - In `recordDailyActivity`, when gap > 1 day AND `availableFreezes > 0`: decrement freezes, set `lastActiveDate = yesterday`, do NOT reset streak. Record a freeze event.
  - In milestone reward logic, at every 14-day milestone grant +1 freeze
  - Add `claimMonthlyFreezeIfPremium(isPremium: boolean)` — idempotent by month

### Files to create

- `src/components/garden/StreakFreezeBadge.tsx` — small badge showing freeze count, tappable → explainer modal
- `src/constants/companionSpeech.ts` — add new mood variant `post_freeze` with speech like "I held the garden steady while you rested. Welcome back."

### Files to modify (UI)

- Wherever the streak number is currently displayed on the home/garden screens (search for `currentStreak` usages), add the `StreakFreezeBadge` next to it
- `app/(onboarding)/paywall.tsx` — add "Monthly streak freezes" to the Platinum features list

### Reused utilities

- `useSubscriptionStore.isPremium` (existing)
- `usePlantStore.recordDailyActivity` (existing — just extended)

### Verification

- Set `lastActiveDate` in store to 2 days ago + `availableFreezes: 1` → trigger `recordDailyActivity` → streak preserved, freezes = 0
- Same setup with `availableFreezes: 0` → streak resets to 1 (existing behavior, unchanged)
- Cross 14-day streak milestone → `availableFreezes` increments
- Mock `isPremium = true` + different month → `claimMonthlyFreezeIfPremium` grants +1; calling again same month is no-op

---

## Phase 3 — Home Hierarchy Restructure (Week 2-3, 3-4 days)

**Goal**: Home screen leads with the companion. Eight stacked cards collapse into three clear pods with obvious intent.

### New information architecture

```
Logo (shrink to ~40px)
Header (date + companion-voice greeting, using gardenName + current mood)
──────────────────────────────────
CompanionCard (plant + speech bubble)  ← hero
CalendarStrip + ProgressCard (combined into one "Today" card)
──────────────────────────────────
Pod 1: TODAY
  • Today's Rituals (HabitCards)
  • Add New Ritual
──────────────────────────────────
Pod 2: REFLECT
  • Journal entry CTA (new or continue)
  • Gratitude jar
──────────────────────────────────
Pod 3: RITUAL MOMENTS
  • Phone Down
  • Beauty ritual
  • Challenge preview (if active)
──────────────────────────────────
```

### Files to modify

- `app/(tabs)/index.tsx` — re-order children, wrap in three `<PodSection title="...">` containers. Keep all existing card components; just reparent them.
- `src/components/home/AffirmationCard.tsx` — relocate OR fold the affirmation line into the CompanionCard speech bubble (affirmation becomes one of the speech variants). Decision: fold in — remove standalone `AffirmationCard` from home.

### Files to create

- `src/components/home/PodSection.tsx` — simple wrapper: label + spacing + optional divider. Reuse existing styles from `profile.tsx` section pattern.
- `src/components/home/TodayOverview.tsx` — combines `CalendarStrip` + `ProgressCard` into one condensed card (side-by-side on wide screens, stacked on narrow).

### Reused utilities

- All existing home card components (`ActionCards`, `ChallengePreviewCard`, `PhoneDownCard`, `GratitudeCard`, `BeautyCard`, `HabitCard`, `ProgressCard`, `CalendarStrip`)
- Section styling pattern from `app/(tabs)/profile.tsx` (look at `sectionLabel` + `card` styles)

### Verification

- Home screen has plant/companion visible immediately above the fold on iPhone 14/15/16 Pro Max
- Count of distinct visual "cards" dropped from 8 → 3 pods (plus companion + today overview header)
- Screenshot compare with previous home; confirm no feature was removed (just regrouped)

---

## Phase 4 — Unhide Community + Activate Pods (Week 3-4)

**Goal**: The community feature (already fully built — `app/(tabs)/community.tsx`, `stores/communityStore.ts`, Supabase tables `community_pods`, `pod_memberships`, `pod_messages` with `emoji_reactions`) ships. Users can join a 4-8 person pod during onboarding and get a low-stakes social layer.

### Files to modify

- `app/(tabs)/_layout.tsx` — remove `href: null` from the `community` tab entry (line currently reads `<Tabs.Screen name="community" options={{ href: null }} />`). Add icon + label in the tab bar order (propose: Home → Garden → Pods → Stack → Journal → Profile, dropping "Quests" from visible tabs to keep 6).
- `app/(tabs)/community.tsx` — UX polish pass:
  - Ensure empty state guides new users to join a pod
  - Add "You and 3 others are reflecting tonight" passive-presence text using last message timestamp
- `stores/communityStore.ts` — add a `getRecentActivity(podId)` selector returning count of messages in last 24h for the presence line

### Files to create

- `supabase/seed_pods.sql` (or equivalent) — seed ~20 themed pods ("Sunday Softness", "Morning Bloom", "Evening Wind-Down", etc.) so the first user isn't alone. Commit this as a fixture — users see populated options on day 1.
- `src/components/community/PodJoinCard.tsx` — clean join-a-pod card for the empty state

### Onboarding integration (lightweight)

- `app/(onboarding)/notifications.tsx` or a new screen before `welcome` — offer "Join a pod" as a soft opt-in. Skippable. Writes to `pod_memberships` via existing `joinPod` action in `stores/communityStore.ts`.

### Reused utilities

- Everything in `stores/communityStore.ts` (fully built — `fetchAvailablePods`, `joinPod`, `sendMessage`, `addReaction`)
- Existing Supabase schema (no migrations needed)

### Verification

- Fresh install → open the app → Pods tab is visible in bottom nav
- Seeded pods appear in the browse list
- Joining a pod and posting a message works; emoji reaction toggles in/out of `emoji_reactions` JSONB
- Second device / second account sees the message + reactions (realtime or via refresh — whichever is currently implemented)
- If `href` removal is not correct approach, check whether `community` is in the tabs order array anywhere else

---

## Phase 5 — Companion Notifications (Week 4, ~3 days)

**Goal**: Push notifications become personalized, companion-voice messages sent at the user's chosen times. No more fixed 8 AM / 9 PM generic copy.

### Current state

`src/lib/notifications.ts` hardcodes 8 AM / 9 PM with body "Glowera ✨ ...". `ensureScheduledFromSettings()` checks `user.notificationSettings.reminders_enabled` but ignores the user's chosen `morningTime` / `eveningTime` that already exist in the settings schema.

### Files to modify

- `src/lib/notifications.ts`:
  - `scheduleDaily()` — accept `{morningTime, eveningTime}` parameters and parse the HH:mm string into `{hour, minute}` for the daily trigger
  - Content copy — import from new `src/constants/notificationCopy.ts` (companion speech, `{gardenName}` token substitution)
  - Add a `scheduleStreakCheckIn(nextMorningTime)` that schedules a one-off "Your bloom is hoping to see you" notification when current streak ≥ 3 AND today has zero activity by 6pm local time
- Any screen that calls `ensureScheduledFromSettings` — pass through the user's chosen times (look for the existing settings hooks in `useUserStore`)

### Files to create

- `src/constants/notificationCopy.ts` — morning / evening / streak-at-risk / milestone variants, each with 10+ lines, keyed by plant mood. Mirror `companionSpeech.ts` structure — same `{gardenName}` and `{streak}` tokens.

### Reused utilities

- `src/constants/companionSpeech.ts` from Phase 1 (share tone + token replacement function)
- `user.notificationSettings.morningTime` and `eveningTime` (already set in Profile's time-picker modal)
- Existing `expo-notifications` integration in `src/lib/notifications.ts`

### Verification

- Change morning time in Profile → next scheduled notification fires at the new time (check `Notifications.getAllScheduledNotificationsAsync()`)
- Notification title / body contains the user's `gardenName`
- Skip a day mid-streak → the one-off "bloom is hoping" push fires ~6pm local
- Disable notifications → all prior ones are cancelled (existing `cancelAllAsync` path)

---

## Out of Scope / Next Phase

Backlog in priority order for a follow-up plan, once Phase 5 retention data is in:

1. **AI journal reflection** (Supabase Edge Function → Anthropic, gated behind Platinum; requires Supabase Pro ~$25/mo)
2. **Cohort challenges** — new `challenge_cohorts` table with `start_date`, `participant_count`, live counter UI
3. **Shareable "week in my garden" card** — extend `useJourneyStore` with image export via `react-native-view-shot`
4. **Referral flow** — invite link schema + RevenueCat promotional codes
5. **Onboarding upgrade (NOT compression)** — keep the length (16 screens is in-line with Noom / Cal AI / Fabulous conversion quizzes), but audit each screen: every screen should either collect personalization signal, surface social proof/testimonials, or reframe the problem. Delete pure-filler screens, don't shorten the quiz. Keep paywall at end of onboarding (post-quiz paywalls convert 2-3× better than post-signup in this category — the sunk-cost of the quiz is the conversion engine). Add an explicit Day-0 commitment inside the flow (name the plant + complete one real ritual before hitting home), which Fabulous already uses inside its long onboarding.
6. **Plant travel / postcards** — Finch-style overnight "trips" with a morning surprise

## Success Metrics to Track

Instrument before Phase 2 lands so we can measure:
- **D1, D7, D30 retention** (baseline today vs. after Phase 2 vs. after Phase 5)
- **Average streak length** (pre/post Phase 2 — streak freezes should lift this 30-50%)
- **% of sessions that open the journal** (Phase 3 should lift this by surfacing Reflect pod)
- **Pod join rate at onboarding** (Phase 4 — target 40%+)
- **Notification tap-through rate** (Phase 5 — companion-voice should ~2× generic app-voice)

## Critical File Inventory

**Read-only references (existing code we're building on):**
- `src/stores/usePlantStore.ts` — streak + growth engine
- `src/stores/useUserStore.ts` — `gardenName` source
- `src/stores/useHabitStore.ts` — `getProgressForDate`
- `src/stores/useJournalStore.ts` — recent mood for plant mood derivation
- `src/constants/affirmations.ts` — daily-hash selection pattern
- `stores/communityStore.ts` — already-built pod/message/reaction actions
- `app/(tabs)/community.tsx` — already-built UI
- `app/(tabs)/_layout.tsx` — where to unhide the pods tab
- `src/lib/notifications.ts` — current scheduling

**New files still to create:**
- `src/constants/notificationCopy.ts`
- `src/components/home/PodSection.tsx`
- `src/components/home/TodayOverview.tsx`
- `src/components/garden/StreakFreezeBadge.tsx`
- `src/components/community/PodJoinCard.tsx`
- `supabase/seed_pods.sql`

**Files still to modify:**
- `src/stores/usePlantStore.ts`
- `src/lib/notifications.ts`
- `app/(tabs)/index.tsx` (Phase 3 restructure)
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/community.tsx`
- `app/(onboarding)/paywall.tsx`
- `app/(onboarding)/notifications.tsx` (for pod join offer)
