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
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronsUpDown, Check } from "lucide-react";
import { useGetUsersQuery } from "@/Slices/userSlice";

const taskSchema = z.object({
  task_name: z.string().min(1, "Nom requis"),
  task_date_echeance: z.string().min(1, "Date requise"),
  task_priorite: z.enum(["urgent", "high", "normal", "low"]).default("normal"),
  task_statut: z
    .enum(["not_started", "in_progress", "completed"])
    .default("not_started"),
  task_assigned_to: z.string().optional().default(""),
  // document is supplied by the parent workflow and not collected here
});

export default function CreateTaskForm({
  className,
  onCreate,
  onBack,
  workflowDocumentId = null,
  ...props
}) {
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // document selector removed; document id will come from workflowDocumentId prop

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      task_name: "",
      task_date_echeance: "",
      task_priorite: "normal",
      task_statut: "not_started",
      task_assigned_to: "",
    },
  });

  // Use the users slice to fetch assignable users
  const { data: usersData = {}, isLoading: usersLoading } = useGetUsersQuery();
  // usersData may be a paginated object { results: [...] } or a plain array.
  // Normalize to an array to avoid runtime errors when mapping.
  const users = Array.isArray(usersData)
    ? usersData
    : Array.isArray(usersData?.results)
    ? usersData.results
    : [];

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
      // Attach the workflow's document id provided by the parent form
      if (workflowDocumentId) {
        formData.append("document", workflowDocumentId);
      }
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
    <div className={cn("flex flex-col gap-6  w-full", className)} {...props}>
      <Card className="border-4 border-border w-full md:max-w-full">
        <CardContent>
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
                      <FormLabel>Task name</FormLabel>
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
                    const dateObj = field.value
                      ? new Date(field.value)
                      : undefined;
                    return (
                      <FormItem>
                        <FormLabel>Due date</FormLabel>
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez une priorité" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>...</SelectLabel>
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
                      <FormLabel>Status</FormLabel>
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
                              <SelectItem value="not_started">
                                Not started
                              </SelectItem>
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

                <FormField
                  control={form.control}
                  name="task_assigned_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned to</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                usersLoading
                                  ? "Loading users..."
                                  : "Select a user"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Users</SelectLabel>
                              {users.map((u) => (
                                <SelectItem key={u.id} value={String(u.id)}>
                                  {u.first_name} {u.last_name} ({u.username})
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

                {/* Document selector removed — document id comes from the workflow */}
              </div>

              <div className="flex justify-between gap-3">
                <Button type="button" variant="secondary" onClick={onBack}>
                  Retour
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
