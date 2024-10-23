"use client";

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [iframeBlocked, setIframeBlocked] = useState(false);

  useEffect(() => {
    const iframe = document.getElementById("iframe");

    const handleIframeLoad = () => {
      try {
        // Test if the iframe is successfully loaded by checking its window property.
        if (iframe.contentWindow.location.href === 'about:blank') {
          setIframeBlocked(true); // If we can't access the iframe content, it's blocked.
        }
      } catch (error) {
        console.error("Iframe blocked due to X-Frame-Options or CSP:", error);
        setIframeBlocked(true); // Set blocked status if accessing the iframe fails.
      }
    };

    iframe.addEventListener('load', handleIframeLoad);

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
    };
  }, []);

  const handleMessage = (event) => {
    if (event.data === 'login_success') {
      window.open('https://power.msbglobals.com', '_blank'); // Open the dashboard in a new tab if login succeeds.
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Redirect to the external site in a new tab if iframe is blocked
  useEffect(() => {
    if (iframeBlocked) {
      window.open('https://power.msbglobals.com', '_blank'); // Automatically open in a new tab
    }
  }, [iframeBlocked]);

  return (
    <div className="w-full h-screen">
      <iframe
        id="iframe"
        height="1000px"
        width="100%"
        src="/site/login"
        className="w-full h-full border-0"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
