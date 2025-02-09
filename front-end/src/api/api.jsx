import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;
// const apiEnv = import.meta.env.VITE_API_ENV;

export const getToken = () => localStorage.getItem("token");
export const getUserData = () => JSON.parse(localStorage.getItem("userData"));
export const getAccountData = () =>
  JSON.parse(localStorage.getItem("accountData"));
export const getRole = () => localStorage.getItem("role");

export const storeAuthData = (token, userData, accountData, role) => {
  localStorage.setItem("token", token);
  localStorage.setItem("userData", JSON.stringify(userData));
  localStorage.setItem("accountData", JSON.stringify(accountData));
  localStorage.setItem("role", role);
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userData");
  localStorage.removeItem("accountData");
  localStorage.removeItem("role");
};

const api = axios.create({
  baseURL: apiUrl,
  timeout: 50000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      logout();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Login Function
export const login = async (email, password) => {
  try {
    const response = await api.post("/users/login", { email, password });
    const userData = response.data.data;
    const token = userData.token;
    const account = response.data.account;
    const role = response.data.role;

    storeAuthData(token, userData, account, role.role_name);
    setAuthToken(token);
    return userData;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed.");
  }
};

// Logout Function
export const logout = async () => {
  try {
    await api.post("/users/logout");
    clearAuthData();
    setAuthToken(null);
  } catch (error) {
    throw new Error("Logout failed.");
  }
};

// Accounts PART
export const fetchUsersData = async () => {
  try {
    const response = await api.get("/users");
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error("Failed to fetch users data");
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const formData = new FormData();
    formData.append("account_id", getAccountData().id);
    formData.append("first_name", userData.firstName);
    formData.append("last_name", userData.lastName);
    formData.append("matricule", userData.matricule);
    formData.append("phone", userData.phone);
    formData.append("status", userData.statut);
    formData.append("email", userData.email);
    formData.append("role_id", userData.role);
    formData.append("site_id", userData.site);
    const response = await api.post("/users/add", formData);

    return response.data;
  } catch (error) {
    console.error("Failed to create user", error);
    throw error;
  }
};

export const updateUser = async (userData, userId) => {
  try {
    const response = await api.put(`/users/update/${userId}`, {
      account_id: getAccountData().id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      matricule: userData.matricule,
      phone: userData.phone,
      status: userData.statut,
      email: userData.email,
      role_id: userData.role,
      site_id: userData.site,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to update user", error);
    throw error;
  }
};

export const fetchUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    if (response && response.data.success) {
      return response.data.accounts;
    }
  } catch (error) {
    throw new error("elyass rah khassra ? ");
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/delete/${userId}`, {
      params: {
        account_id: getAccountData().id,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to delete user", error);
    throw error;
  }
};

// Sites PART
export const fetchSitesData = async () => {
  try {
    const response = await api.get("/sites");
    return response.data; // Return the entire response data
  } catch (error) {
    console.error("Failed to fetch sites data: ", error);
    throw error; // Rethrow the error for handling in the calling function
  }
};

// Reglement PART
export const fetchReglementsData = async () => {
  try {
    const response = await api.get(`/reglements`);
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch reglements data");
    throw error;
  }
};

export const fetchReglementById = async (id) => {
  try {
    const response = await api.get(`/reglements/${id}`);
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error("Failed to fetch reglement by id", error);
    throw error;
  }
};

export const fetchReglementByAdminstratifId = async (id) => {
  try {
    const response = await api.get(`/reglements/administratif/${id}`);
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch reglement by id", error);
    throw error;
  }
};

export const fetchReglementTypes = async () => {
  try {
    const response = await api.get("/reglements-types");
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch reglement types");
    throw error;
  }
};

export const fetchReglementDomains = async () => {
  try {
    const response = await api.get("/reglements-domains");
    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch reglement domains");
    throw error;
  }
};

export const fetchDomainByThemes = async (theme) => {
  try {
    const response = await api.get(`/reglements-domains/${theme}`);
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch domain by themes", error);
    throw error;
  }
};

export const createReglement = async (reglementData) => {
  try {
    const formData = new FormData();

    formData.append("account_id", getAccountData().id);
    formData.append("type_name", reglementData.type);
    formData.append("domain_name", reglementData.domain);
    formData.append("regulation_ref", reglementData.ref);
    formData.append("regulation_title", reglementData.title);
    formData.append("publication_date", reglementData.publicationDate);
    reglementData.admin_general_ids.forEach((id) => {
      formData.append("admin_general_ids[]", id);
    });
    const response = await api.post("/reglements/add", formData);

    return response.data;
  } catch (error) {
    console.error("Failed to create reglement", error);
    throw error;
  }
};

export const updateReglement = async (reglementData, reglementId) => {
  try {
    const response = await api.put(`/reglements/update/${reglementId}`, {
      account_id: getAccountData().id,
      type_name: reglementData.type,
      domain_name: reglementData.domain,
      regulation_ref: reglementData.ref,
      regulation_title: reglementData.title,
      publication_date: reglementData.publicationDate,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to update reglement", error);
    throw error;
  }
};

export const fetchCities = async () => {
  try {
    const response = await api.get("/cities");
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch cities");
    throw error;
  }
};

export const deleteReglement = async (reglementId) => {
  try {
    const response = await api.delete(`/reglements/delete/${reglementId}`, {
      params: { account_id: getAccountData().id }, // Pass account ID as a query param
    });
    console.log("Reglement deleted: ", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to delete reglement", error);
    throw error;
  }
};

export const fetchAdministratif = async () => {
  try {
    const response = await api.get("/administratif");
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch administratif");
    throw error;
  }
};

export const fetchReglementDomainsadministratif = async (administratif) => {
  try {
    const response = await api.get(`/sites/administratif/${administratif}`);
    if (response.data) {
      console.log("data dyal back", response.data.data);
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch reglement domains");
    throw error;
  }
};

export const fetchAdministratifGeneral = async () => {
  try {
    const response = await api.get("/administratifgeneral");
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch administratif general");
    throw error;
  }
};

export const fetchAdministratifGeneralByReglementId = async (reglementId) => {
  try {
    const response = await api.get(
      `/administratifgeneral/reglement/${reglementId}`
    );
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    throw error;
  }
};

export const fetchReglementDomainsadministratifDetails = async () => {
  try {
    const response = await api.get("/administratifgeneral/details");
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error("Failed to fetch administratif general details");
    throw error;
  }
};

// Exigences PART
export const fetchExigences = async (administratif, reglementId) => {
  try {
    console.log("test : ", reglementId, administratif);
    const response = await api.get(
      `/exigencies/reglements/${administratif}/${reglementId}`
    );
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    throw error;
  }
};

export const createExigence = async (exigenceData) => {
  try {
    const formData = new FormData();
    formData.append("account_id", getAccountData().id);
    formData.append("exigence_type", "Reglement");
    formData.append("reglement_id", exigenceData.reglementId);
    formData.append("exigence_content", exigenceData.content);
    formData.append("exigence_description", exigenceData.description);
    formData.append("reglement_article", exigenceData.article);
    exigenceData.admin_general_ids.forEach((id) => {
      formData.append("admin_general_ids[]", id);
    });
    const response = await api.post("/exigencies/add", formData);
    return response.data;
  } catch (error) {
    console.error("Failed to create exigence", error);
    throw error;
  }
};

export const updateExigence = async (exigenceData, exigenceId) => {
  try {
    const response = await api.put(`/exigencies/update/${exigenceId}`, {
      account_id: getAccountData().id,
      reglement_id: exigenceData.reglementid,
      exigence_content: exigenceData.content,
      exigence_description: exigenceData.description,
      reglement_article: exigenceData.article,
      exigence_type: "Reglement",
    });

    return response.data;
  } catch (error) {
    console.error("Failed to update exigence", error);
    throw error;
  }
};

export const deleteExigence = async (exigenceId) => {
  try {
    const response = await api.delete(`/exigencies/delete/${exigenceId}`, {
      params: { account_id: getAccountData().id }, // Pass account ID as a query param
    });
    console.log("Exigence deleted: ", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to delete exigence", error);
    throw error;
  }
};

export const fetchExigenceById = async (id) => {
  try {
    const response = await api.get(`/exigencies/${id}`);
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error("Failed to fetch exigence by id", error);
    throw error;
  }
};

// Norms PART
export const fetchNormsData = async () => {
  try {
    const response = await api.get(`/norms`);
    if (response.data) {
      console.log("Fetched norms data:", response.data.data);
      return response.data.data;
    } else {
      console.error("Unexpected response structure:", response);
      return []; // Return an empty array if the response is not as expected
    }
  } catch (error) {
    console.error("Failed to fetch norms data", error);
    return []; // Return an empty array on error
  }
};

export const createNorms = async (normData) => {
  try {
    const formData = new FormData();
    formData.append("account_id", getAccountData().id);
    formData.append("norm_ref", normData.ref);
    formData.append("norm_abbreviation_name", normData.abbrev);
    formData.append("norm_complet_name", normData.nom);
    formData.append("norm_version", normData.version);
    formData.append("norm_pub_date", normData.publicationDate);
    formData.append("norm_developed_with", normData.developedBy);

    const response = await api.post("/norms/add", formData);

    return response.data;
  } catch (error) {
    console.error("Failed to create norms", error);
    throw error;
  }
};

export const fetchNormById = async (NormId) => {
  try {
    const response = await api.get(`/norms/${NormId}`);
    if (response.data) {
      console.log(response.data);
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch norm by id", error);
    throw error;
  }
};

export const updateNorm = async (normData, normId) => {
  try {
    const response = await api.put(`/norms/update/${normId}`, {
      account_id: getAccountData().id,
      norm_ref: normData.ref,
      norm_abbreviation_name: normData.abbrev,
      norm_complet_name: normData.nom,
      norm_version: normData.version,
      norm_pub_date: normData.publicationDate,
      norm_developed_with: normData.developedBy,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to update norm", error);
    throw error;
  }
};

export const deleteNorm = async (normId) => {
  try {
    const response = await api.delete(`/norms/delete/${normId}`, {
      params: { account_id: getAccountData().id }, // Pass account ID as a query param
    });
    console.log("Norm deleted: ", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to delete norm", error);
    throw error;
  }
};

export const fetchNormChapitres = async (normId) => {
  try {
    const response = await api.get(`/exigencies/norms/${normId}`);

    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error("Failed to fetch chapitres", error);
    throw error;
  }
};

export const fetchApplicabilite = async () => {
  try {
    const response = await api.get("/applicability");
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch applicabilite");
    throw error;
  }
};
export const createApplicabilite = async (applicabiliteData) => {
  try {
    const formData = new FormData();
    formData.append("account_id", getAccountData().id);

    applicabiliteData.applicabilite.forEach((item) => {
      console.log("Item:", item);
      formData.append("applicabilite[]", JSON.stringify(item));
    });
    const response = await api.post("/applicability/add", formData);
    return response.data;
  } catch (error) {
    console.error("Failed to add applicabilite", error);
    throw error;
  }
};

export const fetchApplicabilityOverview = async () => {
  try {
    const response = await api.get("/applicability-overview");
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch applicabilite");
    throw error;
  }
};

export const fetchApplicabiliteByAdminstratifId = async (id) => {
  try {
    const response = await api.get(`/applicability/administratif/${id}`);
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch applicabilite by id", error);
    throw error;
  }
};

export const fetchConformiteOverview = async () => {
  try {
    const response = await api.get("/conformity-overview");
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch conformite");
    throw error;
  }
};

export const createConformite = async (conformiteData) => {
  try {
    console.log("Conformite data:", conformiteData);

    const formData = new FormData();
    formData.append("account_id", getAccountData().id);

    // Add each conformity to formData
    conformiteData.forEach((item, index) => {
      console.log("Item:", item);
      formData.append("conformity[]", JSON.stringify(item)); // Check if all fields are populated
    });

    const response = await api.post("/conformity/add", formData);

    console.log("Conformite added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to add conformite", error);
    throw error;
  }
};

export const fetchActionsByStatusOverview = async () => {
  try {
    const response = await api.get("/actions-overview/status");
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch actions");
    throw error;
  }
};

export const fetchActionsByPriorityOverview = async () => {
  try {
    const response = await api.get("/actions-overview/priority");
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    throw error;
  }
};

export const fetchConformiteByAdministration = async (administratif) => {
  try {
    const response = await api.get(
      `/conformity/for-action/by-administratif/${administratif}`
    );
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    throw error;
  }
};

export const createActions = async (actionsData) => {
  try {
    const formData = new FormData();
    formData.append("account_id", getAccountData().id);
    formData.append("actions", JSON.stringify(actionsData)); // Send the entire array as a single JSON string
    const response = await api.post("/actions/add", formData);
    return response.data;
  } catch (error) {
    console.error("Failed to add actions", error);
    throw error;
  }
};

export const fetchRoles = async () => {
  try {
    const response = await api.get("/roles");
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch roles");
    throw error;
  }
};

export const createRole = async (roleData) => {
  try {
    console.log("Role data:", roleData);
    const response = await api.post(
      "/roles/add",
      {
        role_name: roleData.roleName,
        role_description: roleData.roleDescription,
      },
      {
        account_id: getAccountData().id,
      }
    );

    if (response.data) {
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};

export const fetchActionStatus = async () => {
  try {
    const response = await api.get("/actions-status");
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};

export const fetchActionPriority = async () => {
  try {
    const response = await api.get("/actions-priority");
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (userId) => {
  try {
    const response = await api.put(`/users/password-reset/${userId}`, {
      account_id: getAccountData().id, // Pass account ID as a query param
    });
    console.log("Reset password response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to reset password:", error);
    throw error;
  }
};

export const confirmNewPassword = async (userId, data) => {
  try {
    const response = await api.put(`/users/password-confirmation/${userId}`, {
      new_password: data.new_password,
      confirm_password: data.confirm_password,
    });
    console.log("Reset password response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to reset password:", error);
    throw error;
  }
};

export const sendConsultation = async (consultationData) => {
  try {
    const formData = new FormData();
    formData.append("account_id", getAccountData().id);
    formData.append("subject", consultationData.object);
    // formData.append("consultantEmail", consultationData.consultantEmail);
    formData.append("content", consultationData.contentEmail);
    const response = await api.post("/consultation/add", formData);
    return response.data;
  } catch (error) {
    console.error("Failed to send consultation", error);
    throw error;
  }
};

export const fetchConsultations = async () => {
  try {
    const response = await api.get("/consultation");
    if (response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch consultations");
    throw error;
  }
};
