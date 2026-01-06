import React, { useEffect, useState } from "react";
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
import { useGetRolesQuery } from "@/slices/rolesSlices";
import { useGetDepartementsQuery } from "@/slices/departementSlice";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

const EditUser = ({ user, onSubmit, onCancel, loading, error }) => {
  const { data: rolesData = [] } = useGetRolesQuery();
  const { data: depsData = [] } = useGetDepartementsQuery();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    role: "",
    departement: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      // Safely handle if fields are null/undefined
      const roleId = user.role?.id ? String(user.role.id) : String(user.role || "");
      const deptId = user.departement?.id ? String(user.departement.id) : String(user.departement || "");

      setForm({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        role: roleId,
        departement: deptId,
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
      username: form.username,
      email: form.email,
      // Only include password if the user actually typed something
      ...(form.password ? { password: form.password } : {}),
      role: form.role ? parseInt(form.role) : null,
      departement: form.departement ? parseInt(form.departement) : null,
    };
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      {/* Show Error if API fails */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {typeof error === "string" ? error : "Failed to update user."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">First Name</label>
          <Input name="firstName" value={form.firstName} onChange={handleChange} required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Last Name</label>
          <Input name="lastName" value={form.lastName} onChange={handleChange} required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Username</label>
          <Input name="username" value={form.username} onChange={handleChange} required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Email</label>
          <Input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Role</label>
          <Select value={form.role} onValueChange={(v) => handleSelect("role", v)}>
            <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {rolesData.map((r) => (
                  <SelectItem key={String(r.id)} value={String(r.id)}>{r.role_name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Department</label>
          <Select value={form.departement} onValueChange={(v) => handleSelect("departement", v)}>
            <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {depsData.map((d) => (
                  <SelectItem key={String(d.id)} value={String(d.id)}>{d.dep_name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm font-medium">Password (Optional)</label>
          <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current" />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default EditUser;