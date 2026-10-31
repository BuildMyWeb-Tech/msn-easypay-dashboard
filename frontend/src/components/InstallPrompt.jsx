import React, { useState, useEffect } from "react";
import { Download, X, Share, Plus, Smartphone } from "lucide-react";

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible]               = useState(false);
  const [isIos, setIsIos]                   = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem("pwa-dismissed") === "1") return; } catch {}
    if (isInStandaloneMode()) return;

    const ios = isIOS();
    setIsIos(ios);

    if (ios) {
      // Show iOS instructions after a short delay
      const t = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(t);
    }

    // Android / Desktop Chrome — wait for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setVisible(false);
    if (outcome === "dismissed") {
      try { localStorage.setItem("pwa-dismissed", "1"); } catch {}
    }
  };

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem("pwa-dismissed", "1"); } catch {}
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={dismiss} style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
        zIndex: 500, animation: "fadeIn 0.2s ease",
      }} />

      {/* Modal */}
      <div style={{
        position: "fixed",
        bottom: isIos ? "calc(24px + env(safe-area-inset-bottom,0px))" : "50%",
        left: "50%",
        transform: isIos ? "translateX(-50%)" : "translate(-50%, 50%)",
        width: "min(360px, calc(100vw - 32px))",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
        zIndex: 501,
        overflow: "hidden",
        animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}>

        {/* Header red band */}
        <div style={{
          background: "var(--red)", padding: "20px 20px 16px",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/msn-logo.png" alt="EasyPay"
              style={{ width: 48, height: 48, borderRadius: 12, background: "#fff", padding: 4 }}
              onError={e => e.target.style.display = "none"} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>MSN EasyPay</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
                HR & Payroll Dashboard
              </div>
            </div>
          </div>
          <button onClick={dismiss} style={{
            background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8,
            width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff", flexShrink: 0,
          }}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 20px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
            Install on your device
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.6, marginBottom: 16 }}>
            Add EasyPay to your home screen for quick one-tap access, offline support, and a full-screen app experience.
          </div>

          {/* Benefits */}
          {[
            { icon: "⚡", text: "Instant access from home screen" },
            { icon: "📶", text: "Works offline" },
            { icon: "🖥️", text: "Full-screen, no browser bar" },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 12, color: "var(--text2)", marginBottom: 8,
            }}>
              <span style={{ fontSize: 15, width: 22, textAlign: "center", flexShrink: 0 }}>{icon}</span>
              {text}
            </div>
          ))}

          {isIos ? (
            /* iOS instructions */
            <div style={{
              marginTop: 16, background: "var(--surface2)", borderRadius: 12, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
                How to install on iPhone / iPad:
              </div>
              {[
                { num: 1, text: "Tap the Share button", icon: <Share size={14} /> },
                { num: 2, text: 'Scroll down and tap "Add to Home Screen"', icon: <Plus size={14} /> },
                { num: 3, text: "Tap Add to confirm", icon: <Smartphone size={14} /> },
              ].map(({ num, text, icon }) => (
                <div key={num} style={{
                  display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
                  fontSize: 12, color: "var(--text2)",
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "var(--red)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>{num}</div>
                  <div style={{ flex: 1 }}>{text}</div>
                  <span style={{ color: "var(--text3)" }}>{icon}</span>
                </div>
              ))}

              {/* iOS arrow pointing to share button */}
              <div style={{
                marginTop: 10, textAlign: "center", fontSize: 11,
                color: "var(--text3)", paddingBottom: 4,
              }}>
                ↓ Tap the share icon at the bottom of Safari
              </div>
            </div>
          ) : (
            /* Android / Desktop install button */
            <button onClick={install} style={{
              marginTop: 16, width: "100%", padding: "13px 0",
              background: "var(--red)", color: "#fff", border: "none", borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 14px rgba(229,57,53,0.4)",
            }}>
              <Download size={16} /> Install App
            </button>
          )}

          <button onClick={dismiss} style={{
            marginTop: 10, width: "100%", padding: "10px 0",
            background: "none", border: "1px solid var(--border)", borderRadius: 12,
            fontSize: 13, color: "var(--text3)", cursor: "pointer", fontWeight: 500,
          }}>
            Not now
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn {
          from { transform: ${isIos ? "translateX(-50%) translateY(30px)" : "translate(-50%, 50%) scale(0.92)"}; opacity: 0; }
          to   { transform: ${isIos ? "translateX(-50%) translateY(0)" : "translate(-50%, 50%) scale(1)"}; opacity: 1; }
        }
      `}</style>
    </>
  );
}
