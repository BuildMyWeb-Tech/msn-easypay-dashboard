import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

// Shows an "Add to Home Screen" banner when the browser fires beforeinstallprompt
export default function InstallPrompt() {
  const [prompt, setPrompt]     = useState(null);
  const [visible, setVisible]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    try {
      if (localStorage.getItem("pwa-dismissed") === "1") return;
    } catch {}
    // Already running in standalone (installed)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setVisible(false);
    if (outcome === "dismissed") {
      try { localStorage.setItem("pwa-dismissed", "1"); } catch {}
    }
  };

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    try { localStorage.setItem("pwa-dismissed", "1"); } catch {}
  };

  if (!visible || dismissed) return null;

  return (
    <div style={{
      position: "fixed", bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
      left: 16, right: 16, zIndex: 400,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      animation: "slideUp 0.3s ease",
    }}>
      <img src="/msn-logo.png" alt="" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }}
        onError={e => e.target.style.display = "none"} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
          Install EasyPay
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>
          Add to your home screen for quick access
        </div>
      </div>
      <button onClick={install} className="btn btn-primary btn-sm"
        style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
        <Download size={13} /> Install
      </button>
      <button onClick={dismiss} style={{
        background: "none", border: "none", color: "var(--text3)",
        padding: 4, display: "flex", flexShrink: 0, cursor: "pointer",
      }}>
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
