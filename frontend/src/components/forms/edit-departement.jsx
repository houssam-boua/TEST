import React, { useEffect, useState } from "react";
import { CirclePicker } from "react-color";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useGetSitesQuery } from "@/Slices/departementSlice";

const EditDepartement = ({ department, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    dep_name: "",
    dep_color: "#2563eb",
    site: "",
  });

  // Fetch available sites
  const { data: sites = [], isLoading: sitesLoading } = useGetSitesQuery();

  useEffect(() => {
    if (department) {
      // Normalize color to ensure it starts with '#'
      const rawColor = department.dep_color || "";
      const depColor = rawColor.startsWith("#") ? rawColor : `#${rawColor}`;
      
      setForm({
        dep_name: department.dep_name || "",
        dep_color: depColor,
        // Ensure site ID is a string for the Select component
        site: department.site ? String(department.site) : "",
      });
    }
  }, [department]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSiteChange = (value) => {
    setForm((prev) => ({ ...prev, site: value }));
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
      {/* Site Selection */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="site">Site</Label>
        <Select
          value={form.site}
          onValueChange={handleSiteChange}
          disabled={sitesLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={sitesLoading ? "Chargement..." : "Sélectionner un site"} />
          </SelectTrigger>
          <SelectContent>
            {sites.map((site) => (
              <SelectItem key={site.id} value={String(site.id)}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Department Name */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="dep_name">Nom du Département</Label>
        <Input
          id="dep_name"
          name="dep_name"
          placeholder="ex. Ressources Humaines"
          value={form.dep_name}
          onChange={handleChange}
          required
        />
      </div>

      {/* Color Picker */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="dep_color">Couleur</Label>
        <div className="p-3 border rounded-lg bg-slate-50/50">
          <CirclePicker
            color={form.dep_color}
            onChangeComplete={(color) =>
              setForm((p) => ({ ...p, dep_color: color?.hex || p.dep_color }))
            }
            width="100%"
            circleSize={24}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-4 border-t mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer"
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditDepartement;