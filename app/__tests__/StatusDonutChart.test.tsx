import { render, screen } from "@testing-library/react";
import StatusDonutChart from "@/app/components/dashboard/StatusDonutChart";
import { StatusStat } from "@/app/lib/dashboardUtils";

describe("StatusDonutChart", () => {
  it("renders 'All done' when data is empty", () => {
    render(<StatusDonutChart data={[]} total={0} />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("All done")).toBeInTheDocument();
    expect(screen.getByText("Status Overview")).toBeInTheDocument();
  });

  it("renders center count and 'active' label with data", () => {
    const data: StatusStat[] = [
      { status: "pending", label: "Pending", count: 3, color: "#eab308" },
      { status: "in_progress", label: "In Progress", count: 2, color: "#3b82f6" },
    ];

    render(<StatusDonutChart data={data} total={5} />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("renders legend labels and counts", () => {
    const data: StatusStat[] = [
      { status: "pending", label: "Pending", count: 3, color: "#eab308" },
      { status: "paused", label: "Paused", count: 1, color: "#71717a" },
    ];

    render(<StatusDonutChart data={data} total={4} />);

    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders SVG circles", () => {
    const data: StatusStat[] = [
      { status: "pending", label: "Pending", count: 2, color: "#eab308" },
    ];

    const { container } = render(
      <StatusDonutChart data={data} total={2} />,
    );

    // Background circle + 1 data segment
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2);
  });
});
