import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SB_URL, SB_KEY, headers } from "./supabase";
import { autoCapName, autoFmtPhone } from "./autoformat";
import FileUpload from "./FileUpload";

import DocUpload from "./DocUpload";
import { C } from "./theme";

function Section({ title, icon, defaultOpen = false, accent, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const clr = accent || C.text3;
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.borderSubtle}`,
      borderRadius: "18px", overflow: "hidden", marginBottom: "12px",
    }}>
      <button onClick={() => setOpen(p => !p)} style={{
        width: "100%", padding: "16px 18px",
        display: "flex", alignItems: "center", gap: "10px",
        background: "none", border: "none", cursor: "pointer",
        fontFamily: "inherit", textAlign: "left",
      }}>
        <span style={{ fontSize: "16px" }}>{icon}</span>
        <span style={{ flex: 1, fontSize: "13px", fontWeight: "700", color: clr, textTransform: "uppercase", letterSpacing: "0.8px" }}>{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{ color: C.text4, fontSize: "12px", lineHeight: 1 }}>▼</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 18px 18px" }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Label = ({ children, required }) => (
  <label style={{ fontSize: "11px", fontWeight: "700", color: C.text3, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
    {children}{required && <span style={{ color: C.blue, marginLeft: "2px" }}>*</span>}
  </label>
);

export default function BrokerForm() {
  const [form, setForm] = useState({
    broker_name: "", client_name: "", phone: "", car_want: "",
    car_input_type: "link", car_link: "", car_vin: "",
    deal_type: "Lease",
    trade_in: false, trade_details: "", trade_vin: "", notes: "",
  });
  const [brokerId, setBrokerId] = useState(null);
  const [tradePhotos, setTradePhotos] = useState([]);
  const [insuranceDoc, setInsuranceDoc] = useState(null);
  const [registrationDoc, setRegistrationDoc] = useState(null);
  const [licenseDoc, setLicenseDoc] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [brokers, setBrokers] = useState([]);
  const [brokerCode, setBrokerCode] = useState("");
  const [brokerStatus, setBrokerStatus] = useState(null); // null | "found" | "not_found"

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${SB_URL}/rest/v1/brokers?active=eq.true&select=*`, {
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
        });
        if (!r.ok) return;
        const data = await r.json();
        if (Array.isArray(data)) setBrokers(data);
      } catch {}
    })();
  }, []);

  const handleBrokerCodeChange = (code) => {
    const val = code.toUpperCase();
    setBrokerCode(val);
    if (!val.trim()) {
      setBrokerStatus(null);
      setBrokerId(null);
      setForm(p => ({ ...p, broker_name: "" }));
      return;
    }
    const match = brokers.find(b => b.broker_code?.toUpperCase() === val.trim());
    if (match) {
      setBrokerStatus("found");
      setBrokerId(match.id);
      setForm(p => ({ ...p, broker_name: match.name || match.company || "" }));
    } else {
      setBrokerStatus("not_found");
      setBrokerId(null);
      setForm(p => ({ ...p, broker_name: "" }));
    }
  };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (!brokerCode.trim()) { setError("Broker code is required"); return; }
    if (brokerStatus !== "found") { setError("Please enter a valid broker code — contact UAL if you don't have one"); return; }
    if (!form.client_name.trim()) { setError("Client name is required"); return; }
    if (!form.phone.trim()) { setError("Client phone is required"); return; }
    setSubmitting(true); setError("");
    try {
      const tradeNotes = form.trade_in
        ? `\nTrade-in: ${form.trade_details.trim() || "Yes"}${form.trade_vin.trim() ? `\nVIN: ${form.trade_vin.trim()}` : ""}`
        : "";
      const extraNotes = form.notes.trim() ? `\n${form.notes.trim()}` : "";
      const carLinkNote = form.car_input_type === "link" && form.car_link.trim()
        ? `\nCar Link: ${form.car_link.trim()}`
        : form.car_input_type === "vin" && form.car_vin.trim()
        ? `\nCar VIN: ${form.car_vin.trim()}`
        : "";

      const allFiles = [
        ...tradePhotos.map(f => ({ ...f, category: "Trade-In" })),
        ...(insuranceDoc ? [{ ...insuranceDoc, category: "Insurance" }] : []),
        ...(registrationDoc ? [{ ...registrationDoc, category: "Registration" }] : []),
        ...(licenseDoc ? [{ ...licenseDoc, category: "Driver's License" }] : []),
      ];
      const attachmentsArr = allFiles.map(f => ({ name: f.name, url: f.url, type: f.type, category: f.category }));
      const attachNotes = allFiles.length > 0 ? `\n\nAttachments:\n${allFiles.map(f => `[${f.category}] ${f.url}`).join("\n")}` : "";

      const r = await fetch(`${SB_URL}/rest/v1/clients`, {
        method: "POST", headers: headers(),
        body: JSON.stringify({
          name: form.client_name.trim(),
          phone: form.phone.trim(),
          car_want: form.car_want.trim(),
          car_link: form.car_input_type === "link" ? form.car_link.trim() || null : null,
          car_vin: form.car_input_type === "vin" ? form.car_vin.trim() || null : null,
          deal_type: form.deal_type,
          notes: `[Broker Form — ${form.broker_name.trim()}]${carLinkNote}${tradeNotes}${extraNotes}${attachNotes}`,
          attachments: attachmentsArr.length > 0 ? attachmentsArr : [],
          status: "active",
          lead_source: "From",
          assigned_to: "O",
          broker_name: form.broker_name.trim(),
          broker_id: brokerId || undefined,
          pinned: false,
          trade_in: form.trade_in,
          car_options: [],
          last_contacted: new Date().toISOString(),
        }),
      });
      if (!r.ok) throw new Error("Failed");
      setDone(true);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inp = (val, key, placeholder, opts = {}) => (
    <input value={val} onChange={e => {
      let v = e.target.value;
      if (key === "broker_name" || key === "client_name") v = autoCapName(v);
      if (key === "phone") v = autoFmtPhone(v);
      if (key === "trade_vin") v = v.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "").slice(0, 17);
      set(key, v);
    }}
      placeholder={placeholder} {...opts}
      style={{
        width: "100%", padding: "14px 16px",
        background: C.input, border: `1px solid ${C.borderSubtle}`,
        borderRadius: "12px", color: C.text1, fontSize: "15px",
        outline: "none", fontFamily: "inherit",
        boxSizing: "border-box", WebkitAppearance: "none",
        minHeight: "48px", transition: "all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)",
        ...(opts.style || {}),
      }}
      onFocus={e => { e.target.style.borderColor = C.borderFocus; e.target.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.08)"; }}
      onBlur={e => { e.target.style.borderColor = C.borderSubtle; e.target.style.boxShadow = "none"; }}
    />
  );

  const txtarea = (val, key, placeholder) => (
    <textarea value={val} onChange={e => set(key, e.target.value)} placeholder={placeholder}
      style={{
        width: "100%", padding: "14px 16px", minHeight: "80px",
        background: C.input, border: `1px solid ${C.borderSubtle}`,
        borderRadius: "12px", color: C.text1, fontSize: "15px",
        outline: "none", fontFamily: "inherit", resize: "vertical",
        lineHeight: 1.5, boxSizing: "border-box", transition: "all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)",
      }}
      onFocus={e => { e.target.style.borderColor = C.borderFocus; e.target.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.08)"; }}
      onBlur={e => { e.target.style.borderColor = C.borderSubtle; e.target.style.boxShadow = "none"; }}
    />
  );

  const toggle = (options, key, colors) => (
    <div style={{ display: "flex", gap: "8px", background: C.input, borderRadius: "12px", border: `1px solid ${C.borderSubtle}`, padding: "4px" }}>
      {options.map((opt, i) => {
        const on = form[key] === opt;
        const clr = colors ? colors[i] : C.blue;
        return (
          <motion.button key={opt} whileTap={{ scale: 0.96 }} onClick={() => set(key, opt)} style={{
            flex: 1, padding: "12px 8px", borderRadius: "10px",
            fontSize: "14px", fontWeight: "600", cursor: "pointer",
            fontFamily: "inherit", minHeight: "44px",
            border: "none",
            background: on ? C.surfaceHover : "transparent",
            color: on ? clr : C.text3,
            transition: "all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}>{opt}</motion.button>
        );
      })}
    </div>
  );

  const fieldGap = { marginBottom: "14px" };

  // ═══ SUCCESS ═══
  if (done) return (
    <div style={{ minHeight: "100dvh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} style={{ textAlign: "center", maxWidth: "400px" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          style={{ width: "88px", height: "88px", borderRadius: "50%", background: "rgba(52,211,153,0.08)", border: `2px solid rgba(52,211,153,0.25)`, margin: "0 auto 28px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "38px", backdropFilter: "blur(20px)" }}>✓</motion.div>
        <h2 style={{ color: C.text1, fontSize: "26px", fontWeight: "800", margin: "0 0 10px" }}>Lead Submitted!</h2>
        <p style={{ color: C.text3, fontSize: "15px", lineHeight: 1.7, margin: "0 0 20px" }}>
          Thanks {form.broker_name.split(" ")[0] || ""}! We've received your client's info and will get to work on it.
        </p>

        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => {
          tradePhotos.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); });
          [insuranceDoc, registrationDoc, licenseDoc].forEach(f => { if (f?.preview) URL.revokeObjectURL(f.preview); });
          setDone(false); setTradePhotos([]); setInsuranceDoc(null); setRegistrationDoc(null); setLicenseDoc(null);
          setForm(p => ({ ...p, client_name: "", phone: "", car_want: "", car_input_type: "link", car_link: "", car_vin: "", deal_type: "Lease", trade_in: false, trade_details: "", trade_vin: "", notes: "" }));
        }} style={{
          width: "100%", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: "12px", padding: "14px 28px", color: C.blue,
          fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(20px)",
          boxSizing: "border-box",
        }}>Submit Another Lead</motion.button>
      </motion.div>
    </div>
  );

  // ═══ FORM ═══
  return (
    <div style={{
      minHeight: "100dvh",
      background: C.bg,
      fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
      padding: "20px 16px 40px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "8%", left: "20%", width: "60%", height: "40%", background: "radial-gradient(ellipse,rgba(59,130,246,0.04),transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "40%", height: "30%", background: "radial-gradient(ellipse,rgba(167,139,250,0.03),transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: "480px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px", paddingTop: "16px" }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 style={{
              fontSize: "28px", fontWeight: "800", margin: "0 0 2px", letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Ultimate Auto Lease</h1>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            style={{ marginTop: "10px" }}>
            <span style={{
              display: "inline-block", padding: "6px 18px", borderRadius: "100px",
              background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)",
              fontSize: "11px", fontWeight: "700", color: C.blue,
              textTransform: "uppercase", letterSpacing: "1.5px",
            }}>Broker Lead Submission</span>
          </motion.div>

          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
            style={{ height: "1px", margin: "24px auto 0", width: "60%", background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent)" }} />
        </div>

        {/* Glass form card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            background: C.glass, backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
            border: `1px solid rgba(255,255,255,0.08)`, borderRadius: "20px", padding: "20px 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}>

          {/* ═══ YOUR INFO ═══ */}
          <Section title="Your Info" icon="👤" defaultOpen accent={C.blue}>
            <div style={{ marginBottom: brokerStatus ? "10px" : "0" }}>
              <Label required>Broker Code</Label>
              <input
                value={brokerCode}
                onChange={e => handleBrokerCodeChange(e.target.value)}
                placeholder="e.g. UAL-001"
                style={{
                  width: "100%", padding: "14px 16px",
                  background: C.input,
                  border: `1px solid ${brokerStatus === "found" ? "rgba(52,211,153,0.35)" : brokerStatus === "not_found" ? "rgba(239,68,68,0.3)" : C.borderSubtle}`,
                  borderRadius: "12px", color: C.text1, fontSize: "15px",
                  outline: "none", fontFamily: "inherit",
                  boxSizing: "border-box", WebkitAppearance: "none",
                  minHeight: "48px", transition: "all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)",
                  letterSpacing: "1px",
                }}
                onFocus={e => { e.target.style.borderColor = C.borderFocus; e.target.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.08)"; }}
                onBlur={e => {
                  e.target.style.borderColor = brokerStatus === "found" ? "rgba(52,211,153,0.35)" : brokerStatus === "not_found" ? "rgba(239,68,68,0.3)" : C.borderSubtle;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <AnimatePresence>
              {brokerStatus === "found" && (
                <motion.div key="found" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", fontSize: "13px", color: C.green, fontWeight: "600" }}>
                  Welcome, {form.broker_name}!
                </motion.div>
              )}
              {brokerStatus === "not_found" && (
                <motion.div key="not_found" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", fontSize: "13px", color: C.text3, fontWeight: "500" }}>
                  Code not found — contact UAL to get your broker code
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          {/* ═══ CLIENT DETAILS ═══ */}
          <Section title="Client Details" icon="📋" defaultOpen accent={C.cyan}>
            <div style={fieldGap}>
              <Label required>Client Name</Label>
              {inp(form.client_name, "client_name", "Full name")}
            </div>
            <div style={fieldGap}>
              <Label required>Client Phone</Label>
              {inp(form.phone, "phone", "305-555-1234", { type: "tel" })}
            </div>
            <div style={fieldGap}>
              <Label>What Car Are They Looking For?</Label>
              {inp(form.car_want, "car_want", "e.g. BMW X5, Tesla Model Y")}
            </div>
            <div style={fieldGap}>
              <Label>Car Listing URL or VIN?</Label>
              <div style={{ display: "flex", gap: "8px", background: C.input, borderRadius: "12px", border: `1px solid ${C.borderSubtle}`, padding: "4px", marginBottom: "8px" }}>
                {[["link", "Car Listing URL"], ["vin", "VIN Number"]].map(([val, label]) => {
                  const on = form.car_input_type === val;
                  return (
                    <motion.button key={val} whileTap={{ scale: 0.96 }} onClick={() => set("car_input_type", val)}
                      style={{ flex: 1, padding: "10px 6px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", minHeight: "40px", border: "none", background: on ? C.surfaceHover : "transparent", color: on ? C.purple : C.text3, transition: "all 0.2s ease" }}>
                      {label}
                    </motion.button>
                  );
                })}
              </div>
              {form.car_input_type === "link"
                ? inp(form.car_link, "car_link", "Paste URL to listing...", { type: "url" })
                : <input value={form.car_vin} onChange={e => set("car_vin", e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "").slice(0, 17))}
                    placeholder="e.g. 1HGBH41JXMN109186"
                    style={{ width: "100%", padding: "14px 16px", background: C.input, border: `1px solid ${C.borderSubtle}`, borderRadius: "12px", color: C.text1, fontSize: "15px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", minHeight: "48px" }}
                    onFocus={e => { e.target.style.borderColor = C.borderFocus; e.target.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.08)"; }}
                    onBlur={e => { e.target.style.borderColor = C.borderSubtle; e.target.style.boxShadow = "none"; }}
                  />
              }
            </div>
            <div>
              <Label>Lease or Finance?</Label>
              {toggle(["Lease", "Finance", "Both"], "deal_type", [C.purple, C.yellow, C.blue])}
            </div>
          </Section>

          {/* ═══ TRADE-IN ═══ */}
          <Section title="Trade-In" icon="🔄" accent={C.green}>
            <div style={fieldGap}>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => set("trade_in", !form.trade_in)} style={{
                width: "100%", padding: "14px 16px", borderRadius: "12px",
                fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
                border: form.trade_in ? `1px solid rgba(52,211,153,0.3)` : `1px solid ${C.borderSubtle}`,
                background: form.trade_in ? "rgba(52,211,153,0.08)" : C.surface,
                color: form.trade_in ? C.green : C.text3,
                textAlign: "left", display: "flex", alignItems: "center", gap: "10px",
                minHeight: "48px", transition: "all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)",
              }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "7px",
                  border: form.trade_in ? "none" : `2px solid ${C.borderMedium}`,
                  background: form.trade_in ? `linear-gradient(135deg, ${C.green}, #10B981)` : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s ease",
                }}>{form.trade_in && <span style={{ color: "#fff", fontSize: "13px", fontWeight: "800" }}>✓</span>}</div>
                Client Has a Trade-In
              </motion.button>
            </div>
            <AnimatePresence>
              {form.trade_in && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }} style={{ overflow: "hidden" }}>
                  <div style={fieldGap}>
                    <Label>Trade-In Details</Label>
                    {txtarea(form.trade_details, "trade_details", "Year, make, model, payoff amount...")}
                  </div>
                  <div style={fieldGap}>
                    <Label>VIN</Label>
                    {inp(form.trade_vin, "trade_vin", "e.g. 1HGBH41JXMN109186")}
                  </div>
                  <div>
                    <Label>Trade-In Photos</Label>
                    <FileUpload files={tradePhotos} setFiles={setTradePhotos} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          {/* ═══ DOCUMENTS ═══ */}
          <Section title="Documents" icon="📎" accent={C.yellow}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <DocUpload label="Insurance" file={insuranceDoc} onUpload={setInsuranceDoc} onRemove={() => { if (insuranceDoc?.preview) URL.revokeObjectURL(insuranceDoc.preview); setInsuranceDoc(null); }} />
              <DocUpload label="Registration" file={registrationDoc} onUpload={setRegistrationDoc} onRemove={() => { if (registrationDoc?.preview) URL.revokeObjectURL(registrationDoc.preview); setRegistrationDoc(null); }} />
              <DocUpload label="Driver's License" file={licenseDoc} onUpload={setLicenseDoc} onRemove={() => { if (licenseDoc?.preview) URL.revokeObjectURL(licenseDoc.preview); setLicenseDoc(null); }} />
            </div>
          </Section>

          {/* ═══ NOTES ═══ */}
          <div style={{ marginBottom: "16px", padding: "0 4px" }}>
            <Label>Additional Notes</Label>
            {txtarea(form.notes, "notes", "Timeline, special requests, anything else...")}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", color: C.red, fontWeight: "600", marginBottom: "14px", textAlign: "center" }}>{error}</motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button whileHover={{ scale: 1.01, boxShadow: "0 6px 30px rgba(59,130,246,0.35)" }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit} disabled={submitting}
            style={{
              width: "100%", background: `linear-gradient(135deg, ${C.blue}, #2563EB)`,
              border: "none", borderRadius: "14px", padding: "18px",
              fontSize: "16px", fontWeight: "700", color: "#fff",
              cursor: submitting ? "wait" : "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 24px rgba(59,130,246,0.25)",
              opacity: submitting ? 0.7 : 1, minHeight: "56px", transition: "opacity 0.2s ease",
            }}>{submitting ? "Submitting..." : "Submit Lead →"}</motion.button>
        </motion.div>

        <p style={{ textAlign: "center", fontSize: "11px", color: C.text4, marginTop: "20px", fontWeight: "500" }}>
          Ultimate Auto Lease · Broker Portal
        </p>
      </div>
    </div>
  );
}
