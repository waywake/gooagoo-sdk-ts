import { describe, expect, test } from "bun:test";
import { GooagooClient, TEST_ENDPOINT, buildSignString, formatTimestamp, sign } from "../src";

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

  test("formats timestamps in local time", () => {
    expect(formatTimestamp(new Date(2026, 0, 2, 3, 4, 5))).toBe("20260102030405");
  });
});
