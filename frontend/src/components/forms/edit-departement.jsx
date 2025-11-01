import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EditDepartement = ({ department, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    dep_name: "",
    dep_color: "",
  });

  useEffect(() => {
    if (department) {
      // Normalize color to ensure it starts with '#' so the color input works
      const rawColor = department.dep_color || "";
      const depColor = rawColor.startsWith("#") ? rawColor : `#${rawColor}`;
      setForm({
        dep_name: department.dep_name,
        dep_color: depColor,
      });
    }
  }, [department]);

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
          Departement Name{" "}
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
          Couleur
        </label>
        <input
          id="dep_color"
          name="dep_color"
          type="color"
          value={form.dep_color}
          onChange={handleChange}
          className="w-12 h-10 p-0 rounded-md border"
        />
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
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default EditDepartement;
