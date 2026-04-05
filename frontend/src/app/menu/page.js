"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Layout from "@/components/layout";
import { getToken, getUser } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
const CANTEEN_KEY = "selectedCanteen";

const EMPTY_FORM = { name: "", price: "", category: "veg", image: "", description: "", availableAt: { MAIN: true, SCAS: true } };

// ── Inner component (uses useSearchParams — needs Suspense parent) ──────────────
function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [category,   setCategory]   = useState(initialCategory);
  const [search,     setSearch]     = useState("");
  const [menuData,   setMenuData]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [addedId,    setAddedId]    = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [canteen,     setCanteen]     = useState(null); // "MAIN" | "SCAS"

  // ── Staff: modal state ───────────────────────────────────────────────────
  const [modal,      setModal]      = useState(null);   // null | "add" | "edit"
  const [editTarget, setEditTarget] = useState(null);   // item being edited
  const [formData,   setFormData]   = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState("");

  const mountedRef   = useRef(true);
  const addedTimer   = useRef(null);

  // Read user + persisted canteen on mount
  useEffect(() => {
    const u = getUser();
    setCurrentUser(u);
    if (!u || u.role !== "staff") {
      const saved = typeof window !== "undefined" ? localStorage.getItem(CANTEEN_KEY) : null;
      setCanteen(saved || null);
    }
  }, []);

  const isStaff = currentUser?.role === "staff";

  // ── Fetch menu ────────────────────────────────────────────────────────────
  const fetchMenu = useCallback(async (signal) => {
    const token = getToken();
    try {
      let url;
      const headers = {};
      if (isStaff) {
        url = `${API_BASE}/api/menu/all`;
        if (token) headers.Authorization = `Bearer ${token}`;
      } else {
        if (!canteen) return;
        url = `${API_BASE}/api/menu?canteen=${canteen}`;
      }

      const res = await fetch(url, { signal, headers });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (mountedRef.current) {
        setMenuData(Array.isArray(data) ? data : []);
        setFetchError(null);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      if (mountedRef.current) setFetchError("Could not load menu. Please refresh.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isStaff, canteen]);

  useEffect(() => {
    mountedRef.current = true;
    if (currentUser === null) return;
    if (!isStaff && !canteen) return;

    setLoading(true);
    const ctrl = new AbortController();
    fetchMenu(ctrl.signal);

    return () => {
      mountedRef.current = false;
      ctrl.abort();
      clearTimeout(addedTimer.current);
    };
  }, [fetchMenu, currentUser, isStaff, canteen]);

  // Persist canteen choice
  function selectCanteen(c) {
    setCanteen(c);
    try { localStorage.setItem(CANTEEN_KEY, c); } catch { /* ignore */ }
  }

  // ── Cart ──────────────────────────────────────────────────────────────────
  function addToCart(item) {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const idx = cart.findIndex((c) => c._id === item._id);
      if (idx >= 0) {
        cart[idx].qty += 1;
      } else {
        cart.push({ _id: item._id, name: item.name, price: item.price, category: item.category, image: item.image || "", qty: 1, canteen });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      setAddedId(item._id);
      clearTimeout(addedTimer.current);
      addedTimer.current = setTimeout(() => { if (mountedRef.current) setAddedId(null); }, 1200);
    } catch { /* localStorage unavailable */ }
  }

  // ── Staff: toggle per-canteen availability ────────────────────────────────
  async function toggleAvailability(item, targetCanteen) {
    const key = `${item._id}-${targetCanteen}`;
    setTogglingId(key);
    try {
      const token = getToken();
      const currentVal = targetCanteen === "ALL" ? item.available : (item.availableAt?.[targetCanteen] ?? true);
      const res = await fetch(`${API_BASE}/api/menu/${item._id}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ canteen: targetCanteen, available: !currentVal }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const updated = await res.json();
      if (mountedRef.current) {
        setMenuData((prev) => prev.map((m) => m._id === updated._id ? updated : m));
      }
    } catch (err) {
      alert(`Toggle failed: ${err.message}`);
    } finally {
      if (mountedRef.current) setTogglingId(null);
    }
  }

  // ── Staff: open add modal ─────────────────────────────────────────────────
  function openAddModal() {
    setFormData(EMPTY_FORM);
    setEditTarget(null);
    setSaveError("");
    setModal("add");
  }

  // ── Staff: open edit modal ────────────────────────────────────────────────
  function openEditModal(item) {
    setFormData({
      name:        item.name,
      price:       String(item.price),
      category:    item.category,
      image:       item.image || "",
      description: item.description || "",
      availableAt: {
        MAIN: item.availableAt?.MAIN ?? true,
        SCAS: item.availableAt?.SCAS ?? true,
      },
    });
    setEditTarget(item);
    setSaveError("");
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditTarget(null);
    setSaveError("");
  }

  // ── Staff: save item (create or update) ───────────────────────────────────
  async function handleSave(e) {
    e.preventDefault();
    setSaveError("");

    const price = parseFloat(formData.price);
    if (!formData.name.trim()) { setSaveError("Name is required."); return; }
    if (isNaN(price) || price < 0) { setSaveError("Enter a valid price."); return; }

    setSaving(true);
    try {
      const token = getToken();
      const isEdit = modal === "edit";
      const url    = isEdit ? `${API_BASE}/api/menu/${editTarget._id}` : `${API_BASE}/api/menu`;
      const method = isEdit ? "PUT" : "POST";

      const body = isEdit
        ? { price, description: formData.description, image: formData.image, name: formData.name, category: formData.category }
        : { name: formData.name.trim(), price, category: formData.category, image: formData.image, description: formData.description, availableAt: formData.availableAt };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Server error ${res.status}`);

      if (mountedRef.current) {
        if (isEdit) {
          setMenuData((prev) => prev.map((m) => m._id === data._id ? data : m));
        } else {
          setMenuData((prev) => [data, ...prev]);
        }
        closeModal();
      }
    } catch (err) {
      if (mountedRef.current) setSaveError(err.message || "Save failed.");
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return menuData.filter((item) => {
      const mapped = item.category === "drinks" ? "snacks" : item.category;
      const catMatch = category === "all" || mapped === category;
      const q = search.toLowerCase();
      const searchMatch = item.name.toLowerCase().includes(q) || (item.description ?? "").toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }, [category, search, menuData]);

  const grouped = useMemo(() => {
    if (category !== "all") return null;
    return {
      veg:    filteredItems.filter((i) => i.category === "veg"),
      nonveg: filteredItems.filter((i) => i.category === "nonveg"),
      snacks: filteredItems.filter((i) => i.category === "snacks" || i.category === "drinks"),
    };
  }, [category, filteredItems]);

  // ── Card renderer ─────────────────────────────────────────────────────────
  const renderCard = useCallback((item) => {
    const masterOff = !item.available;
    const mainOff   = !(item.availableAt?.MAIN ?? true);
    const scasOff   = !(item.availableAt?.SCAS ?? true);

    return (
      <div key={item._id} className="foodCard foodCardPremium"
        style={masterOff ? { opacity: 0.55, filter: "grayscale(40%)" } : undefined}>

        <div className="foodImageWrap">
          {item.image ? (
            <Image src={item.image} alt={item.name} width={600} height={400} className="foodThumb foodThumbPremium" />
          ) : (
            <div style={{ width: "100%", height: 200, background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🍽️</div>
          )}
          <div className="foodOverlayTag">
            {item.category === "veg" ? "Veg" : item.category === "nonveg" ? "Non-Veg" : "Snacks & Drinks"}
          </div>
          {isStaff && (
            <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
              {masterOff && <StatusPill bg="#dc2626">All Off</StatusPill>}
              {!masterOff && mainOff && <StatusPill bg="#d97706">MAIN Off</StatusPill>}
              {!masterOff && scasOff && <StatusPill bg="#d97706">SCAS Off</StatusPill>}
            </div>
          )}
        </div>

        <div className="foodBody foodBodyPremium">
          <div className="foodHeaderRow">
            <h3 className="foodName">{item.name}</h3>
            <div className="foodPrice">₹{item.price}</div>
          </div>
          <p className="foodDesc">{item.description || "Freshly prepared canteen favourite."}</p>

          <div className="foodFooterRow">
            {isStaff ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                {/* Availability toggles */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <ToggleBtn label="MAIN" on={!masterOff && !mainOff} loading={togglingId === `${item._id}-MAIN`} onClick={() => toggleAvailability(item, "MAIN")} />
                  <ToggleBtn label="SCAS" on={!masterOff && !scasOff} loading={togglingId === `${item._id}-SCAS`} onClick={() => toggleAvailability(item, "SCAS")} />
                  <ToggleBtn label="ALL"  on={!masterOff}             loading={togglingId === `${item._id}-ALL`}  onClick={() => toggleAvailability(item, "ALL")} />
                </div>
                {/* Edit button */}
                <button
                  onClick={() => openEditModal(item)}
                  style={{
                    padding: "7px 14px", borderRadius: 10, fontWeight: 800, fontSize: 12,
                    cursor: "pointer", border: "1.5px solid rgba(70,45,20,0.15)",
                    background: "rgba(255,255,255,0.9)", color: "var(--text)",
                    transition: "all 0.15s", alignSelf: "flex-start",
                  }}
                >
                  ✏️ Edit Item
                </button>
              </div>
            ) : (
              <>
                <div className="foodMetaSub">
                  {item.available ? "Freshly available" : "Not available today"}
                </div>
                <button
                  className="buyBtn"
                  onClick={() => addToCart(item)}
                  disabled={!item.available}
                  style={{
                    background: addedId === item._id ? "#16a34a" : !item.available ? "#9ca3af" : undefined,
                    cursor: !item.available ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  {addedId === item._id ? "Added!" : "Add"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStaff, togglingId, addedId, canteen]);

  // ── Canteen picker (students only, before selection) ──────────────────────
  if (!isStaff && !canteen && currentUser !== null) {
    return (
      <Layout>
        <div className="menuHero">
          <div className="menuKicker">Campus menu</div>
          <h1 className="sectionHeading">Choose your canteen</h1>
          <p className="sectionSub">Select which canteen you are ordering from to see the right menu.</p>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 32, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { key: "MAIN", icon: "🍽️", desc: "Rice, meals & non-veg" },
            { key: "SCAS", icon: "☕", desc: "Snacks, chat & beverages" },
          ].map(({ key, icon, desc }) => (
            <button key={key} onClick={() => selectCanteen(key)} style={{
              width: 200, padding: "32px 24px", borderRadius: 24,
              border: "2px solid rgba(70,45,20,0.10)",
              background: "white", cursor: "pointer",
              boxShadow: "0 10px 28px rgba(90,55,20,0.08)",
              fontWeight: 900, fontSize: 22, color: "var(--text)",
              transition: "all 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(70,45,20,0.10)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
              {key} Canteen
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", marginTop: 6 }}>{desc}</div>
            </button>
          ))}
        </div>
      </Layout>
    );
  }

  const pageTitle = isStaff ? "Menu Management" : `${canteen} Canteen`;
  const pageSub   = isStaff
    ? "Toggle per-canteen availability, add new items, or edit existing ones."
    : "Browse today's menu and add items to your cart.";

  return (
    <Layout>
      {/* ── Add/Edit Modal ── */}
      {modal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}
        >
          <div style={{
            background: "white", borderRadius: 28, padding: "32px 36px",
            width: "100%", maxWidth: 520,
            boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
            animation: "fadeUp 0.22s ease",
          }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
                {modal === "add" ? "Add New Item" : "Edit Item"}
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--muted)", lineHeight: 1 }}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Name */}
              <label style={labelStyle}>
                Item name <span style={{ color: "#dc2626" }}>*</span>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required placeholder="e.g. Veg Biryani"
                  style={inputStyle}
                />
              </label>

              {/* Price + Category */}
              <div style={{ display: "flex", gap: 12 }}>
                <label style={{ ...labelStyle, flex: 1 }}>
                  Price (₹) <span style={{ color: "#dc2626" }}>*</span>
                  <input
                    type="number" min="0" step="1"
                    value={formData.price}
                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                    required placeholder="e.g. 80"
                    style={inputStyle}
                  />
                </label>
                <label style={{ ...labelStyle, flex: 1 }}>
                  Category <span style={{ color: "#dc2626" }}>*</span>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="veg">Veg</option>
                    <option value="nonveg">Non-Veg</option>
                    <option value="snacks">Snacks</option>
                    <option value="drinks">Drinks</option>
                  </select>
                </label>
              </div>

              {/* Image URL */}
              <label style={labelStyle}>
                Image path / URL
                <input
                  value={formData.image}
                  onChange={(e) => setFormData((p) => ({ ...p, image: e.target.value }))}
                  placeholder="/menu/item.png or https://…"
                  style={inputStyle}
                />
              </label>

              {/* Description */}
              <label style={labelStyle}>
                Description
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short description shown on the card…"
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical", paddingTop: 10, paddingBottom: 10 }}
                />
              </label>

              {/* Initial canteen availability (add only) */}
              {modal === "add" && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>
                    Initial availability
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    {["MAIN", "SCAS"].map((c) => (
                      <label key={c} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                        <input
                          type="checkbox"
                          checked={formData.availableAt[c]}
                          onChange={(e) => setFormData((p) => ({ ...p, availableAt: { ...p.availableAt, [c]: e.target.checked } }))}
                          style={{ width: 16, height: 16, cursor: "pointer" }}
                        />
                        {c} Canteen
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {saveError && (
                <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 13px", color: "#dc2626", fontWeight: 700, fontSize: 13 }}>
                  {saveError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1, padding: "13px 0", borderRadius: 14, fontWeight: 800, fontSize: 15,
                    background: saving ? "#d1d5db" : "var(--brand)", color: "white", border: "none",
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: saving ? "none" : "0 8px 20px var(--brand-glow)",
                    transition: "all 0.2s",
                  }}
                >
                  {saving ? "Saving…" : modal === "add" ? "Add Item" : "Save Changes"}
                </button>
                <button type="button" onClick={closeModal} style={{
                  padding: "13px 22px", borderRadius: 14, fontWeight: 800, fontSize: 15,
                  background: "transparent", border: "1.5px solid rgba(0,0,0,0.12)",
                  color: "var(--text)", cursor: "pointer", transition: "all 0.18s",
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="menuHero">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="menuKicker">{isStaff ? "Staff management" : "Campus menu"}</div>
            <h1 className="sectionHeading">{pageTitle}</h1>
            <p className="sectionSub">{pageSub}</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {/* Staff: Add Item button */}
            {isStaff && (
              <button onClick={openAddModal} style={{
                padding: "10px 20px", borderRadius: 14, fontWeight: 800, fontSize: 14,
                background: "var(--brand)", color: "white", border: "none", cursor: "pointer",
                boxShadow: "0 6px 18px var(--brand-glow)", transition: "all 0.2s",
              }}>
                + Add Item
              </button>
            )}
            {/* Students: switch canteen */}
            {!isStaff && (
              <div style={{ display: "flex", gap: 8 }}>
                {["MAIN", "SCAS"].map((c) => (
                  <button key={c} onClick={() => selectCanteen(c)} style={{
                    padding: "8px 18px", borderRadius: 12, fontWeight: 800, fontSize: 13,
                    cursor: "pointer", border: `2px solid ${canteen === c ? "var(--brand)" : "rgba(70,45,20,0.10)"}`,
                    background: canteen === c ? "var(--brand)" : "rgba(255,255,255,0.88)",
                    color: canteen === c ? "white" : "var(--text)",
                    transition: "all 0.18s",
                  }}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Category filters + search ── */}
      <div className="menuControls">
        <div className="searchRow menuSearchRow">
          {["all", "veg", "nonveg", "snacks"].map((cat) => (
            <button key={cat}
              className={`filterChip ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}>
              {cat === "all" ? "All" : cat === "veg" ? "Veg" : cat === "nonveg" ? "Non-Veg" : "Snacks & Drinks"}
            </button>
          ))}
          <input className="searchInput" placeholder="Search menu…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* ── Loading skeletons ── */}
      {loading && (
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 20 }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} style={{ background: "white", borderRadius: 22, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", animation: "pulse 1.4s ease-in-out infinite" }}>
              <div style={{ height: 200, background: "#f3f4f6" }} />
              <div style={{ padding: 18 }}>
                <div style={{ height: 18, width: "60%", borderRadius: 8, background: "#f3f4f6", marginBottom: 10 }} />
                <div style={{ height: 14, width: "80%", borderRadius: 8, background: "#f3f4f6" }} />
              </div>
            </div>
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && fetchError && (
        <div style={{ marginTop: 32, background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 18, padding: "22px 24px", color: "#dc2626", fontWeight: 700 }}>
          {fetchError}{" "}
          <button onClick={() => { setFetchError(null); setLoading(true); const ctrl = new AbortController(); fetchMenu(ctrl.signal); }}
            style={{ background: "none", border: "none", color: "#dc2626", textDecoration: "underline", cursor: "pointer", fontWeight: 700 }}>
            Retry
          </button>
        </div>
      )}

      {/* ── Grouped "All" view ── */}
      {!loading && !fetchError && category === "all" && grouped && (
        <div className="menuSections">
          {[
            { key: "veg",    title: "Veg",             sub: "Vegetarian favourites" },
            { key: "nonveg", title: "Non-Veg",         sub: "Rich meal picks" },
            { key: "snacks", title: "Snacks & Drinks", sub: "Quick bites and beverages" },
          ].map(({ key, title, sub }) =>
            grouped[key].length > 0 ? (
              <section key={key} className="menuSectionBlock">
                <div className="menuSectionHead"><h2>{title}</h2><p>{sub}</p></div>
                <div className="gridCards">{grouped[key].map(renderCard)}</div>
              </section>
            ) : null
          )}
        </div>
      )}

      {/* ── Single-category view ── */}
      {!loading && !fetchError && category !== "all" && (
        <div className="gridCards">{filteredItems.map(renderCard)}</div>
      )}

      {/* ── Empty state ── */}
      {!loading && !fetchError && filteredItems.length === 0 && (
        <div className="emptyState">
          <h3>No items found</h3>
          <p>{isStaff ? "Add items using the button above." : "Try a different search or category."}</p>
        </div>
      )}
    </Layout>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusPill({ bg, children }) {
  return (
    <span style={{ background: bg, color: "white", borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 900 }}>
      {children}
    </span>
  );
}

function ToggleBtn({ label, on, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: "5px 11px", borderRadius: 8, fontWeight: 800, fontSize: 12,
        cursor: loading ? "not-allowed" : "pointer",
        border: "1.5px solid",
        borderColor: loading ? "#d1d5db" : on ? "#16a34a" : "#dc2626",
        background:  loading ? "#f3f4f6"  : on ? "#f0fdf4" : "#fff5f5",
        color:       loading ? "#9ca3af"  : on ? "#15803d" : "#dc2626",
        transition: "all 0.15s",
      }}
    >
      {loading ? "…" : `${label}: ${on ? "ON" : "OFF"}`}
    </button>
  );
}

// Shared styles for modal form elements
const labelStyle = { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--muted)" };
const inputStyle = {
  padding: "10px 13px", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.12)",
  fontSize: 14, fontWeight: 500, color: "var(--text)", background: "white",
  transition: "border-color 0.15s", outline: "none", width: "100%",
};

// ── Page export — Suspense required for useSearchParams in App Router ──────────
export default function MenuPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div style={{ textAlign: "center", padding: "56px 24px", color: "var(--muted)", fontWeight: 700 }}>
          Loading menu…
        </div>
      </Layout>
    }>
      <MenuContent />
    </Suspense>
  );
}
