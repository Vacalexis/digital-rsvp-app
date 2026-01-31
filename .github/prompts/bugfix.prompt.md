# Bug Fix Task

You are fixing a bug in the Digital RSVP App.

## Bug Fix Workflow

### 1. REPRODUCE (Understand)
- What is the expected behavior?
- What is the actual behavior?
- What are the reproduction steps?
- Which files are involved?

### 2. INVESTIGATE (Diagnose)
- Read the relevant files completely
- Check for related code in similar files
- Look for patterns that should match
- Identify the root cause, not just symptoms

### 3. FIX (Implement)
- Make the minimal change to fix the issue
- Don't refactor unrelated code
- Preserve existing functionality
- Add defensive checks if appropriate

### 4. VERIFY (Test)
- Run `npm run build` to check for errors
- Consider edge cases
- Ensure fix doesn't break other features

## Common Bug Categories

### Data Model Issues
- Check `src/app/models/` for interface definitions
- Ensure frontend and API use same field names
- Watch for `id` vs `_id` in MongoDB responses

### API Issues
- Check `api/` folder for endpoint implementation
- Verify HTTP method (GET/POST/PUT/DELETE)
- Check response format matches frontend expectations

### UI/Display Issues
- Check component's SCSS for specificity issues
- Verify CSS variables are used correctly
- Check for missing `@if` conditions

### State Issues
- Verify signals are being updated correctly
- Check if `computed()` dependencies are correct
- Ensure service methods are called in right order

## Defensive Coding Patterns

```typescript
// Null checks
const value = data?.property ?? 'default';

// Array safety
const items = response?.items ?? [];

// Type guards
if (this.isValidEvent(event)) {
  // now TypeScript knows event shape
}
```

## Debug Without Breaking Production

```typescript
// Use environment check for debug logs
if (!environment.production) {
  console.log('Debug:', data);
}
```

## Checklist
- [ ] Root cause identified (not just symptom)
- [ ] Fix is minimal and focused
- [ ] No regressions introduced
- [ ] Build passes
- [ ] Edge cases considered
