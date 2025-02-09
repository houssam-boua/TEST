import axios from "axios";

export let token = localStorage.getItem("token");
export let userData = JSON.parse(localStorage.getItem("userData"));
export let accountData = JSON.parse(localStorage.getItem("accountData"));
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 50000,
  withCredentials: true,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, password) => {
  try {
    const response = await api.post("/users/login", { email, password });
    if (response && response.data && response.data.success) {
      const newUserData = response.data.data;
      const newToken = newUserData.token;
      const newAccountData = response.data.account;
      localStorage.setItem("token", newToken);
      localStorage.setItem("userData", JSON.stringify(newUserData));
      localStorage.setItem("accountData", JSON.stringify(newAccountData));
      token = newToken;
      userData = newUserData;
      accountData = newAccountData;
      console.log(
        "token : ",
        token,
        "userData : ",
        userData,
        "accountData: ",
        accountData
      );
      if (localStorage.getItem("userData")) {
        userData = JSON.parse(localStorage.getItem("userData"));
      } else {
        userData = null;
      }
      setAuthToken(newToken); // Update the header with the new token
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error("Login failed:", error.message);
    throw new Error(error.message);
  }
};

export const logout = async () => {
  try {
    token = null;
    userData = null;
    localStorage.removeItem("token");
    localStorage.removeItem("userData");

    setAuthToken(null);
  } catch (error) {
    console.error("Logout failed:", error.message);
    throw new Error(error.message);
  }
};

export const fetchUsersData = async () => {
  try {
    const response = await api.get("/users");
    if (response && response.data) {
      return response.data.accounts;
    }
  } catch (error) {
    console.error("Failed to ffetch users data");
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const formData = new FormData();
    formData.append("image", userData.image);
    formData.append("first_name", userData.firstName);
    formData.append("last_name", userData.lastName);
    formData.append("cin", userData.cin);
    formData.append("birthday", userData.birthday);
    formData.append("gender", userData.gender);
    formData.append("phone", userData.phone);
    formData.append("username", userData.username);
    formData.append("civility", userData.role);
    formData.append("address", userData.address);
    formData.append("city", userData.city);
    formData.append("status", userData.statut);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("role_name", userData.role);
    formData.append("site_id", userData.site);

    const response = await api.post("/users/add", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Course created: ", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to create user", error);
    throw error;
  }
};

export const updateUser = async (userData, userId) => {
  try {
    const formData = new FormData();
    formData.append("image", userData.image);
    formData.append("first_name", userData.firstName);
    formData.append("last_name", userData.lastName);
    formData.append("cin", userData.cin);
    formData.append("birthday", userData.birthday);
    formData.append("gender", userData.gender);
    formData.append("phone", userData.phone);
    formData.append("username", userData.username);
    formData.append("civility", userData.role);
    formData.append("address", userData.address);
    formData.append("city", userData.city);
    formData.append("status", userData.statut);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("role_name", userData.role_name);

    const response = await api.put(`/users/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("User updated: ", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to update user", error);
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

//

// Reglement PART

export const fetchReglementsData = async () => {
  try {
    const response = await api.get("/reglements");
    if (response && response.data) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch reglements data");
    throw error;
  }
};

export const fetchReglementTypes = async () => {
  try {
    const response = await api.get("/reglements-types");
    if (response.data.success && response.data.flag === 200) {
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
    if (response.data.success && response.data.flag === 200) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch reglement domains");
    throw error;
  }
};

export const createReglement = async (reglementData) => {
  try {
    console.log("accounrData", accountData);
    const formData = new FormData();
    formData.append("account_id", accountData.id);
    formData.append("type_id", reglementData.type);
    formData.append("domain_id", reglementData.domain);
    formData.append("regulation_ref", reglementData.ref);
    formData.append("regulation_title", reglementData.title);
    formData.append("regulation_version", reglementData.version);
    formData.append("publication_date", reglementData.publicationDate);
    formData.append("published_by", reglementData.publishedBy);
    formData.append("regulation_status", reglementData.status);
    console.log("formData", formData);
    const response = await api.post("/reglements/add", formData);

    return response.data;
  } catch (error) {
    console.error("Failed to create reglement", error);
    throw error;
  }
};

export const updateReglement = async (reglementData, reglementId) => {
  try {
    const formData = new FormData();
    formData.append("type_id", reglementData.type);
    formData.append("domain_id", reglementData.domain);
    formData.append("regulation_ref", reglementData.ref);
    formData.append("regulation_title", reglementData.title);
    formData.append("regulation_version", reglementData.version);
    formData.append("publication_date", reglementData.publicationDate);
    formData.append("published_by", reglementData.publishedBy);
    formData.append("regulation_status", reglementData.status);

    const response = await api.put(
      `/reglements/update/${reglementId}`,
      formData
    );

    return response.data;
  } catch (error) {
    console.error("Failed to update reglement", error);
    throw error;
  }
};
