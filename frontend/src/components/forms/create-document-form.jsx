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
import { CloudUpload } from "lucide-react";
import { useGetDepartementsQuery } from "../../slices/departementSlice";
import { useGetFoldersQuery } from "../../slices/documentSlice";

export function CreateDocumentForm({ onSubmit, loading }) {
  const [localError, setLocalError] = useState(null);
  const { data: departements } = useGetDepartementsQuery();
  const { data: folders } = useGetFoldersQuery();
  const form = useForm({
    defaultValues: {
      file: null,
      // doc_category: "Technical",
      doc_title: "",
      doc_status: "",
      doc_path: "",
      doc_owner: "",
      doc_departement: "",
      doc_description: "",
    },
  });

  const handleLocalSubmit = async (values) => {
    setLocalError(null);
    if (!onSubmit) return;
    try {
      await onSubmit(values);
      form.reset();
    } catch (err) {
      setLocalError(err?.message || String(err));
      throw err;
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 ")}>
      <Card className="border-4 border-border ">
        <CardContent>
          {localError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{localError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              className="space-y-6"
              onSubmit={form.handleSubmit(handleLocalSubmit)}
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
                  name="doc_path"
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
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
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
                              {departements?.map((dep) => (
                                <SelectItem
                                  key={String(dep.id)}
                                  value={String(dep.id)}
                                >
                                  {dep.dep_name}
                                </SelectItem>
                              ))}
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
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create"}
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
