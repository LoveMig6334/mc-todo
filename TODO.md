# MC-Todo — TODO

## Feature 5: Project Management

A project is a time-bounded, color-coded container that groups related tasks. Projects appear as large bordered cards on the task manager page (containing indented child tasks), as translucent color overlays on the calendar, and their child-tasks count as normal tasks on the dashboard.

---

### 5.1 Foundation — Types & Hook

- [x] Add `Project` interface and `ProjectFormData` to `types/task.ts`
- [x] Add optional `projectId?: string` to `Task` interface
- [x] Create `useProjects` hook with full CRUD + normalization
- [x] Add `projectId` to `useTaskManager` normalization (backward-compat default `undefined`)

### 5.2 Project Creation UI

- [x] Rework floating Add button: pill-tab selector (Task | Project)
- [x] Create `ProjectModal` (Title, Description, Date Range, Color picker)
- [x] Wire project creation/editing in `app/page.tsx`

### 5.3 Task Manager Page

- [x] Create `ProjectItem` component (bordered card, left color accent bar, collapsible indented tasks, expand/collapse)
- [x] Update `TaskList` to render Projects above standalone tasks
- [x] Add `prefilledProjectId` + project dropdown to `TaskModal`
- [x] "Add task to project" inline action inside `ProjectItem`

### 5.4 Calendar Integration

- [x] Create `ProjectOverlay` component (translucent color band, pointer-events: none)
- [x] Render overlays in `CalendarGrid` behind task events
- [x] Constrain task drag/resize to project date range in `useEventDrag` / `useEventResize`

### 5.5 Dashboard & Tests

- [x] Audit `useDashboardStats` / `dashboardUtils` — verify project child-tasks counted correctly
- [x] Jest: `useProjects` CRUD tests
- [x] Jest: `ProjectItem` rendering tests
- [x] Jest: `ProjectModal` form validation tests
- [x] Jest: calendar drag-constraint tests
