import { getAuthToken, awaitUserInput } from "../auth";

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks()
});

describe("Test for getAuthToken()", () => {
  it("should get an auth token", async () => {
    // mock fetch with expected response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ auth_token: "TEST_TOKEN" }),
      })
    ) as jest.Mock;
    jest.spyOn(global, "fetch");

    const token = await getAuthToken();

    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:41184/auth`,
      { method: "POST" }
    );
    expect(token).toBeTruthy();
    expect(token?.auth_token).toEqual("TEST_TOKEN");
  });
});

describe("Test for awaitUserInput()", () => {
  test("accepts user input and returns auth token", async () => {
    // mock fetch with expected response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ token: "TEST_AUTH_TOKEN", status: "accepted" }),
      })
    ) as jest.Mock;
    jest.spyOn(global, "fetch");
    const token = await awaitUserInput("MOCK_TOKEN");

    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:41184/auth/check?auth_token=MOCK_TOKEN`,
      { method: "GET" }
    );
    expect(token).toBeTruthy();
    expect(token).toEqual("TEST_AUTH_TOKEN");
  });

  // TODO - figure out why this is not working
  // test("rejects user input and returns auth token", async () => {
  //   // mock fetch with expected response
  //   global.fetch = jest.fn().mockImplementation(() =>
  //     Promise.resolve({
  //       json: () =>
  //         Promise.resolve({ status: "rejected" }),
  //     })
  //   ) as jest.Mock;
  //   jest.spyOn(global, "fetch");

  //   const token = await awaitUserInput("MOCK_TOKEN")

  //   expect(fetch).toHaveBeenCalledWith(
  //     `http://localhost:41184/auth/check?auth_token=MOCK_TOKEN`,
  //     { method: "GET" }
  //     );
  //     // await expect(await awaitUserInput("MOCK_TOKEN")).rejects.toEqual('user rejected');
  //   });
});
