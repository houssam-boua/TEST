import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CirclePicker } from "react-color";
import { Loader2 } from "lucide-react";

export default function CreateRoleForm({
  onCreate,
  onCancel,
  loading,
  className,
  ...props
}) {
  const [form, setForm] = useState({ role_name: "", role_color: "#2563eb" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCreate) onCreate({ ...form });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-6 w-full ${className || ""}`}
      {...props}
    >
      <div className="space-y-2">
        <Label htmlFor="role_name">Role Name</Label>
        <Input
          id="role_name"
          name="role_name"
          placeholder="e.g. Author, Reviewer"
          value={form.role_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-3">
        <Label>Badge Color</Label>
        <div className="p-4 border rounded-md bg-slate-50 flex justify-center">
          <CirclePicker
            color={form.role_color}
            onChangeComplete={(color) =>
              setForm((p) => ({ ...p, role_color: color.hex }))
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Role"
          )}
        </Button>
      </div>
    </form>
  );
}