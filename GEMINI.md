<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.agents/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.agents/skills/antislop-ui/SKILL.md`
- Copy & text: `antislop-copywriting`: `.agents/skills/antislop-copywriting/SKILL.md`
- People: `antislop-human`: `.agents/skills/antislop-human/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.agents/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `antislop-code`: `.agents/skills/antislop-code/SKILL.md`

Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->

# Master Anti-Slop, Design Taste & Human Writing Rules

## 1. UI & Visual Craft (antislop + taste-skill)
- **Brief Inference & Design Read**: Before generating UI, declare a one-line Design Read:
  *"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <aesthetic/system>."*
- **The Three Core Dials**: Calibrate dynamically:
  - `DESIGN_VARIANCE` (1-10, baseline 8): Layout asymmetry and rhythmic tension vs. rigid template symmetry.
  - `MOTION_INTENSITY` (1-10, baseline 6): Tactile, physics-based micro-interactions vs. static page.
  - `VISUAL_DENSITY` (1-10, baseline 4): Airy editorial showcase vs. high-density workstation cockpit.
- **Anti-Default Discipline**: Reject all generic LLM design habits:
  - No default purple/violet gradient blobs on dark mesh canvas.
  - No repetitive 3-card bento grids without functional reason.
  - Pass the **Purpose Test** for every gradient, border, glass effect, or badge: if the only reason is "it looks AI", cut it.
  - No fabricated statistics (no "99.999% ROI" or "Quantum Synergy"). Only real, verifiable numbers.
  - Every button, tab, and control must be functional or wired to a real state.
- **Installed Skills**:
  - `taste-skill`: `.agents/skills/taste-skill/SKILL.md`
  - `brandkit`: `.agents/skills/brandkit/SKILL.md`
  - `minimalist-skill`: `.agents/skills/minimalist-skill/SKILL.md`
  - `brutalist-skill`: `.agents/skills/brutalist-skill/SKILL.md`
  - `soft-skill`: `.agents/skills/soft-skill/SKILL.md`
  - `stitch-skill`: `.agents/skills/stitch-skill/SKILL.md`
  - `output-skill`: `.agents/skills/output-skill/SKILL.md`
  - `redesign-skill`: `.agents/skills/redesign-skill/SKILL.md`

## 2. Prose, Copy & Content Humanization (humanizer + stop-slop + no-ai-slop + avoid-ai-writing)
- **Zero Throat-Clearing**: Cut announcement phrases; start with the fact:
  - Ban: *"Here's the thing:"*, *"Let me be clear"*, *"The truth is,"*, *"It turns out"*, *"At the end of the day"*, *"In today's fast-paced world"*, *"Let's dive in"*, *"When it comes to"*.
- **Eliminate Structural AI Tells**:
  - No binary contrasts: *"Not X, but Y"* / *"This isn't just X, it's Y"*. State Y directly.
  - No dramatic one-line closers repeating the point at paragraph ends.
  - No forced triads (compulsive sets of three parallel adjectives/nouns).
  - No excessive em-dashes (`—`). Use natural punctuation.
  - No automatic bold labels on every list item (`- **Title**: text`).
  - No faux-insight colon reveals (*"The best part: it learns"*). Write a plain sentence.
- **Banned AI Vocabulary**:
  - Permanently eliminate: *delve, foster, leverage, utilize, streamline, robust, cutting-edge, paradigm shift, game changer, tapestry, realm, beacon, multifaceted, meticulous, intricate, paramount, transformative, elevate, embark, supercharge, harness, ever-evolving*.
- **Active Voice & Real Actors**:
  - Cut empty adverbs (*really, literally, fundamentally, crucially, inherently*).
  - Make real human actors the subject doing human verbs (no *"the decision emerged"*).
  - Respect the reader: state facts directly without marketing hype or hand-holding.
- **Installed Skills**:
  - `humanizer`: `.agents/skills/humanizer/SKILL.md`
  - `stop-slop`: `.agents/skills/stop-slop/SKILL.md`
  - `no-ai-slop`: `.agents/skills/no-ai-slop/SKILL.md`
  - `avoid-ai-writing`: `.agents/skills/avoid-ai-writing/SKILL.md`
  - `antislop-copywriting`: `.agents/skills/antislop-copywriting/SKILL.md`

## 3. Code & Comment Hygiene (antislop-code)
- No decorative box-drawing banners, ASCII dividers, or emoji in code comments.
- Never restate what the code trivially does. Only explain non-obvious rationale, architectural boundaries, and performance constraints.
- Leave executable code clean, idiomatic, and untouched.
- `antislop-code`: `.agents/skills/antislop-code/SKILL.md`

## 4. Project-Specific UI Invariants (Notula / VOXTUM)
- **Strictly Rectangular Containers**: All cards, drop zones, buttons, inputs, modal dialogs, and badges must use `rounded-none`. Reject default rounded aesthetics (`rounded-lg`, `rounded-xl`, `rounded-2xl`).
- **Multi-Format Media Pipeline**: Always support both audio (MP3, WAV, M4A) and video (MP4, WEBM) via automated client-side audio extraction using Web Audio API before dispatching to ASR inference.
- **Progressive Disclosure for Results**: Hide transcription and summary containers during upload/idle states. Animate and reveal results via collapsible accordion dropdowns only after processing finishes, complete with rich text formatting controls (B, I, U).
