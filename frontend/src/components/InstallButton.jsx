import React, { useState, useEffect } from "react";
import { Download, Share, Plus, Smartphone, X } from "lucide-react";

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}
function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installing, setInstalling]         = useState(false);
  const [showModal, setShowModal]           = useState(false);
  const [ios]                               = useState(isIOS);

  useEffect(() => {
    if (isStandalone()) return;
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Don't show if already running as installed PWA
  if (isStandalone()) return null;

  const handleButtonClick = async () => {
    if (deferredPrompt) {
      // Chrome/Android: trigger native prompt directly
      setInstalling(true);
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setInstalling(false);
    } else {
      // No native prompt (iOS or already dismissed): show instruction modal
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Corner button — always visible */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={installing}
        style={{
          position: "fixed", top: 16, right: 16, zIndex: 1000,
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 18px",
          background: "#fff",
          color: "var(--primary)",
          border: "1.5px solid var(--primary)",
          borderRadius: 8,
          fontSize: 14, fontWeight: 700,
          cursor: installing ? "default" : "pointer",
          opacity: installing ? 0.7 : 1,
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          transition: "opacity .15s",
          whiteSpace: "nowrap",
        }}>
        <Download size={15} />
        {installing ? "Installing…" : "Install App"}
      </button>

      {/* Instruction modal for iOS or when native prompt unavailable */}
      {showModal && (
        <>
          <div onClick={() => setShowModal(false)} style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)",
            zIndex: 1001,
          }} />
          <div style={{
            position: "fixed", zIndex: 1002,
            bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
            left: "50%", transform: "translateX(-50%)",
            width: "min(360px, calc(100vw - 32px))",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              background: "var(--primary)", padding: "16px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img src="/msn-logo.png" alt=""
                  style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", padding: 3 }}
                  onError={e => e.target.style.display = "none"} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>MSN EasyPay</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>HR &amp; Payroll Dashboard</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8,
                width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff", flexShrink: 0,
              }}>
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "16px 20px 20px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                Install on your device
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.6, marginBottom: 14 }}>
                Add EasyPay to your home screen for quick one-tap access and a full-screen experience.
              </div>

              {/* Steps */}
              <div style={{ background: "var(--bg)", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                  {ios ? "How to install on iPhone / iPad:" : "How to install on Android:"}
                </div>
                {(ios ? [
                  { n: 1, icon: <Share size={13} />,      text: 'Tap the Share button at the bottom of Safari' },
                  { n: 2, icon: <Plus size={13} />,       text: 'Tap "Add to Home Screen"' },
                  { n: 3, icon: <Smartphone size={13} />, text: 'Tap "Add" to confirm' },
                ] : [
                  { n: 1, icon: <span style={{fontSize:13}}>⋮</span>, text: 'Tap the 3-dot menu in Chrome' },
                  { n: 2, icon: <Download size={13} />,               text: 'Tap "Add to Home screen" or "Install app"' },
                  { n: 3, icon: <Smartphone size={13} />,             text: 'Tap "Add" / "Install" to confirm' },
                ]).map(({ n, icon, text }) => (
                  <div key={n} style={{
                    display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8,
                    fontSize: 12, color: "var(--text2)",
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "var(--primary)", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
                    }}>{n}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                      <span style={{ color: "var(--text3)", flexShrink: 0 }}>{icon}</span>
                      {text}
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowModal(false)} style={{
                marginTop: 12, width: "100%", padding: "10px 0",
                background: "none", border: "1px solid var(--border)", borderRadius: 10,
                fontSize: 13, color: "var(--text3)", cursor: "pointer", fontWeight: 500,
              }}>
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
