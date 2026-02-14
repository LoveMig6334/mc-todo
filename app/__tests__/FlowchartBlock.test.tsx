import FlowchartBlock from "@/app/components/playground/FlowchartBlock";
import {
  FlowchartBlockData,
  FlowchartNode,
} from "@/app/types/playground";
import { fireEvent, render, screen } from "@testing-library/react";

const makeNode = (
  overrides: Partial<FlowchartNode> = {},
): FlowchartNode => ({
  id: "node-1",
  label: "Start",
  shape: "rectangle",
  position: { x: 50, y: 50 },
  size: { width: 120, height: 50 },
  ...overrides,
});

const defaultData: FlowchartBlockData = {
  title: "My Flow",
  nodes: [],
  edges: [],
  color: "#27272a",
};

const blockSize = { width: 400, height: 300 };

describe("FlowchartBlock", () => {
  it("renders title input", () => {
    render(
      <FlowchartBlock
        data={defaultData}
        isSelected={false}
        onUpdate={jest.fn()}
        blockSize={blockSize}
      />,
    );

    expect(screen.getByDisplayValue("My Flow")).toBeInTheDocument();
  });

  it("calls onUpdate when title changes", () => {
    const onUpdate = jest.fn();
    render(
      <FlowchartBlock
        data={defaultData}
        isSelected={false}
        onUpdate={onUpdate}
        blockSize={blockSize}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("My Flow"), {
      target: { value: "New Title" },
    });
    expect(onUpdate).toHaveBeenCalledWith({ title: "New Title" });
  });

  it("shows shape toolbar when selected", () => {
    render(
      <FlowchartBlock
        data={defaultData}
        isSelected={true}
        onUpdate={jest.fn()}
        blockSize={blockSize}
      />,
    );

    expect(screen.getByTestId("shape-toolbar")).toBeInTheDocument();
    expect(screen.getByTitle("Add rectangle")).toBeInTheDocument();
    expect(screen.getByTitle("Add diamond")).toBeInTheDocument();
    expect(screen.getByTitle("Add circle")).toBeInTheDocument();
  });

  it("hides shape toolbar when not selected", () => {
    render(
      <FlowchartBlock
        data={defaultData}
        isSelected={false}
        onUpdate={jest.fn()}
        blockSize={blockSize}
      />,
    );

    expect(screen.queryByTestId("shape-toolbar")).not.toBeInTheDocument();
  });

  it("adds a rectangle node when button clicked", () => {
    const onUpdate = jest.fn();
    render(
      <FlowchartBlock
        data={defaultData}
        isSelected={true}
        onUpdate={onUpdate}
        blockSize={blockSize}
      />,
    );

    fireEvent.click(screen.getByTitle("Add rectangle"));
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        nodes: [
          expect.objectContaining({
            shape: "rectangle",
            label: "Label",
          }),
        ],
      }),
    );
  });

  it("adds a diamond node when button clicked", () => {
    const onUpdate = jest.fn();
    render(
      <FlowchartBlock
        data={defaultData}
        isSelected={true}
        onUpdate={onUpdate}
        blockSize={blockSize}
      />,
    );

    fireEvent.click(screen.getByTitle("Add diamond"));
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        nodes: [
          expect.objectContaining({
            shape: "diamond",
            label: "?",
          }),
        ],
      }),
    );
  });

  it("adds a circle node when button clicked", () => {
    const onUpdate = jest.fn();
    render(
      <FlowchartBlock
        data={defaultData}
        isSelected={true}
        onUpdate={onUpdate}
        blockSize={blockSize}
      />,
    );

    fireEvent.click(screen.getByTitle("Add circle"));
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        nodes: [
          expect.objectContaining({
            shape: "circle",
            label: "Label",
          }),
        ],
      }),
    );
  });

  it("renders existing nodes", () => {
    const dataWithNodes: FlowchartBlockData = {
      ...defaultData,
      nodes: [
        makeNode({ id: "n1", label: "Start", shape: "rectangle" }),
        makeNode({ id: "n2", label: "Check?", shape: "diamond", position: { x: 200, y: 50 } }),
      ],
    };

    render(
      <FlowchartBlock
        data={dataWithNodes}
        isSelected={false}
        onUpdate={jest.fn()}
        blockSize={blockSize}
      />,
    );

    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("Check?")).toBeInTheDocument();
    expect(screen.getByTestId("flowchart-node-rectangle")).toBeInTheDocument();
    expect(screen.getByTestId("flowchart-node-diamond")).toBeInTheDocument();
  });

  it("renders edges between nodes", () => {
    const dataWithEdge: FlowchartBlockData = {
      ...defaultData,
      nodes: [
        makeNode({ id: "n1", label: "A" }),
        makeNode({
          id: "n2",
          label: "B",
          position: { x: 200, y: 50 },
        }),
      ],
      edges: [
        {
          id: "e1",
          sourceNodeId: "n1",
          targetNodeId: "n2",
          label: "Yes",
        },
      ],
    };

    render(
      <FlowchartBlock
        data={dataWithEdge}
        isSelected={false}
        onUpdate={jest.fn()}
        blockSize={blockSize}
      />,
    );

    // Edge label should render
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("shows color picker when selected", () => {
    render(
      <FlowchartBlock
        data={defaultData}
        isSelected={true}
        onUpdate={jest.fn()}
        blockSize={blockSize}
      />,
    );

    expect(screen.getByTitle("Zinc")).toBeInTheDocument();
    expect(screen.getByTitle("Blue")).toBeInTheDocument();
    expect(screen.getByTitle("Purple")).toBeInTheDocument();
  });

  it("hides color picker when not selected", () => {
    render(
      <FlowchartBlock
        data={defaultData}
        isSelected={false}
        onUpdate={jest.fn()}
        blockSize={blockSize}
      />,
    );

    expect(screen.queryByTitle("Zinc")).not.toBeInTheDocument();
  });

  it("calls onUpdate with new color", () => {
    const onUpdate = jest.fn();
    render(
      <FlowchartBlock
        data={defaultData}
        isSelected={true}
        onUpdate={onUpdate}
        blockSize={blockSize}
      />,
    );

    fireEvent.click(screen.getByTitle("Blue"));
    expect(onUpdate).toHaveBeenCalledWith({ color: "#1e3a5f" });
  });

  it("renders canvas area", () => {
    render(
      <FlowchartBlock
        data={defaultData}
        isSelected={false}
        onUpdate={jest.fn()}
        blockSize={blockSize}
      />,
    );

    expect(screen.getByTestId("flowchart-canvas")).toBeInTheDocument();
  });
});
