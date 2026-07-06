import { formatTimestamp } from "./time";
import { sign, type SignableParams } from "./sign";
import type {
  BillImportPayload,
  GooagooClientOptions,
  GooagooPublicParams,
  GooagooResponse,
  RequestOptions,
} from "./types";

export const DEFAULT_ENDPOINT = "http://api.syandata.com/oapi/rest";
export const TEST_ENDPOINT = "http://api.test.goago.cn/oapi/rest";
export const ROUTING_METHOD = "gogo.open.auto.routing";
export const BILL_IMPORT_METHOD = "com.gooagoo.exportbill";

export class GooagooError extends Error {
  constructor(
    message: string,
    public readonly response?: GooagooResponse,
  ) {
    super(message);
    this.name = "GooagooError";
  }
}

export class GooagooClient {
  private readonly endpoint: string;
  private readonly appId: string;
  private readonly appKey: string;
  private readonly secretKey: string;
  private readonly version: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: GooagooClientOptions) {
    this.endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
    this.appId = options.appId;
    this.appKey = options.appKey;
    this.secretKey = options.secretKey;
    this.version = options.version ?? "1.0";
    this.fetchImpl = options.fetch ?? fetch;
  }

  async importBill(
    payload: BillImportPayload,
    options: RequestOptions = {},
  ): Promise<GooagooResponse<string>> {
    return this.request<string>(BILL_IMPORT_METHOD, payload, options);
  }

  buildRequestParams(
    lowerMethod: string,
    data: unknown,
    options: RequestOptions = {},
  ): GooagooPublicParams {
    const timestamp =
      options.timestamp instanceof Date
        ? formatTimestamp(options.timestamp)
        : (options.timestamp ?? formatTimestamp());
    const dataText = typeof data === "string" ? data : JSON.stringify(data);

    const unsignedParams: Omit<GooagooPublicParams, "sign"> = {
      method: ROUTING_METHOD,
      timestamp,
      messageFormat: "json",
      appId: this.appId,
      appKey: this.appKey,
      v: this.version,
      signMethod: "MD5",
      lowerMethod,
      data: dataText,
    };

    return {
      ...unsignedParams,
      sign: sign(unsignedParams as SignableParams, this.secretKey),
    };
  }

  async request<T = unknown>(
    lowerMethod: string,
    data: unknown,
    options: RequestOptions = {},
  ): Promise<GooagooResponse<T>> {
    const params = this.buildRequestParams(lowerMethod, data, options);
    const body = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      body.set(key, value);
    }

    const response = await this.fetchImpl(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      },
      body,
    });
    const text = await response.text();

    if (!response.ok) {
      throw new GooagooError(
        `Gooagoo request failed with HTTP ${response.status}: ${text}`,
      );
    }

    let parsed: GooagooResponse<T>;
    try {
      parsed = JSON.parse(text) as GooagooResponse<T>;
    } catch (error) {
      throw new GooagooError(`Gooagoo response is not valid JSON: ${text}`);
    }

    if (parsed.rescode && parsed.rescode !== "OPEN_SUCCESS") {
      throw new GooagooError(parsed.resmsg || "Gooagoo request failed", parsed);
    }

    return parsed;
  }
}
