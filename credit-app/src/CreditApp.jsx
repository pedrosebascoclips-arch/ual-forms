import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SB_URL, SB_KEY, headers } from "./supabase";

// Broker form URL
const BROKER_FORM_URL = "https://1278-main-9qmnh1lkf-pedrosebascoclips-6169s-projects.vercel.app";

const C = {
  bg: "#070B14",
  surface: "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.06)",
  glass: "rgba(255,255,255,0.04)",
  glassHeavy: "rgba(12,16,28,0.88)",
  input: "rgba(255,255,255,0.04)",
  borderSubtle: "rgba(255,255,255,0.06)",
  borderMedium: "rgba(255,255,255,0.10)",
  borderFocus: "rgba(59,130,246,0.40)",
  text1: "#FFFFFF",
  text2: "rgba(255,255,255,0.65)",
  text3: "rgba(255,255,255,0.30)",
  text4: "rgba(255,255,255,0.15)",
  blue: "#3B82F6",
  green: "#34D399",
  yellow: "#F59E0B",
  red: "#EF4444",
  purple: "#A78BFA",
  cyan: "#22D3EE",
};

const TEAM = ["Pedro", "Kevin", "Francisco"];
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

function Section({ title, icon, defaultOpen = true, accent, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const clr = accent || C.text3;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.borderSubtle}`, borderRadius: "18px", overflow: "hidden", marginBottom: "12px" }}>
      <button onClick={() => setOpen(p => !p)} style={{ width: "100%", padding: "16px 18px", display: "flex", alignItems: "center", gap: "10px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
        <span style={{ fontSize: "16px" }}>{icon}</span>
        <span style={{ flex: 1, fontSize: "13px", fontWeight: "700", color: clr, textTransform: "uppercase", letterSpacing: "0.8px" }}>{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ color: C.text4, fontSize: "12px", lineHeight: 1 }}>▼</motion.span>
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

const inputStyle = {
  width: "100%", padding: "14px 16px", background: C.input,
  border: `1px solid ${C.borderSubtle}`, borderRadius: "12px",
  color: C.text1, fontSize: "15px", outline: "none", fontFamily: "inherit",
  boxSizing: "border-box", WebkitAppearance: "none", minHeight: "48px",
  transition: "all 0.2s ease",
};

function Inp({ value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
      style={{ ...inputStyle, ...style }}
      onFocus={e => { e.target.style.borderColor = C.borderFocus; e.target.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.08)"; }}
      onBlur={e => { e.target.style.borderColor = C.borderSubtle; e.target.style.boxShadow = "none"; }}
    />
  );
}

function SelectInp({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, color: value ? C.text1 : C.text3, cursor: "pointer" }}
      onFocus={e => { e.target.style.borderColor = C.borderFocus; e.target.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.08)"; }}
      onBlur={e => { e.target.style.borderColor = C.borderSubtle; e.target.style.boxShadow = "none"; }}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(o => <option key={o} value={o} style={{ background: "#0E1220" }}>{o}</option>)}
    </select>
  );
}

function SSNInp({ value, onChange }) {
  const [show, setShow] = useState(false);
  const formatSSN = (raw) => {
    const d = raw.replace(/\D/g, "").slice(0, 9);
    if (d.length <= 3) return d;
    if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
  };
  return (
    <div style={{ position: "relative" }}>
      <input
        value={value}
        onChange={e => onChange(formatSSN(e.target.value))}
        placeholder="XXX-XX-XXXX"
        type={show ? "text" : "password"}
        inputMode="numeric"
        style={{ ...inputStyle, paddingRight: "58px" }}
        onFocus={e => { e.target.style.borderColor = C.borderFocus; e.target.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.08)"; }}
        onBlur={e => { e.target.style.borderColor = C.borderSubtle; e.target.style.boxShadow = "none"; }}
      />
      <button type="button" onClick={() => setShow(p => !p)}
        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.text3, cursor: "pointer", fontSize: "12px", fontFamily: "inherit", fontWeight: "600" }}>
        {show ? "HIDE" : "SHOW"}
      </button>
    </div>
  );
}

function YearsMonthsInp({ value, onChange }) {
  const parseVal = (v) => {
    const ym = /(\d+)\s*y/i.exec(v);
    const mm = /(\d+)\s*mo/i.exec(v);
    return { years: ym ? ym[1] : "", months: mm ? mm[1] : "" };
  };
  const { years, months } = parseVal(value);
  const build = (y, m) => {
    const parts = [];
    if (y !== "") parts.push(`${y} ${y === "1" ? "year" : "years"}`);
    if (m && m !== "0") parts.push(`${m} ${m === "1" ? "month" : "months"}`);
    return parts.join(" ");
  };
  const selStyle = { ...inputStyle, cursor: "pointer" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
      <select value={years} onChange={e => onChange(build(e.target.value, months))}
        style={selStyle}
        onFocus={e => { e.target.style.borderColor = C.borderFocus; e.target.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.08)"; }}
        onBlur={e => { e.target.style.borderColor = C.borderSubtle; e.target.style.boxShadow = "none"; }}>
        <option value="">Years</option>
        {Array.from({ length: 31 }, (_, i) => <option key={i} value={String(i)} style={{ background: "#0E1220" }}>{i} {i === 1 ? "yr" : "yrs"}</option>)}
      </select>
      <select value={months} onChange={e => onChange(build(years, e.target.value))}
        style={selStyle}
        onFocus={e => { e.target.style.borderColor = C.borderFocus; e.target.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.08)"; }}
        onBlur={e => { e.target.style.borderColor = C.borderSubtle; e.target.style.boxShadow = "none"; }}>
        <option value="">Months</option>
        {Array.from({ length: 12 }, (_, i) => <option key={i} value={String(i)} style={{ background: "#0E1220" }}>{i} {i === 1 ? "mo" : "mos"}</option>)}
      </select>
    </div>
  );
}

function SignaturePad({ onSave }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches ? e.touches[0] : e;
    return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setHasSig(true);
  };

  const endDraw = () => {
    if (drawing) {
      setDrawing(false);
      onSave(canvasRef.current.toDataURL());
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
    onSave("");
  };

  return (
    <div>
      <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: `1px solid ${hasSig ? "rgba(52,211,153,0.3)" : C.borderSubtle}`, background: "rgba(255,255,255,0.02)", transition: "border-color 0.2s" }}>
        <canvas
          ref={canvasRef}
          width={480}
          height={130}
          style={{ width: "100%", height: "130px", cursor: "crosshair", display: "block", touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasSig && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <span style={{ color: C.text4, fontSize: "13px" }}>✍️ Sign here with your finger or mouse</span>
          </div>
        )}
      </div>
      {hasSig && (
        <button type="button" onClick={clear}
          style={{ marginTop: "8px", background: "none", border: "none", color: C.text3, fontSize: "12px", cursor: "pointer", fontFamily: "inherit", padding: "4px 0" }}>
          Clear &amp; redo
        </button>
      )}
    </div>
  );
}

function PhoneInp({ value, onChange, placeholder }) {
  const fmt = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  };
  return <Inp value={value} onChange={v => onChange(fmt(v))} placeholder={placeholder || "305-555-1234"} type="tel" />;
}

const fld = { marginBottom: "14px" };
const row2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" };

export default function CreditApp() {
  const [brokers, setBrokers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [inviteState, setInviteState] = useState(null);

  const [f, setF] = useState({
    consultant: "",
    first_name: "", last_name: "",
    address: "", address2: "", city: "", state: "", zip: "",
    phone: "", email: "", dob: "", ssn: "",
    own_or_rent: "", time_at_address: "", monthly_rent: "",
    employer_name: "", employer_phone: "",
    employer_address: "", employer_address2: "",
    employer_city: "", employer_state: "", employer_zip: "",
    time_in_position: "", job_title: "", annual_income: "",
    signature_first: "", signature_last: "", signature_canvas: "",
  });

  const s = (key, val) => setF(p => ({ ...p, [key]: val }));

  const patchInvite = async (patch) => {
    if (!inviteState?.id) return;
    const merged = { ...inviteState, ...patch };
    await fetch(`${SB_URL}/rest/v1/credit_app_invites?id=eq.${inviteState.id}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
    });
    setInviteState(merged);
  };

  const personalDone = !!(
    f.consultant &&
    f.first_name.trim() &&
    f.last_name.trim() &&
    f.phone.trim() &&
    f.email.trim() &&
    f.dob.trim() &&
    f.ssn.trim()
  );
  const addressDone = !!(
    f.address.trim() &&
    f.city.trim() &&
    f.state &&
    f.zip.trim() &&
    f.own_or_rent &&
    f.time_at_address.trim() &&
    f.monthly_rent.trim()
  );
  const employmentDone = !!(
    f.employer_name.trim() &&
    f.employer_phone.trim() &&
    f.employer_address.trim() &&
    f.employer_city.trim() &&
    f.employer_state &&
    f.employer_zip.trim() &&
    f.time_in_position.trim() &&
    f.job_title.trim() &&
    f.annual_income.trim()
  );
  const signatureDone = !!(f.signature_first.trim() && f.signature_last.trim());

  const computedProgress = signatureDone ? 100 : employmentDone ? 75 : addressDone ? 50 : personalDone ? 25 : 0;

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${SB_URL}/rest/v1/brokers?select=name&order=name`, {
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
        });
        const data = await r.json();
        if (Array.isArray(data)) setBrokers([...TEAM, ...data.map(b => b.name)]);
        else setBrokers(TEAM);
      } catch {
        setBrokers(TEAM);
      }
    })();
  }, []);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("invite");
    if (!token) return;
    setInviteToken(token);
    (async () => {
      try {
        const r = await fetch(`${SB_URL}/rest/v1/credit_app_invites?invite_token=eq.${encodeURIComponent(token)}&select=*&limit=1`, {
          headers: headers(),
        });
        const data = await r.json();
        const invite = Array.isArray(data) ? data[0] : null;
        if (!invite) return;
        setInviteState(invite);
        if (!invite.opened_at) {
          const openedAt = new Date().toISOString();
          await fetch(`${SB_URL}/rest/v1/credit_app_invites?id=eq.${invite.id}`, {
            method: "PATCH",
            headers: headers(),
            body: JSON.stringify({ opened_at: openedAt, status: "opened", last_step: "opened", updated_at: openedAt }),
          });
          setInviteState({ ...invite, opened_at: openedAt, status: "opened", last_step: "opened" });
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!inviteState?.id) return;
    if (inviteState.submitted_at) return;
    const timer = setTimeout(async () => {
      try {
        const prev = inviteState.progress_percent || 0;
        if (computedProgress <= prev) return;
        const patch = {
          progress_percent: computedProgress,
          status: computedProgress >= 100 ? "signing_done" : "in_progress",
          last_step: computedProgress >= 100 ? "signing_done" : `${computedProgress}%`,
        };
        if (computedProgress >= 100 && !inviteState.signing_done_at) {
          patch.signing_done_at = new Date().toISOString();
        }
        await patchInvite(patch);
      } catch {}
    }, 750);
    return () => clearTimeout(timer);
  }, [computedProgress, inviteState]);

  const handleSubmit = async () => {
    if (!f.consultant) { setError("Please select your auto consultant"); return; }
    if (!f.first_name.trim() || !f.last_name.trim()) { setError("First and last name are required"); return; }
    if (!f.phone.trim()) { setError("Phone number is required"); return; }
    if (!f.ssn.trim()) { setError("Social Security # is required"); return; }
    if (!f.signature_first.trim() || !f.signature_last.trim()) { setError("Signature is required"); return; }

    setSubmitting(true); setError("");
    try {
      // Try to find matching client
      const fullName = `${f.first_name.trim()} ${f.last_name.trim()}`;
      let clientId = inviteState?.client_id || null;
      try {
        const cr = await fetch(`${SB_URL}/rest/v1/clients?or=(name.ilike.${encodeURIComponent(fullName)},phone.eq.${encodeURIComponent(f.phone.trim())})&select=id,name,phone&limit=5`, {
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
        });
        const matches = await cr.json();
        if (Array.isArray(matches) && matches.length > 0) {
          // prefer exact name match
          const exact = matches.find(c => c.name.toLowerCase() === fullName.toLowerCase());
          clientId = exact ? exact.id : matches[0].id;
        }
      } catch {}

      const r = await fetch(`${SB_URL}/rest/v1/credit_apps`, {
        method: "POST", headers: headers(),
        body: JSON.stringify({
          consultant: f.consultant,
          first_name: f.first_name.trim(), last_name: f.last_name.trim(),
          address: f.address.trim(), address2: f.address2.trim(), city: f.city.trim(), state: f.state, zip: f.zip.trim(),
          phone: f.phone.trim(), email: f.email.trim(), dob: f.dob.trim(), ssn: f.ssn.trim(),
          own_or_rent: f.own_or_rent, time_at_address: f.time_at_address.trim(), monthly_rent: f.monthly_rent.trim(),
          employer_name: f.employer_name.trim(), employer_phone: f.employer_phone.trim(),
          employer_address: f.employer_address.trim(), employer_address2: f.employer_address2.trim(),
          employer_city: f.employer_city.trim(), employer_state: f.employer_state, employer_zip: f.employer_zip.trim(),
          time_in_position: f.time_in_position.trim(), job_title: f.job_title.trim(), annual_income: f.annual_income.trim(),
          signature_first: f.signature_first.trim(), signature_last: f.signature_last.trim(),
          signature_canvas: f.signature_canvas || null,
          client_id: clientId,
        }),
      });
      if (!r.ok) throw new Error("Submit failed");
      const inserted = await r.json();
      const creditAppId = Array.isArray(inserted) ? inserted[0]?.id : null;
      if (inviteState?.id) {
        const submittedAt = new Date().toISOString();
        await patchInvite({
          submitted_at: submittedAt,
          status: "submitted",
          progress_percent: 100,
          last_step: "submitted",
          credit_app_id: creditAppId || inviteState.credit_app_id || null,
        });
      }
      setDone(true);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ═══ SUCCESS ═══
  if (done) return (
    <div style={{ minHeight: "100dvh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Inter',-apple-system,sans-serif", overflow: "hidden", position: "relative" }}>
      {/* Background glow */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "500px", height: "300px", background: "radial-gradient(ellipse, rgba(52,211,153,0.07), transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.4,0,0.2,1] }}
        style={{ textAlign: "center", maxWidth: "420px", width: "100%", position: "relative", zIndex: 1 }}>

        {/* Success image */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
          style={{ marginBottom: "28px" }}>
          <img
            src="/success.png"
            alt="Approved"
            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
            style={{ width: "100%", maxWidth: "320px", height: "auto", borderRadius: "20px", objectFit: "cover", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
          />
          {/* Fallback checkmark if no image */}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={{ display: "none", width: "88px", height: "88px", borderRadius: "50%", background: "rgba(52,211,153,0.08)", border: "2px solid rgba(52,211,153,0.25)", margin: "0 auto", alignItems: "center", justifyContent: "center", fontSize: "38px" }}>✓</motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
          <h2 style={{ color: C.text1, fontSize: "28px", fontWeight: "800", margin: "0 0 10px", letterSpacing: "-0.5px" }}>
            You're All Set! 🎉
          </h2>
          <p style={{ color: C.text2, fontSize: "15px", lineHeight: 1.7, margin: "0 0 6px" }}>
            Your credit application has been submitted successfully.
          </p>
          <p style={{ color: C.text3, fontSize: "14px", lineHeight: 1.6, margin: "0 0 32px" }}>
            <strong style={{ color: C.text2 }}>{f.consultant}</strong> will be in touch with you shortly to get you behind the wheel.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => {
            setDone(false);
            setF({ consultant: "", first_name: "", last_name: "", address: "", address2: "", city: "", state: "", zip: "", phone: "", email: "", dob: "", ssn: "", own_or_rent: "", time_at_address: "", monthly_rent: "", employer_name: "", employer_phone: "", employer_address: "", employer_address2: "", employer_city: "", employer_state: "", employer_zip: "", time_in_position: "", job_title: "", annual_income: "", signature_first: "", signature_last: "", signature_canvas: "" });
          }} style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "12px", padding: "14px 24px", color: C.blue, fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
            Submit Another Application
          </motion.button>
          <a href={BROKER_FORM_URL} style={{ color: C.text4, fontSize: "13px", fontWeight: "600", textDecoration: "none", padding: "8px" }}>
            ← Back to Broker Form
          </a>
        </motion.div>
      </motion.div>
    </div>
  );

  // ═══ FORM ═══
  return (
    <div style={{ minHeight: "100dvh", background: C.bg, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", padding: "20px 16px 40px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "5%", left: "10%", width: "80%", height: "50%", background: "radial-gradient(ellipse,rgba(59,130,246,0.04),transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: "50%", height: "40%", background: "radial-gradient(ellipse,rgba(167,139,250,0.03),transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: "520px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Back link */}
        <a href={BROKER_FORM_URL} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: C.text4, textDecoration: "none", marginBottom: "16px", paddingTop: "4px" }}>
          ← Broker Form
        </a>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 8px", letterSpacing: "-0.5px", background: "linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>UAL Credit Application</h1>
            <p style={{ fontSize: "14px", color: C.text3, margin: 0, lineHeight: 1.6 }}>
              You're one step closer to driving your brand new car.<br />
              Please fill out the information below so we can start working on your approval.
            </p>
          </motion.div>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
            style={{ height: "1px", margin: "20px auto 0", width: "60%", background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent)" }} />
        </div>

        {/* Form card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          style={{ background: C.glass, backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "20px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)" }}>

          {inviteToken && (
            <div style={{ marginBottom: "14px", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(59,130,246,0.22)", background: "rgba(59,130,246,0.08)", fontSize: "12px", color: C.text2 }}>
              Tracked link active{inviteState?.status ? ` · ${inviteState.status.replace("_", " ")}` : ""}
            </div>
          )}

          {/* Consultant */}
          <div style={{ ...fld, marginBottom: "20px", padding: "16px", background: "rgba(59,130,246,0.04)", borderRadius: "14px", border: "1px solid rgba(59,130,246,0.1)" }}>
            <Label required>Who's Your Auto Consultant?</Label>
            <SelectInp value={f.consultant} onChange={v => s("consultant", v)} options={[...new Set(brokers)]} placeholder="Select a consultant" />
          </div>

          {/* Personal Info */}
          <Section title="Personal Information" icon="👤" defaultOpen accent={C.blue}>
            <div style={row2}>
              <div><Label required>First Name</Label><Inp value={f.first_name} onChange={v => s("first_name", v)} placeholder="John" /></div>
              <div><Label required>Last Name</Label><Inp value={f.last_name} onChange={v => s("last_name", v)} placeholder="Smith" /></div>
            </div>
            <div style={fld}><Label required>Phone</Label><PhoneInp value={f.phone} onChange={v => s("phone", v)} /></div>
            <div style={fld}><Label required>Email Address</Label><Inp value={f.email} onChange={v => s("email", v)} placeholder="john@email.com" type="email" /></div>
            <div style={row2}>
              <div><Label required>Date of Birth</Label><Inp value={f.dob} onChange={v => s("dob", v)} placeholder="MM/DD/YYYY" /></div>
              <div><Label required>Social Security #</Label><SSNInp value={f.ssn} onChange={v => s("ssn", v)} /></div>
            </div>
          </Section>

          {/* Address */}
          <Section title="Current Address" icon="🏠" defaultOpen accent={C.cyan}>
            <div style={fld}><Label required>Address Line 1</Label><Inp value={f.address} onChange={v => s("address", v)} placeholder="123 Main St" /></div>
            <div style={fld}><Label>Address Line 2</Label><Inp value={f.address2} onChange={v => s("address2", v)} placeholder="Apt, Suite, etc." /></div>
            <div style={row2}>
              <div><Label required>City</Label><Inp value={f.city} onChange={v => s("city", v)} placeholder="Miami" /></div>
              <div><Label required>State</Label><SelectInp value={f.state} onChange={v => s("state", v)} options={US_STATES} placeholder="State" /></div>
            </div>
            <div style={fld}><Label required>ZIP Code</Label><Inp value={f.zip} onChange={v => s("zip", v.replace(/\D/g, "").slice(0, 5))} placeholder="33101" /></div>
            <div style={{ marginBottom: "14px" }}>
              <Label required>Own or Rent?</Label>
              <div style={{ display: "flex", gap: "8px", background: C.input, borderRadius: "12px", border: `1px solid ${C.borderSubtle}`, padding: "4px" }}>
                {["Own", "Rent"].map(opt => {
                  const on = f.own_or_rent === opt;
                  return (
                    <motion.button key={opt} whileTap={{ scale: 0.96 }} onClick={() => s("own_or_rent", opt)} style={{ flex: 1, padding: "12px 8px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", border: "none", background: on ? C.surfaceHover : "transparent", color: on ? C.blue : C.text3, transition: "all 0.2s ease" }}>{opt}</motion.button>
                  );
                })}
              </div>
            </div>
            <div style={{ ...fld }}>
              <Label required>How Long at Address?</Label>
              <YearsMonthsInp value={f.time_at_address} onChange={v => s("time_at_address", v)} />
            </div>
            <div style={fld}><Label required>Monthly Rent/Mortgage</Label><Inp value={f.monthly_rent} onChange={v => s("monthly_rent", v)} placeholder="e.g. $1,200" /></div>
          </Section>

          {/* Employment */}
          <Section title="Employment" icon="💼" defaultOpen accent={C.purple}>
            <div style={fld}><Label required>Employer / Company Name</Label><Inp value={f.employer_name} onChange={v => s("employer_name", v)} placeholder="Company name" /></div>
            <div style={fld}><Label required>Employer Phone Number</Label><PhoneInp value={f.employer_phone} onChange={v => s("employer_phone", v)} /></div>
            <div style={fld}><Label required>Employer Address Line 1</Label><Inp value={f.employer_address} onChange={v => s("employer_address", v)} placeholder="123 Business Ave" /></div>
            <div style={fld}><Label>Employer Address Line 2</Label><Inp value={f.employer_address2} onChange={v => s("employer_address2", v)} placeholder="Suite, Floor, etc." /></div>
            <div style={row2}>
              <div><Label required>City</Label><Inp value={f.employer_city} onChange={v => s("employer_city", v)} placeholder="City" /></div>
              <div><Label required>State</Label><SelectInp value={f.employer_state} onChange={v => s("employer_state", v)} options={US_STATES} placeholder="State" /></div>
            </div>
            <div style={fld}><Label required>ZIP Code</Label><Inp value={f.employer_zip} onChange={v => s("employer_zip", v.replace(/\D/g, "").slice(0, 5))} placeholder="33101" /></div>
            <div style={{ ...fld }}>
              <Label required>Time in Position</Label>
              <YearsMonthsInp value={f.time_in_position} onChange={v => s("time_in_position", v)} />
            </div>
            <div style={fld}><Label required>Position / Job Title</Label><Inp value={f.job_title} onChange={v => s("job_title", v)} placeholder="e.g. Manager" /></div>
            <div style={fld}><Label required>Gross Annual Income / Salary</Label><Inp value={f.annual_income} onChange={v => s("annual_income", v)} placeholder="e.g. $55,000" /></div>
          </Section>

          {/* Signature */}
          <Section title="Signature" icon="✍️" defaultOpen accent={C.green}>
            <p style={{ fontSize: "13px", color: C.text3, marginBottom: "14px", lineHeight: 1.5 }}>
              Draw your signature below using your finger or mouse, then type your name to confirm.
            </p>
            <div style={{ marginBottom: "14px" }}>
              <Label required>Draw Signature</Label>
              <SignaturePad onSave={v => s("signature_canvas", v)} />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <Label required>Type Full Name to Confirm</Label>
              <div style={row2}>
                <div><Inp value={f.signature_first} onChange={v => s("signature_first", v)} placeholder="First name" /></div>
                <div><Inp value={f.signature_last} onChange={v => s("signature_last", v)} placeholder="Last name" /></div>
              </div>
            </div>
            {f.signature_first && f.signature_last && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ padding: "14px", borderRadius: "12px", background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.12)", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: C.text4, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>Name Confirmed</div>
                <div style={{ fontSize: "18px", color: C.green, fontStyle: "italic", fontWeight: "300" }}>
                  {f.signature_first} {f.signature_last}
                </div>
              </motion.div>
            )}
          </Section>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", color: C.red, fontWeight: "600", marginBottom: "14px", textAlign: "center" }}>{error}</motion.div>
            )}
          </AnimatePresence>

          {/* Disclaimer */}
          <p style={{ fontSize: "11px", color: C.text4, lineHeight: 1.6, marginBottom: "16px", textAlign: "center" }}>
            By submitting this form you authorize Ultimate Auto Lease to process your credit application.
          </p>

          {/* Submit */}
          <motion.button whileHover={{ scale: 1.01, boxShadow: "0 6px 30px rgba(59,130,246,0.35)" }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit} disabled={submitting}
            style={{ width: "100%", background: `linear-gradient(135deg, ${C.blue}, #2563EB)`, border: "none", borderRadius: "14px", padding: "18px", fontSize: "16px", fontWeight: "700", color: "#fff", cursor: submitting ? "wait" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 24px rgba(59,130,246,0.25)", opacity: submitting ? 0.7 : 1, minHeight: "56px", transition: "opacity 0.2s ease" }}>
            {submitting ? "Submitting..." : "Submit Application →"}
          </motion.button>
        </motion.div>

        <p style={{ textAlign: "center", fontSize: "11px", color: C.text4, marginTop: "20px", fontWeight: "500" }}>
          Ultimate Auto Lease · Credit Application
        </p>
      </div>
    </div>
  );
}
