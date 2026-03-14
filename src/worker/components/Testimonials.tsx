import React from "react";

export const MOCK_REVIEWS = [
  { name: "Priya Sharma", rating: 5, text: "Amazing service! The cleaner was professional and thorough. Highly recommend!", avatar: "P", bg: "#F97316" },
  { name: "Rahul Verma", rating: 5, text: "Booked a plumber for an emergency. Arrived on time and fixed everything quickly.", avatar: "R", bg: "#8B5CF6" },
  { name: "Anjali Patel", rating: 4, text: "Great experience with the salon service. Will definitely book again.", avatar: "A", bg: "#16a34a" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 10, color: i <= rating ? "#F97316" : "#E5E7EB" }}>★</span>
      ))}
      <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 4 }}>{rating}</span>
    </div>
  );
}

interface TestimonialsProps {
  isMobile: boolean;
  siteReviews: typeof MOCK_REVIEWS;
}

export function Testimonials({ isMobile, siteReviews }: TestimonialsProps) {
  return (
    <section style={{ padding: isMobile ? "24px 0" : "60px 0", background: "#FAFAFA" }}>
      <div className="ss-section">
        <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Trusted by 1M+ Customers</h2>
        <div className="ss-grid-3">
          {siteReviews.map(({ name, rating, text, avatar, bg }) => (
            <div key={name} style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #F3F4F6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15 }}>{avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{name}</div>
                  <Stars rating={rating} />
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.6, margin: 0 }}>"{text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}