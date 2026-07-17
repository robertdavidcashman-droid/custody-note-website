import releasesData from "../../data/releases.json";

export const SUPPORT_EMAIL = "support@custodynote.com";

export const APP_VERSION =
  (releasesData && typeof releasesData.version === "string" && releasesData.version) ||
  "1.9.52";

export const DOWNLOAD_URL = "/download";
