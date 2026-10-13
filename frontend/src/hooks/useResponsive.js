import { useState, useEffect } from "react";

export function useResponsive() {
  const [isMobile, setMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return { isMobile };
}
