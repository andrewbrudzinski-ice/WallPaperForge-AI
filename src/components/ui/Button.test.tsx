import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Generate</Button>);
    expect(screen.getByRole("button", { name: "Generate" })).toBeInTheDocument();
  });

  it("fires onClick when enabled", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies size and variant classes", () => {
    render(
      <Button size="lg" variant="secondary">
        X
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/h-14/); // lg
    expect(btn.className).toMatch(/border-white/); // secondary
  });
});
