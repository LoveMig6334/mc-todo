import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from '@/app/components/task/TaskItem';
import { Task, Category } from '@/app/types/task';

const mockCategory: Category = { id: 'work', name: 'Work', color: '#f97316' };

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  details: 'Test details',
  categoryId: 'work',
  priority: 5,
  status: "pending",
  dueDate: { start: '2099-01-15', end: null },
  referenceLinks: [],
  completed: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockHandlers = {
  onToggleComplete: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe('TaskItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task title', () => {
    render(
      <TaskItem
        task={mockTask}
        category={mockCategory}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders task details', () => {
    render(
      <TaskItem
        task={mockTask}
        category={mockCategory}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Test details')).toBeInTheDocument();
  });

  it('calls onToggleComplete when checkbox clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        category={mockCategory}
        {...mockHandlers}
      />
    );

    const checkbox = screen.getAllByRole('button')[0];
    fireEvent.click(checkbox);

    expect(mockHandlers.onToggleComplete).toHaveBeenCalledWith('1');
  });

  it('calls onEdit when edit button clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        category={mockCategory}
        {...mockHandlers}
      />
    );

    const editButton = screen.getByLabelText('Edit task');
    fireEvent.click(editButton);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        category={mockCategory}
        {...mockHandlers}
      />
    );

    const deleteButton = screen.getByLabelText('Delete task');
    fireEvent.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });

  it('shows completed styling when task is completed', () => {
    const completedTask = { ...mockTask, completed: true };

    render(
      <TaskItem
        task={completedTask}
        category={mockCategory}
        {...mockHandlers}
      />
    );

    const title = screen.getByText('Test Task');
    expect(title).toHaveClass('line-through');
  });

  it('shows overdue styling for past due incomplete tasks', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: { start: '2020-01-01', end: null },
    };

    render(
      <TaskItem
        task={overdueTask}
        category={mockCategory}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('(Overdue)')).toBeInTheDocument();
  });

  it('does not show overdue for completed tasks', () => {
    const completedOverdueTask = {
      ...mockTask,
      dueDate: { start: '2020-01-01', end: null },
      completed: true,
    };

    render(
      <TaskItem
        task={completedOverdueTask}
        category={mockCategory}
        {...mockHandlers}
      />
    );

    expect(screen.queryByText('(Overdue)')).not.toBeInTheDocument();
  });
});
