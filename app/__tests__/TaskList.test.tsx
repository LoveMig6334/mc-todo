import { render, screen } from '@testing-library/react';
import TaskList from '@/app/components/task/TaskList';
import { Task, Category } from '@/app/types/task';

const mockCategories: Category[] = [
  { id: 'work', name: 'Work', color: '#f97316' },
  { id: 'personal', name: 'Personal', color: '#3b82f6' },
];

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  details: 'Test details',
  categoryId: 'work',
  priority: 5,
  status: "pending",
  dueDate: { start: '2099-01-15', end: null },
  referenceLinks: ['https://example.com'],
  completed: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockHandlers = {
  onToggleComplete: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe('TaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no tasks', () => {
    render(
      <TaskList
        tasks={[]}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first task to get started')).toBeInTheDocument();
  });

  it('renders tasks when provided', () => {
    render(
      <TaskList
        tasks={[mockTask]}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test details')).toBeInTheDocument();
  });

  it('displays category name', () => {
    render(
      <TaskList
        tasks={[mockTask]}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('displays priority label', () => {
    render(
      <TaskList
        tasks={[mockTask]}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('displays link count', () => {
    render(
      <TaskList
        tasks={[mockTask]}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('1 link')).toBeInTheDocument();
  });

  it('shows plural for multiple links', () => {
    const taskWithMultipleLinks = {
      ...mockTask,
      referenceLinks: ['https://example1.com', 'https://example2.com'],
    };

    render(
      <TaskList
        tasks={[taskWithMultipleLinks]}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('2 links')).toBeInTheDocument();
  });

  it('renders multiple tasks', () => {
    const tasks = [
      mockTask,
      { ...mockTask, id: '2', title: 'Second Task' },
      { ...mockTask, id: '3', title: 'Third Task' },
    ];

    render(
      <TaskList
        tasks={tasks}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Second Task')).toBeInTheDocument();
    expect(screen.getByText('Third Task')).toBeInTheDocument();
  });

  it('shows overdue status for past due tasks', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: { start: '2020-01-01', end: null },
    };

    render(
      <TaskList
        tasks={[overdueTask]}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('(Overdue)')).toBeInTheDocument();
  });
});
