import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useContext, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload } from "lucide-react";
import { useCreateDocumentMutation } from "@/Slices/documentSlice";
import { toast } from "sonner";
import { AuthContext } from "../../Context/AuthContextDefinition";
const docSchema = z.object({
  file: z.any().nullable().optional(),
  doc_category: z
    .enum(["Technical", "Financial", "HR", "Legal"])
    .default("Technical"),
  doc_title: z.string().min(1, "Title requis"),
  doc_status: z
    .enum(["Draft", "In Review", "Approved", "Rejected"])
    .default("Draft"),
  doc_path: z.string().min(1, "Path requis"),
  doc_owner: z.string().min(1, "Owner requis"),
  doc_departement: z.string().min(1, "Département requis"),
  doc_description: z.string().min(1, "Description requise"),
  doc_comment: z.string().min(1, "Commentaire requis"),
});

export function CreateDocumentForm({ className, onCreate, ...props }) {
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // RTK Query mutation hook for creating documents (used when no onCreate prop)
  const [createDocumentMutation] = useCreateDocumentMutation();
  const auth = useContext(AuthContext);
  const userId = auth?.userId;
  const form = useForm({
    resolver: zodResolver(docSchema),
    defaultValues: {
      file: null,
      doc_title: "",
      doc_category: undefined,
      doc_status: undefined,
      doc_path: "",
      doc_owner: "",
      doc_departement: undefined,
      doc_description: "",
      doc_comment: "",
    },
  });
  const token = useSelector((s) => s.auth?.token);

  // Visible debug state so user can see submission details in the UI
  const [, setDebug] = useState({
    lastSubmitValues: null,
    lastFormData: null,
    lastResponse: null,
    lastError: null,
  });
  // also expose whether we have an auth token
  useEffect(() => {
    setDebug((d) => ({ ...d, tokenPresent: !!token }));
  }, [token]);

  // Ensure doc_owner and doc_path are populated in the form state
  useEffect(() => {
    try {
      // If userId is available, set it into the form so it's included in values
      if (userId) {
        form.setValue("doc_owner", userId, {
          shouldValidate: false,
          shouldDirty: true,
        });
      } else {
        // still set a fallback so backend receives something meaningful
        form.setValue("doc_owner", "anonymous", {
          shouldValidate: false,
          shouldDirty: true,
        });
      }
      // Path is always 'test' per requirement
      form.setValue("doc_path", "test", {
        shouldValidate: false,
        shouldDirty: true,
      });
    } catch (e) {
      console.warn("[INIT] could not set default form values", e);
    }
  }, [userId, form]);

  const onSubmit = async () => {
    setSubmitError("");
    setSubmitting(true);
    try {
      // Read the latest values from the form (in case setValue changed them)
      const current = form.getValues();
      // Ensure owner and path are present
      const submitValues = {
        ...current,
        doc_owner: userId || current.doc_owner || "anonymous",
        doc_path: current.doc_path || "test",
      };
      setDebug((d) => ({
        ...d,
        lastSubmitValues: submitValues,
        lastResponse: null,
        lastError: null,
      }));
      const formData = new FormData();
      if (submitValues.file) formData.append("file", submitValues.file);
      formData.append("doc_title", submitValues.doc_title);
      formData.append("doc_category", submitValues.doc_category);
      formData.append("doc_status", submitValues.doc_status);
      formData.append("doc_path", submitValues.doc_path);
      formData.append("doc_owner", submitValues.doc_owner);
      formData.append("doc_departement", submitValues.doc_departement);
      formData.append("doc_description", submitValues.doc_description);
      formData.append("doc_comment", submitValues.doc_comment);
      // Build a readable representation of FormData for the debug panel
      const fdEntries = [];
      try {
        for (const pair of formData.entries()) {
          if (pair[1] instanceof File) {
            console.debug("[FormData] entry:", pair[0], pair[1].name, pair[1]);
            fdEntries.push({ key: pair[0], value: pair[1].name });
          } else {
            console.debug("[FormData] entry:", pair[0], pair[1]);
            fdEntries.push({ key: pair[0], value: pair[1] });
          }
        }
      } catch (e) {
        console.debug("[FormData] logging failed", e);
      }
      setDebug((d) => ({ ...d, lastFormData: fdEntries }));
      // If a file is present, prefer the direct upload path which we confirmed works
      if (submitValues.file) {
        try {
          const base =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
          const url = `${base}/api/documents/`;
          const headers = token ? { Authorization: `Token ${token}` } : {};
          const resp = await fetch(url, {
            method: "POST",
            headers,
            body: formData,
          });
          let body;
          const ct = resp.headers.get("content-type") || "";
          if (ct.includes("application/json")) body = await resp.json();
          else body = await resp.text();
          setDebug((d) => ({
            ...d,
            lastResponse: { status: resp.status, body },
            lastError: resp.ok ? null : body,
          }));
          if (!resp.ok) {
            const errMsg =
              typeof body === "string" ? body : JSON.stringify(body);
            setSubmitError(errMsg);
            toast.error(errMsg || "Erreur lors de la création du document");
          } else {
            toast.success("Document créé");
          }
        } catch (fetchErr) {
          console.error("File upload failed:", fetchErr);
          setDebug((d) => ({ ...d, lastResponse: null, lastError: fetchErr }));
          setSubmitError(fetchErr?.message || "File upload failed");
          toast.error(fetchErr?.message || "File upload failed");
        }
      } else {
        // No file: prefer onCreate/RTK path
        let handled = false;
        if (typeof onCreate === "function") {
          try {
            const result = await onCreate(formData, submitValues);
            setDebug((d) => ({ ...d, lastResponse: result, lastError: null }));
            toast.success("Document créé", { duration: 4000 });
            handled = true;
          } catch (err) {
            console.error("onCreate error (falling back to RTK):", err);
            setDebug((d) => ({ ...d, lastResponse: null, lastError: err }));
          }
        }
        if (!handled) {
          try {
            const resAction = await createDocumentMutation(formData);
            setDebug((d) => ({
              ...d,
              lastResponse: resAction,
              lastError: resAction.error || null,
            }));
            if (resAction.error) {
              console.error("CreateDocument failed:", resAction.error);
              const errMsg =
                resAction.error?.data?.detail ||
                resAction.error?.error ||
                JSON.stringify(resAction.error);
              setSubmitError(
                errMsg || "Erreur lors de la création du document"
              );
              toast.error(errMsg || "Erreur lors de la création du document");
            } else if (resAction.data) {
              const result = resAction.data;
              console.debug("CreateDocument success", result);
              try {
                const text = JSON.stringify(result);
                toast.success(
                  `Document créé: ${text.slice(0, 200)}${
                    text.length > 200 ? "…" : ""
                  }
                }`,
                  { duration: 6000 }
                );
              } catch {
                toast.success("Document créé", { duration: 4000 });
              }
            } else {
              console.warn("CreateDocument returned unknown action", resAction);
              toast.error("Erreur inconnue lors de la création du document");
            }
          } catch (rtkErr) {
            console.error("RTK mutation threw:", rtkErr);
            setSubmitError(rtkErr?.message || "RTK mutation failed");
          }
        }
      }
      form.reset(form.getValues());
    } catch (err) {
      setSubmitError(err?.message || "Erreur lors de la création du document");
      toast.error(err?.message || "Erreur lors de la création du document");
      console.error("CreateDocument error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Direct upload helper to post FormData (bypass RTK Query)
  const uploadFormData = async () => {
    const current = form.getValues();
    const submitValues = {
      ...current,
      doc_owner: userId || current.doc_owner || "anonymous",
      doc_path: current.doc_path || "test",
    };
    const formData = new FormData();
    if (submitValues.file) formData.append("file", submitValues.file);
    formData.append("doc_title", submitValues.doc_title);
    formData.append("doc_category", submitValues.doc_category);
    formData.append("doc_status", submitValues.doc_status);
    formData.append("doc_path", submitValues.doc_path);
    formData.append("doc_owner", submitValues.doc_owner);
    formData.append("doc_departement", submitValues.doc_departement);
    formData.append("doc_description", submitValues.doc_description);
    formData.append("doc_comment", submitValues.doc_comment);
    setDebug((d) => ({
      ...d,
      lastSubmitValues: submitValues,
      lastResponse: null,
      lastError: null,
    }));
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const url = `${base}/api/documents/`;
      const headers = token ? { Authorization: `Token ${token}` } : {};
      const resp = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });
      let body;
      const ct = resp.headers.get("content-type") || "";
      if (ct.includes("application/json")) body = await resp.json();
      else body = await resp.text();
      setDebug((d) => ({
        ...d,
        lastResponse: { status: resp.status, body },
        lastError: resp.ok ? null : body,
      }));
      if (!resp.ok) {
        setSubmitError(typeof body === "string" ? body : JSON.stringify(body));
      } else {
        toast.success("Document créé");
      }
    } catch (err) {
      console.error("[UPLOAD] fetch thrown error:", err);
      setDebug((d) => ({ ...d, lastResponse: null, lastError: err }));
      setSubmitError(err?.message || "Upload failed");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 ", className)} {...props}>
      <Card className="border-4 border-border ">
        <CardContent>
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(onSubmit)(e);
              }}
            >
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <label
                      htmlFor="dropzone-file"
                      onDrop={(e) => {
                        e.preventDefault();
                        const f = e.dataTransfer?.files?.[0] ?? null;
                        if (f) field.onChange(f);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-muted rounded-xl cursor-pointer bg-base-200/10 hover:border-primary/60 hover:bg-base-200/20 transition-colors duration-200 ease-in-out"
                    >
                      <div className="flex flex-col items-center justify-center p-5 text-center">
                        <CloudUpload className="w-10 h-10 mb-3 text-primary" />
                        <p className="text-sm text-base-content/80">
                          <span className="font-medium text-primary">
                            Click to upload
                          </span>
                          or drag and drop
                        </p>
                        <p className="text-xs text-base-content/50 mt-1">
                          PDF, DOC, XLS, or images (MAX. 10MB)
                        </p>
                      </div>

                      {/* Invisible but clickable native file input (fills the label) */}
                      <FormControl>
                        <Input
                          id="dropzone-file"
                          type="file"
                          accept="*/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) =>
                            field.onChange(e.target.files?.[0] ?? null)
                          }
                        />
                      </FormControl>

                      {/* Show selected file name and clear control */}
                      {field.value && (
                        <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between gap-2 bg-base-100/60 px-3 py-1 rounded">
                          <div className="truncate text-sm">
                            {field.value.name}
                          </div>
                          <button
                            type="button"
                            className="text-xs text-destructive hover:underline"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              field.onChange(null);
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </label>
                    <FormDescription>
                      Choisissez un fichier à importer.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="doc_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre du document" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doc_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Catégories</SelectLabel>
                              <SelectItem value="Technical">
                                Technique
                              </SelectItem>
                              <SelectItem value="Financial">
                                Financier
                              </SelectItem>
                              <SelectItem value="HR">RH</SelectItem>
                              <SelectItem value="Legal">Légal</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doc_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez un statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Statuts</SelectLabel>
                              <SelectItem value="Draft">Brouillon</SelectItem>
                              <SelectItem value="In Review">
                                En revue
                              </SelectItem>
                              <SelectItem value="Approved">Approuvé</SelectItem>
                              <SelectItem value="Rejected">Rejeté</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doc_departement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Département</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez un département" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Départements</SelectLabel>

                              <SelectItem value="1">RH</SelectItem>
                              <SelectItem value="2">IT</SelectItem>
                              <SelectItem value="3">Finance</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="doc_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Décrivez le document"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doc_comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commentaire</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Commentaire initial"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  disabled={submitting}
                  onClick={async () => {
                    // Prevent default form submission and decide path explicitly
                    try {
                      const values = form.getValues();
                      if (values.file) {
                        // Use the direct upload helper which is known to work for files
                        await uploadFormData();
                      } else {
                        // No file: use normal RHF submit flow
                        await form.handleSubmit(onSubmit)();
                      }
                    } catch (err) {
                      console.error("Create button handler error:", err);
                    }
                  }}
                >
                  {submitting ? "Création..." : "Créer"}
                </Button>
                {/* Direct upload handled by Create button when a file is present */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Réinitialiser
                </Button>
              </div>
            </form>
          </Form>
          {/* Temporary visible debug panel (dev only) */}
        </CardContent>
      </Card>
    </div>
  );
}
