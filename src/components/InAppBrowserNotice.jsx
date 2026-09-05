import { useState } from "react";
import "../pages/styles/pages.css";

function getInstagramBrowserInfo() {
  if (typeof navigator === "undefined") {
    return { isInstagram: false, isAndroid: false, isIOS: false };
  }

  const userAgent = navigator.userAgent || "";
  const isInstagram = /Instagram/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

  return { isInstagram, isAndroid, isIOS };
}

function InAppBrowserNotice() {
  const [browserInfo] = useState(getInstagramBrowserInfo);

  if (!browserInfo.isInstagram) {
    return null;
  }

  const openInChrome = () => {
    const currentUrl = new URL(window.location.href);
    const fallbackUrl = encodeURIComponent(currentUrl.href);
    const intentUrl = `intent://${currentUrl.host}${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallbackUrl};end`;

    window.location.href = intentUrl;
  };

  return (
    <aside className="in-app-browser-notice" role="status">
      <strong>Open this page in your browser</strong>
      {browserInfo.isAndroid ? (
        <>
          <p>Google sign-in is faster in Chrome.</p>
          <button type="button" className="btn-link" onClick={openInChrome}>
            Open in Chrome
          </button>
        </>
      ) : browserInfo.isIOS ? (
        <p>
          Tap the <strong>•••</strong> menu, then choose{" "}
          <strong>Open in external browser</strong> to sign in with Google.
        </p>
      ) : (
        <p>
          Open this page in Safari or Chrome to sign in with Google more easily.
        </p>
      )}
    </aside>
  );
}

export default InAppBrowserNotice;
