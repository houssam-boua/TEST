import React, { useEffect } from "react";
import { CirclePicker } from "react-color";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EditRole = ({ role, onSubmit, onCancel, loading }) => {
  const [form, setForm] = React.useState({
    role_name: "",
    role_color: "",
  });

  useEffect(() => {
    if (role) {
      const rawColor = role.role_color || "";
      const roleColor = rawColor.startsWith("#") ? rawColor : `#${rawColor}`;
      setForm({
        role_name: role.role_name,
        role_color: roleColor,
      });
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit({ ...form });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-md w-full"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="role_name" className="text-sm font-medium">
          Role Name{" "}
        </label>
        <Input
          id="role_name"
          name="role_name"
          placeholder="Role Name"
          value={form.role_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="role_color" className="text-sm font-medium">
          Couleur
        </label>
        <div id="role_color">
          <CirclePicker
            color={form.role_color || "#000000"}
            onChangeComplete={(color) =>
              setForm((p) => ({ ...p, role_color: color?.hex || p.role_color }))
            }
          />
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

export default EditRole;
