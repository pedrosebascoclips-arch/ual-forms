import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SB_URL, SB_KEY } from "./supabase";

const UploadIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(59,130,246,0.8)" strokeWidth="2" strokeLinecap="round" style={{ animation: "fupSpin 1s linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default function FileUpload({ files, setFiles }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const addInputRef = useRef(null);

  const uploadOne = async (file) => {
    const ext = file.name.split(".").pop();
    const path = `public/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const r = await fetch(`${SB_URL}/storage/v1/object/broker-uploads/${path}`, {
      method: "POST",
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": file.type },
      body: file,
    });
    if (!r.ok) throw new Error("Upload failed");
    const url = `${SB_URL}/storage/v1/object/public/broker-uploads/${path}`;
    return {
      name: file.name,
      url,
      path,
      type: file.type,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    };
  };

  const handleFiles = useCallback(async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError("");
    const arr = Array.from(fileList);
    const results = [];
    for (let i = 0; i < arr.length; i++) {
      setUploadProgress(`Uploading ${i + 1} of ${arr.length}...`);
      try {
        const result = await uploadOne(arr[i]);
        results.push(result);
      } catch {
        setError(`Failed to upload ${arr[i].name}`);
      }
    }
    if (results.length > 0) setFiles(prev => [...prev, ...results]);
    setUploading(false);
    setUploadProgress("");
  }, [setFiles]);

  const removeFile = (idx) => {
    setFiles(prev => {
      const removed = prev[idx];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); };
  const onDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); handleFiles(e.dataTransfer.files); };

  const hasFiles = files.length > 0;

  return (
    <div>
      <style>{`@keyframes fupSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Drop zone -- shown when no files yet or always as background */}
      {!hasFiles && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragEnter={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          style={{
            border: dragOver ? "2px solid rgba(59,130,246,0.6)" : "2px dashed rgba(255,255,255,0.1)",
            borderRadius: "18px",
            padding: "36px 20px",
            textAlign: "center",
            cursor: uploading ? "wait" : "pointer",
            background: dragOver ? "rgba(59,130,246,0.06)" : "rgba(255,255,255,0.02)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            transition: "all 0.25s ease",
            minHeight: "160px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {uploading ? (
            <>
              <SpinnerIcon />
              <div style={{ fontSize: "14px", fontWeight: "600", color: "rgba(255,255,255,0.5)" }}>{uploadProgress}</div>
            </>
          ) : (
            <>
              <motion.div
                animate={dragOver ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <UploadIcon />
              </motion.div>
              <div style={{ fontSize: "15px", fontWeight: "600", color: dragOver ? "#3B82F6" : "rgba(255,255,255,0.45)" }}>
                Tap to add photos or files
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.18)" }}>
                or drag and drop here
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            style={{ display: "none" }}
            onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
            disabled={uploading}
          />
        </motion.div>
      )}

      {/* Thumbnail grid */}
      {hasFiles && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: hasFiles && !uploading ? 0 : "10px" }}
          onDragOver={onDragOver}
          onDragEnter={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <AnimatePresence>
            {files.map((f, i) => (
              <motion.div
                key={f.url || i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{
                  position: "relative",
                  width: "80px", height: "80px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  flexShrink: 0,
                }}
              >
                {f.preview ? (
                  <img src={f.preview} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: "3px" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span style={{ fontSize: "8px", fontWeight: "700", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {f.name.split(".").pop()}
                    </span>
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  style={{
                    position: "absolute", top: "4px", right: "4px",
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff", fontSize: "12px", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    lineHeight: 1, fontWeight: "600",
                  }}
                >×</button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add more button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => !uploading && addInputRef.current?.click()}
            style={{
              width: "80px", height: "80px",
              borderRadius: "14px",
              border: "2px dashed rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: uploading ? "wait" : "pointer",
              background: "rgba(255,255,255,0.02)",
              flexShrink: 0,
              transition: "border-color 0.2s",
            }}
          >
            {uploading ? (
              <SpinnerIcon />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
            <input
              ref={addInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
              disabled={uploading}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Upload progress bar for when files exist */}
      {uploading && hasFiles && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginTop: "8px", fontSize: "12px", fontWeight: "600", color: "rgba(59,130,246,0.7)", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <SpinnerIcon />
          {uploadProgress}
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: "8px", fontSize: "12px", fontWeight: "600", color: "#EF4444", background: "rgba(239,68,68,0.08)", padding: "8px 12px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
