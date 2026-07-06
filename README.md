# gooagoo-sdk-ts

TypeScript SDK for Gooagoo Open Platform. This first version implements bill import only.

## Install

```bash
bun install
```

## Build

```bash
bun run build
```

## Bill Import

```ts
import { GooagooClient, TEST_ENDPOINT } from "@waywake/gooagoo-sdk";

const client = new GooagooClient({
  endpoint: TEST_ENDPOINT,
  appId: process.env.GOOAGOO_APP_ID!,
  appKey: process.env.GOOAGOO_APP_KEY!,
  secretKey: process.env.GOOAGOO_SECRET_KEY!,
});

const response = await client.importBill({
  terminalNumber: "6A53BB2D7CDE",
  saleTime: "2026-07-06 10:00:00",
  billType: "1",
  exactBillType: "10101",
  billSerialNumber: "BILL-20260706-0001",
  thirdPartyOrderNo: "ORDER-20260706-0001",
  totalNum: 1,
  totalFee: 10,
  paidAmount: 10,
  receivableAmount: 10,
  discountAmount: 0,
  settlementWay: [{ p: "现金", a: 10 }],
  goodsDetails: [
    {
      name: "测试商品",
      itemserial: "SKU001",
      price: 10,
      totalnum: 1,
      totalprice: 10,
    },
  ],
});

console.log(response);
```

The SDK sends `application/x-www-form-urlencoded` requests to `/oapi/rest` and signs all non-empty public parameters with:

```txt
MD5(sorted key=value pairs + "&key=SecretKey").toUpperCase()
```
