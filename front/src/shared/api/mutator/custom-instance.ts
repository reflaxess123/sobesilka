import Axios, { AxiosError, type AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = Axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication if needed
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  },
);

interface CustomInstanceInterface {
  <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T>;
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) => Promise<T>;
  put: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) => Promise<T>;
  delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

const baseCustomInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error - Adding cancel method to promise
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

// Create customInstance with methods
export const customInstance: CustomInstanceInterface = Object.assign(
  baseCustomInstance,
  {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
      baseCustomInstance<T>({ method: 'GET', url, ...config }),

    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      baseCustomInstance<T>({ method: 'POST', url, data, ...config }),

    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      baseCustomInstance<T>({ method: 'PUT', url, data, ...config }),

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
      baseCustomInstance<T>({ method: 'DELETE', url, ...config }),
  },
);

export type ErrorType<Error = AxiosError> = Error;
export type BodyType<BodyData = unknown> = BodyData;
