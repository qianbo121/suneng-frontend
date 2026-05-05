export type AdminRole = 'super_admin' | 'editor';

export type AdminUser = {
  id: number;
  username: string;
  role: AdminRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AdminUser;
};

export type AdminUserListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: AdminRole;
};

export type AdminUserFormValues = {
  username: string;
  password?: string;
  role: AdminRole;
  isActive: boolean;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type AuthContextValue = {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => void;
  refreshProfile: () => Promise<AdminUser | null>;
};
