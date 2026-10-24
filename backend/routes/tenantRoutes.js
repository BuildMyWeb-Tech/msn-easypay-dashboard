const router  = require("express").Router();
const tenants = require("../services/tenantService");

// Public — frontend fetches this to resolve a slug
router.get("/:slug", async (req, res, next) => {
  try {
    const tenant = await tenants.getBySlug(req.params.slug);
    if (!tenant) return res.status(404).json({ success: false, message: "Company not found" });
    res.json({ success: true, data: tenant });
  } catch (err) { next(err); }
});

// ── Admin endpoints (protected by ADMIN_KEY env var) ──────────
function adminAuth(req, res, next) {
  const key = process.env.ADMIN_KEY;
  if (!key) return res.status(503).json({ success: false, message: "Admin not configured (set ADMIN_KEY env var)" });
  if (req.headers["x-admin-key"] !== key)
    return res.status(401).json({ success: false, message: "Invalid admin key" });
  next();
}

// List all companies
router.get("/", adminAuth, async (req, res, next) => {
  try {
    const list = await tenants.getAll();
    res.json({ success: true, data: list });
  } catch (err) { next(err); }
});

// Add / update a company
router.post("/", adminAuth, async (req, res, next) => {
  try {
    const { slug, companyCode, companyId, companyName, logoUrl } = req.body;
    if (!slug || !companyCode || !companyId)
      return res.status(400).json({ success: false, message: "slug, companyCode and companyId are required" });
    await tenants.upsert({ slug, companyCode, companyId, companyName, logoUrl });
    const updated = await tenants.getBySlug(slug);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// Enable / disable a company
router.patch("/:slug", adminAuth, async (req, res, next) => {
  try {
    const { active } = req.body;
    await tenants.setActive(req.params.slug, active !== false);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
