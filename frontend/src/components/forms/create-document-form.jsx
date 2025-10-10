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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload } from "lucide-react";
const docSchema = z.object({
  file: z.any().nullable().optional(),
  doc_category: z
    .enum(["Technical", "Financial", "HR", "Legal"])
    .default("Technical"),
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

  const form = useForm({
    resolver: zodResolver(docSchema),
    defaultValues: {
      file: null,
      doc_category: "Technical",
      doc_status: "Draft",
      doc_path: "test_folder",
      doc_owner: "6",
      doc_departement: "3",
      doc_description: "This is a test document",
      doc_comment: "Initial upload",
    },
  });

  const onSubmit = async (values) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (values.file) formData.append("file", values.file);
      formData.append("doc_category", values.doc_category);
      formData.append("doc_status", values.doc_status);
      formData.append("doc_path", values.doc_path);
      formData.append("doc_owner", values.doc_owner);
      formData.append("doc_departement", values.doc_departement);
      formData.append("doc_description", values.doc_description);
      formData.append("doc_comment", values.doc_comment);

      if (typeof onCreate === "function") {
        await onCreate(formData, values);
      } else {
        // Fallback: just log the payload
        console.debug("CreateDocument payload", values);
      }
      form.reset(form.getValues());
    } catch (err) {
      setSubmitError(err?.message || "Erreur lors de la création du document");
      console.error("CreateDocument error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 ", className)} {...props}>
      <Card className="border-4 border-border ">
        <CardHeader className="items-center">
          <CardTitle>Créer un document</CardTitle>
          <CardDescription>
            Renseignez les informations du document
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div>
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-muted rounded-xl cursor-pointer bg-base-200/10 hover:border-primary/60 hover:bg-base-200/20 transition-colors duration-200 ease-in-out"
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
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="file"
                            accept="*/*"
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0] ?? null)
                            }
                                    className="hidden"
                          />
                        </FormControl>
                        <FormDescription>
                          Choisissez un fichier à importer.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Création..." : "Créer"}
                </Button>
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
        </CardContent>
      </Card>
    </div>
  );
}
