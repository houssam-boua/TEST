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
  documents = [],
  ...props
}) {
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [docOpen, setDocOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      nom: "",
      description: "",
      etat: "in_progress",
      document: "",
    },
  });

  const onSubmit = async (values) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("nom", values.nom);
      formData.append("description", values.description);
      formData.append("etat", values.etat);
      formData.append("document", values.document);

      if (typeof onCreate === "function") {
        await onCreate(formData, values);
      } else {
        // Fallback: just log the payload
        console.debug("CreateWorkflow payload", values);
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
    <div className={cn("flex flex-col gap-6 ", className)} {...props}>
      <Card className="border-4 border-border ">
        <CardHeader className="items-center">
          <CardTitle>Créer un workflow</CardTitle>
          <CardDescription>
            Renseignez les informations du workflow
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  className="col-span-2"
                  name="task_name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Nom de la tâche</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de la tâche" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>

                <FormField
                  control={form.control}
                  name="task_statut"
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
                      <PopoverContent className="w-full p-0" align="start">
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
                name="doc_description"
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
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateWorkflowForm;
