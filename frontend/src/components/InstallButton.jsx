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

  if (isStandalone()) return null;

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstalling(false);
    setShowModal(false);
  };

  // Corner button click:
  // - Android + prompt ready  → install directly (no popup)
  // - Android + no prompt     → show modal with manual steps
  // - iOS                     → show modal with Safari steps
  const handleCornerClick = () => {
    if (!ios && deferredPrompt) {
      triggerInstall();
    } else {
      setShowModal(true);
    }
  };

  const iosSteps = [
    { n: 1, icon: <Share size={14} />,      text: 'Tap the Share button at the bottom of Safari' },
    { n: 2, icon: <Plus size={14} />,       text: 'Scroll and tap "Add to Home Screen"' },
    { n: 3, icon: <Smartphone size={14} />, text: 'Tap "Add" to confirm' },
  ];
  const androidSteps = [
    { n: 1, icon: <span style={{ fontSize: 16, lineHeight: 1 }}>⋮</span>, text: 'Tap the 3-dot menu (⋮) in Chrome top-right' },
    { n: 2, icon: <Download size={14} />,                                  text: 'Tap "Add to Home screen" or "Install app"' },
    { n: 3, icon: <Smartphone size={14} />,                                text: 'Tap "Add" or "Install" to confirm' },
  ];

  return (
    <>
      {/* ── Corner button — always visible ── */}
      <button
        type="button"
        onClick={handleCornerClick}
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
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          whiteSpace: "nowrap",
          opacity: installing ? 0.75 : 1,
        }}>
        <Download size={15} />
        {installing ? "Installing…" : "Install App"}
      </button>

      {/* ── Modal — only shown for iOS or when no native prompt ── */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 1001,
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)",
            }}
          />

          {/* Sheet */}
          <div style={{
            position: "fixed", zIndex: 1002,
            bottom: "env(safe-area-inset-bottom, 0px)",
            left: 0, right: 0,
            background: "var(--surface)",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.22)",
            overflow: "hidden",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>

            {/* Red header */}
            <div style={{
              background: "var(--primary)", padding: "18px 20px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img src="/msn-logo.png" alt=""
                  style={{ width: 44, height: 44, borderRadius: 10, background: "#fff", padding: 4 }}
                  onError={e => e.target.style.display = "none"} />
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>MSN EasyPay</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>HR &amp; Payroll Dashboard</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8,
                width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff", flexShrink: 0,
              }}>
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 20px 32px" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
                Install on your device
              </div>
              <div style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6, marginBottom: 20 }}>
                Add EasyPay to your home screen for quick one-tap access and a full-screen app experience.
              </div>

              {/* Steps */}
              <div style={{ background: "var(--bg)", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
                  {ios ? "How to install on iPhone / iPad:" : "How to install on Android Chrome:"}
                </div>

                {(ios ? iosSteps : androidSteps).map(({ n, icon, text }) => (
                  <div key={n} style={{
                    display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12,
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: "var(--primary)", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800,
                    }}>{n}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, paddingTop: 2 }}>
                      <span style={{ color: "var(--text3)", flexShrink: 0 }}>{icon}</span>
                      <span style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.4 }}>{text}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  marginTop: 14, width: "100%", padding: "12px 0",
                  background: "none", border: "1.5px solid var(--border)", borderRadius: 12,
                  fontSize: 14, color: "var(--text3)", cursor: "pointer", fontWeight: 600,
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
