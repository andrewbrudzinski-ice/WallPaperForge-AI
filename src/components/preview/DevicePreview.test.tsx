import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DevicePreview } from "./DevicePreview";
import { getDeviceById, DEVICES } from "@/lib/devices/devices";

const device = getDeviceById("iphone-16-pro") ?? DEVICES[0];

describe("DevicePreview", () => {
  it("renders the wallpaper image when a url is provided", () => {
    render(<DevicePreview device={device} imageUrl="data:image/svg+xml;base64,AA" mode="full" />);
    const img = screen.getByAltText("Wallpaper preview") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("data:image/svg+xml");
  });

  it("renders the frame at the device aspect ratio", () => {
    const { container } = render(<DevicePreview device={device} imageUrl={null} />);
    const frame = container.firstChild as HTMLElement;
    expect(frame.style.aspectRatio).toBe(`${device.width} / ${device.height}`);
  });

  it("shows the safe-zone overlay labels when enabled", () => {
    render(<DevicePreview device={device} imageUrl={null} showZones />);
    expect(screen.getByText("focal safe zone")).toBeInTheDocument();
    expect(screen.getByText("clock")).toBeInTheDocument();
  });
});
