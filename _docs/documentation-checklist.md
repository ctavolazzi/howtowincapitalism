# Documentation Checklist

Generated: 2025-12-14T15:56:18.350Z

## Summary

- Total files: 130
- Files with headers: 17 (13%)
- Files needing headers: 113

**Progress Update (2025-12-14):**
- lib/auth: 12/12 complete (100%)
- lib/tools: 4/4 complete (100%) - includes test file

## Progress by Category

### components/search (0/1 = 0%)

- [ ] `src/components/search/GlobalSearch.astro` (P:139, L:385)

### scripts (1/8 = 13%)

- [ ] `scripts/terminal-ambient-animation.mjs` (P:181, L:278)
- [ ] `scripts/ship.mjs` (P:155, L:124)
- [ ] `scripts/capture-auth-screenshots.mjs` (P:125, L:88)
- [x] `scripts/analyze-codebase.mjs` (P:104, L:550)
- [ ] `scripts/seed-users.mjs` (P:96, L:166)
- [ ] `scripts/new-page.mjs` (P:94, L:120)
- [ ] `scripts/generate-og-image.mjs` (P:34, L:25)
- [ ] `scripts/generate-icons.mjs` (P:33, L:29)

### layouts (0/1 = 0%)

- [ ] `src/layouts/Base.astro` (P:72, L:537)

### pages (0/20 = 0%)

- [ ] `src/pages/users/[id].astro` (P:171, L:549)
- [ ] `src/pages/[...slug].astro` (P:143, L:64)
- [ ] `src/pages/index.astro` (P:143, L:81)
- [ ] `src/pages/profile/edit.astro` (P:141, L:352)
- [ ] `src/pages/admin/users/index.astro` (P:140, L:391)
- [ ] `src/pages/profile/me.astro` (P:136, L:218)
- [ ] `src/pages/admin/users/new.astro` (P:95, L:295)
- [ ] `src/pages/profile/[id].astro` (P:56, L:210)
- [ ] `src/pages/users/index.astro` (P:43, L:258)
- [ ] `src/pages/forgot-password/index.astro` (P:27, L:101)
- [ ] `src/pages/login/index.astro` (P:23, L:107)
- [ ] `src/pages/register/index.astro` (P:23, L:104)
- [ ] `src/pages/logout/index.astro` (P:22, L:59)
- [ ] `src/pages/profile/index.astro` (P:22, L:51)
- [ ] `src/pages/disclaimer.astro` (P:21, L:48)
- [ ] `src/pages/privacy/index.astro` (P:21, L:29)
- [ ] `src/pages/reset-password/index.astro` (P:21, L:86)
- [ ] `src/pages/terms/index.astro` (P:21, L:25)
- [ ] `src/pages/confirm/error/index.astro` (P:20, L:150)
- [ ] `src/pages/confirm/success/index.astro` (P:20, L:112)

### components/auth (0/5 = 0%)

- [ ] `src/components/auth/ResetPasswordForm.astro` (P:150, L:368)
- [ ] `src/components/auth/LoginForm.astro` (P:51, L:255)
- [ ] `src/components/auth/RegisterForm.astro` (P:46, L:348)
- [ ] `src/components/auth/UserMenu.astro` (P:43, L:203)
- [ ] `src/components/auth/ForgotPasswordForm.astro` (P:26, L:178)

### lib/auth/tests (0/4 = 0%)

- [ ] `src/lib/auth/registration-validation.test.ts` (P:140, L:221)
- [ ] `src/lib/auth/rate-limit.test.ts` (P:28, L:151)
- [ ] `src/lib/auth/turnstile.test.ts` (P:28, L:119)
- [ ] `src/lib/auth/local-auth.test.ts` (P:21, L:115)

### components/guards (0/1 = 0%)

- [ ] `src/components/guards/OwnerGuard.astro` (P:41, L:211)

### lib/tools/tests (0/1 = 0%)

- [ ] `src/lib/tools/decision-matrix.test.ts` (P:41, L:494)

### api/admin (0/3 = 0%)

- [ ] `src/pages/api/admin/users/[id].ts` (P:64, L:234)
- [ ] `src/pages/api/admin/users/create.ts` (P:30, L:131)
- [ ] `src/pages/api/admin/users/list.ts` (P:26, L:64)

### tests (0/12 = 0%)

- [ ] `tests/auth-snapshots.spec.ts` (P:144, L:68)
- [ ] `tests/accessibility.spec.ts` (P:92, L:178)
- [ ] `tests/account-rights.spec.ts` (P:57, L:98)
- [ ] `tests/admin.spec.ts` (P:57, L:265)
- [ ] `tests/registration.spec.ts` (P:53, L:254)
- [ ] `tests/security.spec.ts` (P:53, L:265)
- [ ] `tests/users.spec.ts` (P:37, L:152)
- [ ] `tests/security-and-smoke.spec.ts` (P:22, L:20)
- [ ] `tests/fixtures/test-credentials.ts` (P:20, L:39)
- [ ] `tests/content.spec.ts` (P:-15, L:158)
- [ ] `tests/auth.spec.ts` (P:-66, L:179)
- [ ] `tests/navigation.spec.ts` (P:-69, L:133)

### api/auth (0/9 = 0%)

- [ ] `src/pages/api/auth/register.ts` (P:125, L:281)
- [ ] `src/pages/api/auth/forgot-password.ts` (P:35, L:75)
- [ ] `src/pages/api/auth/login.ts` (P:34, L:168)
- [ ] `src/pages/api/auth/account/delete.ts` (P:30, L:62)
- [ ] `src/pages/api/auth/account/export.ts` (P:26, L:46)
- [ ] `src/pages/api/auth/confirm.ts` (P:26, L:31)
- [ ] `src/pages/api/auth/logout.ts` (P:26, L:62)
- [ ] `src/pages/api/auth/me.ts` (P:26, L:66)
- [ ] `src/pages/api/auth/reset-password.ts` (P:-72, L:105)

### components/organisms (0/9 = 0%)

- [ ] `src/components/organisms/profile/ProfileForm.astro` (P:46, L:278)
- [ ] `src/components/organisms/Footer.astro` (P:41, L:202)
- [ ] `src/components/organisms/ContentSection.astro` (P:21, L:43)
- [ ] `src/components/organisms/Hero.astro` (P:21, L:150)
- [ ] `src/components/organisms/PageHeader.astro` (P:21, L:32)
- [ ] `src/components/organisms/profile/ActivityFeed.astro` (P:21, L:110)
- [ ] `src/components/organisms/profile/ProfileHeader.astro` (P:21, L:200)
- [ ] `src/components/organisms/profile/SystemBulletin.astro` (P:21, L:170)
- [ ] `src/components/organisms/profile/index.ts` (P:20, L:7)

### src/other (0/2 = 0%)

- [ ] `src/middleware.ts` (P:26, L:24)
- [ ] `src/content.config.ts` (P:21, L:48)

### lib/email (0/3 = 0%)

- [ ] `src/lib/email/send-confirmation.ts` (P:31, L:115)
- [ ] `src/lib/email/send-password-reset.ts` (P:31, L:126)
- [ ] `src/lib/email/send-reset.ts` (P:11, L:233)

### components/atoms (0/5 = 0%)

- [ ] `src/components/atoms/Breadcrumbs.astro` (P:21, L:94)
- [ ] `src/components/atoms/Collapsible.astro` (P:21, L:171)
- [ ] `src/components/atoms/WikiBox.astro` (P:21, L:54)
- [ ] `src/components/atoms/Avatar.astro` (P:20, L:48)
- [ ] `src/components/atoms/RoleBadge.astro` (P:20, L:65)

### components/trade (0/1 = 0%)

- [ ] `src/components/trade/TradeWidget.astro` (P:21, L:177)

### other (0/3 = 0%)

- [ ] `astro.config.mjs` (P:21, L:25)
- [ ] `playwright.config.ts` (P:21, L:48)
- [ ] `vitest.config.ts` (P:21, L:14)

### components/other (0/1 = 0%)

- [ ] `src/components/index.ts` (P:20, L:51)

### components/simple (0/4 = 0%)

- [ ] `src/components/simple/Aside.astro` (P:20, L:36)
- [ ] `src/components/simple/Steps.astro` (P:20, L:39)
- [ ] `src/components/simple/TabItem.astro` (P:20, L:15)
- [ ] `src/components/simple/Tabs.astro` (P:20, L:34)

### components/utilities (0/3 = 0%)

- [ ] `src/components/utilities/CardGrid.astro` (P:20, L:41)
- [ ] `src/components/utilities/Empty.astro` (P:20, L:10)
- [ ] `src/components/utilities/ForceLightTheme.astro` (P:20, L:13)

### components/molecules (0/13 = 0%)

- [ ] `src/components/molecules/Favorites.astro` (P:137, L:248)
- [ ] `src/components/molecules/DecisionMatrix.astro` (P:42, L:307)
- [ ] `src/components/molecules/CallToAction.astro` (P:22, L:59)
- [ ] `src/components/molecules/Disclaimer.astro` (P:21, L:45)
- [ ] `src/components/molecules/FAQ.astro` (P:21, L:93)
- [ ] `src/components/molecules/InfoBox.astro` (P:21, L:21)
- [ ] `src/components/molecules/NavBox.astro` (P:21, L:21)
- [ ] `src/components/molecules/NoteBox.astro` (P:21, L:19)
- [ ] `src/components/molecules/SeeAlso.astro` (P:21, L:64)
- [ ] `src/components/molecules/TopicCard.astro` (P:21, L:70)
- [ ] `src/components/molecules/BlankSlate.astro` (P:20, L:166)
- [ ] `src/components/molecules/CompletenessMeter.astro` (P:20, L:254)
- [ ] `src/components/molecules/ActivityItem.astro` (P:-177, L:125)

### lib/api (0/3 = 0%)

- [ ] `src/lib/api/index.ts` (P:21, L:37)
- [ ] `src/lib/api/profileService.ts` (P:-12, L:229)
- [ ] `src/lib/api/profileActions.ts` (P:-13, L:122)

### lib/auth (12/12 = 100%) ✅

- [x] `src/lib/auth/kv-auth.ts` (P:115, L:519)
- [x] `src/lib/auth/rate-limit.ts` (P:49, L:232)
- [x] `src/lib/auth/userStore.ts` (P:49, L:272)
- [x] `src/lib/auth/store.ts` (P:29, L:165)
- [x] `src/lib/auth/index.ts` (P:20, L:62)
- [x] `src/lib/auth/local-auth.ts` (P:18, L:151)
- [x] `src/lib/auth/csrf.ts` (P:16, L:153)
- [x] `src/lib/auth/permissions.ts` (P:14, L:201)
- [x] `src/lib/auth/activity.ts` (P:6, L:73)
- [x] `src/lib/auth/api-client.ts` (P:2, L:65)
- [x] `src/lib/auth/turnstile.ts` (P:-10, L:93)
- [x] `src/lib/auth/schemas/userProfile.ts` (P:-494, L:507)

### lib/config (0/1 = 0%)

- [ ] `src/lib/config/systemBulletins.ts` (P:-15, L:73)

### lib/tools (3/3 = 100%) ✅

- [x] `src/lib/tools/logger.mjs` (P:117, L:287)
- [x] `src/lib/tools/index.ts` (P:21, L:21)
- [x] `src/lib/tools/decision-matrix.ts` (P:-319, L:868)

### lib/other (0/2 = 0%)

- [ ] `src/lib/constants.ts` (P:21, L:21)
- [ ] `src/lib/debug.ts` (P:-303, L:302)
