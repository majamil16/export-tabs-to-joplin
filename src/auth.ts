/**
 * Handle Joplin Auth
 */
import { JOPLIN_API_KEY, BASE_URL } from "./constants";

export interface AuthToken {
  auth_token: string;
}

// API response from the /auth endpoint
export interface AuthAPIResponse {
  token: string;
  status: string;
}
const authURL = `${BASE_URL}/auth`;

/**
 * Step 1: Get an auth token
 */
const getAuthToken = async (): Promise<AuthToken | null> => {
  try {
    console.log("in getAuthToken");
    // make a request to auth endpoint
    let token = await fetch(
      authURL +
        "?" +
        new URLSearchParams({
          token: JOPLIN_API_KEY,
        }),
      { method: "POST" }
    );
    let token_json = (await token.json()) as AuthToken;
    return token_json;
  } catch (e) {
    console.log("Error!!");
    console.log(e);
    return null;
  }
};

/**
 * Step 2: check until user approves auth request in the Joplin app
 */
const awaitUserInput = async (token: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let approved: boolean = false;
      console.log("in awaitUserInput");
      while (!approved) {
        // let timeout = 1000;
        let i = 0;
        // while (i < timeout) {
        console.log(`Not approved...${i}`);
        // request the /check endpoint
        let response: any = await fetch(
          authURL +
            "/check" +
            "?" +
            new URLSearchParams({
              auth_token: token,
            }),
          { method: "GET" }
        );
        response = await response.json();
        let status = (response as AuthAPIResponse).status;
        console.log(`STATUS == ${status}`);
        // if waiting...request again
        if (status === "waiting") {
          console.log(`Still waiting ${i}`);
          i++;
        } else if (status === "accepted") {
          // if token - return
          let token: string = response.token;
          approved = true;
          resolve(token);
        } else {
          console.log('rejecting with status')
          reject('user rejected');
        }
      }
    } catch (e) {
      console.log('error = ')
      console.log(e);
      reject(e)
    }
  });
};

export { getAuthToken, awaitUserInput };
