import { message } from 'antd';

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export interface FetchResponse<T = any> {
  data?: T;
  success?: boolean;
  msg?: string;
  error?: string;
}

export const service = async <T>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  options.headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const error = new Error(`HTTP error ${response.status}`);
      error.name = response.statusText;
      throw error;
    }
    const data: FetchResponse = await response.json();
    return data;
  } catch (error: any) {
    message.error(error.message);
    return { error: error.message };
  }
};

export default service;