// ─── ReviewsPage.tsx ──────────────────────────────────────────────────────────
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { api, type ProviderProfile } from "./dashboardTypes";
import { Spinner, useIsMobile } from "./dashboardShared";

// ── Inline Review type (avoids dependency on dashboardTypes export) ────────────
interface Review {
  id:            string | number;
  rating:        number;
  comment:       string | null;
  reviewer_name: string;
  service_name?: string | null;
  created_at:    string;
}

// ── Star renderer ─────────────────────────────────────────────────────────────
const Stars = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24"
        fill={i <= Math.round(rating) ? "#F97316" : "#E5E7EB"}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

// ── Rating bar ────────────────────────────────────────────────────────────────
const RatingBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: "#6B7280", width: 14, textAlign: "right" as const }}>{star}</span>
      <svg width={12} height={12} viewBox="0 0 24 24" fill="#F97316">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <div style={{ flex: 1, height: 8, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: "linear-gradient(90deg, #F97316, #fb923c)",
          borderRadius: 4, transition: "width 0.6s ease",
        }} />
      </div>
      <span style={{ fontSize: 12, color: "#9CA3AF", width: 24, textAlign: "right" as const }}>{count}</span>
    </div>
  );
};

// ── Avatar ────────────────────────────────────────────────────────────────────
const ReviewAvatar = ({ name }: { name: string }) => {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const colors   = ["#F97316", "#3B82F6", "#8B5CF6", "#10B981", "#EC4899", "#F59E0B"];
  const color    = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      background: color, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14, fontWeight: 700, flexShrink: 0,
    }}>{initials}</div>
  );
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// ─────────────────────────────────────────────────────────────────────────────
const ReviewsPage = ({
  token,
  profile,
  onProfileUpdate,
}: {
  token:            string;
  profile:          ProviderProfile | null;
  onProfileUpdate?: Dispatch<SetStateAction<ProviderProfile | null>>;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [filter,  setFilter]  = useState<number | null>(null);
  const [sort,    setSort]    = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const isMobile = useIsMobile();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api<Review[]>("/reviews/provider-dashboard", token);
        setReviews(Array.isArray(data) ? data : []);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const total     = reviews.length;
  const avgRating = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const starCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
  }));

  const filtered = reviews
    .filter(r => filter === null || Math.round(r.rating) === filter)
    .sort((a, b) => {
      if (sort === "newest")  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "oldest")  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "highest") return b.rating - a.rating;
      return a.rating - b.rating;
    });

  const C: React.CSSProperties = {
    background: "#fff", borderRadius: 14, border: "1px solid #F3F4F6",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: isMobile ? 16 : 20,
  };

  if (loading) return (
    <div className="ds-page" style={{ maxWidth: 860 }}>
      <div className="ds-page-header">
        <div><h1>⭐ My Reviews</h1><p>Loading your customer reviews...</p></div>
      </div>
      <Spinner />
    </div>
  );

  if (error) return (
    <div className="ds-page" style={{ maxWidth: 860 }}>
      <div style={{ ...C, textAlign: "center", padding: 40, color: "#EF4444", fontSize: 14 }}>
        ⚠️ Failed to load reviews: {error}
      </div>
    </div>
  );

  return (
    <div className="ds-page" style={{ maxWidth: 860 }}>

      {/* Header */}
      <div className="ds-page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#111827" }}>
            ⭐ My Reviews
          </h1>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 2 }}>
            {total > 0
              ? `${total} review${total !== 1 ? "s" : ""} from your customers`
              : "Reviews from your customers will appear here"}
          </p>
        </div>
      </div>

      {/* Summary card */}
      <div style={{
        ...C,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: 24, marginBottom: 16,
        alignItems: isMobile ? "stretch" : "center",
      }}>
        <div style={{ textAlign: "center", minWidth: 120 }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: "#111827", lineHeight: 1, fontFamily: "monospace" }}>
            {total > 0 ? avgRating.toFixed(1) : "—"}
          </div>
          <div style={{ marginTop: 6 }}>
            <Stars rating={avgRating} size={18} />
          </div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
            {total} review{total !== 1 ? "s" : ""}
          </div>
        </div>

        {!isMobile && <div style={{ width: 1, background: "#F3F4F6", alignSelf: "stretch" }} />}

        <div style={{ flex: 1 }}>
          {starCounts.map(({ star, count }) => (
            <RatingBar key={star} star={star} count={count} total={total} />
          ))}
        </div>

        {!isMobile && <div style={{ width: 1, background: "#F3F4F6", alignSelf: "stretch" }} />}

        <div style={{
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          gap: 12, justifyContent: "center",
        }}>
          {[
            { label: "5★ Reviews", value: starCounts[0].count,                                                color: "#22c55e" },
            { label: "Avg Rating", value: (profile?.avg_rating ?? avgRating).toFixed(1),                     color: "#F97316" },
            { label: "Total Jobs", value: profile?.total_jobs ?? total,                                       color: "#3B82F6" },
            { label: "Response",   value: total > 0 ? `${Math.round((starCounts[0].count + starCounts[1].count) / total * 100)}%` : "—", color: "#8B5CF6" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              textAlign: "center", padding: "10px 16px",
              background: "#F9FAFB", borderRadius: 10,
              border: "1px solid #F3F4F6",
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter + Sort bar */}
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 16, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, flex: 1 }}>
          {[null, 5, 4, 3, 2, 1].map(star => (
            <button key={star ?? "all"} onClick={() => setFilter(star)} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: "1.5px solid",
              borderColor: filter === star ? "#F97316" : "#E5E7EB",
              background:  filter === star ? "#FFF7ED" : "#fff",
              color:       filter === star ? "#F97316" : "#6B7280",
              cursor: "pointer", transition: "all 0.15s",
            }}>
              {star === null ? "All" : `${star}★`}
              {star !== null && (
                <span style={{ marginLeft: 4, color: "#9CA3AF" }}>
                  ({starCounts.find(s => s.star === star)?.count ?? 0})
                </span>
              )}
            </button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} style={{
          border: "1.5px solid #E5E7EB", borderRadius: 10,
          padding: "6px 12px", fontSize: 12, color: "#374151",
          background: "#fff", outline: "none", cursor: "pointer",
        }}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest">Highest rated</option>
          <option value="lowest">Lowest rated</option>
        </select>
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <div style={{ ...C, textAlign: "center", padding: 48, color: "#9CA3AF", fontSize: 14 }}>
          {total === 0 ? (
            <div>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 6 }}>No reviews yet</div>
              <p style={{ fontSize: 13, maxWidth: 280, margin: "0 auto" }}>
                Complete jobs and ask customers to leave a review — they'll appear here!
              </p>
            </div>
          ) : "No reviews match this filter."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((review, idx) => (
            <div key={review.id} style={{
              ...C,
              animation: "fadeUp 0.3s ease both",
              animationDelay: `${idx * 0.04}s`,
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <ReviewAvatar name={review.reviewer_name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", flexWrap: "wrap" as const,
                    gap: 6, marginBottom: 6,
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
                        {review.reviewer_name}
                      </div>
                      <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        {review.service_name && (
                          <>
                            <span style={{
                              background: "#FFF7ED", color: "#F97316",
                              border: "1px solid #FED7AA",
                              borderRadius: 6, padding: "1px 7px",
                              fontSize: 11, fontWeight: 600,
                            }}>
                              {review.service_name}
                            </span>
                            <span>·</span>
                          </>
                        )}
                        <span>{fmtDate(review.created_at)}</span>
                      </div>
                    </div>

                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: review.rating >= 4 ? "#F0FDF4" : review.rating >= 3 ? "#FFFBEB" : "#FEF2F2",
                      border: `1px solid ${review.rating >= 4 ? "#BBF7D0" : review.rating >= 3 ? "#FDE68A" : "#FECACA"}`,
                      borderRadius: 8, padding: "4px 10px",
                    }}>
                      <Stars rating={review.rating} size={12} />
                      <span style={{
                        fontSize: 13, fontWeight: 700, fontFamily: "monospace",
                        color: review.rating >= 4 ? "#16A34A" : review.rating >= 3 ? "#D97706" : "#DC2626",
                      }}>
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {review.comment ? (
                    <p style={{
                      fontSize: 13, color: "#4B5563", lineHeight: 1.6,
                      margin: 0, padding: "10px 14px",
                      background: "#F9FAFB", borderRadius: 10,
                      borderLeft: "3px solid #F97316",
                    }}>
                      "{review.comment}"
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, color: "#D1D5DB", fontStyle: "italic", margin: 0 }}>
                      No written comment
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ReviewsPage;
