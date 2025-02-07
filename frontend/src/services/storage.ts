export const STORAGE_KEYS = {
  TOKEN: 'authToken',
  USER_DATA: 'userData',
  ACCOUNT_DATA: 'accountData',
  ROLE: 'userRole',
} as const;

export interface UserData {
  id: string;
  email: string;
  [key: string]: any;
}

export interface AccountData {
  id: string;
  [key: string]: any;
}

type StorageKeys = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export class SecureStorage {
  static get<T>(key: StorageKeys): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  static set(key: StorageKeys, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static remove(key: StorageKeys): void {
    localStorage.removeItem(key);
  }

  static getToken(): string | null {
    return this.get(STORAGE_KEYS.TOKEN);
  }

  static getUserData(): UserData | null {
    return this.get(STORAGE_KEYS.USER_DATA);
  }

  static getAccountData(): AccountData | null {
    return this.get(STORAGE_KEYS.ACCOUNT_DATA);
  }

  static getRole(): string | null {
    return this.get(STORAGE_KEYS.ROLE);
  }

  static storeAuthData(
    token: string,
    userData: UserData,
    accountData: AccountData,
    role: string
  ): void {
    this.set(STORAGE_KEYS.TOKEN, token);
    this.set(STORAGE_KEYS.USER_DATA, userData);
    this.set(STORAGE_KEYS.ACCOUNT_DATA, accountData);
    this.set(STORAGE_KEYS.ROLE, role);
  }

  static clearAuthData(): void {
    Object.values(STORAGE_KEYS).forEach(this.remove);
  }
}
