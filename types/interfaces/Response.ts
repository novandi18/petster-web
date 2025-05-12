export type Response<T> =
  | { status: "loading"; data?: T }
  | { status: "success"; data: T }
  | { status: "error"; error: string; data?: T };

export const Response = {
  Loading: <T>(data?: T): Response<T> => ({ status: "loading", data }),
  Success: <T>(data: T): Response<T> => ({ status: "success", data }),
  Error: <T>(error: string, data?: T): Response<T> => ({
    status: "error",
    error,
    data,
  }),
};
