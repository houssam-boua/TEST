import React, { useState } from "react";
import { CirclePicker } from "react-color";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CreateDepartement = ({ onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    dep_name: "",
    dep_color: "#2563eb",
  });

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
        <label htmlFor="dep_name" className="text-sm font-medium">
          Departement Name
        </label>
        <Input
          id="dep_name"
          name="dep_name"
          placeholder="Departement Name"
          value={form.dep_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="dep_color" className="text-sm font-medium">
          Color
        </label>
        <div id="dep_color">
          <CirclePicker
            color={form.dep_color || "#2563eb"}
            onChangeComplete={(color) =>
              setForm((p) => ({ ...p, dep_color: color?.hex || p.dep_color }))
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
};

export default CreateDepartement;
