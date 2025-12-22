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
  USERNAME: import.meta.env.VITE_MLEAN_USERNAME || "RKApm",
  PASSWORD: import.meta.env.VITE_MLEAN_PASSWORD || "KAmPS2025!",
};

async function login() {
  const body = { username: DEFAULTS.USERNAME, password: DEFAULTS.PASSWORD };
  const res = await fetch(DEFAULTS.LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Mlean login failed (${res.status})`);
  const data = await res.json().catch(() => ({}));
  const token =
    data.token || data.access || data.access_token || data.key || data.bearer;
  if (!token) throw new Error("No token returned from Mlean login");
  localStorage.setItem(STORAGE_KEY, token);
  return token;
}

function getStoredToken() {
  return localStorage.getItem(STORAGE_KEY) || null;
}

async function fetchWithAuth(url, opts = {}, retry = true) {
  let token = getStoredToken();
  if (!token) {
    token = await login();
  }
  const headers = Object.assign({}, opts.headers || {}, {
    Authorization: `Bearer ${token}`,
  });
  const res = await fetch(url, Object.assign({}, opts, { headers }));
  if (res.status === 401 && retry) {
    try {
      const newToken = await login();
      const headers2 = Object.assign({}, opts.headers || {}, {
        Authorization: `Bearer ${newToken}`,
      });
      return fetch(url, Object.assign({}, opts, { headers: headers2 }));
    } catch (e) {
      throw e;
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

export async function createRemoteDocument({ name, file }) {
  const fd = new FormData();
  fd.append("name", name || file.name || "document");
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

export async function createPaperStandard({
  name,
  paper_standard,
  perimeters = [],
}) {
  const body = { is_auditable: true, name, paper_standard, perimeters };
  const res = await fetchWithAuth(DEFAULTS.PAPER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed create paper standard: ${res.status} ${txt}`);
  }
  return res.json().catch(() => ({}));
}

export async function syncDocumentToMlean({
  name,
  file,
  perimeters = [],
} = {}) {
  if (!file) throw new Error("No file provided for mlean sync");
  const doc = await createRemoteDocument({ name, file });
  const id = doc.id || doc.pk || doc.document_id;
  if (!id) return { remote: doc, paper: null };
  const paper = await createPaperStandard({
    name: name || file.name,
    paper_standard: id,
    perimeters,
  });
  return { remote: doc, paper };
}

export default {
  login,
  fetchPerimeters,
  createRemoteDocument,
  createPaperStandard,
  syncDocumentToMlean,
};
