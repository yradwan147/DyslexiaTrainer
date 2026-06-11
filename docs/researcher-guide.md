# DyslexiaTrainer - Researcher Guide

## Getting Started

### Logging In

1. Go to the platform URL
2. Select **"I'm a Researcher"**
3. Enter your email and password
4. You'll land on the **Admin Dashboard**

---

## Creating a Study

1. Navigate to **Studies** from the sidebar
2. Click **Create Study**
3. Fill in the details:
   - **Study Name** — e.g. "Spring 2026 Visual Training"
   - **Description** — Brief summary of the study's purpose
   - **Target Sessions** — Total number of sessions each child should complete (e.g. 15)
   - **Sessions/Day** — How many sessions a child can do per day (default: 1)
   - **Duration (min)** — Expected session duration in minutes
4. **Select exercises** — Click the exercise chips at the bottom to add them to the study. For each exercise you can set the number of **Trials**. (Difficulty is not set here — every exercise starts at Level 1 and advances automatically; see *Difficulty Levels* below.)
5. Click **Create Study**

> The exercises you select become the study's first **Session Template**. You can add more templates later from the study configuration page.

---

## Configuring a Study

Click the **Configure** button on any study card to open the study detail page. It has four sections:

### 1. Study Settings

Edit the study name, description, target sessions, sessions per day, and duration. Click **Save Settings** when done.

Use **Lock Study** to prevent accidental changes during data collection. Unlock when you need to make adjustments.

### 2. Session Templates

Session templates define which exercises children do in each session. Most studies need just one template, but you can create multiple for varied protocols.

**How template cycling works:**
- If you have 1 template: every session uses the same exercises
- If you have 2 templates: odd sessions use Template 1, even sessions use Template 2
- If you have 3 templates: sessions cycle 1 → 2 → 3 → 1 → 2 → 3 → ...

**To manage templates:**
- Click the template tabs to switch between them
- **Add exercises** by clicking the exercise chips below the list
- **Remove exercises** with the ✕ button
- **Reorder exercises** with the ↑ ↓ arrows
- **Change trial count** by editing the **Trials** number next to each exercise
- **Add a new session type** with the "+ Add Session Type" button
- **Delete a session type** with the link at the bottom (only if more than one exists)

### 3. Difficulty Levels

Difficulty **advances automatically**, tracked per child per exercise — you don't set it manually.

- Every exercise starts at **Level 1**.
- After a session where the child scores **70% or higher** on an exercise, that exercise moves up **one level** for their next session.
- A score below 70% keeps the same level (it never drops). Levels are capped at **15**.
- **Coherent Motion Detection** is the exception — it has no fixed levels. Each session resumes at the coherence the child reached at the end of their previous session (starting at 30% the first time).

### 4. Participants

Shows all children enrolled in this study. Click **View Details** to see a child's full analytics.

---

## Adding Children (Participants)

1. Navigate to **Participants** from the sidebar
2. Click **Add Participant**
3. Fill in:
   - **Child Code** — A unique login code for the child (e.g. "CHILD01"). This is what they use to sign in.
   - **Password** — A simple PIN or password (e.g. "1234")
   - **First Name** — The child's name (optional, for your reference)
   - **Age** — The child's age (optional)
   - **Study** — Select which study to enrol them in
   - **Group** — Optional group label (e.g. "training", "control")
4. Click **Add**

> Share the child code and password with the child or their guardian. They will use these to log in.

---

## The Child Experience

When a child logs in, here's what they see:

### If enrolled in a study:
1. **Study progress** — "Session 5 of 15" with a progress bar
2. **Start Today's Session** button — Creates a new session and begins the exercise sequence
3. **Daily limits** — If sessions_per_day is reached, they see "All done for today! Great work!"
4. **Practice Mode** — Below the session button, they can freely practice any exercise from their study

### During a session:
1. **Intro screen** — Shows how many exercises they'll do
2. **Exercise sequence** — Exercises play in the order defined by the session template
3. **Transitions** — Between exercises, an encouragement screen shows progress
4. **Completion** — Final screen shows their overall score and star rating
5. They're returned to the dashboard

### Difficulty levels:
- Difficulty advances automatically, tracked per child per exercise — children don't choose difficulty
- Every exercise starts at Level 1 and moves up one level the session after the child scores 70%+ (a lower score holds the level; it never drops; capped at Level 15)
- Coherent Motion is the exception: each session resumes at the coherence reached at the end of the previous session
- A given level always produces the same exercise content (deterministic), so a level change is what gives the child new material

---

## Monitoring Progress

### Participant Detail Page

From **Participants**, click on any child to see:

1. **Study progress** — Sessions completed vs. target, with progress bar
2. **Session history** — Table showing every session: number, date, status, exercises completed, duration
3. **Progress summary** — The difficulty level each exercise was most recently trained at
4. **Per-exercise charts:**
   - Accuracy over time
   - Reaction time trends
   - Difficulty level progression
   - Sport-specific scores (football goals, tennis hits)
5. **Coherence staircase** — For coherent motion exercises, a trial-by-trial coherence chart

### Studies Page

Each study card shows:
- Number of participants
- Total completed sessions across all participants
- Target sessions
- Exercise list with difficulty levels

---

## Exporting Data

1. Navigate to **Export** from the sidebar
2. Select the study and data format
3. Click **Export** to download the data file

Exported data includes trial-level detail: every response, reaction time, correctness, and exercise-specific metrics.

---

## Available Exercises

| Exercise | Description | What it measures |
|----------|-------------|-----------------|
| **Coherent Motion Detection** | Find the side where dots move together | Motion perception threshold |
| **Visual Search** | Find the odd item among distractors | Visual attention, search efficiency |
| **Line Tracking** | Follow tangled lines to find the correct endpoint | Eye tracking, sustained attention |
| **Maze Tracking** | Navigate a maze collecting objects in order | Visual planning, spatial memory |
| **Visual Memory** | Remember and reproduce a sequence of images | Visual working memory |
| **Football (Dynamic Tracking)** | Track a moving ball behind occluders | Predictive eye tracking |
| **Tennis (Dynamic Tracking)** | Hit a bouncing ball with a paddle | Dynamic visual tracking |
| **Saccades** | Quick eye movements between targets | Saccadic eye movement speed |
| **Pair Search** | Find the matching shape in a grid | Visual discrimination |

---

## Tips

- **Start simple** — Create a study with 1 template and a few exercises first. You can always add more templates later.
- **Difficulty takes care of itself** — Every exercise starts at Level 1 and advances automatically when a child scores 70%+ in a session, so each child progresses at their own pace. Watch progression on the participant detail page.
- **Check progress regularly** — The participant detail page gives you real-time insight into each child's performance.
- **Lock your study** before data collection begins to prevent accidental configuration changes.
- **Sessions per day > 1** — Useful for intensive training protocols. Templates cycle across sessions, so with 2 templates and 2 sessions/day, children alternate between template types each session.
