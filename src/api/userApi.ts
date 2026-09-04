import { request } from "./client";
import type {
  AuthSession,
  EditProfileRequest,
  FcmTokenRequest,
  MyPageUser,
  SignupRequest,
} from "./types";

export const userApi = {
  login: (email: string, password: string) =>
    request<AuthSession>("user", "/login", { method: "POST", body: { email, password }, auth: false }),

  signup: (payload: SignupRequest) =>
    request<number>("user", "/signup", { method: "POST", body: payload, auth: false }),

  checkEmail: (email: string) =>
    request<boolean>("user", "/signup/email/check", { query: { email }, auth: false }),

  refresh: () =>
    request<AuthSession>("user", "/refresh", { method: "POST", auth: false }),

  logout: () =>
    request("user", "/logout", { method: "POST", auth: false }),

  getUser: (userId: number) =>
    request<MyPageUser>("user", `/users/${userId}`),

  editProfile: (userId: number, payload: EditProfileRequest) =>
    request("user", "/users/profile/edit", { method: "PATCH", query: { userId }, body: payload }),

  registerFcmToken: (payload: FcmTokenRequest) =>
    request<number>("user", "/api/v1/users/fcm/token", { method: "POST", body: payload }),
};
