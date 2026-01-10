const STORAGE_KEY = "mlean_token";

const DEFAULTS = {
  LOGIN_URL:
    import.meta.env.VITE_MLEAN_LOGIN_URL || "https://partners.mlean.com/login/",
  PERIMETERS_URL:
    import.meta.env.VITE_MLEAN_PERIMETERS_URL ||
    "https://partners.mlean.com/perimeters/",
  DOCUMENTS_URL:
    import.meta.env.VITE_MLEAN_CREATE_URL ||
    "https://partners.mlean.com/documents/",
  PAPER_URL:
    import.meta.env.VITE_MLEAN_PAPER_URL ||
    "https://partners.mlean.com/paper-standards/",
  PROFILE_URL:
    import.meta.env.VITE_MLEAN_PROFILE_URL ||
    "https://partners.mlean.com/profile/",
  CREATE_DRAFT_URL:
    import.meta.env.VITE_MLEAN_CREATE_DRAFT_URL ||
    "https://partners.mlean.com/paper-standards-create-draft-login/",
  STANDARDS_BASE_URL:
    import.meta.env.VITE_MLEAN_STANDARDS_BASE_URL ||
    "https://partners.mlean.com/standards/",
  USERNAME: import.meta.env.VITE_MLEAN_USERNAME || "RKApm",
  PASSWORD: import.meta.env.VITE_MLEAN_PASSWORD || "KAmPS2025!1",
};

function extractId(obj) {
  return (
    obj?.id ??
    obj?.pk ??
    obj?.document_id ??
    obj?.paper_standard_id ??
    obj?.standard_id ??
    null
  );
}

function resolveStandardRootIdFromPaperStandard(paper) {
  const fromStandard =
    extractId(paper?.standard) ??
    (Number.isFinite(Number(paper?.standard)) ? Number(paper.standard) : null) ??
    (Number.isFinite(Number(paper?.standard_id)) ? Number(paper.standard_id) : null);

  if (fromStandard) return fromStandard;

  const fromParent =
    extractId(paper?.parent) ??
    (Number.isFinite(Number(paper?.parent)) ? Number(paper.parent) : null) ??
    (Number.isFinite(Number(paper?.parent_id)) ? Number(paper.parent_id) : null);

  if (fromParent) return fromParent;

  return extractId(paper) ?? null;
}

async function login() {
  const body = { username: DEFAULTS.USERNAME, password: DEFAULTS.PASSWORD };

  const res = await fetch(DEFAULTS.LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`mLean login failed (${res.status})`);

  const data = await res.json().catch(() => ({}));
  const token =
    data.token || data.access || data.access_token || data.key || data.bearer;

  if (!token) throw new Error("No token returned from mLean login");

  localStorage.setItem(STORAGE_KEY, token);
  return token;
}

function getStoredToken() {
  return localStorage.getItem(STORAGE_KEY) || null;
}

// ✅ FIXED: Handle 403 Token Expiration
async function fetchWithAuth(url, opts = {}, retry = true) {
  let token = getStoredToken();
  if (!token) token = await login();

  const headers = Object.assign({}, opts.headers || {}, {
    Authorization: `Bearer ${token}`,
  });

  const res = await fetch(url, Object.assign({}, opts, { headers }));

  // Check for 401 OR 403 (mLean returns 403 for expired tokens)
  if ((res.status === 401 || res.status === 403) && retry) {
    try {
      console.log("mLean Token expired (401/403), refreshing...");
      const newToken = await login();
      const headers2 = Object.assign({}, opts.headers || {}, {
        Authorization: `Bearer ${newToken}`,
      });
      return await fetch(url, Object.assign({}, opts, { headers: headers2 }));
    } catch (err) {
      console.error("Failed to refresh mLean token:", err);
      // Throw original response if refresh fails so caller handles it
      return res; 
    }
  }

  return res;
}

export async function fetchPerimeters() {
  const res = await fetchWithAuth(DEFAULTS.PERIMETERS_URL);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed fetching perimeters: ${res.status} ${txt}`);
  }
  const data = await res.json().catch(() => []);
  return data.results || data || [];
}

export async function getProfile() {
  const res = await fetchWithAuth(DEFAULTS.PROFILE_URL);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed fetching profile: ${res.status} ${txt}`);
  }
  return res.json().catch(() => ({}));
}

export async function createRemoteDocument({ name, file }) {
  const fd = new FormData();
  fd.append("name", name || file?.name || "document");
  fd.append("file", file);

  const res = await fetchWithAuth(DEFAULTS.DOCUMENTS_URL, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed create remote document: ${res.status} ${txt}`);
  }

  return res.json().catch(() => ({}));
}

export async function createOrEvolvePaperStandard({
  name,
  description = "",
  paper_standard,
  parent = null,
  perimeters = [],
  is_auditable = true,
  is_minor_version = true,
}) {
  const cleanPerimeters = (Array.isArray(perimeters) ? perimeters : [])
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (!cleanPerimeters.length) {
    throw new Error(
      "mLean validation: perimeters must contain at least 1 valid id."
    );
  }

  const ps = Number(paper_standard);
  if (!Number.isFinite(ps) || ps <= 0) {
    throw new Error(
      "mLean validation: paper_standard must be a valid document id."
    );
  }

  const body = {
    name,
    description,
    is_auditable,
    is_minor_version,
    paper_standard: ps,
    parent: parent === null || parent === undefined ? null : Number(parent),
    perimeters: cleanPerimeters,
  };

  const res = await fetchWithAuth(DEFAULTS.PAPER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed create/evolve paper standard: ${res.status} ${txt}`);
  }

  return res.json().catch(() => ({}));
}

export async function syncDocumentToMlean({
  name,
  file,
  perimeters = [],
  description = "",
} = {}) {
  if (!file) throw new Error("No file provided for mLean sync");

  const remote = await createRemoteDocument({ name, file });
  const mlean_document_id = extractId(remote);
  if (!mlean_document_id) throw new Error("mLean /documents/ did not return an id");

  const paper = await createOrEvolvePaperStandard({
    name: name || file.name,
    description,
    paper_standard: mlean_document_id,
    parent: null,
    perimeters,
    is_auditable: true,
    is_minor_version: true,
  });

  const mlean_paper_standard_id = extractId(paper);
  const mlean_standard_id = resolveStandardRootIdFromPaperStandard(paper);

  return {
    mlean_document_id,
    mlean_paper_standard_id,
    mlean_standard_id,
    remote,
    paper,
  };
}

export async function auditableUpdateViaPaperStandards({
  standardRootId,
  currentDocumentId,
  previousPaperStandardId,
  name,
  description = "",
  perimeters = [],
  is_minor_version = false,
}) {
  if (!standardRootId) throw new Error("auditableUpdateViaPaperStandards requires standardRootId");
  if (!currentDocumentId) throw new Error("auditableUpdateViaPaperStandards requires currentDocumentId");

  const parentId = previousPaperStandardId ? Number(previousPaperStandardId) : Number(standardRootId);

  const paper = await createOrEvolvePaperStandard({
    name,
    description,
    paper_standard: Number(currentDocumentId),
    parent: parentId,
    perimeters,
    is_auditable: true,
    is_minor_version,
  });

  return {
    newPaperStandard: paper,
    newPaperStandardId: extractId(paper),
    standardRootId: resolveStandardRootIdFromPaperStandard(paper) || standardRootId,
  };
}

export async function minorChangesUpdateViaPaperStandards({
  standardRootId,
  previousPaperStandardId,
  name,
  file,
  description = "",
  perimeters = [],
}) {
  if (!standardRootId) throw new Error("minorChangesUpdateViaPaperStandards requires standardRootId");
  if (!file) throw new Error("minorChangesUpdateViaPaperStandards requires file");

  const remoteDoc = await createRemoteDocument({ name, file });
  const remoteDocId = extractId(remoteDoc);
  if (!remoteDocId) throw new Error("mLean /documents/ did not return an id");

  const parentId = previousPaperStandardId ? Number(previousPaperStandardId) : Number(standardRootId);

  const paper = await createOrEvolvePaperStandard({
    name: name || file.name,
    description,
    paper_standard: Number(remoteDocId),
    parent: parentId,
    perimeters,
    is_auditable: false,
    is_minor_version: true,
  });

  return {
    remoteDoc,
    remoteDocId,
    newPaperStandard: paper,
    newPaperStandardId: extractId(paper),
    standardRootId: resolveStandardRootIdFromPaperStandard(paper) || standardRootId,
  };
}

export async function getActiveAndDraftVersion(standardRootId) {
  const url = `${DEFAULTS.STANDARDS_BASE_URL.replace(/\/+$/, "")}/${standardRootId}/active_and_draft_version/`;
  const res = await fetchWithAuth(url, { method: "GET" });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed active_and_draft_version: ${res.status} ${txt}`);
  }

  return res.json().catch(() => ({}));
}

export async function getPaperStandard(paperId) {
  const url = `${DEFAULTS.PAPER_URL.replace(/\/+$/, "")}/${paperId}/`;
  const res = await fetchWithAuth(url, { method: "GET" });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed get paper-standard ${paperId}: ${res.status} ${txt}`);
  }

  return res.json().catch(() => ({}));
}

export async function createDraftLogin(standardRootId) {
  const body = { standard: Number(standardRootId) };

  const res = await fetchWithAuth(DEFAULTS.CREATE_DRAFT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed create draft: ${res.status} ${txt}`);
  }

  return res.json().catch(() => ({}));
}

export default {
  login,
  fetchPerimeters,
  getProfile,
  createRemoteDocument,
  createOrEvolvePaperStandard,
  syncDocumentToMlean,
  auditableUpdateViaPaperStandards,
  minorChangesUpdateViaPaperStandards,
  getActiveAndDraftVersion,
  getPaperStandard,
  createDraftLogin,
};