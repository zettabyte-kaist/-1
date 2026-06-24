# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## 5. 게임 배포 규칙

**사이트**: https://zettabyte-kaist.github.io/-1/

**배포 구조:**
- GitHub Pages는 `main` 브랜치의 루트 `index.html`을 서빙한다.
- 게임 파일은 `game/` 디렉토리에서 관리하지만, 사이트는 루트 `index.html`을 읽는다.
- `game/index.html`에는 `game/data.js`, `game/engine.js`, `game/ui.js`가 인라인으로 포함되어 있다.

**게임 수정 시 필수 절차:**

1. `game/data.js`, `game/engine.js`, `game/ui.js` 중 수정이 필요한 파일 수정
2. 수정된 내용을 `game/index.html`의 인라인 `<script>` 블록에도 동기화
3. 루트 `index.html`을 `game/index.html`로 덮어쓰기:
   ```
   cp game/index.html index.html
   ```
4. 변경된 파일 모두 커밋하고 `main` 브랜치에 푸시:
   ```
   git add game/ index.html
   git commit -m "..."
   git push origin main
   ```
5. GitHub Actions가 자동으로 배포 (약 1~2분 소요). 워크플로우: `.github/workflows/deploy.yml`

**이 절차를 빠뜨리면:** `game/` 파일만 바뀌고 루트 `index.html`이 구버전으로 남아 사이트에 반영되지 않는다.
