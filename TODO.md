# MC-Todo — TODO

## Feature 4: Playground Dashboard

A per-task interactive workspace where users can create flowcharts, take notes, make TODO lists, draw images, and manage information related to that task. Each task has its own unique playground dashboard.

---

### 4.1 Core Infrastructure

- [x] Create `/playground/[taskId]` route
- [x] Design playground layout (toolbar + canvas area)
- [x] Implement playground data model and types
- [x] Add localStorage persistence per task (keyed by task ID)
- [x] Add navigation link from task to its playground (TaskItem, TaskModal)
- [x] Handle invalid/deleted task IDs gracefully

### 4.2 Block System (Foundation)

- [x] Define base block type (id, type, position, size, zIndex)
- [x] Implement block rendering engine (canvas area with positioned blocks)
- [x] Add block selection (click to select, click away to deselect)
- [x] Add block dragging (reposition blocks on the canvas)
- [x] Add block resizing (drag handles on edges/corners)
- [x] Add block deletion (delete key / context menu)
- [x] Add block z-index management (bring to front, send to back)
- [x] Implement toolbar with block-type creation buttons

### 4.3 Note Block

- [x] Rich text note block with title and body
- [x] Markdown support or basic formatting (bold, italic, lists)
- [x] Auto-save on edit
- [x] Customizable background color

### 4.4 TODO List Block

- [x] Inline checklist block with add/remove items
- [x] Toggle checkbox completion
- [x] Reorder items via drag
- [x] Progress indicator (e.g., 3/5 done)

### 4.5 Flowchart Block

- [ ] Node creation (labeled boxes/circles)
- [ ] Edge/connection drawing between nodes
- [ ] Node dragging with connected edges following
- [ ] Edge labels
- [ ] Basic node shapes (rectangle, diamond, circle)

### 4.6 Drawing Block

- [ ] Freehand drawing canvas (pen tool)
- [ ] Stroke color and width picker
- [ ] Eraser tool
- [ ] Clear canvas action
- [ ] Export drawing as image (optional)

### 4.7 Toolbar & UX

- [x] Floating toolbar with block type icons (Note, TODO, Flowchart, Drawing)
- [x] Zoom and pan controls for the canvas
- [x] Add Playground nav item to FloatingNav with task list dropdown
- [ ] Grid/snap-to-grid toggle
- [ ] Undo/redo support
- [ ] Keyboard shortcuts (delete, copy, paste blocks)

### 4.8 Persistence & Data

- [x] Serialize all blocks to JSON per task
- [x] Load playground state on mount
- [x] Auto-save on every change (debounced)
- [ ] Handle migration if block schema changes

### 4.9 Unit Tests

- [x] Block CRUD operations
- [x] Playground data serialization/deserialization
- [ ] Navigation between task and playground
- [x] Individual block type rendering
