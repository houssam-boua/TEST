import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";

// FolderBrowser
// Props
// - initialPath: string, default '/Documents'
// - folders: array of folder paths (strings). Example: '/Documents/Administration/Contracts'
// - files: array of file objects with a `path` (full path string) and `name`
// - onOpenFile: function(file) called when file clicked
// - className: optional wrapper className
// Behavior: at any `currentPath` the component shows only immediate child
// folders (one level down) and files that are directly inside the
// currentPath. Clicking a folder navigates into it. Breadcrumbs allow
// moving up.

function normalize(p) {
  if (!p) return "";
  let s = String(p).trim();
  // ensure leading slash
  if (!s.startsWith("/")) s = "/" + s;
  // remove trailing slash except for root
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

function immediateChildrenFromPaths(paths = [], currentPath) {
  const cur = normalize(currentPath || "/");
  const prefix = cur === "/" ? "/" : cur + "/";
  const children = new Set();
  for (const raw of paths || []) {
    if (!raw) continue;
    const p = normalize(raw);
    if (p === cur) continue;
    if (!p.startsWith(prefix)) continue;
    // rest without prefix
    const rest = p.slice(prefix.length);
    const parts = rest.split("/");
    if (parts.length >= 1 && parts[0]) {
      children.add(parts[0]);
    }
  }
  return Array.from(children).sort();
}

export default function FolderBrowser({
  initialPath = "/Documents",
  folders = [],
  files = [],
  onOpenFile = null,
  className = "",
}) {
  const [currentPath, setCurrentPath] = useState(normalize(initialPath));

  const folderChildren = useMemo(() => {
    return immediateChildrenFromPaths(folders, currentPath);
  }, [folders, currentPath]);

  const fileChildren = useMemo(() => {
    const cur = normalize(currentPath);
    const prefix = cur === "/" ? "/" : cur + "/";
    return (files || [])
      .filter((f) => {
        const p = normalize(f.path || f.folder || "");
        if (p === cur) return true; // file stored at path equal to currentPath
        if (!p.startsWith(prefix)) return false;
        const rest = (f.path || "").replace(prefix, "") || "";
        // file is immediate child when there is no additional slash in rest
        return rest && !rest.includes("/");
      })
      .map((f) => ({
        name: f.name || (f.path || "").split("/").pop(),
        path: f.path,
        raw: f,
      }));
  }, [files, currentPath]);

  const breadcrumbs = useMemo(() => {
    const p = normalize(currentPath);
    if (p === "/") return [{ name: "/", path: "/" }];
    const parts = p.split("/").filter(Boolean);
    const crumbs = [];
    let accum = "";
    crumbs.push({ name: "/", path: "/" });
    for (const part of parts) {
      accum = accum === "/" ? "/" + part : accum + "/" + part;
      crumbs.push({ name: part, path: accum });
    }
    return crumbs;
  }, [currentPath]);

  function openFolder(name) {
    const cur = normalize(currentPath);
    const next = cur === "/" ? `/${name}` : `${cur}/${name}`;
    setCurrentPath(normalize(next));
  }

  function onCrumbClick(path) {
    setCurrentPath(normalize(path));
  }

  return (
    <div className={className}>
      <nav className="mb-3 text-sm text-muted-foreground">
        {breadcrumbs.map((c, idx) => (
          <span key={c.path} className="inline-flex items-center">
            <button
              type="button"
              onClick={() => onCrumbClick(c.path)}
              className="text-primary hover:underline px-1"
            >
              {c.name}
            </button>
            {idx < breadcrumbs.length - 1 && <span className="px-1">/</span>}
          </span>
        ))}
      </nav>

      <div className="space-y-3">
        <div>
          <div className="font-medium mb-2">Folders</div>
          {folderChildren.length === 0 ? (
            <div className="text-sm text-muted-foreground">No folders</div>
          ) : (
            <ul className="space-y-1">
              {folderChildren.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => openFolder(name)}
                    className="text-left w-full px-2 py-1 rounded hover:bg-muted/20"
                  >
                    📁 {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="font-medium mb-2">Files</div>
          {fileChildren.length === 0 ? (
            <div className="text-sm text-muted-foreground">No files</div>
          ) : (
            <ul className="space-y-1">
              {fileChildren.map((f) => (
                <li key={f.path || f.name}>
                  <button
                    type="button"
                    onClick={() => onOpenFile && onOpenFile(f.raw)}
                    className="text-left w-full px-2 py-1 rounded hover:bg-muted/20"
                  >
                    📄 {f.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

FolderBrowser.propTypes = {
  initialPath: PropTypes.string,
  folders: PropTypes.array,
  files: PropTypes.array,
  onOpenFile: PropTypes.func,
  className: PropTypes.string,
};
