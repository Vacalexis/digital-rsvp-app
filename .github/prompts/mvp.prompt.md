# MVP Development Task

You are working on the **Digital RSVP App MVP**. Focus on shipping functional features quickly while maintaining code quality.

## Context
- This is an Ionic 8 + Angular 18 application
- Backend: Vercel Serverless Functions + MongoDB Atlas
- All UI text must be in Portuguese (PT-PT)
- Deploy branch: `development`

## MVP Priorities (In Order)
1. **Core functionality works** - User can complete the main flows
2. **No crashes or errors** - Happy path is stable
3. **Consistent UX** - Similar patterns across screens
4. **Code reuse** - Use existing components/utils
5. **Edge cases** - Handle them, but don't over-engineer

## Your Task Approach

### Before Coding
1. Identify the **minimum** changes needed
2. Check for **existing** components in `src/app/components/`
3. Check for **existing** utils in `src/app/utils/`
4. Check for **similar patterns** in other pages

### While Coding
- Prefer modifying existing code over creating new files
- Follow patterns already established in the codebase
- Keep changes focused on the specific task
- Add loading states and error handling

### After Coding
- Run `npm run build` to verify no errors
- Ensure no duplicate code was introduced
- Test the happy path mentally

## Key Files for MVP
- `src/app/pages/rsvp/` - Public RSVP form
- `src/app/pages/invitation-preview/` - Invitation display
- `src/app/components/invitation-card/` - Shared invitation component
- `src/app/services/invitation.service.ts` - Invitation API

## Known MVP Issues (from AUDIT-MVP-ISSUES.md)
- ISSUE-002: `children` vs `childrenNames` inconsistency
- ISSUE-003: RSVP doesn't ask children ages
- ISSUE-004: Dietary options duplicated

## Quality Checklist
- [ ] Portuguese text only (no English in UI)
- [ ] Uses existing components where applicable
- [ ] No hardcoded colors (use CSS variables)
- [ ] Build passes without errors
- [ ] Follows standalone component pattern
