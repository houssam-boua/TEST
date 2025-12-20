import React, { useEffect, useRef, useState } from "react";
import authStorage from "../../lib/authStorage";
import { useParams } from "react-router-dom";

// Default to 8080 because your Document Server is running on http://localhost:8080
// You can override by setting `VITE_ONLYOFFICE_URL` in the frontend .env file.
const DOCSERVER =
  import.meta.env.VITE_ONLYOFFICE_URL || "http://localhost:8080";

// Helpful debug output when starting the editor
console.debug("OnlyOffice Document Server URL:", DOCSERVER);

export default function OnlyOfficeEditor({ docId }) {
  const containerId = `onlyoffice-editor-${docId}`;
  const scriptRef = useRef(null);
  const editorRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const token = authStorage.getToken();
        // The backend uses DRF TokenAuthentication which expects the header: 'Authorization: Token <key>'
        const headers = token
          ? {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            }
          : { "Content-Type": "application/json" };

        const res = await fetch(`/api/documents/${docId}/onlyoffice-config/`, {
          credentials: "include",
          headers,
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("OnlyOffice config fetch failed", res.status, text);
          throw new Error(`OnlyOffice config fetch failed: ${res.status}`);
        }

        const config = await res.json();

        // Ensure `document` object exists and contains required fields for DocsAPI
        // Some backends may return slightly different shapes; normalize here so the
        // editor always receives the document implicitly.
        if (!config.document) {
          // Try to pick reasonable fallbacks from the response
          config.document = {
            title: config.title || config.doc_title || `doc-${docId}`,
            url:
              config.url ||
              config.file_url ||
              `${DOCSERVER}/web-apps/files/${docId}`,
            fileType: (
              config.fileType ||
              config.doc_format ||
              ""
            ).toLowerCase(),
            key: config.key || `doc-${docId}-${Date.now()}`,
          };
        } else {
          // Normalize some fields when present but in unexpected keys
          config.document.title =
            config.document.title ||
            config.title ||
            config.doc_title ||
            `doc-${docId}`;
          config.document.url =
            config.document.url ||
            config.file_url ||
            `${DOCSERVER}/web-apps/files/${docId}`;
          config.document.fileType = (
            config.document.fileType ||
            config.fileType ||
            config.doc_format ||
            ""
          ).toLowerCase();
          config.document.key =
            config.document.key || config.key || `doc-${docId}-${Date.now()}`;
        }

        // Ensure editorConfig exists and has sensible defaults
        config.editorConfig = config.editorConfig || {};
        config.editorConfig.mode = config.editorConfig.mode || "edit";
        config.editorConfig.callbackUrl =
          config.editorConfig.callbackUrl ||
          `${window.location.origin}/api/documents/${docId}/onlyoffice-callback/`;

        // Provide default permissions so the editor can edit/view as expected
        config.permissions = config.permissions || {
          edit: true,
          download: true,
          print: true,
        };

        // If backend provided a top-level token, make sure it's available
        // inside the document object as some Document Server setups expect it there.
        if (config.token) {
          config.document.token = config.document.token || config.token;
        }

        console.debug(
          "OnlyOffice normalized config:",
          config.document,
          config.editorConfig,
          "token:",
          config.token
        );

        // Load DocsAPI script if not present
        const scriptUrl = `${DOCSERVER}/web-apps/apps/api/documents/api.js`;
        if (!window.DocsAPI) {
          // Probe the script URL first so we can log server responses (404/HTML, etc.)
          try {
            const probe = await fetch(scriptUrl, { method: "GET" });
            if (!probe.ok) {
              const body = await probe.text();
              console.error(
                "OnlyOffice script probe failed",
                probe.status,
                body.slice ? body.slice(0, 2000) : body
              );
              throw new Error(
                `OnlyOffice script probe failed: ${probe.status}`
              );
            }
          } catch (probeErr) {
            // If probing failed due to CORS or network issue, still attempt to load the script
            console.warn(
              "Script probe failed, attempting to load script tag anyway",
              probeErr
            );
          }

          await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = scriptUrl;
            s.async = true;
            s.onload = () => {
              resolve();
            };
            s.onerror = (ev) => {
              console.error("OnlyOffice script failed to load", ev);
              reject(new Error("Failed to load OnlyOffice script"));
            };
            document.body.appendChild(s);
            scriptRef.current = s;
          });
        }

        if (!mounted) return;
        // instantiate OnlyOffice editor
        // eslint-disable-next-line no-undef
        editorRef.current = new window.DocsAPI.DocEditor(containerId, config);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error("OnlyOffice init failed", err);
      }
    };

    start();

    return () => {
      mounted = false;
      try {
        if (editorRef.current && editorRef.current.destroy)
          editorRef.current.destroy();
      } catch (e) {}
      if (scriptRef.current) {
        // keep script cached; don't remove to avoid reloading repeatedly
      }
    };
  }, [docId]);

  return (
    <div className="w-full h-[80vh] bg-white rounded shadow-sm">
      {loading && <div className="p-4">Loading editor...</div>}
      <div id={containerId} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
