import React from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { ChevronDown, ChevronsUpDown, Check } from "lucide-react";
import { useGetDocumentsQuery } from "@/Slices/documentSlice";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Schema aligned to workflow task fields
const taskSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  description: z.string().min(1, "Date requise"),
  etat: z.enum(["in_progress", "completed"]).default("in_progress"),
  document: z.string().min(1, "Document requis"),
});

export function CreateWorkflowForm({
  className,
  onCreate,
  documents: documentsProp = [],
  ...props
}) {
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [debug, setDebug] = useState({ lastPayload: null, lastFormData: null });

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      nom: "",
      description: "",
      etat: "in_progress",
      document: "",
    },
  });

  // Fetch documents from the API to populate the document selector.
  const { data: fetchedDocuments = [] } = useGetDocumentsQuery();

  const documents =
    (fetchedDocuments && Array.isArray(fetchedDocuments)
      ? fetchedDocuments.map((d) => ({
          value: String(d.id ?? d.pk ?? d?.id),
          label:
            d.file_name ||
            d.doc_description ||
            d.doc_path ||
            `Document ${d.id}`,
        }))
      : []) || documentsProp;

  const onSubmit = async (values) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      console.log("[CreateWorkflowForm] onSubmit called with values:", values);
      const formData = new FormData();
      formData.append("nom", values.nom);
      formData.append("description", values.description);
      formData.append("etat", values.etat);
      formData.append("document", values.document);

      // Build a readable representation of FormData for the debug panel
      const fdEntries = [];
      try {
        for (const pair of formData.entries()) {
          const [k, v] = pair;
          if (v instanceof File) {
            fdEntries.push({
              key: k,
              file: { name: v.name, size: v.size, type: v.type },
            });
            console.debug("[CreateWorkflow] FormData entry:", k, v.name, v);
          } else {
            fdEntries.push({ key: k, value: v });
            console.debug("[CreateWorkflow] FormData entry:", k, v);
          }
        }
      } catch (e) {
        console.debug("[CreateWorkflow] FormData inspect failed", e);
      }

      // Save debug info and also log the original values
      setDebug({ lastPayload: values, lastFormData: fdEntries });
      console.info("[CreateWorkflowForm] submit payload:", values);

      // Also log that we're about to call onCreate (page handler)
      console.log("[CreateWorkflowForm] about to call onCreate prop");

      if (typeof onCreate === "function") {
        console.log("[CreateWorkflowForm] calling onCreate...");
        await onCreate(formData, values);
        console.log("[CreateWorkflowForm] onCreate returned");
      } else {
        // Fallback: just log the payload
        console.log("[CreateWorkflowForm] no onCreate prop, payload:", values);
      }
      form.reset(form.getValues());
    } catch (err) {
      setSubmitError(err?.message || "Erreur lors de la création du workflow");
      console.error("CreateWorkflow error:", err);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card className="border-4 border-border w-full md:max-w-[720px]">
        {/* <CardHeader className="items-center">
          <CardTitle>Créer un workflow</CardTitle>
          <CardDescription>
            Renseignez les informations du workflow
          </CardDescription>
        </CardHeader> */}
        <CardContent>
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  className="col-span-1"
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la tâche</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de la tâche" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="etat"
                  className="col-span-1"
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
                              <SelectItem value="in_progress">
                                In progress
                              </SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Document combobox selector */}
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document</FormLabel>
                    <Popover open={docOpen} onOpenChange={setDocOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={docOpen}
                            className="w-full justify-between"
                          >
                            {field.value
                              ? documents.find(
                                  (d) => String(d.value) === String(field.value)
                                )?.label || "Document sélectionné"
                              : "Sélectionnez un document..."}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-full max-w-[680px] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Rechercher un document..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>Aucun document trouvé.</CommandEmpty>
                            <CommandGroup>
                              {documents.map((doc) => (
                                <CommandItem
                                  key={String(doc.value)}
                                  value={String(doc.value)}
                                  onSelect={(currentValue) => {
                                    const next =
                                      currentValue === field.value
                                        ? ""
                                        : currentValue;
                                    field.onChange(next);
                                    setDocOpen(false);
                                  }}
                                >
                                  {doc.label}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      String(field.value) === String(doc.value)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-muted-foreground">
                      Sélectionnez le document lié à ce workflow.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Décrivez le workflow"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          {/* Debug panel (dev) */}
          <div className="mt-4 p-3 bg-slate-50 rounded border text-sm">
            <div className="font-medium text-xs mb-1">Debug (last submit)</div>
            <pre className="whitespace-pre-wrap break-words text-xs">
              {JSON.stringify(debug, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateWorkflowForm;
