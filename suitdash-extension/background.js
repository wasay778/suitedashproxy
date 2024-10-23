chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
      const headers = details.responseHeaders.filter(
        (header) =>
          !["x-frame-options", "content-security-policy"].includes(
            header.name.toLowerCase()
          )
      );
  
      return { responseHeaders: headers };
    },
    {
      urls: ["*://power.msbglobals.com/*"],
      types: ["sub_frame", "main_frame"]
    },
    ["blocking", "responseHeaders"]
  );
  