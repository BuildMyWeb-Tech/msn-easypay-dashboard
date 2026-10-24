// Multi-tenant config — add a new entry for each company
// slug must match the URL path segment: /omtex, /kct, etc.
const TENANTS = {
  omtex: {
    slug:        "omtex",
    companyCode: "5146688",
    companyId:   50,
    name:        "OM Textiles",
    logo:        "/msn-logo.png",
  },
  // Add more companies here:
  // kct: {
  //   slug:        "kct",
  //   companyCode: "KCTCODE",
  //   companyId:   51,
  //   name:        "KCT Company",
  //   logo:        "/msn-logo.png",
  // },
};

export default TENANTS;
