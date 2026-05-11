import { api } from '../service/api';

export interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken?: string;
}

export const loginAdmin = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/login', {
    email,
    password,
  });

  console.log("LOGIN API RESPONSE:", res);

  return res;
};

export const signupAdmin = async (data: any): Promise<AuthResponse> => {
  return await api.post<AuthResponse>('/auth/register', data);
};

// ✅ Change Password
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  return api.put("/auth/change-password", {
    currentPassword,
    newPassword,
  });
};

// ✅ Forgot Password
export const forgotPassword = async (
  email: string
) => {
  return api.post('/auth/forgot-password', {
    email,
  });
};

// ✅ Reset Password
export const resetPassword = async (
  token: string,
  newPassword: string
) => {
  return api.post('/auth/reset-password', {
    token,
    newPassword,
  });
};