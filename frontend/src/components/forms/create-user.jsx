import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useGetRolesQuery } from "@/slices/rolesSlices";
import { useGetDepartementsQuery, useGetSitesQuery } from "@/slices/departementSlice";

const CreateUserForm = ({
  onSubmit,
  onCreate,
  onCancel,
  loading,
}) => {
  const submitHandler = onSubmit || onCreate;

  const { data: roles = [], isLoading: loadingRoles } = useGetRolesQuery();
  const { data: departements = [], isLoading: loadingDepts } = useGetDepartementsQuery();
  const { data: sites = [], isLoading: loadingSites } = useGetSitesQuery();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    site: "", // Filter departments by site
    departement: "",
  });

  // Filter departments based on selected site
  const filteredDepartments = useMemo(() => {
    if (!form.site) return [];
    return departements.filter(d => String(d.site) === String(form.site));
  }, [departements, form.site]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSelect = (name, value) => {
    setForm((p) => {
      // If site changes, reset department
      if (name === "site") {
        return { ...p, site: value, departement: "" };
      }
      return { ...p, [name]: value };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!submitHandler) return;

    const payload = {
      username: `${form.firstName}.${form.lastName}`.toLowerCase().replace(/\s+/g, ''),
      email: form.email,
      first_name: form.firstName,
      last_name: form.lastName,
      // Send IDs as integers
      role: parseInt(form.role, 10),
      departement: parseInt(form.departement, 10),
      // Clean up empty strings
      groups: [], 
    };

    submitHandler(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">First Name</label>
          <Input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="John"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Last Name</label>
          <Input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="john.doe@example.com"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <Select
            value={form.role}
            onValueChange={(v) => handleSelect("role", v)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingRoles ? "Loading..." : "Select Role"} />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.role_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Site Filter (Optional but recommended for large orgs) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Site</label>
          <Select
            value={form.site}
            onValueChange={(v) => handleSelect("site", v)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingSites ? "Loading..." : "Select Site"} />
            </SelectTrigger>
            <SelectContent>
              {sites.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtered Department Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Department</label>
        <Select
          value={form.departement}
          onValueChange={(v) => handleSelect("departement", v)}
          required
          disabled={!form.site} // Disable until site is picked
        >
          <SelectTrigger>
            <SelectValue 
              placeholder={
                !form.site 
                  ? "Select a Site first" 
                  : loadingDepts 
                    ? "Loading..." 
                    : filteredDepartments.length === 0 
                      ? "No departments found" 
                      : "Select Dept"
              } 
            />
          </SelectTrigger>
          <SelectContent>
            {filteredDepartments.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.dep_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} type="button" disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Create User"
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserForm;