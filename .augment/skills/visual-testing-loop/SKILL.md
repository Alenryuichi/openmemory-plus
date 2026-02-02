---
name: visual-testing-loop
description: Automated visual testing closed-loop workflow. Use when building or iterating on frontend interfaces - automatically generates, serves, screenshots, analyzes, and iterates until quality criteria are met. Eliminates manual visual verification.
---

# Visual Testing Loop

## Overview

Automate the visual feedback loop for frontend development. No manual verification needed - Agent sees what users see and iterates autonomously.

**Core principle:** Generate → Serve → Screenshot → Analyze → Iterate (until satisfied)

## When to Use

- Building new UI components or pages
- Iterating on visual design
- Verifying responsive layouts
- Testing dark/light themes
- Quality-checking before delivery

## Prerequisites

Agent must have access to Playwright MCP tools:
- `browser_navigate_playwright`
- `browser_take_screenshot_playwright`
- `browser_snapshot_playwright`
- `launch-process` (for starting dev server)

## The Loop

### Phase 1: Generate

Create or modify the frontend code:
1. Apply `frontend-design` skill for aesthetic quality
2. Generate production-grade HTML/CSS/JS or React components
3. Ensure code is runnable locally

### Phase 2: Serve

Start a local development server:

```bash
# For static HTML
npx serve -p 3000 ./dist

# For React/Vite
npm run dev

# For Next.js
npm run dev
```

**Keep server running** (use `wait=false` for background process)

### Phase 3: Screenshot

Capture the rendered output:

1. Navigate to the page:
   ```
   browser_navigate_playwright → http://localhost:3000
   ```

2. Wait for page load:
   ```
   browser_wait_for_playwright → wait for key elements
   ```

3. Take screenshot:
   ```
   browser_take_screenshot_playwright → save to file
   ```

4. For full page:
   ```
   browser_take_screenshot_playwright → fullPage: true
   ```

### Phase 4: Analyze

Evaluate the screenshot against quality criteria:

**Visual Checklist:**
- [ ] Typography is distinctive (not generic fonts)
- [ ] Color palette is cohesive and intentional
- [ ] Layout has visual hierarchy
- [ ] Spacing is consistent
- [ ] No visual glitches or overflow
- [ ] Responsive at current viewport
- [ ] Matches intended aesthetic direction

**Technical Checklist:**
- [ ] All elements render correctly
- [ ] Images/icons load properly
- [ ] No console errors (check `browser_console_messages_playwright`)
- [ ] Interactive states work (hover, click)

### Phase 5: Iterate

If issues found:
1. Identify specific problems from screenshot analysis
2. Make targeted code changes
3. Return to Phase 3 (no need to restart server)
4. Repeat until all criteria pass

**Max iterations:** 5 (if exceeded, ask user for direction)

## Viewport Presets

Test at multiple sizes:

| Device | Width | Height |
|--------|-------|--------|
| Mobile | 375 | 667 |
| Tablet | 768 | 1024 |
| Desktop | 1440 | 900 |
| Wide | 1920 | 1080 |

Use `browser_resize_playwright` to switch viewports.

## Quality Gates

**PASS criteria (all must be true):**
- Visual checklist ≥ 6/7 items
- Technical checklist = 4/4 items
- No critical visual issues
- Matches user's stated requirements

**FAIL triggers (any = iterate):**
- Generic "AI slop" aesthetics detected
- Layout broken at any viewport
- Console errors present
- Missing required elements

## Example Workflow

```
1. Generate: Create landing page with hero section
2. Serve: npx serve -p 3000 ./output
3. Screenshot: Capture at 1440x900
4. Analyze: "Hero text too small, gradient too subtle"
5. Iterate: Increase font-size, boost gradient contrast
6. Screenshot: Recapture
7. Analyze: "Looks good, but mobile layout untested"
8. Resize: 375x667
9. Screenshot: Capture mobile view
10. Analyze: "Pass all criteria"
11. Complete: Deliver to user
```

## Integration with Other Skills

- **frontend-design**: Apply before Phase 1 for aesthetic guidance
- **systematic-debugging**: Use if rendering issues persist
- **verification-before-completion**: Run before final delivery

## Anti-Patterns

❌ Skip screenshot, trust code looks correct
❌ Only test one viewport
❌ Ignore console warnings
❌ Iterate > 5 times without user input
❌ Deliver without final screenshot verification

## Output

After successful loop, provide:
1. Final screenshot(s) at key viewports
2. Summary of iterations made
3. Any known limitations or trade-offs

