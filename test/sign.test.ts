import { describe, expect, test } from "bun:test";
import {
  BILL_DETAIL_IMPORT_METHOD,
  GooagooClient,
  TEST_ENDPOINT,
  buildSignString,
  formatTimestamp,
  sign,
} from "../src";

describe("sign", () => {
  test("sorts non-empty params by key and appends secret key", () => {
    expect(
      buildSignString(
        {
          timestamp: "201904091000371",
          method: "gogo.bill.amount.query",
          signMethod: "MD5",
          messageFormat: "json",
          empty: "",
          sign: "ignored",
          appKey: "8641474589158318",
          v: "1.0",
        },
        "1D293J60TR392T0AB2M102HLGM00108N",
      ),
    ).toBe(
      "appKey=8641474589158318&messageFormat=json&method=gogo.bill.amount.query&signMethod=MD5&timestamp=201904091000371&v=1.0&key=1D293J60TR392T0AB2M102HLGM00108N",
    );
  });

  test("returns uppercase MD5", () => {
    expect(sign({ appKey: "10024", method: "gogo.invoice.enterprise.add" }, "18C1PB5DB2N8S7004D6ON0616662KA50")).toMatch(/^[A-F0-9]{32}$/);
  });
});

describe("client", () => {
  test("builds signed bill import params", () => {
    const client = new GooagooClient({
      endpoint: TEST_ENDPOINT,
      appId: "app-id",
      appKey: "app-key",
      secretKey: "secret",
    });

    const params = client.buildRequestParams(
      "com.gooagoo.exportbill",
      { terminalNumber: "6A53BB2D7CDE", paidAmount: 1 },
      { timestamp: new Date(2026, 6, 6, 10, 3, 4) },
    );

    expect(params.method).toBe("gogo.open.auto.routing");
    expect(params.lowerMethod).toBe("com.gooagoo.exportbill");
    expect(params.timestamp).toBe("20260706100304");
    expect(params.data).toBe('{"terminalNumber":"6A53BB2D7CDE","paidAmount":1}');
    expect(params.sign).toMatch(/^[A-F0-9]{32}$/);
  });

  test("imports bill details with the detail lower method", async () => {
    let requestBody: URLSearchParams | undefined;
    const client = new GooagooClient({
      endpoint: TEST_ENDPOINT,
      appId: "app-id",
      appKey: "app-key",
      secretKey: "secret",
      fetch: (async (_input, init) => {
        requestBody = init?.body as URLSearchParams;
        return new Response(
          JSON.stringify({
            rescode: "OPEN_SUCCESS",
            resmsg: "账单导入成功",
            data: "成功",
          }),
        );
      }) as typeof fetch,
    });

    const response = await client.importBillDetail(
      {
        terminalNumber: "6A53BB2D7CDE",
        saleTime: "2026-07-06 10:00:00",
        billType: "1",
        exactBillType: "10101",
        billSerialNumber: "BILL-1",
        thirdPartyOrderNo: "ORDER-1",
        totalNum: 1,
        totalFee: 10,
        paidAmount: 10,
        receivableAmount: 10,
        goodsDetails: [
          { name: "测试商品", price: 10, totalnum: 1, totalprice: 10 },
        ],
        settlementWay: [{ p: "现金", a: 10 }],
      },
      { timestamp: "20260706100000" },
    );

    expect(requestBody?.get("lowerMethod")).toBe(BILL_DETAIL_IMPORT_METHOD);
    expect(JSON.parse(requestBody?.get("data") ?? "{}").goodsDetails).toEqual([
      { name: "测试商品", price: 10, totalnum: 1, totalprice: 10 },
    ]);
    expect(response.data).toBe("成功");
  });

  test("formats timestamps in local time", () => {
    expect(formatTimestamp(new Date(2026, 0, 2, 3, 4, 5))).toBe("20260102030405");
  });
});
