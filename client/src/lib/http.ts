import envConfig from "@/config";
import { LoginResType } from "@/schemaValidations/auth.schema";
import { cookies } from "next/headers";

const ENTITY_ERROR_STATUS = 422;

type EntityErrorPayload = {
  message: string;
  errors: {
    field: string;
    message: string;
  }[];
};

type EntityErrorType = {
  status: 422;
  payload: EntityErrorPayload;
};

export class HttpError extends Error {
  status: number;
  payload: {
    message: string;
    [key: string]: any;
  };

  constructor({ status, payload }: { status: number; payload: any }) {
    super("Http Error");
    this.status = status;
    this.payload = payload;
  }
}

export class EntityError extends HttpError {
  status: 422;
  payload: EntityErrorPayload;
  constructor({ status, payload }: EntityErrorType) {
    super({ status, payload });
    this.status = status;
    this.payload = payload;
  }
}

type CustomOptions = Omit<RequestInit, "body" | "method"> & {
  body?: any;
  baseUrl?: string;
};
class SessionToken {
  private token = "";
  get value() {
    return this.token;
  }
  set value(token: string) {
    if (typeof window === "undefined") {
      throw new Error("This method is only supported in the client side");
    }
    this.token = token;
  }
}
export const clientSessionToken = new SessionToken();

const getBody = (body: any) => {
  if(!body) return undefined

  return JSON.stringify(body)
}



const request = async <Response>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  options?: CustomOptions | undefined
) => {
  const body = getBody(options?.body)
 
  // Nếu không truyền baseUrl (hoặc baseUrl = undefined) thì sẽ lấy giá trị mặc định từ envConfig
  // Nếu truyền baseUrl thì sẽ lấy giá trị truyền vào, truyền vào '' thì gọi đến Next.js Server, còn truyền vào endpoint thì gọi đến server khác

  const baseUrl =
    options?.baseUrl === undefined
      ? envConfig.NEXT_PUBLIC_API_ENDPOINT
      : options.baseUrl;

  const fulllUrl = url.startsWith("/")
    ? `${baseUrl}${url}`
    : `${baseUrl}/${url}`;

    const baseHeaders = {
      "Content-Type": "application/json",
      Authorization: clientSessionToken.value
        ? `Bearer ${clientSessionToken.value}`
        : "",
    };
    
  const res = await fetch(fulllUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers,
    },
    body,
    method,
  });
  const payload: Response = await res.json();
  const data = {
    status: res.status,
    payload,
  };

  if (!res.ok) {
    if (res.status === ENTITY_ERROR_STATUS) {
      throw new EntityError(data as EntityErrorType);
    }

    // throw new HttpError(data);
  }

  if (url === "auth/login" || url === "auth/register") {
    clientSessionToken.value = (payload as LoginResType).data.token;
  } else if (url === "auth/logout") {
    clientSessionToken.value = "";
  }
  return data;
};


const http = {
  get<Response>(
    url: string,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("GET", url, options);
  },
  post<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("POST", url, { ...options, body });
  },
  put<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("PUT", url, { ...options, body });
  },
  delete<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) {
    return request<Response>("DELETE", url, { ...options, body });
  },
};

export default http;
