import { createFileRoute } from "@tanstack/react-router";
import { ReceiptPrinter } from "@/components/receipt-printer";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Himalayan Sync Treks — Booking Confirmation" },
    { name: "description", content: "Prepaid trekking booking confirmation for Himalayan Sync Treks across Nepal, India, Bhutan, and Tibet." },
    { property: "og:title", content: "Himalayan Sync Treks — Booking Confirmation" },
    { property: "og:description", content: "Print and download your Himalayan Sync Treks booking confirmation with traveler, group, departure, and guide details." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Index() {
  return <ReceiptPrinter />;
}
