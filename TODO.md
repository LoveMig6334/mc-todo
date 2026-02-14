# MC-Todo — TODO

## Feature 4: Playground Dashboard

A per-task interactive workspace where users can create flowcharts, take notes, make TODO lists, draw images, and manage information related to that task. Each task has its own unique playground dashboard.

---

### 4.1 Core Infrastructure
- [ ] Create `/playground/[taskId]` route
- [ ] Design playground layout (toolbar + canvas area)
- [ ] Implement playground data model and types
- [ ] Add localStorage persistence per task (keyed by task ID)
- [ ] Add navigation link from task to its playground (TaskItem, TaskModal)
- [ ] Handle invalid/deleted task IDs gracefully

### 4.2 Block System (Foundation)
- [ ] Define base block type (id, type, position, size, zIndex)
- [ ] Implement block rendering engine (canvas area with positioned blocks)
- [ ] Add block selection (click to select, click away to deselect)
- [ ] Add block dragging (reposition blocks on the canvas)
- [ ] Add block resizing (drag handles on edges/corners)
- [ ] Add block deletion (delete key / context menu)
- [ ] Add block z-index management (bring to front, send to back)
- [ ] Implement toolbar with block-type creation buttons

### 4.3 Note Block
- [ ] Rich text note block with title and body
- [ ] Markdown support or basic formatting (bold, italic, lists)
- [ ] Auto-save on edit
- [ ] Customizable background color

### 4.4 TODO List Block
- [ ] Inline checklist block with add/remove items
- [ ] Toggle checkbox completion
- [ ] Reorder items via drag
- [ ] Progress indicator (e.g., 3/5 done)

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
- [ ] Floating toolbar with block type icons (Note, TODO, Flowchart, Drawing)
- [ ] Zoom and pan controls for the canvas
- [ ] Grid/snap-to-grid toggle
- [ ] Undo/redo support
- [ ] Keyboard shortcuts (delete, copy, paste blocks)

### 4.8 Persistence & Data
- [ ] Serialize all blocks to JSON per task
- [ ] Load playground state on mount
- [ ] Auto-save on every change (debounced)
- [ ] Handle migration if block schema changes

### 4.9 Unit Tests
- [ ] Block CRUD operations
- [ ] Playground data serialization/deserialization
- [ ] Navigation between task and playground
- [ ] Individual block type rendering
