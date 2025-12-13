⸻

Visual Processing Training Website – Product Specification

Based on the “Visual processing training program” project and its exercises (coherent motion, visual search, eye tracking, etc.).  ￼

⸻

1. Project Overview

1.1 Purpose

Build a web-based training platform for 12-year-old children that:
	•	Delivers scripted visual-processing exercises for research.
	•	Supports user accounts (children + researcher/admin roles).
	•	Logs fine-grained performance data for each trial and session.
	•	Provides consistent, deterministic stimuli:
	•	Exercise X at difficulty level Y is exactly the same for every user and every run.
	•	Supports toggling difficulty levels per exercise (by researchers).
	•	Supports a 15-week protocol, 1 session per week (~30 minutes).

The system is for research on the connection between visual processing and reading in transparent (Slovene) vs. non-transparent (English) languages.  ￼

⸻

2. Key Constraints and Design Principles
	1.	Determinism for Research
	•	For each exercise and each difficulty level:
	•	The sequence of stimuli and correct answers is fixed and reproducible.
	•	No randomness based on time, user ID, or device.
	•	This ensures that any performance differences are due to the child’s abilities, not different stimuli.
	2.	Age-Appropriate UI (12-year-olds)
	•	Simple navigation, large buttons, clear icons.
	•	Minimal text; use clear instructions and friendly visuals.
	•	Positive feedback (animations, smiley faces) but not distracting.
	3.	Data Quality
	•	Precise logging of:
	•	Response accuracy, response time, exercise config, difficulty, device info.
	•	Exportable as CSV/JSON for statistical analysis.
	4.	Security & Privacy
	•	Children’s data must be pseudonymized.
	•	Only researchers/admins see identifying info (if any).
	•	Role-based access control.
	5.	Configurable, Versioned Protocol
	•	Exercise definitions and difficulty settings must be versioned.
	•	All logs reference the exercise version to ensure reproducibility.

⸻

3. User Roles & Personas

3.1 Child User (Participant)
	•	Age: around 12.
	•	Abilities: basic reading skills, can follow simple on-screen instructions.
	•	Access: login with credentials provided by researcher or using a one-time code.

Capabilities:
	•	View assigned sessions.
	•	Start a training session.
	•	Perform exercises in a fixed order.
	•	See simple feedback (e.g., score summary at session end).

Not allowed:
	•	Change difficulty levels.
	•	View detailed data history.
	•	Access admin/other children’s data.

⸻

3.2 Researcher / Admin
	•	Role: psychologist, special educator, or research assistant.
	•	Responsibilities: manage users, configure protocol, assign difficulties, export data.

Capabilities:
	•	Create/edit/delete child accounts.
	•	Assign children to groups (e.g., control, training).
	•	Configure:
	•	Which exercises are active.
	•	Difficulty level per exercise per child (or per group).
	•	Session length and schedule window.
	•	View and export:
	•	Session summaries.
	•	Trial-level logs.
	•	Lock configurations for study phases.

⸻

3.3 Optional: Parent/Guardian (Read-Only)
	•	View session participation and a high-level progress summary.
	•	Does not see detailed trial-level research data.

(This role is optional; can be added later.)

⸻

4. Functional Requirements

4.1 Authentication & User Management

Requirements:
	1.	Account Creation (Researcher/Admin only)
	•	Researchers can:
	•	Create child user accounts with:
	•	child_code (unique pseudonym, e.g., C1234).
	•	Optional fields: first name, age, school/class.
	•	Assign child to:
	•	Study Group (e.g., Group A/B, control).
	•	Protocol (set of exercises + difficulty levels).
	•	No open self-registration for children.
	2.	Login
	•	Web-based login via:
	•	Username + password, or
	•	Short child code + PIN.
	•	Researchers log in with email + password (stronger policy).
	3.	Role-Based Access Control
	•	Child: only own dashboard + sessions.
	•	Researcher/Admin: everything (within their study site).
	•	(Optional) Parent: limited read-only access.
	4.	Password & Security
	•	Encrypted password storage (e.g., bcrypt).
	•	Password reset for researchers through email.
	•	For children, password reset managed via researchers.

⸻

4.2 Study & Session Management

Requirements:
	1.	Study Definition
	•	Researcher can define a Study with:
	•	Name and description.
	•	Start and end dates.
	•	Protocol:
	•	Expected number of sessions (default: 15).
	•	Recommended frequency (1/week).
	•	Exercises included, and difficulty for each.
	•	Duration per session (e.g., 30 minutes).
	2.	Participant Assignment
	•	Assign each child to a Study.
	•	Assign default exercise set and difficulty levels.
	•	Option to override difficulty per child (if needed).
	3.	Session Flow (Child View)
	•	Child logs in.
	•	Home screen shows:
	•	“Start Today’s Session” button (enabled if they haven’t done today’s session).
	•	Number of completed sessions / total planned.
	•	Once session starts:
	•	Pre-session screen with short instructions (possibly researcher-specific).
	•	Exercises presented in configured order, each with:
	•	Intro screen with instructions.
	•	Trials (number depends on exercise/difficulty).
	•	Session ends with:
	•	“Well done!” screen.
	•	Simple metrics (e.g., stars, points, number of tasks completed).
	•	System logs session start/end times and completion status.
	4.	Session Enforcement
	•	Option to:
	•	Limit to one session per day.
	•	Enforce maximum number of total sessions (e.g., 15).
	•	Researchers can override and reopen extra sessions if needed.

⸻

4.3 Exercise Engine – Global Requirements

All exercises share:
	1.	Deterministic Configuration
	•	For each exercise:
	•	Define a finite set of Difficulty Levels (e.g., Level 1..5).
	•	For each difficulty level:
	•	Pre-script all trials:
	•	Stimulus parameters.
	•	Correct responses.
	•	Timing.
	•	Store these scripts in the database or as versioned JSON assets.
	•	When a child runs Exercise X at level Y, the system:
	•	Loads the pre-scripted sequence of trials.
	•	Displays them in order, no randomization.
	2.	Trial Lifecycle
	•	Each trial must have:
	•	Trial ID (unique within exercise version).
	•	Start timestamp.
	•	Stimulus description (logged).
	•	Correct answer.
	•	User response.
	•	Response time (ms).
	•	Flags: is_correct, timed_out, skipped.
	3.	Timing
	•	Each exercise must specify:
	•	Stimulus display duration.
	•	Allowed response window.
	•	Inter-trial interval (ITI) or a minimal gap.
	4.	Feedback
	•	Simple trial feedback:
	•	Visual indicator (e.g., green ✔ for correct, red ✖ for incorrect).
	•	Possibly optional (configurable, since some paradigms need no feedback).
	5.	Pause/Exit Handling
	•	Child can pause mid-session (e.g., “Pause” button).
	•	On resume:
	•	Returns to exact trial.
	•	If the browser refreshes/crashes:
	•	Session can resume from last completed trial.
	•	Incomplete session is logged but marked as incomplete.

⸻

4.4 Data Logging Requirements

Per Session:
	•	Session ID.
	•	Child ID.
	•	Study ID.
	•	Date/time start and end.
	•	Device info:
	•	Browser, OS.
	•	Screen resolution.
	•	Exercises performed, order, and difficulty levels used.
	•	Completion status and reason if not completed (timeout, manual exit).

Per Exercise Run (within a Session):
	•	Session ID + ExerciseRun ID.
	•	Exercise ID & version.
	•	Difficulty level ID & version.
	•	Start/end times.
	•	Number of trials.
	•	Aggregate stats:
	•	Number correct/incorrect.
	•	Average reaction time.
	•	Score (if applicable).

Per Trial:
	•	ExerciseRun ID + Trial ID.
	•	Pre-scripted trial parameters (sufficient to reconstruct stimulus):
	•	For example: dot positions, motion direction, coherence percentage, target locations, etc. (or a seed + version + param set).
	•	Display timing (planned vs. actual).
	•	Child’s response:
	•	Key/button clicked, or numeric input (e.g., count for visual search).
	•	Response time (ms) from stimulus onset.
	•	is_correct boolean.
	•	Metadata:
	•	Difficulty level.
	•	Index in sequence (e.g., trial 7 of 40).

Exports:
	•	Researcher can export:
	•	Trial-level CSV per child, per study, or global.
	•	Session-level CSV summaries.
	•	All exports should include:
	•	Exercise and difficulty versions.
	•	Child pseudonym (child_code), not real names.

⸻

5. Detailed Exercise Specifications

For each exercise below, you’ll define:
	•	Exercise ID and version.
	•	UI layout.
	•	Trial structure.
	•	Difficulty levels and what changes between them (e.g., number of items, speed, etc.).
	•	Logging fields.

5.1 Exercise 1 – Coherent Motion Detection

Goal: Develop magnocellular function through coherent motion detection.  ￼

Description:
	•	Two patches (left/right) with moving white dots on a dark background.
	•	One patch: random motion.
	•	Other patch: fixed coherence % (subset of dots move left/right consistently).
	•	Child chooses which patch contains coherent motion.

Deterministic Implementation:
	•	For each difficulty level:
	•	Predefine:
	•	Coherence percentage.
	•	Motion direction (left/right).
	•	Exact dot starting positions and trajectories for each trial.
	•	Save as a JSON asset, e.g.:

{
  "exercise_id": "coherent_motion_v1",
  "difficulty": 3,
  "trials": [
    {
      "trial_id": 1,
      "coherence_percent": 35,
      "coherent_side": "left",
      "seed": 12345
    },
    ...
  ]
}


	•	Using a pseudo-random generator seeded with seed, generate exact same dot positions on all devices.

Difficulty Levels (example):
	•	Level 1: 60% coherence, 20 trials.
	•	Level 2: 50% coherence, 24 trials.
	•	Level 3: 40% coherence, 30 trials.
	•	Level 4: 30% coherence, 30 trials.
	•	Level 5: 25% coherence, 30 trials.

(Researcher can adjust exact values, but they must be fixed per level.)

UI:
	•	Full-screen dark background.
	•	Two rectangular patches left/right (size and position fixed).
	•	Below patches: two big buttons “Left” and “Right” (or click directly on patches).

Timing:
	•	Stimulus display: 2300 ms/trial (as in study description).  ￼
	•	Response window:
	•	Option A: Response during stimulus.
	•	Option B: Response allowed for e.g. 2000 ms after stimulus disappears.
	•	ITI: 500–1000 ms (fixed per level).

Logging extra fields:
	•	coherence_percent.
	•	coherent_side.
	•	dot_seed.
	•	stimulus_duration_planned.
	•	stimulus_duration_actual.

⸻

5.2 Exercise 2 – Visual Search

Goal: Train visual discrimination and attention.  ￼

Description:
	•	Display a grid of simple pictures (e.g., shapes or icons).
	•	One or more items differ in some feature (size, color, orientation, shape).
	•	Child must count how many are different and choose the correct number.

Deterministic Implementation:
	•	For each difficulty level:
	•	Define:
	•	Grid size (rows × columns).
	•	Feature difference type (shape/colour/orientation).
	•	Number of targets.
	•	Exact positions of targets for each trial.
	•	Exact picture set used (IDs from image library).
	•	Pre-store each trial configuration.

Difficulty levels (example):
	•	Level 1:
	•	3×3 grid, 1 target, high contrast difference, 10 trials.
	•	Level 2:
	•	4×4 grid, 1–2 targets, moderate contrast difference.
	•	Level 3:
	•	5×5 grid, 2–3 targets, more subtle difference.
	•	Level 4–5:
	•	Larger grids, more targets, subtler differences.

UI:
	•	Central area: grid of images.
	•	Below: choices (buttons with numbers, e.g., 0–6).
	•	Clear instruction: “How many are different?”

Timing:
	•	Stimulus stays until child responds or max time (e.g., 15 seconds).
	•	ITI: 500 ms.

Logging:
	•	num_targets_correct.
	•	num_targets_reported.
	•	grid_size.
	•	difference_type.
	•	target_positions.

⸻

5.3 Exercise 3 – Static Eye Tracking (Line & Maze)

Goal: Train smooth pursuit-like tracking and spatial organization.  ￼

3a. Line Tracking
Description:
	•	A starting symbol on left (e.g., star).
	•	Multiple lines extend across the screen horizontally, crossing and connecting to different objects on the right.
	•	Child visually follows the correct line and selects the object connected to the target.

Deterministic Implementation:
	•	For each difficulty level:
	•	Predefine line layouts:
	•	Start/end points.
	•	Path coordinates.
	•	Predefine which line is the correct one per trial.

Difficulty variables:
	•	Number of lines.
	•	Path complexity (number of bends/crossings).
	•	Line thickness.

3b. Maze Tracking
Description:
	•	Standard 2D maze.
	•	Child finds path from entrance to exit (mouse path or just select exit).

Deterministic Implementation:
	•	Store maze images and correct paths (list of coordinates or cell path).
	•	For performance:
	•	Option 1 (Preferred for research): child clicks “Start” then “End” cell that is reachable via correct path.
	•	Option 2: capture mouse movement and evaluate path.

Difficulty variables:
	•	Maze size (width × height).
	•	Complexity (branching factor, length).

Logging:
	•	For line tracking:
	•	Selected object ID.
	•	is_correct.
	•	For maze:
	•	Chosen exit.
	•	Optional: path length, number of wrong clicks.

⸻

5.4 Exercise 4 – Dynamic Eye Tracking

Includes multiple mini-tasks, all deterministic.

4a. Football (Moving Circle Overlap)
Description:
	•	Circle moves within screen boundaries in predefined pattern.
	•	Static square at center.
	•	Child follows circle with eyes and clicks when circle overlaps the square.

Deterministic Implementation:
	•	Each trial:
	•	Pre-script circle trajectory (positions over time).
	•	Predefine time(s) when circle overlaps the square.

Difficulty variables:
	•	Circle speed.
	•	Square size.
	•	Number of overlap events per trial.

Logging:
	•	Timestamps of all child clicks.
	•	For each valid overlap window: whether child clicked within allowed time window.

4b. Tennis (Moving Ball and Paddle)
Description:
	•	Ball moves in a pre-defined random-looking path.
	•	Child controls paddle with mouse/keyboard to “hit” the ball.

Deterministic Implementation:
	•	Ball path and initial direction: fixed and pre-scripted.
	•	Paddle movement: child-controlled, but ball path is independent.

Difficulty variables:
	•	Ball speed.
	•	Paddle size.
	•	Number of hits required.

Logging:
	•	Number of hits.
	•	Number of misses.
	•	Reaction pattern over time.

4c. Two Moving Circles
Description:
	•	Two circles move around the screen.
	•	Child must click when the circles touch (overlap).

Deterministic Implementation:
	•	Predefine two paths for circles.
	•	Predefine time(s) when they overlap.

Difficulty variables:
	•	Speeds of circles.
	•	Number of overlaps.
	•	Minimal distance threshold.

Logging:
	•	Click timestamps.
	•	For each overlap window: whether clicked in window (hit) or not (miss).
	•	False positives (clicks when not overlapping).

⸻

5.5 Exercise 5 – Visually Guided Saccades

Description:
	•	A circle appears at one location, stays for a fixed time, disappears, and reappears elsewhere.
	•	The sequence moves from left-right and top-bottom gradually.
	•	Child must click when the circle appears at the new location.  ￼

Deterministic Implementation:
	•	For each difficulty level:
	•	Predefine a fixed list of circle positions and timings.
	•	Each trial is one “jump” or a sequence of jumps.

Difficulty variables:
	•	Duration circle stays visible.
	•	Inter-stimulus interval.
	•	Saccade amplitude (distance between positions).

Logging:
	•	Position index.
	•	Correct click or missed.
	•	Reaction time from circle onset.

⸻

5.6 Exercise 6 – Visual Memory

Description:
	•	Child sees a sequence of pictures for a brief period.
	•	Pictures disappear.
	•	Child must reproduce the correct order using drag-and-drop or by selecting numbered positions.  ￼

Deterministic Implementation:
	•	For each difficulty level:
	•	Predefine the picture sets and orders per trial.
	•	Display time per image is fixed.

Difficulty variables:
	•	Sequence length (number of pictures).
	•	Display time per picture.
	•	Complexity of images (similar vs clearly distinct).

Logging:
	•	Original sequence.
	•	Child’s reproduced sequence.
	•	Number of items in correct position.
	•	Longest correct prefix, etc.

⸻

5.7 Exercise 7 – Visual Orientation – Pair Search

Description:
	•	Display array of items; child searches for matching pairs among visual stimuli.  ￼

Deterministic Implementation:
	•	For each difficulty level:
	•	Predefine positions and what items appear.
	•	Predefine which items form pairs.

Difficulty variables:
	•	Number of items on screen.
	•	Number of pairs.
	•	Similarity of pairs vs distractors.

UI:
	•	Child clicks two items to indicate a pair.
	•	If they match, they stay highlighted or disappear.
	•	Continue until all pairs found or time runs out.

Logging:
	•	Number of correct pairs found.
	•	Number of wrong pair attempts.
	•	Time to complete.

⸻

6. Admin / Researcher Interface

6.1 Dashboard
	•	Summary cards:
	•	Number of active studies.
	•	Number of participants.
	•	Sessions completed / expected.
	•	Filters:
	•	By study, group, date range, exercise.

6.2 Participant Management
	•	List of participants with:
	•	child_code, age (optional), group, study, sessions completed.
	•	Buttons:
	•	View participant details.
	•	Assign/modify difficulties (per exercise).
	•	Lock configuration after baseline.

6.3 Study Configuration
	•	Create/edit studies:
	•	Choose exercises to include.
	•	For each exercise:
	•	Choose difficulty level(s).
	•	Choose number of trials.
	•	Set exercise order.
	•	Set session settings:
	•	Limit per day.
	•	Target session count (default 15).
	•	Expected duration.

6.4 Data Export
	•	Export options:
	•	Session-level data (CSV).
	•	Trial-level data (CSV).
	•	Filter by:
	•	Study.
	•	Date range.
	•	Participant codes.
	•	Include exercise version & difficulty.

⸻

⸻

8. Data Protection & Ethics
	•	Use hashed IDs for children.
	•	Separate table for personally identifying info (if stored at all).
	•	Ensure data at rest is encrypted (optionally).
	•	HTTPS for all traffic.
	•	Admin activity logging (who changed what, when).
	•	Support data deletion per participant (right to erasure).

⸻

9. Versioning & Research Integrity
	•	Each exercise must have:
	•	exercise_id (e.g., “coherent_motion”).
	•	exercise_version (e.g., “1.0.0”).
	•	Each difficulty configuration also has:
	•	difficulty_version (to track changes in stimulus parameters).
	•	Logged data should always include:
	•	exercise_id, exercise_version, difficulty_id, difficulty_version.
	•	Once a study begins:
	•	Option to lock exercise versions so that changes cannot affect ongoing participants.
	•	New exercise versions require new study definitions.

