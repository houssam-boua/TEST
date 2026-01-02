import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetRolesQuery } from "@/slices/rolesslices";
import { useGetDepartementsQuery } from "@/slices/departementSlice";
import { useGetPermissionGroupsQuery } from "@/slices/permissionSlice";

const CreateUserForm = ({
  onSubmit,
  onCreate,
  onCancel,
  loading,
  roles: rolesProp,
  departements: departementsProp,
}) => {
  // support either onSubmit or onCreate prop
  const submitHandler = onSubmit || onCreate;

  const { data: rolesData } = useGetRolesQuery();
  const { data: depsData } = useGetDepartementsQuery();
  const { data: permGroupsData } = useGetPermissionGroupsQuery();

  const permissionGroups = useMemo(
    () =>
      Array.isArray(permGroupsData) && permGroupsData.length
        ? permGroupsData
        : [],
    [permGroupsData]
  );

  // prefer API data, fall back to props passed from parent (mock data)
  const roles = useMemo(
    () =>
      Array.isArray(rolesData) && rolesData.length
        ? rolesData
        : Array.isArray(rolesProp)
        ? rolesProp
        : [],
    [rolesData, rolesProp]
  );
  const departements = useMemo(
    () =>
      Array.isArray(depsData) && depsData.length
        ? depsData
        : Array.isArray(departementsProp)
        ? departementsProp
        : [],
    [depsData, departementsProp]
  );

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    departement: "",
    group: "",
  });

  // Set defaults when roles/departements/groups load
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      role: prev.role || (roles[0]?.id ? String(roles[0].id) : ""),
      departement:
        prev.departement ||
        (departements[0]?.id ? String(departements[0].id) : ""),
      group:
        prev.group ||
        (permissionGroups[0]?.id ? String(permissionGroups[0].id) : ""),
    }));
  }, [roles, departements, permissionGroups]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSelect = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitHandler) {
      const payload = {
        username: `${form.firstName}${form.lastName}`.toLowerCase(),
        email: form.email,
        first_name: form.firstName,
        last_name: form.lastName,
        // coerce to numbers before sending
        role: form.role ? Number(form.role) : null,
        departement: form.departement ? Number(form.departement) : null,
        // some backends expect *_id keys — include both to be safe
        role_id: form.role ? Number(form.role) : null,
        // include groups as array of ids (backend expects list)
        groups: form.group ? [Number(form.group)] : [],
      };

      // basic client-side validation
      if (!payload.departement) {
        // prevent submitting invalid payload
        console.error("CreateUserForm: departement is missing", payload);
        return Promise.reject(new Error("Departement is required"));
      }

      return submitHandler(payload);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-lg w-full"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="firstName" className="text-sm font-medium">
            First Name
          </label>
          <Input
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last Name
          </label>
          <Input
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Role</label>
          <Select
            className="w-full"
            value={form.role}
            onValueChange={(v) => handleSelect("role", v)}
          >
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Roles</SelectLabel>
                {roles.map((r) => (
                  <SelectItem key={String(r.id)} value={String(r.id)}>
                    {r.role_name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Departement</label>
          <Select
            className="w-full"
            value={form.departement}
            onValueChange={(v) => handleSelect("departement", v)}
          >
            <SelectTrigger id="departement" className="w-full">
              <SelectValue placeholder="Select departement" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Departements</SelectLabel>
                {departements.map((d) => (
                  <SelectItem key={String(d.id)} value={String(d.id)}>
                    {d.dep_name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className=" flex flex-col gap-1">
          <label className="text-sm font-medium">Group</label>
          <Select
            className="w-full"
            value={form.group}
            onValueChange={(v) => handleSelect("group", v)}
          >
            <SelectTrigger id="group" className="w-full">
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Permission Groups</SelectLabel>
                {permissionGroups.map((g) => (
                  <SelectItem key={String(g.id)} value={String(g.id)}>
                    {g.name || g.title || g.id}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserForm;
