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
import { useGetRolesQuery } from "@/Slices/rolesSlices";
import { useGetDepartementsQuery } from "@/Slices/departementSlice";

const EditUser = ({ user, onSubmit, onCancel, loading }) => {
  const { data: rolesData } = useGetRolesQuery();
  const { data: depsData } = useGetDepartementsQuery();

  const roles = useMemo(
    () => (Array.isArray(rolesData) ? rolesData : []),
    [rolesData]
  );
  const departements = useMemo(
    () => (Array.isArray(depsData) ? depsData : []),
    [depsData]
  );

  const [form, setForm] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    role: user?.role ? String(user.role) : "",
    departement: user?.departement ? String(user.departement) : "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        role: user.role ? String(user.role) : "",
        departement: user.departement ? String(user.departement) : "",
        password: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onSubmit) return;
    const payload = {
      id: user?.id,
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      // include password only if provided
      ...(form.password ? { password: form.password } : {}),
      role: form.role ? Number(form.role) : null,
      departement: form.departement ? Number(form.departement) : null,
      role_id: form.role ? Number(form.role) : null,
      departement_id: form.departement ? Number(form.departement) : null,
    };
    return onSubmit(payload);
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
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="leave blank to keep current"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Role</label>
          <Select
            value={form.role}
            onValueChange={(v) => handleSelect("role", v)}
          >
            <SelectTrigger id="role">
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
            value={form.departement}
            onValueChange={(v) => handleSelect("departement", v)}
          >
            <SelectTrigger id="departement">
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

export default EditUser;
