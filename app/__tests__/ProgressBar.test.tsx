import { render, screen } from "@testing-library/react";

// Mock motion/react to avoid animation issues in tests
jest.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

import ProgressBar from "@/app/components/task/ProgressBar";

describe("ProgressBar", () => {
  it("renders 0% when no tasks exist", () => {
    render(<ProgressBar completed={0} total={0} />);

    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("0/0 completed")).toBeInTheDocument();
  });

  it("renders correct percentage", () => {
    render(<ProgressBar completed={3} total={10} />);

    expect(screen.getByText("30%")).toBeInTheDocument();
    expect(screen.getByText("3/10 completed")).toBeInTheDocument();
  });

  it("renders 100% when all tasks completed", () => {
    render(<ProgressBar completed={5} total={5} />);

    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("5/5 completed")).toBeInTheDocument();
  });

  it("rounds percentage correctly", () => {
    render(<ProgressBar completed={1} total={3} />);

    expect(screen.getByText("33%")).toBeInTheDocument();
  });

  it("has correct aria attributes", () => {
    render(<ProgressBar completed={7} total={10} />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "70");
    expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    expect(progressBar).toHaveAttribute("aria-valuemax", "100");
  });
});
