import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useGetPermissionsQuery } from "@/slices/permissionSlice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react";

export default function CreatePermissionGroups({ onSubmit, onCancel, loading }) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Fetch available permissions from API
  const { data: permissions = [], isLoading: isLoadingPerms } = useGetPermissionsQuery();

  const form = useForm({
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  const handleFormSubmit = async (values) => {
    setSubmitError(null);
    try {
      if (onSubmit) {
        await onSubmit(values);
        form.reset();
      }
    } catch (err) {
      setSubmitError(err?.data?.error || "Failed to create group.");
    }
  };

  // Helper to remove a selected permission tag
  const removePermission = (codename) => {
    const current = form.getValues("permissions");
    form.setValue(
      "permissions",
      current.filter((c) => c !== codename)
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          
          {/* Group Name */}
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Group name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Editors, Auditors" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Permissions Multi-Select */}
          <FormField
            control={form.control}
            name="permissions"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Permissions</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                          "w-full justify-between h-auto min-h-[40px]",
                          !field.value?.length && "text-muted-foreground"
                        )}
                        disabled={isLoadingPerms}
                      >
                        {field.value?.length > 0
                          ? `${field.value.length} permission(s) selected`
                          : isLoadingPerms ? "Loading permissions..." : "Select permissions"}
                        {isLoadingPerms ? (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search permissions..." />
                      <CommandList className="max-h-[300px] overflow-auto">
                        <CommandEmpty>No permission found.</CommandEmpty>
                        <CommandGroup>
                          {permissions.map((perm) => {
                            const codename = perm.codename || perm; // Handle object or string
                            const isSelected = field.value?.includes(codename);
                            const label = perm.label || perm.name || codename; // Fallback label

                            return (
                              <CommandItem
                                key={codename}
                                value={label} // Search by label
                                onSelect={() => {
                                  const current = field.value || [];
                                  if (current.includes(codename)) {
                                    field.onChange(current.filter((c) => c !== codename));
                                  } else {
                                    field.onChange([...current, codename]);
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{label}</span>
                                  <span className="text-xs text-muted-foreground">{codename}</span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {/* Selected Permissions Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value?.map((codename) => (
                    <Badge key={codename} variant="secondary" className="pr-1">
                      {codename}
                      <button
                        type="button"
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                        onClick={() => removePermission(codename)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <FormDescription>
                  Select the access rights for users in this group.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Group
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}