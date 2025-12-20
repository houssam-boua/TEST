// authStorage.js - abstracts auth persistence (localStorage by default)
// Replace implementation to use cookies or secure storage later without changing other modules.

const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
};

export function getToken() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (e) {
    return null;
  }
}

export function setToken(token) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    if (token == null) {
      window.localStorage.removeItem(STORAGE_KEYS.TOKEN);
    } else {
      window.localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
  } catch (e) {
    // ignore
  }
}

export function removeToken() {
  setToken(null);
}

export function getUser() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const j = window.localStorage.getItem(STORAGE_KEYS.USER);
    return j ? JSON.parse(j) : null;
  } catch (e) {
    return null;
  }
}

export function setUser(user) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    if (user == null) {
      window.localStorage.removeItem(STORAGE_KEYS.USER);
    } else {
      window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  } catch (e) {
    // ignore
  }
}

export function clearAuth() {
  removeToken();
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (e) {
    // ignore
  }
}

export function setAuth({ token, user }) {
  setToken(token);
  setUser(user);
}

export default {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  clearAuth,
  setAuth,
};