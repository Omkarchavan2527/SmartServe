
const FOOTER_LINKS = {
  Services: ["Cleaning Services","Beauty Services","Spa Services","Repair Services","Pest Control"],
  Company:  ["About Us","Careers","Blog","Press","Contact"],
  Support:  ["Help Center","Safety Tips","Cancellation Policy","Privacy Policy","Terms of Service"],
};

interface FooterProps {
  isMobile: boolean;
}

export function Footer({ isMobile }: FooterProps) {
  return (
    <footer style={{ background: "#1A1A2E", padding: isMobile ? "32px 0 24px" : "56px 40px 32px", color: "#9CA3AF" }}>
      <div className="ss-section" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="ss-footer-grid">
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#F97316", marginBottom: 12 }}>SmartServe</div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#6B7280", maxWidth: 220 }}>Professional home services at your fingertips. Quality guaranteed.</p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 14 }}>{heading}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {links.map(link => (
                  <a key={link} href="#" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#F97316")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}
                  >{link}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 48, paddingTop: 24, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>© 2026 SmartServe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}