import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CirclePicker } from "react-color";
import CreatableSelect from "../collection/createable-select";

const CreateFolder = ({ onCreate, onCancel, loading, className, ...props }) => {
  const [form, setForm] = React.useState({ path: "" });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // normalize prefix and entered path, then combine
    const prefixRaw = String(props.prefix || "").trim();
    const entered = String(form.path || "").trim();
    if (!entered) return; // noop when empty

    // strip leading/trailing slashes from both
    const strip = (s) => s.replace(/^\/+|\/+$/g, "");
    const pref = prefixRaw === "/" ? "" : strip(prefixRaw);
    const combined = pref ? `${pref}/${strip(entered)}` : strip(entered);

    if (typeof onCreate === "function") {
      // collect other form values (including the hidden input written by CreatableSelect)
      const fd = new FormData(e.target);
      const folderType = fd.get("folderType") || null;
      return onCreate({ path: combined, type: folderType });
    }
    console.debug("CreateFolderForm payload", { ...form, type: null });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={"flex flex-col gap-4 max-w-lg w-full " + (className || "")}
      {...props}
    >
      <div className="w-full max-w-lg ">
        <div className="flex flex-row gap-4 mb-4">
          <span className="text-sm font-bold">Current path:</span>
          <span className="text-sm font-medium">{props.prefix || "/"}</span>
        </div>
        <div className="grid grid-rows-2 gap-3">
          <div className="flex flex-col">
            <label htmlFor="path" className="text-sm font-bold">
              New Path
            </label>
            <Input
              id="path"
              name="path"
              type="text"
              placeholder="Enter new folder name"
              className="peer pl"
              onChange={handleChange}
              value={form.path}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="path" className="text-sm font-bold">
              Reference
            </label>
            <CreatableSelect
              options={[
                { value: "private", label: "Private" },
                { value: "public", label: "Public" },
              ]}
              defaultValue={{ value: "private", label: "Private" }}
              name="folderType"
              id="folder-type"
            />
          </div>
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
