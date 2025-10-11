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
  task_name: z.string().min(2, { message: "Nom trop court" }),
  task_date_echeance: z.string().optional(),
  task_priorite: z.string().optional(),
  task_statut: z.string().optional(),
  task_assigned_to: z.string().optional(),
});
const CreateTask = () => {
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(docSchema),
    defaultValues: {
      task_name: "",
      task_date_echeance: "",
      task_priorite: "",
      task_statut: "",
      task_assigned_to: "",
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const formData = new FormData();
      formData.append("task_name", data.task_name);
      formData.append("task_date_echeance", data.task_date_echeance || "");
      formData.append("task_priorite", data.task_priorite || "");
      formData.append("task_statut", data.task_statut || "");
      formData.append("task_assigned_to", data.task_assigned_to || "");

      if (typeof onCreate === "function") {
        await onCreate(formData, data);
      } else {
        console.log("Form data ready for submission:", data);
      }
      form.reset(form.getValues());
    } catch (err) {
      setSubmitError(err?.message || "Erreur lors de la création du document");
      console.error("Create task error:", err);
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
            fill task details
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
                ></FormField>

                <FormField
                  control={form.control}
                  name="task_date_echeance"
                  render={({ field }) => {
                    const dateObj = field.value
                      ? new Date(field.value)
                      : undefined;
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
                      <FormLabel>Priority</FormLabel>
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
                              <SelectLabel>Proprieties</SelectLabel>
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

                <FormField
                  control={form.control}
                  name="task_statut"
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
                          placeholder="Décrivez le workflow"
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
};

export default CreateTask;
