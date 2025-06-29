# Archetype Implementation Flow Analysis

## Execution Flow for `worktree open 123 -w 3`

### 1. Entry Point (index.ts)
- Command: `worktree open <issue-number> [description]`
- Options parsed:
  - `-w, --workers <number>`: defaults to '1'
  - `--watcher`: boolean flag
  - `--no-wizard`: sets `wizard: false` in options

### 2. openCommand Function (open.ts)

#### Initial Setup (lines 51-65)
- Parses worker count from options
- Validates worker count (1-5)
- Initializes Git, GitHub, Config, and Tmux operations

#### Single Worker Path (lines 162-165)
- If `workerCount === 1`, launches Claude without archetypes
- No coordination file created
- Simple prompt: "Solve the issue described in CLAUDE.md"

#### Multiple Worker Path (lines 166-222)

##### Worker 1 Setup (line 167)
- Always assigned as Coordinator
- No archetype selection needed

##### Archetype Selection (lines 169-185)
- Creates `workerArchetypes` object to store selections
- Two paths:
  1. **Wizard Mode** (`options?.wizard !== false`):
     - Interactive selection for workers 2+
     - Uses `selectArchetype()` function
     - Shows all 5 archetypes with emojis
  2. **No-Wizard Mode** (`--no-wizard` flag):
     - Uses `getDefaultArchetypeForWorker()`
     - Default assignments:
       - Worker 2: Detective
       - Worker 3: Craftsman
       - Worker 4: Aesthete
       - Worker 5: Explorer

##### Coordination File Creation (lines 188-200)
- Only created if `workerCount > 1`
- Passes `workerArchetypes` to `generateCoordinationMd()`
- File created BEFORE launching workers

##### Worker Launch Sequence (lines 203-222)
- Worker 1: Launched first with coordinator prompt
- Workers 2+: Launched with archetype-specific prompts
- Each worker gets:
  - Worker number
  - Total worker count
  - Issue number
  - Archetype (if applicable)

### 3. Coordination File Generation (coordination.md.ts)

#### Worker Sections
- Worker 1: Always listed as Coordinator
- Workers 2-5: Display archetype info if available:
  - Emoji and name in header
  - Short description as role
  - Focus area
  - First 4 traits as responsibilities

#### Fallback Behavior
- If archetype data missing, uses generic descriptions
- Safe optional chaining throughout (`?.`)

### 4. Worker Prompts (generateWorkerPrompt)

#### Worker 1 Prompt
- Identifies as Coordinator
- Instructions to create task breakdown
- No archetype-specific guidance

#### Workers 2+ Prompts
- If archetype provided:
  - Includes archetype name
  - Adds archetype-specific prompt
- Instructions to wait for coordination file
- Check every 20 seconds until available

### 5. Tmux Operations (tmux.ts)

#### launchClaudeWithPrompt (Worker 1)
- Creates new window
- Launches Claude
- Sends coordinator prompt after 5s delay

#### launchClaudeInPaneWithPrompt (Workers 2+)
- Splits pane (alternating H/V)
- Launches Claude
- Sends archetype prompt after 5s delay
- Logs worker number in success message

## Potential Issues Identified

### 1. ✅ Archetype Data Flow - SOLID
- Archetypes properly selected before coordination file creation
- Data correctly passed through all functions
- No risk of undefined archetypes in coordination file

### 2. ✅ Worker 1 Stays as Coordinator - CONFIRMED
- Never goes through archetype selection
- Always gets coordinator prompt
- Coordination file correctly identifies it

### 3. ✅ Wizard Handling - ROBUST
- Default behavior: wizard enabled (interactive)
- `--no-wizard` flag properly disables it
- Input validation (1-5) with retry on invalid

### 4. ✅ Coordination File Timing - CORRECT
- Created AFTER archetype selection
- Created BEFORE launching workers
- Workers instructed to wait and check for it

### 5. ✅ Edge Case Handling - SAFE
- Optional chaining prevents crashes
- Fallback text for missing archetypes
- Worker count validation (1-5)

### 6. ⚠️ Minor Enhancement Opportunities
- No validation if archetype selection interrupted (Ctrl+C)
- No confirmation prompt after selections
- No way to review/change selections

## Conclusion

The archetype implementation is **solid and well-structured**. The flow correctly:
1. Validates input
2. Selects archetypes before creating coordination file
3. Passes archetype data through all layers
4. Handles both wizard and no-wizard modes
5. Maintains Worker 1 as Coordinator
6. Provides appropriate fallbacks

The implementation successfully avoids the common pitfalls of:
- Undefined archetype data
- Race conditions between file creation and worker launch
- Worker 1 getting an archetype
- Invalid worker counts

The code is production-ready with good error handling and user feedback.