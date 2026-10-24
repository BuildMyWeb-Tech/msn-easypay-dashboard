import { useParams } from "react-router-dom";
import TENANTS from "../config/tenants";

export function useTenant() {
  const { tenant } = useParams();
  const config = tenant ? TENANTS[tenant.toLowerCase()] : null;
  return { tenant: tenant?.toLowerCase() || null, config, isValid: !!config };
}
