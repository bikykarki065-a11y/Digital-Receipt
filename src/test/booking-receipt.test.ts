import { describe, expect, it } from "vitest";
import { booking, defaultReceipt, receiptTotal } from "@/lib/receipt";

describe("Trekking booking confirmation", () => {
  it("uses the agency branding and zero-priced prepaid package", () => {
    expect(defaultReceipt.brand).toBe("Himalayan Sync Treks");
    expect(defaultReceipt.tagline).toBe("Nepal | India | Bhutan | Tibet");
    expect(defaultReceipt.items).toEqual([{ id: 1, qty: 1, desc: "Everest Base Camp Trekking Package", price: 0 }]);
    expect(receiptTotal(defaultReceipt)).toBe(0);
  });

  it("shares all travel metadata and the exact intro with PDF export", () => {
    expect(booking.intro).toBe("EXPLORE • EXPERIENCE • CONNECT");
    expect(booking.metadata.map(([label]) => label)).toEqual([
      "BOOKING", "TRAVELER NAME", "GROUP SIZE (PAX)", "DEPARTURE DATE", "GUIDE / AGENT", "STATUS",
    ]);
    expect(booking.metadata.at(-1)?.[1]).toBe("PRE-PAID");
  });
});