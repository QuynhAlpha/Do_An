(() => {
  const mount = document.querySelector("[data-site-footer]");
  if (!mount) return;

  const footerUrl = new URL("../footer.html", document.currentScript.src);

  fetch(footerUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Footer request failed: ${response.status}`);
      }

      return response.text();
    })
    .then((html) => {
      const footerDocument = new DOMParser().parseFromString(html, "text/html");
      const footer = footerDocument.querySelector(".daqt-footer");
      if (!footer) {
        throw new Error("Shared footer element was not found");
      }

      mount.replaceChildren(footer);
      mount.querySelectorAll("a[href]").forEach((link) => {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("#")) return;

        const resolvedUrl = new URL(href, footerUrl);
        if (resolvedUrl.origin === footerUrl.origin) {
          link.href = resolvedUrl.href;
        }
      });
    })
    .catch((error) => {
      console.error("Could not load shared footer:", error);
      mount.textContent = "Không thể tải footer. Hãy chạy trang qua máy chủ local.";
    });
})();
