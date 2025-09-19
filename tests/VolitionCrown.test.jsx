import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import VolitionCrown from "../src/components/VolitionCrown";

describe("VolitionCrown", () => {
  it("should display current and max volition values", () => {
    render(<VolitionCrown current={75} max={100} />);

    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("/100")).toBeInTheDocument();
  });

  it("should handle edge cases gracefully", () => {
    render(<VolitionCrown current={null} max={0} />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("/1")).toBeInTheDocument(); // Safe max fallback
  });

  it("should round current value for display", () => {
    render(<VolitionCrown current={42.7} max={100} />);

    expect(screen.getByText("43")).toBeInTheDocument(); // Math.round(42.7)
  });
});
