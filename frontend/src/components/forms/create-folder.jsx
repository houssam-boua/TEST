import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CirclePicker } from "react-color";

const CreateFolder = ({ onCreate, onCancel, loading, className, ...props }) => {
  const [form, setForm] = React.useState({ path: "" });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (typeof onCreate === "function") {
      return onCreate({ ...form });
    }
    console.debug("CreateFolderForm payload", form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={"flex flex-col gap-4 max-w-md w-full " + (className || "")}
      {...props}
    >
      <div className="w-full max-w-md ">
        <label htmlFor="path" className="text-sm font-medium">
          New Path
        </label>
        <div className="flex rounded-md shadow-xs">
          <span className="border-input bg-background text-muted-foreground -z-1 inline-flex items-center rounded-l-md border px-3 text-sm">
           {props.prefix}
          </span>
          <Input
            id="path"
            name="path"
            type="text"
            placeholder="shadcnstudio.com"
            className="peer pl"
            onChange={handleChange}
            value={form.path}
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

export default CreateFolder;
