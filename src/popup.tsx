import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { getAuthToken, awaitUserInput, AuthToken } from "./auth";
import { v4 as uuid } from "uuid";
import { BASE_URL } from "./constants";

interface Tab {
  url: string;
  title: string;

  // not as relevant (yet?)
  incognito: boolean;
  index: number;
  pinned: boolean;
  selected: boolean;
  windowId: number;
}

const Popup = () => {
  const [count, setCount] = useState(0);
  const [currentURL, setCurrentURL] = useState<string>();
  const [authToken, _setAuthToken] = useState<string>();
  const [approved, _setApproved] = useState<boolean>(false);
  const [joplinKey, _setJoplinKey] = useState<string | null>(); // store the user's joplin API key

  const [exportErrors, setExportErrors] = useState<string>();

  useEffect(() => {
    chrome.action.setBadgeText({ text: count.toString() }); // 'badge' on the chrome extension
  }, [count]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setCurrentURL(tabs[0].url);
    });
  }, []);

  const changeBackground = (): void => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            color: "#555555",
          },
          (msg) => {
            console.log("result message:", msg);
          }
        );
      }
    });
  };

  const setAuthToken = async () => {
    try {
      let api_key: any = joplinKey;
      if (joplinKey == null) {
        console.log("No Joplin API Key");

        // run Auth flow
        let token = await getAuthToken();
        console.log("authToken is: ");
        console.log(token);

        if (token != null) {
          let token_str: string = (token as AuthToken)["auth_token"];
          _setAuthToken(token_str); // set the state auth token
          api_key = await awaitUserInput(token_str); // wait for user to approve request in joplin & retrieve the joplin API token
          if (api_key == null) {
            console.log("no API token. boo");
          }
          // set the Joplin key state
          console.log(`API key retrieved: ${api_key}`);
          _setJoplinKey(api_key);
        }
      }
      console.log("Joplin Key is : ");
      console.log(api_key);
      // TODO - store the key in LS.
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * Create a new Joplin page to put the URLs on
   */
  const createJoplinPage = async (bodyHtml: string): Promise<void> => {
    try {
      console.log("Create Joplin Page");

      // generate a uuid without dashes to assign the page.
      const pageId: string = uuid().replace(/-/g, "");

      const _body = {
        body_html: bodyHtml, // "<p>Test note body</p><ul><li>item 1</li><li>item 2</li></ul>",
        title: "Exported Chrome Tabs " + Date(),
        id: pageId,
      };

      // post to the /notes endpoint
      let response = await fetch(
        BASE_URL +
          "/notes" +
          "?" +
          new URLSearchParams({
            token: joplinKey as string,
          }),

        { method: "POST", body: JSON.stringify(_body) }
      );
      response = await response.json();
      console.log("Response?");
      console.log(response);
    } catch (e) {
      console.log("Error");
      console.log(e);
    }
  };

  /**
   * onClick for "Export" button
   */
  const exportToJoplin = (): void => {
    console.log("Clicked export");
    console.log(joplinKey);
    if (joplinKey == null) {
      let msg: string = "Joplin key is null. Please reauthenticate";
      setExportErrors(msg);
    } else {
      setExportErrors(undefined);

      // get the tabs
      chrome.tabs.query({}, (tabs) => {
        console.log("=== got tabs ===");
        console.log(tabs);

        const formattedHTML = formatTabsAsHTML(tabs as Array<Tab>);
        console.log("formatted formattedHTML");
        console.log(formattedHTML);
        createJoplinPage(formattedHTML);
      });
    }
  };

  const formatTabsAsHTML = (tabsList: Array<Tab>) => {
    const formattedList = tabsList.map((t) => {
      const { title, url } = t;
      console.log(title);
      console.log(url);
      let markdownString: string = `<li><a href="${url}">${title}</a></li>`;
      return markdownString;
    });

    let formattedListStr = formattedList.join("");
    formattedListStr = "<ul>" + formattedListStr + "</ul>";
    return formattedListStr;
  };

  return (
    <>
      <ul style={{ minWidth: "700px" }}>
        <li>Current URL: {currentURL}</li>
        <li>Current Time: {new Date().toLocaleTimeString()}</li>
      </ul>

      <label htmlFor="joplin-key">API Token</label>
      <input
        onChange={(e) => {
          console.log("changed joplin-key");
          console.log(e.target.value);
        }}
        type="password"
        name="joplin-key"
      ></input>

      <button onClick={changeBackground}>change background</button>
      <button onClick={setAuthToken}>authenticate Joplin</button>
      <button onClick={exportToJoplin}>export</button>
      {exportErrors && <p>{exportErrors}</p>}
      <p>
        {authToken && !approved && !joplinKey
          ? "Please go to Joplin to approve"
          : ""}
      </p>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
