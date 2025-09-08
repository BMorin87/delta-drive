import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import VerticalProgressBar from "../src/components/physiological/VerticalProgressBar";

describe("VerticalProgressBar", () => {
  const defaultProps = {
    current: 50,
    max: 100,
    label: "Test Bar",
    colorClass: "test-color",
  };

  it("should display label and values correctly", () => {
    render(<VerticalProgressBar {...defaultProps} />);

    expect(screen.getByText("Test Bar")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("/100")).toBeInTheDocument();
  });

  it("should calculate percentage correctly", () => {
    render(
      <VerticalProgressBar
        current={25}
        max={100}
        label="Test"
        colorClass="test"
      />
    );

    expect(screen.getByText("25.0% full")).toBeInTheDocument();
  });

  it("should cap percentage at 100%", () => {
    render(
      <VerticalProgressBar
        current={150}
        max={100}
        label="Test"
        colorClass="test"
      />
    );

    expect(screen.getByText("100.0% full")).toBeInTheDocument();
  });

  it("should use custom height when provided", () => {
    render(<VerticalProgressBar {...defaultProps} height={300} />);

    const wrapper = screen
      .getByText("Test Bar")
      .parentElement.querySelector(".progress-bar-wrapper");
    expect(wrapper).toHaveStyle("height: 300px");
  });

  it("should use default height when not provided", () => {
    render(<VerticalProgressBar {...defaultProps} />);

    const wrapper = screen
      .getByText("Test Bar")
      .parentElement.querySelector(".progress-bar-wrapper");
    expect(wrapper).toHaveStyle("height: 200px");
  });
});
