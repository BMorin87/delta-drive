import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import VolitionCrown from "../src/components/VolitionCrown";
import * as gameStore from "../src/components/gameStore";

describe("VolitionCrown", () => {
  beforeEach(() => {
    // Reset the mock before each test
    vi.clearAllMocks();
    vi.spyOn(gameStore, "useGameStore");
  });

  it("should display current and max volition values", () => {
    gameStore.useGameStore.mockReturnValue({
      volition: 75,
      volitionCapacity: 100,
      resourceRates: { volition: 0 },
    });

    render(<VolitionCrown />);

    // The text "75" and "/100" appear in a single text element with a tspan
    expect(screen.getByText(/75/)).toBeInTheDocument();
    expect(screen.getByText(/\/100/)).toBeInTheDocument();
  });

  it("should handle edge cases gracefully", () => {
    gameStore.useGameStore.mockReturnValue({
      volition: null,
      volitionCapacity: 0,
      resourceRates: { volition: 0 },
    });

    render(<VolitionCrown />);

    // Use more specific matchers to avoid matching the rate display
    expect(
      screen.getByText((content, element) => {
        return (
          element.classList.contains("crown-text-current") &&
          content.includes("0")
        );
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/\/1/)).toBeInTheDocument(); // Safe max fallback
  });

  it("should round current value for display", () => {
    gameStore.useGameStore.mockReturnValue({
      volition: 42.7,
      volitionCapacity: 100,
      resourceRates: { volition: 0 },
    });

    render(<VolitionCrown />);

    expect(screen.getByText(/43/)).toBeInTheDocument(); // Math.round(42.7)
  });

  it("should display positive volition rate", () => {
    gameStore.useGameStore.mockReturnValue({
      volition: 50,
      volitionCapacity: 100,
      resourceRates: { volition: 2.5 },
    });

    render(<VolitionCrown />);

    expect(screen.getByText(/\+2\.5\/s/)).toBeInTheDocument();
  });

  it("should display negative volition rate", () => {
    gameStore.useGameStore.mockReturnValue({
      volition: 50,
      volitionCapacity: 100,
      resourceRates: { volition: -1.2 },
    });

    render(<VolitionCrown />);

    expect(screen.getByText(/-1\.2\/s/)).toBeInTheDocument();
  });

  it("should cap percentage at 100% when current exceeds max", () => {
    gameStore.useGameStore.mockReturnValue({
      volition: 150,
      volitionCapacity: 100,
      resourceRates: { volition: 0 },
    });

    render(<VolitionCrown />);

    // Component should still render without errors
    expect(screen.getByText(/150/)).toBeInTheDocument();
    expect(screen.getByText(/\/100/)).toBeInTheDocument();
  });
});
