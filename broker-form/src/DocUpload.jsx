import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { SB_URL, SB_KEY } from "./supabase";

export default function DocUpload({ label, file, onUpload, onRemove, accept }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (f) => {
    if (!f) return;
    setUploading(true);
    try {
      const ext = f.name.split(".").pop();
      const path = `public/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const r = await fetch(`${SB_URL}/storage/v1/object/broker-uploads/${path}`, {
        method: "POST",
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": f.type },
        body: f,
      });
      if (!r.ok) throw new Error("Upload failed");
      const url = `${SB_URL}/storage/v1/object/public/broker-uploads/${path}`;
      const isImg = f.type.startsWith("image/");
      onUpload({ name: f.name, url, type: f.type, preview: isImg ? URL.createObjectURL(f) : null, category: label });
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  if (file) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 14px", borderRadius: "14px",
          background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)",
        }}
      >
        {file.preview ? (
          <img src={file.preview} alt={label} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📄</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#34D399" }}>{label}</div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
        </div>
        <button onClick={onRemove} style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
          borderRadius: "8px", padding: "6px 10px", fontSize: "10px", fontWeight: "700",
          color: "#EF4444", cursor: "pointer", fontFamily: "inherit",
        }}>Remove</button>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => !uploading && inputRef.current?.click()}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "14px 16px", borderRadius: "14px",
        border: "2px dashed rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
        cursor: uploading ? "wait" : "pointer",
        opacity: uploading ? 0.6 : 1,
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {uploading ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(59,130,246,0.7)" strokeWidth="2" strokeLinecap="round" style={{ animation: "docSpin 1s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.35)" }}>{uploading ? "Uploading..." : label}</div>
        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)" }}>Tap to upload</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept || "image/*,.pdf,.doc,.docx"}
        style={{ display: "none" }}
        onChange={e => { handleFile(e.target.files[0]); e.target.value = ""; }}
        disabled={uploading}
      />
      <style>{`@keyframes docSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
}
