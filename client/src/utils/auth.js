import { api } from "@/src/utils/api";

export const AuthAPI = {
  register: (payload) => api("/api/auth/register", { method: "POST", data: payload }),
  login:    (payload) => api("/api/auth/login", { method: "POST", data: payload }),
  me:       (token)   => api("/api/users/me",   { token }),
};
