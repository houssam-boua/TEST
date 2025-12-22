import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CirclePicker } from "react-color";
import CreatableSelect from "../collection/createable-select";

const CreateFolder = ({ onCreate, onCancel, loading, className, ...props }) => {
  const [form, setForm] = React.useState({
    fol_name: "",
    fol_path: "",
    fol_index: "",
    parent_folder: "",
    created_by: "",
  });
  React.useEffect(() => {
    // keep fol_path in sync with current prefix (the current folder path)
    setForm((p) => ({
      ...p,
      fol_path: props.prefix || "",
      parent_folder:
        p.parent_folder || props.parent || props.parent_folder || "",
      created_by:
        p.created_by ||
        props.currentUserId ||
        (props.currentUser && props.currentUser.id) ||
        "",
    }));
  }, [
    props.prefix,
    props.parent,
    props.parent_folder,
    props.currentUserId,
    props.currentUser,
  ]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // normalize prefix and entered folder name, then combine (for display/use if needed)
    const prefixRaw = String(props.prefix || "").trim();
    const entered = String(form.fol_name || "").trim();
    if (!entered) return; // noop when empty

    // strip leading/trailing slashes from both
    const strip = (s) => s.replace(/^\/+|\/+$/g, "");
    const pref = prefixRaw === "/" ? "" : strip(prefixRaw);
    const combined = pref ? `${pref}/${strip(entered)}` : strip(entered);

    if (typeof onCreate === "function") {
      // collect other form values (including the hidden inputs written by CreatableSelect)
      const fd = new FormData(e.target);
      const folIndex = fd.get("fol_index") || null;
      const payload = {
        fol_name: entered,
        fol_path: fd.get("fol_path") || props.prefix || "",
        fol_index: folIndex,
        parent_folder:
          fd.get("parent_folder") ||
          form.parent_folder ||
          props.parent ||
          props.parent_folder ||
          null,
        created_by:
          fd.get("created_by") ||
          props.currentUserId ||
          (props.currentUser && props.currentUser.id) ||
          null,
        // also provide a combined path if the caller wants it
        combined_path: combined,
      };
      return onCreate(payload);
    }
    console.debug("CreateFolderForm payload", {
      ...form,
      combined_path: combined,
    });
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
            <label htmlFor="fol_name" className="text-sm font-bold">
              Folder name
            </label>
            <Input
              id="fol_name"
              name="fol_name"
              type="text"
              placeholder="Enter new folder name"
              className="peer pl"
              onChange={handleChange}
              value={form.fol_name}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="path" className="text-sm font-bold">
              Index
            </label>
            <CreatableSelect
              options={[
                { value: "private", label: "Private" },
                { value: "public", label: "Public" },
              ]}
              defaultValue={{ value: "private", label: "Private" }}
              name="fol_index"
              id="folder-type"
            />
          </div>
        </div>
      </div>

      {/* hidden inputs: fol_path (current path), parent_folder, created_by */}
      <input
        type="hidden"
        name="fol_path"
        value={props.prefix || form.fol_path || ""}
      />
      <input
        type="hidden"
        name="parent_folder"
        value={form.parent_folder || props.parent || props.parent_folder || ""}
      />
      <input
        type="hidden"
        name="created_by"
        value={
          form.created_by ||
          props.currentUserId ||
          (props.currentUser && props.currentUser.id) ||
          ""
        }
      />

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
