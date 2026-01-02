import React, { useState, useId } from "react";
import { useGetPermissionsQuery } from "../../slices/permissionSlice";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import {
  Check as CheckIcon,
  ChevronsUpDown as ChevronsUpDownIcon,
  X as XIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CreatePermissionGroups = ({ onSubmit, loading }) => {
  const [localError, setLocalError] = useState(null);
  const { data: permissions } = useGetPermissionsQuery();

  // helpers: permissions may be array of strings (codenames) or objects
  const getPermCodename = (perm) =>
    typeof perm === "string" ? perm : perm?.codename ?? String(perm?.id ?? "");
  const getPermLabel = (permOrCodename) => {
    if (!permOrCodename) return "";
    if (typeof permOrCodename === "string") {
      return permOrCodename
        .replace(/_/g, " ")
        .replace(/\b\w/g, (s) => s.toUpperCase());
    }
    return (
      permOrCodename.label ||
      permOrCodename.name ||
      permOrCodename.codename ||
      String(permOrCodename)
    );
  };

  const form = useForm({
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  const id = useId();
  const [permOpen, setPermOpen] = useState(false);
  const [permExpanded, setPermExpanded] = useState(false);

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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group name</FormLabel>
                    <FormControl>
                      <input
                        className="w-full rounded-md border px-3 py-2"
                        placeholder="Group name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => {
                  const selected = Array.isArray(field.value)
                    ? field.value
                    : [];
                  const maxShownItems = 2;
                  const visibleItems = permExpanded
                    ? selected
                    : selected.slice(0, maxShownItems);
                  const hiddenCount = selected.length - visibleItems.length;

                  const removeSelection = (value, e) => {
                    e.stopPropagation();
                    const prev = Array.isArray(field.value) ? field.value : [];
                    field.onChange(prev.filter((v) => v !== value));
                  };

                  return (
                    <FormItem>
                      <FormLabel>Permissions</FormLabel>
                      <Popover open={permOpen} onOpenChange={setPermOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            id={id}
                            variant="outline"
                            role="combobox"
                            aria-expanded={permOpen}
                            className="h-auto min-h-8 w-full justify-between hover:bg-transparent"
                          >
                            <div className="flex flex-wrap items-center gap-1 pr-2.5">
                              {selected.length > 0 ? (
                                <>
                                  {visibleItems.map((codename) => {
                                    // find object if available
                                    const permObj = (permissions || []).find(
                                      (p) =>
                                        typeof p === "string"
                                          ? p === codename
                                          : (p.codename || String(p.id)) ===
                                            codename
                                    );
                                    const label = permObj
                                      ? getPermLabel(permObj)
                                      : getPermLabel(codename);
                                    return (
                                      <Badge key={codename} variant="outline">
                                        {label}
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="size-4"
                                          onClick={(e) =>
                                            removeSelection(codename, e)
                                          }
                                          asChild
                                        >
                                          <span>
                                            <XIcon className="size-3" />
                                          </span>
                                        </Button>
                                      </Badge>
                                    );
                                  })}
                                  {hiddenCount > 0 || permExpanded ? (
                                    <Badge
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPermExpanded((p) => !p);
                                      }}
                                    >
                                      {permExpanded
                                        ? "Show Less"
                                        : `+${hiddenCount} more`}
                                    </Badge>
                                  ) : null}
                                </>
                              ) : (
                                <span className="text-muted-foreground">
                                  Select permissions...
                                </span>
                              )}
                            </div>
                            <ChevronsUpDownIcon
                              size={16}
                              className="text-muted-foreground/80 shrink-0"
                              aria-hidden="true"
                            />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
                          <Command>
                            <CommandInput placeholder="Search permissions..." />
                            <CommandList>
                              <CommandEmpty>No permission found.</CommandEmpty>
                              <CommandGroup>
                                {(permissions || []).map((perm) => {
                                  const codename =
                                    getPermCodename(perm) || String(perm);
                                  const checked = selected.includes(codename);
                                  const label = getPermLabel(perm);
                                  return (
                                    <CommandItem
                                      key={codename}
                                      value={codename}
                                      onSelect={() => {
                                        const prev = Array.isArray(field.value)
                                          ? field.value
                                          : [];
                                        const next = prev.includes(codename)
                                          ? prev.filter((v) => v !== codename)
                                          : [...prev, codename];
                                        field.onChange(next);
                                      }}
                                    >
                                      <span className="truncate">{label}</span>
                                      {checked && (
                                        <CheckIcon
                                          size={16}
                                          className="ml-auto"
                                        />
                                      )}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="flex gap-3">
                <Button type="submit">
                  {loading ? "Creating..." : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePermissionGroups;
