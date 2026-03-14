
const HOW_IT_WORKS = [
  { step: 1, title: "Book", desc: "Select service & schedule" },
  { step: 2, title: "Confirm", desc: "Get instant confirmation" },
  { step: 3, title: "Professional", desc: "Certified expert arrives" },
  { step: 4, title: "Enjoy", desc: "Quality service guaranteed" },
];

interface HowItWorksProps {
  isMobile: boolean;
}

export function HowItWorks({ isMobile }: HowItWorksProps) {
  return (
    <section style={{ padding: isMobile ? "24px 0" : "60px 0" }}>
      <div className="ss-section">
        <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color: "#111827", marginBottom: 20 }}>How It Works</h2>
        <div className="ss-grid-4">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 16, padding: "24px 18px", textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#F97316", color: "#fff", fontWeight: 800, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>{step}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}