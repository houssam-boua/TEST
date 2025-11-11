import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CirclePicker } from "react-color";

// Simple controlled form that mirrors CreateDepartement logic.
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (typeof onCreate === "function") {
      return onCreate({ ...form });
    }
    console.debug("CreateRoleForm payload", form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={"flex flex-col gap-4 max-w-md w-full " + (className || "")}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="role_name" className="text-sm font-medium">
          Nom du rôle
        </label>
        <Input
          id="role_name"
          name="role_name"
          placeholder="Nom du rôle"
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
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer"}
        </Button>
      </div>
    </form>
  );
}
