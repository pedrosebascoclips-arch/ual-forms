import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SB_URL, SB_KEY, headers } from "./supabase";
import { autoCapName } from "./autoformat";
import FileUpload from "./FileUpload";

import DocUpload from "./DocUpload";
import { C } from "./theme";

const BROKER_STAGES = [
  ["Active",                "#6B7280"],
  ["Car Chosen",            "#A78BFA"],
  ["Needs Numbers",         "#F59E0B"],
  ["Needs Credit Approval", "#3B82F6"],
  ["Approved",              "#34D399"],
  ["Delivery Set",          "#22D3EE"],
];

const STAGE_ORDER = ["Active", "Car Chosen", "Needs Numbers", "Needs Credit Approval", "Approved", "Delivery Set"];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  return `${weeks} weeks ago`;
}

function ClientPipelineCard({ client }) {
  const idx = STAGE_ORDER.indexOf(client.client_stage);
  const progress = idx >= 0 ? ((idx + 1) / STAGE_ORDER.length) * 100 : 0;
  return (
    <div style={{
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "14px",
      overflow: "hidden",
      marginBottom: "8px",
    }}>
      {/* Green progress bar at top */}
      <div style={{ height: "3px", background: "rgba(255,255,255,0.08)", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progress}%`, background: "#34D399", transition: "width 0.6s ease", borderRadius: "999px" }} />
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff", marginBottom: "6px" }}>
          {client.name || "Client"}
        </div>
        {/* Stage dots */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {STAGE_ORDER.map((stage, i) => {
            const done = idx >= i;
            return (
              <div key={stage} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div title={stage} style={{
                  width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                  background: done ? "#34D399" : "rgba(255,255,255,0.2)",
                  boxShadow: done ? "0 0 5px rgba(52,211,153,0.5)" : "none",
                }} />
                {i < STAGE_ORDER.length - 1 && (
                  <div style={{ flex: 1, height: "2px", background: (idx >= i + 1) ? "#34D399" : "rgba(255,255,255,0.1)" }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", marginTop: "6px" }}>
          {client.client_stage || "Active"} · {timeAgo(client.created_at)}
        </div>
      </div>
    </div>
  );
}

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

function PinBoxes({ value, onChange, onComplete }) {
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs[i-1].current?.focus();
    }
  };
  const handleChange = (i, v) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = d;
    onChange(next);
    if (d && i < 3) refs[i+1].current?.focus();
    if (d && i === 3) onComplete?.(next.join(""));
  };
  return (
    <div style={{ display: "flex", gap: "12px", justifyContent: "center", margin: "20px 0" }}>
      {[0,1,2,3].map(i => (
        <input
          key={i}
          ref={refs[i]}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={value[i]}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          style={{
            width: "56px", height: "64px", textAlign: "center",
            fontSize: "24px", fontWeight: "700",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "14px", color: "#fff",
            outline: "none", fontFamily: "inherit",
            WebkitAppearance: "none",
            caretColor: "transparent",
          }}
          onFocus={e => { e.target.style.borderColor = "rgba(59,130,246,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; e.target.style.boxShadow = "none"; }}
        />
      ))}
    </div>
  );
}

export default function BrokerForm() {
  const [form, setForm] = useState({
    broker_name: "", client_name: "",
    car_input_type: "link", car_link: "", car_vin: "",
    deal_type: "Lease", client_stage: "",
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

  const [authStep, setAuthStep] = useState("phone"); // "phone" | "pin" | "register"
  const [phone, setPhone] = useState("");
  const [pinInput, setPinInput] = useState(["","","",""]);
  const [pinError, setPinError] = useState("");
  const [regName, setRegName] = useState("");
  const [regPin, setRegPin] = useState(["","","",""]);
  const [regPinConfirm, setRegPinConfirm] = useState(["","","",""]);
  const [regError, setRegError] = useState("");
  const [brokerVerified, setBrokerVerified] = useState(false);
  const [matchedBroker, setMatchedBroker] = useState(null);

  const [view, setView] = useState("success"); // "success" | "clients"
  const [myClients, setMyClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [submittedClientId, setSubmittedClientId] = useState(null);
  const [creditLinkCopied, setCreditLinkCopied] = useState(false);
  const CREDIT_APP_URL = "https://ual-credit-app.vercel.app";

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

  const fmtPhone = (raw) => {
    const d = raw.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };
  const normalize = (p) => (p || "").replace(/\D/g, "");

  const handlePhoneChange = (raw) => {
    const formatted = fmtPhone(raw);
    setPhone(formatted);
    const digits = normalize(formatted);
    if (digits.length === 10) {
      const match = brokers.find(b => normalize(b.phone) === digits);
      if (match) {
        setMatchedBroker(match);
        setForm(p => ({ ...p, broker_name: match.name || match.company || "" }));
        setBrokerId(match.id);
        // Short delay then advance
        setTimeout(() => {
          if (match.pin) {
            setAuthStep("pin");
          } else {
            setAuthStep("register");
          }
        }, 400);
      }
    } else {
      setMatchedBroker(null);
      setBrokerId(null);
      setForm(p => ({ ...p, broker_name: "" }));
    }
  };

  const fetchMyClients = async (brokerIdArg) => {
    setLoadingClients(true);
    try {
      const r = await fetch(
        `${SB_URL}/rest/v1/clients?broker_id=eq.${brokerIdArg}&order=created_at.desc&limit=50&select=id,name,client_stage,created_at`,
        { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
      );
      const data = await r.json();
      setMyClients(Array.isArray(data) ? data : []);
    } catch {}
    setLoadingClients(false);
  };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (!brokerVerified) { setError("Please log in first"); return; }
    if (!form.client_name.trim()) { setError("Client name is required"); return; }
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
          car_link: form.car_input_type === "link" ? form.car_link.trim() || null : null,
          car_vin: form.car_input_type === "vin" ? form.car_vin.trim() || null : null,
          deal_type: form.deal_type,
          notes: `[Broker Form — ${form.broker_name.trim()}]${carLinkNote}${tradeNotes}${extraNotes}${attachNotes}`,
          attachments: attachmentsArr.length > 0 ? attachmentsArr : [],
          status: "active",
          lead_source: "From",
          assigned_to: "",
          broker_name: form.broker_name.trim(),
          broker_id: brokerId || undefined,
          client_stage: form.client_stage || null,
          pinned: false,
          trade_in: form.trade_in,
          car_options: [],
          last_contacted: new Date().toISOString(),
        }),
      });
      if (!r.ok) throw new Error("Failed");
      const created = await r.json();
      const newId = created?.[0]?.id || null;
      setSubmittedClientId(newId);
      setDone(true);
      // Auto-switch to clients view and fetch
      setView("clients");
      fetchMyClients(brokerId);
      // Auto-update stage to "Active" after 2 minutes
      if (newId) {
        setTimeout(async () => {
          try {
            await fetch(`${SB_URL}/rest/v1/clients?id=eq.${newId}`, {
              method: "PATCH",
              headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
              body: JSON.stringify({ client_stage: "Active" }),
            });
            setMyClients(prev => prev.map(c => c.id === newId ? { ...c, client_stage: "Active" } : c));
          } catch {}
        }, 2 * 60 * 1000);
      }
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
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} style={{ textAlign: "center", maxWidth: "400px", width: "100%" }}>

        {/* Copy Credit App Link */}
        <button onClick={() => {
          const ta = document.createElement("textarea");
          ta.value = CREDIT_APP_URL;
          ta.style.cssText = "position:fixed;top:-9999px;opacity:0";
          document.body.appendChild(ta); ta.focus(); ta.select();
          try { document.execCommand("copy"); } catch {}
          document.body.removeChild(ta);
          setCreditLinkCopied(true);
          setTimeout(() => setCreditLinkCopied(false), 2500);
        }} style={{
          width: "100%", marginBottom: "12px", padding: "13px 16px",
          borderRadius: "12px", border: creditLinkCopied ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(255,255,255,0.1)",
          background: creditLinkCopied ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.05)",
          color: creditLinkCopied ? "#34D399" : "rgba(255,255,255,0.75)",
          fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          transition: "all 0.2s", boxSizing: "border-box",
        }}>
          {creditLinkCopied ? "✓ Copied!" : "📋 Copy Credit App Link"}
        </button>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button
            onClick={() => setView("success")}
            style={{
              flex: 1, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: "13px", fontWeight: "700",
              background: view === "success" ? "#34D399" : "rgba(255,255,255,0.08)",
              color: view === "success" ? "#000" : "rgba(255,255,255,0.6)",
              transition: "all 0.2s",
            }}
          >
            ✓ Lead Submitted
          </button>
          <button
            onClick={() => {
              setView("clients");
              if (myClients.length === 0) fetchMyClients(brokerId);
            }}
            style={{
              flex: 1, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: "13px", fontWeight: "700",
              background: view === "clients" ? "#34D399" : "rgba(255,255,255,0.08)",
              color: view === "clients" ? "#000" : "rgba(255,255,255,0.6)",
              transition: "all 0.2s",
            }}
          >
            👥 My Clients
          </button>
        </div>

        {view === "success" && (
          <div>
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
              setView("success"); setMyClients([]); setSubmittedClientId(null); setCreditLinkCopied(false);
              setForm(p => ({ ...p, client_name: "", car_input_type: "link", car_link: "", car_vin: "", deal_type: "Lease", client_stage: "", trade_in: false, trade_details: "", trade_vin: "", notes: "" }));
            }} style={{
              width: "100%", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "12px", padding: "14px 28px", color: C.blue,
              fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(20px)",
              boxSizing: "border-box",
            }}>Submit Another Lead</motion.button>
          </div>
        )}

        {view === "clients" && (
          <div style={{ textAlign: "left" }}>
            {loadingClients ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", padding: "40px 0", fontSize: "13px" }}>Loading...</div>
            ) : myClients.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "40px 0", fontSize: "13px" }}>No clients submitted yet</div>
            ) : (() => {
                const now = new Date();
                const current = myClients.filter(c => (now - new Date(c.created_at)) < 30 * 86400000);
                const previous = myClients.filter(c => (now - new Date(c.created_at)) >= 30 * 86400000);
                return (
                  <>
                    {current.length > 0 && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>This Month</div>}
                    {current.map(c => <ClientPipelineCard key={c.id} client={c} />)}
                    {previous.length > 0 && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", margin: "16px 0 8px" }}>Previous</div>}
                    {previous.map(c => <ClientPipelineCard key={c.id} client={c} />)}
                  </>
                );
              })()
            }
          </div>
        )}

      </motion.div>
    </div>
  );

  // ═══ AUTH SCREEN ═══
  if (!brokerVerified) return (
    <div style={{
      minHeight: "100dvh", background: C.bg,
      fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "20px 16px",
    }}>
      {/* Background glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "8%", left: "20%", width: "60%", height: "40%", background: "radial-gradient(ellipse,rgba(59,130,246,0.04),transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: "360px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 8px", letterSpacing: "-0.5px", background: "linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Ultimate Auto Lease
          </h1>
          <span style={{ display: "inline-block", padding: "5px 16px", borderRadius: "100px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)", fontSize: "10px", fontWeight: "700", color: C.blue, textTransform: "uppercase", letterSpacing: "1.5px" }}>
            Broker Portal
          </span>
        </div>

        {/* Card */}
        <div style={{ background: C.glass, backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "28px 24px", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>

          {/* SCREEN 1 — PHONE */}
          {authStep === "phone" && (
            <div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: C.text1, marginBottom: "6px" }}>Welcome</div>
              <div style={{ fontSize: "13px", color: C.text3, marginBottom: "20px" }}>Enter your phone number to continue</div>
              <Label required>Phone Number</Label>
              <input
                type="tel"
                value={phone}
                onChange={e => handlePhoneChange(e.target.value)}
                placeholder="(555) 555-5555"
                style={{ width: "100%", padding: "14px 16px", background: C.input, border: `1px solid ${matchedBroker ? "rgba(52,211,153,0.35)" : normalize(phone).length === 10 && !matchedBroker ? "rgba(239,68,68,0.3)" : C.borderSubtle}`, borderRadius: "12px", color: C.text1, fontSize: "18px", letterSpacing: "1px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", minHeight: "52px" }}
              />
              {matchedBroker && (
                <div style={{ marginTop: "10px", padding: "10px 14px", borderRadius: "10px", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", fontSize: "13px", color: C.green, fontWeight: "600" }}>
                  ✓ {matchedBroker.name || matchedBroker.company} — just a moment...
                </div>
              )}
              {normalize(phone).length === 10 && !matchedBroker && (
                <div style={{ marginTop: "10px", padding: "10px 14px", borderRadius: "10px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", fontSize: "13px", color: C.text3 }}>
                  Phone not recognized — contact UAL to get set up
                </div>
              )}
            </div>
          )}

          {/* SCREEN 2 — PIN ENTRY (existing broker) */}
          {authStep === "pin" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "800", color: C.text1, marginBottom: "4px" }}>Welcome back</div>
              <div style={{ fontSize: "14px", color: C.green, fontWeight: "600", marginBottom: "4px" }}>{matchedBroker?.name || ""}</div>
              <div style={{ fontSize: "13px", color: C.text3, marginBottom: "4px" }}>Enter your 4-digit PIN</div>
              <PinBoxes value={pinInput} onChange={setPinInput} onComplete={(val) => {
                if (val === matchedBroker?.pin) {
                  setBrokerVerified(true);
                  setPinError("");
                } else {
                  setPinError("Incorrect PIN — try again");
                  setPinInput(["","","",""]);
                }
              }} />
              {pinError && <div style={{ fontSize: "13px", color: C.red, marginBottom: "10px" }}>{pinError}</div>}
              <button onClick={() => {
                if (pinInput.join("") === matchedBroker?.pin) {
                  setBrokerVerified(true); setPinError("");
                } else {
                  setPinError("Incorrect PIN — try again");
                  setPinInput(["","","",""]);
                }
              }} style={{ width: "100%", background: `linear-gradient(135deg, ${C.blue}, #2563EB)`, border: "none", borderRadius: "12px", padding: "16px", fontSize: "15px", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "inherit", marginTop: "4px" }}>
                Continue →
              </button>
              <div style={{ marginTop: "14px", fontSize: "12px", color: C.text4 }}>Forgot PIN? Contact UAL to reset</div>
              <button onClick={() => { setAuthStep("phone"); setPhone(""); setMatchedBroker(null); setBrokerId(null); setPinInput(["","","",""]); setPinError(""); setForm(p => ({ ...p, broker_name: "" })); }}
                style={{ marginTop: "8px", background: "none", border: "none", color: C.text4, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>
                ← Back
              </button>
            </div>
          )}

          {/* SCREEN 3 — REGISTRATION (first time) */}
          {authStep === "register" && (
            <div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: C.text1, marginBottom: "4px" }}>Set up your account</div>
              <div style={{ fontSize: "13px", color: C.text3, marginBottom: "20px" }}>One-time setup for {matchedBroker?.company || "your account"}</div>
              <div style={{ marginBottom: "14px" }}>
                <Label required>Your Full Name</Label>
                <input
                  value={regName}
                  onChange={e => setRegName(autoCapName(e.target.value))}
                  placeholder="First Last"
                  style={{ width: "100%", padding: "14px 16px", background: C.input, border: `1px solid ${C.borderSubtle}`, borderRadius: "12px", color: C.text1, fontSize: "15px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", minHeight: "48px" }}
                />
              </div>
              <Label required>Create a 4-Digit PIN</Label>
              <PinBoxes value={regPin} onChange={setRegPin} />
              <Label required>Confirm PIN</Label>
              <PinBoxes value={regPinConfirm} onChange={setRegPinConfirm} />
              {regError && <div style={{ fontSize: "13px", color: C.red, marginBottom: "10px", textAlign: "center" }}>{regError}</div>}
              <button onClick={async () => {
                if (!regName.trim()) { setRegError("Please enter your name"); return; }
                const p1 = regPin.join("");
                const p2 = regPinConfirm.join("");
                if (p1.length < 4) { setRegError("PIN must be 4 digits"); return; }
                if (p1 !== p2) { setRegError("PINs don't match — try again"); setRegPinConfirm(["","","",""]); return; }
                setRegError("");
                try {
                  const r = await fetch(`${SB_URL}/rest/v1/brokers?id=eq.${matchedBroker.id}`, {
                    method: "PATCH",
                    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
                    body: JSON.stringify({ name: regName.trim(), pin: p1 }),
                  });
                  if (!r.ok) throw new Error();
                  setForm(p => ({ ...p, broker_name: regName.trim() }));
                  setMatchedBroker(prev => ({ ...prev, name: regName.trim(), pin: p1 }));
                  setBrokerVerified(true);
                } catch {
                  setRegError("Something went wrong — please try again");
                }
              }} style={{ width: "100%", background: `linear-gradient(135deg, ${C.blue}, #2563EB)`, border: "none", borderRadius: "12px", padding: "16px", fontSize: "15px", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "inherit", marginTop: "8px" }}>
                Create Account →
              </button>
              <button onClick={() => { setAuthStep("phone"); setPhone(""); setMatchedBroker(null); setBrokerId(null); setRegName(""); setRegPin(["","","",""]); setRegPinConfirm(["","","",""]); setRegError(""); setForm(p => ({ ...p, broker_name: "" })); }}
                style={{ width: "100%", marginTop: "10px", background: "none", border: "none", color: C.text4, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>
                ← Back
              </button>
            </div>
          )}

        </div>
      </div>
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

          {/* Verified badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", padding: "10px 14px", borderRadius: "10px", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
            <span style={{ fontSize: "13px" }}>✓</span>
            <span style={{ color: "#34D399", fontSize: "13px", fontWeight: "600" }}>{form.broker_name}</span>
            <button onClick={() => { setBrokerVerified(false); setAuthStep("phone"); setPhone(""); setMatchedBroker(null); setBrokerId(null); setPinInput(["","","",""]); setPinError(""); setForm(p => ({ ...p, broker_name: "" })); }}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "11px", fontFamily: "inherit" }}>Switch</button>
          </div>

          {/* ═══ CLIENT DETAILS ═══ */}
          <Section title="Client Details" icon="📋" defaultOpen accent={C.cyan}>
            <div style={fieldGap}>
              <Label required>Client Name</Label>
              {inp(form.client_name, "client_name", "Full name")}
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

          {/* ═══ CLIENT STAGE ═══ */}
          <Section title="Client Stage" icon="📍" defaultOpen={true} accent={C.cyan}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {BROKER_STAGES.map(([stage, clr]) => {
                const on = form.client_stage === stage;
                return (
                  <motion.button
                    key={stage}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setForm(p => ({ ...p, client_stage: on ? "" : stage }))}
                    style={{
                      padding: "9px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: "700",
                      cursor: "pointer", fontFamily: "inherit",
                      border: on ? `1px solid ${clr}40` : `1px solid ${C.borderSubtle}`,
                      background: on ? `${clr}15` : "transparent",
                      color: on ? clr : C.text3,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {stage}
                  </motion.button>
                );
              })}
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
