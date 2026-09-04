import { request } from "./client";

export const userApi = {
  login: (email, password) =>
    request("user", "/login", { method: "POST", body: { email, password }, auth: false }),

  signup: (payload) =>
    request("user", "/signup", { method: "POST", body: payload, auth: false }),

  checkEmail: (email) =>
    request("user", "/signup/email/check", { query: { email }, auth: false }),

  refresh: () =>
    request("user", "/refresh", { method: "POST", auth: false }),

  getUser: (userId) =>
    request("user", `/users/${userId}`),

  editProfile: (userId, payload) =>
    request("user", "/users/profile/edit", { method: "PATCH", query: { userId }, body: payload }),

  registerFcmToken: (payload) =>
    request("user", "/api/v1/users/fcm/token", { method: "POST", body: payload }),
};
