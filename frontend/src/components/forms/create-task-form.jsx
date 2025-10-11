import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronsUpDown, Check } from "lucide-react";

const taskSchema = z.object({
  task_name: z.string().min(1, "Nom requis"),
  task_date_echeance: z.string().min(1, "Date requise"),
  task_priorite: z.enum(["urgent", "high", "normal", "low"]).default("normal"),
  task_statut: z
    .enum(["not_started", "in_progress", "completed"])
    .default("not_started"),
  task_assigned_to: z.string().optional().default(""),
  document: z.string().optional().default(""),
});

export default function CreateTaskForm({
  className,
  onCreate,
  onBack,
  documents = [],
  ...props
}) {
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [docOpen, setDocOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      task_name: "",
      task_date_echeance: "",
      task_priorite: "normal",
      task_statut: "not_started",
      task_assigned_to: "",
      document: "",
    },
  });

  const onSubmit = async (values) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("task_name", values.task_name);
      formData.append("task_date_echeance", values.task_date_echeance);
      formData.append("task_priorite", values.task_priorite);
      formData.append("task_statut", values.task_statut);
      formData.append("task_assigned_to", values.task_assigned_to);
      formData.append("document", values.document || "");
      if (typeof onCreate === "function") {
        await onCreate(formData, values);
      } else {
        console.debug("CreateTask payload", values);
      }
      form.reset(form.getValues());
    } catch (err) {
      setSubmitError(err?.message || "Erreur lors de la création de la tâche");
      console.error("CreateTask error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {submitError && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="task_name"
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
              name="task_date_echeance"
              render={({ field }) => {
                const dateObj = field.value ? new Date(field.value) : undefined;
                return (
                  <FormItem>
                    <FormLabel>Date d'échéance</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-between font-normal"
                          >
                            {dateObj
                              ? dateObj.toLocaleDateString()
                              : "Sélectionnez une date"}
                            <ChevronDown className="h-4 w-4 opacity-60" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateObj}
                          captionLayout="dropdown"
                          onSelect={(d) =>
                            field.onChange(
                              d ? d.toISOString().slice(0, 10) : ""
                            )
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Choisissez la date limite de la tâche.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="task_priorite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorité</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez une priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Priorités</SelectLabel>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="task_statut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Statuts</SelectLabel>
                          <SelectItem value="not_started">
                            Not started
                          </SelectItem>
                          <SelectItem value="in_progress">
                            In progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
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
              name="task_assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigné à (ID/nom)</FormLabel>
                  <FormControl>
                    <Input placeholder="Utilisateur assigné" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <PopoverContent className="w-[300px] p-0" align="start">
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
                  <FormDescription>
                    Sélectionnez le document lié à cette tâche.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between gap-3">
            <Button type="button" variant="secondary" onClick={onBack}>
              Retour
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Création..." : "Créer la tâche"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
