import {
  InlineDateCell,
  InlineLinkCell,
  InlineNumberCell,
  InlineSelectCell,
  InlineTextCell,
} from "@/app/components/task/InlineEditableCell";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// --- InlineTextCell ---

describe("InlineTextCell", () => {
  it("renders display value", () => {
    render(<InlineTextCell value="Hello" onSave={jest.fn()} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("shows placeholder when value is empty", () => {
    render(
      <InlineTextCell value="" onSave={jest.fn()} placeholder="Empty" />,
    );
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("enters edit mode on double-click", async () => {
    render(<InlineTextCell value="Hello" onSave={jest.fn()} />);
    await userEvent.dblClick(screen.getByText("Hello"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("Hello");
  });

  it("saves on Enter", async () => {
    const onSave = jest.fn();
    render(<InlineTextCell value="Hello" onSave={onSave} />);

    await userEvent.dblClick(screen.getByText("Hello"));
    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "Updated{Enter}");

    expect(onSave).toHaveBeenCalledWith("Updated");
  });

  it("saves on blur", async () => {
    const onSave = jest.fn();
    render(<InlineTextCell value="Hello" onSave={onSave} />);

    await userEvent.dblClick(screen.getByText("Hello"));
    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "Blurred");
    fireEvent.blur(input);

    expect(onSave).toHaveBeenCalledWith("Blurred");
  });

  it("cancels on Escape without saving", async () => {
    const onSave = jest.fn();
    render(<InlineTextCell value="Hello" onSave={onSave} />);

    await userEvent.dblClick(screen.getByText("Hello"));
    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "Changed{Escape}");

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("does not save when value is unchanged", async () => {
    const onSave = jest.fn();
    render(<InlineTextCell value="Hello" onSave={onSave} />);

    await userEvent.dblClick(screen.getByText("Hello"));
    fireEvent.blur(screen.getByRole("textbox"));

    expect(onSave).not.toHaveBeenCalled();
  });
});

// --- InlineSelectCell ---

describe("InlineSelectCell", () => {
  const options = [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
    { value: "c", label: "Option C" },
  ];

  it("renders display content", () => {
    render(
      <InlineSelectCell
        value="a"
        options={options}
        onSave={jest.fn()}
        renderDisplay={(val) => <span>Selected: {val}</span>}
      />,
    );
    expect(screen.getByText("Selected: a")).toBeInTheDocument();
  });

  it("shows select dropdown on double-click", async () => {
    render(
      <InlineSelectCell
        value="a"
        options={options}
        onSave={jest.fn()}
        renderDisplay={(val) => <span>{val}</span>}
      />,
    );

    await userEvent.dblClick(screen.getByText("a"));
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("saves when a new option is selected", async () => {
    const onSave = jest.fn();
    render(
      <InlineSelectCell
        value="a"
        options={options}
        onSave={onSave}
        renderDisplay={(val) => <span>{val}</span>}
      />,
    );

    await userEvent.dblClick(screen.getByText("a"));
    await userEvent.selectOptions(screen.getByRole("combobox"), "b");

    expect(onSave).toHaveBeenCalledWith("b");
  });

  it("does not save when same option is selected", async () => {
    const onSave = jest.fn();
    render(
      <InlineSelectCell
        value="a"
        options={options}
        onSave={onSave}
        renderDisplay={(val) => <span>{val}</span>}
      />,
    );

    await userEvent.dblClick(screen.getByText("a"));
    await userEvent.selectOptions(screen.getByRole("combobox"), "a");

    expect(onSave).not.toHaveBeenCalled();
  });
});

// --- InlineNumberCell ---

describe("InlineNumberCell", () => {
  it("renders display content", () => {
    render(
      <InlineNumberCell
        value={5}
        onSave={jest.fn()}
        renderDisplay={(val) => <span>P{val}</span>}
      />,
    );
    expect(screen.getByText("P5")).toBeInTheDocument();
  });

  it("enters edit mode on double-click", async () => {
    render(
      <InlineNumberCell
        value={5}
        onSave={jest.fn()}
        renderDisplay={(val) => <span>{val}</span>}
      />,
    );

    await userEvent.dblClick(screen.getByText("5"));
    expect(screen.getByRole("spinbutton")).toHaveValue(5);
  });

  it("saves a valid number on Enter", async () => {
    const onSave = jest.fn();
    render(
      <InlineNumberCell
        value={5}
        min={0}
        max={10}
        onSave={onSave}
        renderDisplay={(val) => <span>{val}</span>}
      />,
    );

    await userEvent.dblClick(screen.getByText("5"));
    const input = screen.getByRole("spinbutton");
    await userEvent.clear(input);
    await userEvent.type(input, "8{Enter}");

    expect(onSave).toHaveBeenCalledWith(8);
  });

  it("rejects out-of-range values", async () => {
    const onSave = jest.fn();
    render(
      <InlineNumberCell
        value={5}
        min={0}
        max={10}
        onSave={onSave}
        renderDisplay={(val) => <span>{val}</span>}
      />,
    );

    await userEvent.dblClick(screen.getByText("5"));
    const input = screen.getByRole("spinbutton");
    await userEvent.clear(input);
    await userEvent.type(input, "15{Enter}");

    expect(onSave).not.toHaveBeenCalled();
  });

  it("cancels on Escape", async () => {
    const onSave = jest.fn();
    render(
      <InlineNumberCell
        value={5}
        onSave={onSave}
        renderDisplay={(val) => <span>{val}</span>}
      />,
    );

    await userEvent.dblClick(screen.getByText("5"));
    const input = screen.getByRole("spinbutton");
    await userEvent.clear(input);
    await userEvent.type(input, "9{Escape}");

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});

// --- InlineDateCell ---

describe("InlineDateCell", () => {
  it("renders display content", () => {
    render(
      <InlineDateCell
        value="2026-02-07"
        onSave={jest.fn()}
        renderDisplay={() => <span>Feb 7, 2026</span>}
      />,
    );
    expect(screen.getByText("Feb 7, 2026")).toBeInTheDocument();
  });

  it("enters edit mode on double-click", async () => {
    render(
      <InlineDateCell
        value="2026-02-07"
        onSave={jest.fn()}
        renderDisplay={() => <span>Feb 7</span>}
      />,
    );

    await userEvent.dblClick(screen.getByText("Feb 7"));
    expect(screen.getByDisplayValue("2026-02-07")).toBeInTheDocument();
  });

  it("saves on date change", async () => {
    const onSave = jest.fn();
    render(
      <InlineDateCell
        value="2026-02-07"
        onSave={onSave}
        renderDisplay={() => <span>Feb 7</span>}
      />,
    );

    await userEvent.dblClick(screen.getByText("Feb 7"));
    fireEvent.change(screen.getByDisplayValue("2026-02-07"), {
      target: { value: "2026-03-15" },
    });

    expect(onSave).toHaveBeenCalledWith("2026-03-15");
  });
});

// --- InlineLinkCell ---

describe("InlineLinkCell", () => {
  it("renders display content", () => {
    render(
      <InlineLinkCell
        value="https://example.com"
        onSave={jest.fn()}
        renderDisplay={() => <span>Link</span>}
      />,
    );
    expect(screen.getByText("Link")).toBeInTheDocument();
  });

  it("enters edit mode on double-click", async () => {
    render(
      <InlineLinkCell
        value="https://example.com"
        onSave={jest.fn()}
        renderDisplay={() => <span>Link</span>}
      />,
    );

    await userEvent.dblClick(screen.getByText("Link"));
    expect(screen.getByDisplayValue("https://example.com")).toBeInTheDocument();
  });

  it("saves updated URL on Enter", async () => {
    const onSave = jest.fn();
    render(
      <InlineLinkCell
        value="https://old.com"
        onSave={onSave}
        renderDisplay={() => <span>Link</span>}
      />,
    );

    await userEvent.dblClick(screen.getByText("Link"));
    const input = screen.getByDisplayValue("https://old.com");
    await userEvent.clear(input);
    await userEvent.type(input, "https://new.com{Enter}");

    expect(onSave).toHaveBeenCalledWith("https://new.com");
  });

  it("cancels on Escape", async () => {
    const onSave = jest.fn();
    render(
      <InlineLinkCell
        value="https://old.com"
        onSave={onSave}
        renderDisplay={() => <span>Link</span>}
      />,
    );

    await userEvent.dblClick(screen.getByText("Link"));
    const input = screen.getByDisplayValue("https://old.com");
    await userEvent.clear(input);
    await userEvent.type(input, "https://changed.com{Escape}");

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("Link")).toBeInTheDocument();
  });
});
