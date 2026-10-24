import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

// Cache resolved tenants for the session so we don't re-fetch on every render
const _cache = {};

export function useTenant() {
  const { tenant }           = useParams();
  const slug                 = tenant?.toLowerCase() || "";
  const [config, setConfig]  = useState(_cache[slug] || null);
  const [loading, setLoading] = useState(!_cache[slug] && !!slug);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    if (_cache[slug]) { setConfig(_cache[slug]); return; }

    let cancelled = false;
    setLoading(true);
    api.get(`/tenants/${slug}`)
      .then(res => {
        if (cancelled) return;
        _cache[slug] = res.data.data;
        setConfig(res.data.data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug]);

  return { tenant: slug, config, loading, isValid: !!config && !notFound, notFound };
}
