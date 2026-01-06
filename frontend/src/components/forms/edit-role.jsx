import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CirclePicker } from "react-color";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EditRoleForm({
  initialData,
  onSave,
  onCancel,
  loading,
  error, // ✅ Added to display API errors
}) {
  const [form, setForm] = useState({
    role_name: "",
    role_color: "#2563eb",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        role_name: initialData.role_name || "",
        role_color: initialData.role_color || "#2563eb",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave({ ...form });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      {/* ✅ Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {typeof error === 'string' ? error : "Failed to update role. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="edit_role_name">Role Name</Label>
        <Input
          id="edit_role_name"
          name="role_name"
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

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}