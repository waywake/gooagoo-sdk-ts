export type SignMethod = "MD5";

export type GooagooEndpoint =
  | "http://api.test.goago.cn/oapi/rest"
  | "http://api.syandata.com/oapi/rest"
  | (string & {});

export interface GooagooClientOptions {
  appId: string;
  appKey: string;
  secretKey: string;
  endpoint?: GooagooEndpoint;
  version?: string;
  fetch?: typeof fetch;
}

export interface GooagooPublicParams {
  method: "gogo.open.auto.routing";
  timestamp: string;
  messageFormat: "json";
  appId: string;
  appKey: string;
  v: string;
  signMethod: SignMethod;
  lowerMethod: string;
  data: string;
  sign: string;
}

export interface GooagooResponse<T = unknown> {
  data: T;
  rescode: string;
  resmsg: string;
  sign?: string;
  [key: string]: unknown;
}

export type BillType = "1" | "3" | "6" | (string & {});

export type ExactBillType =
  | "10101"
  | "10102"
  | "10103"
  | "10104"
  | "10105"
  | "10106"
  | "10601"
  | "10602"
  | "10603"
  | "10604"
  | "10605"
  | "10606"
  | "3"
  | (string & {});

export interface SettlementWay {
  p: string;
  a: number;
}

export interface GoodsDetail {
  name: string;
  itemserial?: string;
  price?: number;
  totalnum: number;
  totalprice: number;
  [key: string]: unknown;
}

/** 商品明细。账单导入（明细）接口要求单价和总价必传。 */
export interface BillDetailGoods {
  name: string;
  price: number;
  totalnum?: number;
  totalprice: number;
  unit?: string;
  [key: string]: unknown;
}

export interface BillImportPayload {
  terminalNumber: string;
  saleTime: string;
  billType: BillType;
  exactBillType: ExactBillType;
  billSerialNumber: string;
  thirdPartyOrderNo: string;
  totalNum: number;
  totalFee: number;
  paidAmount: number;
  receivableAmount: number;
  discountAmount?: number;
  salesNum?: number;
  refundAmount?: number;
  refundOrders?: number;
  takeoutAmount?: number;
  takeoutOrders?: number;
  inStoreAmount?: number;
  inStoreOrders?: number;
  saler?: string;
  checkstand?: string;
  cashier?: string;
  couponAmount?: number;
  changeAmount?: number;
  settlementWay?: SettlementWay[];
  goodsDetails?: GoodsDetail[];
  pickupNo?: string;
  [key: string]: unknown;
}

/**
 * 账单导入（明细）请求参数。
 *
 * 明细接口要求结账单和退款单携带商品、支付明细。为避免调用方
 * 根据 billType 分支时丢失必填项，SDK 对所有明细请求统一设为必填。
 */
export interface BillDetailImportPayload
  extends Omit<BillImportPayload, "goodsDetails" | "settlementWay"> {
  goodsDetails: BillDetailGoods[];
  settlementWay: SettlementWay[];
}

export interface RequestOptions {
  timestamp?: string | Date;
}
