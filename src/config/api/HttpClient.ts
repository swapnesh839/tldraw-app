import axios, { AxiosRequestConfig } from "axios";
import store from "../redux/store";

// API Base URL
const API_BASE_URL = "http://localhost:3000/";

// Generic Types for Responses
export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse<T> {
  success: false;
  message: string;
  data?: T;
}

// Union type that covers both cases
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse<T>;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
});

api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
export const deleteApiCaller = ({ uri }: { uri: string }) => {
  return api.delete(uri);
};

// Types for apiCaller
interface ApiCallerProps {
  uri: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: object;
  token?: string | null | number;
  contentType?: string;
}

// apiCaller with TypeScript Generics for response handling
const apiCaller = <T>({
  uri,
  method = "GET",
  data = {},
  token,
  contentType,
}: ApiCallerProps): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method,
      url: API_BASE_URL + uri,
      headers: {
        "Content-Type": contentType || "application/json",
        Accept: "/",
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      data,
    };

    console.log(config, ":config");

    api(config)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

export const HttpClient = {
  apiCaller,
  API_BASE_URL,
  deleteApiCaller,
};
