import React, { useContext, useMemo } from "react";
import { AuthContext } from "../Context/AuthContextDefinition";

/**
 * useHasPermission - hook to evaluate user permissions
 * @param {string|string[]} required - a permission or array of permissions (strings)
 * @param {{ mode?: "any" | "all" }} [options] - mode "any" (default) or "all"
 * @returns {boolean} whether the current user satisfies the permission requirement
 */
export function useHasPermission(required, options = { mode: "any" }) {
  const ctx = useContext(AuthContext) || {};

  // Memoize permission evaluation to avoid recomputing on every render
  return useMemo(() => {
    // If AuthContext exposes a centralized hasPermission helper, prefer it
    if (typeof ctx.hasPermission === "function") {
      return ctx.hasPermission(required, options?.mode || "any");
    }

    const { isAdmin, user } = ctx;

    // Admin bypass
    if (typeof isAdmin === "function" && isAdmin()) return true;

    const perms = user?.permissions || user?.user_permissions || [];

    const list = Array.isArray(required)
      ? required.filter(Boolean)
      : [required].filter(Boolean);

    if (list.length === 0) return true;

    if (options.mode === "all") {
      return list.every((p) => perms.includes(p));
    }

    // default: "any"
    return list.some((p) => perms.includes(p));
  }, [ctx, required, options?.mode, ctx?.user, ctx?.permissions]);
}

/**
 * PermissionGate - component wrapper to conditionally render children based on permissions
 * Props:
 *  - required: string | string[] (permission(s) required)
 *  - mode: "any" | "all"
 *  - fallback: node to render when access is denied (defaults to null)
 *
 * Usage:
 * <PermissionGate required="documents.edit">
 *   <Button>Edit</Button>
 * </PermissionGate>
 */
export function PermissionGate({
  required,
  mode = "any",
  children,
  fallback = null,
}) {
  const allowed = useHasPermission(required, { mode });
  if (allowed) return <>{children}</>;
  return fallback;
}

export default useHasPermission;
