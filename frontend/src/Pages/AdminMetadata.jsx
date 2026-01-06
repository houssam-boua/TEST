import React, { useState, useMemo } from "react";
import {
  useGetSitesQuery,
  useCreateSiteMutation,
  useUpdateSiteMutation,
  useDeleteSiteMutation,
  useGetDocumentTypesQuery,
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
  useDeleteDocumentTypeMutation,
} from "@/slices/documentSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Loader2, 
  Search, 
  Building, 
  FileType2, 
  Settings2,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// --- Generic CRUD Component ---
const DictionaryManager = ({
  title,
  icon: Icon,
  description,
  data,
  isLoading,
  createHook,
  updateHook,
  deleteHook,
  fields = [], // [{ name: "name", label: "Name", isCode: boolean }, ...]
}) => {
  const [create, { isLoading: isCreating }] = createHook();
  const [update, { isLoading: isUpdating }] = updateHook();
  const [remove, { isLoading: isDeleting }] = deleteHook();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Filtering Logic
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery) return data;
    const lowerQ = searchQuery.toLowerCase();
    return data.filter((item) =>
      fields.some((f) => String(item[f.name] || "").toLowerCase().includes(lowerQ))
    );
  }, [data, searchQuery, fields]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item? This action usually cannot be undone if documents are linked.")) return;
    try {
      await remove(id).unwrap();
      toast.success("Item deleted successfully");
    } catch (err) {
      toast.error("Failed to delete item. It might be in use.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await update({ id: editingItem.id, ...formData }).unwrap();
        toast.success("Item updated successfully");
      } else {
        await create(formData).unwrap();
        toast.success("Item created successfully");
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Operation failed. Please check your inputs.");
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="border-b bg-muted/40 pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {Icon && <Icon className="h-6 w-6" />}
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={`Search ${title}...`}
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Add New
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  {fields.map((f) => (
                    <TableHead key={f.name} className="font-semibold text-foreground">
                      {f.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={fields.length + 1}
                      className="h-48 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="h-8 w-8 opacity-20" />
                        <p>No records found matching your search.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      {fields.map((f) => (
                        <TableCell key={f.name} className="py-3">
                          {f.isCode ? (
                            <Badge variant="outline" className="font-mono bg-muted/50">
                              {item[f.name]}
                            </Badge>
                          ) : (
                            <span className="font-medium text-foreground/90">
                              {item[f.name] || <span className="text-muted-foreground italic">-</span>}
                            </span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-primary" />}
              {editingItem ? `Edit ${title.slice(0, -1)}` : `Create ${title.slice(0, -1)}`}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? "Modify the details below. Changes will be reflected immediately." 
                : "Fill in the details below to add a new entry to the system."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            {fields.map((f) => (
              <div key={f.name} className="space-y-2">
                <Label htmlFor={f.name} className="text-sm font-medium">
                  {f.label} {f.required && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id={f.name}
                  value={formData[f.name] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [f.name]: e.target.value })
                  }
                  placeholder={f.placeholder || ""}
                  required={f.required}
                  className="h-10"
                />
                {f.description && (
                  <p className="text-[0.8rem] text-muted-foreground">
                    {f.description}
                  </p>
                )}
              </div>
            ))}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingItem ? "Save Changes" : "Create Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// --- Main Page Component ---
export default function AdminMetadata() {
  const { data: sites, isLoading: sitesLoading } = useGetSitesQuery();
  const { data: types, isLoading: typesLoading } = useGetDocumentTypesQuery();

  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      <div className="container mx-auto p-6 md:p-8 max-w-7xl space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-primary" />
            System Metadata
          </h1>
          <p className="text-muted-foreground text-lg">
            Configure system-wide classifications and locations used for document indexing.
          </p>
        </div>

        <Tabs defaultValue="sites" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px] h-11 p-1 bg-muted">
            <TabsTrigger value="sites" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm">
              <Building className="mr-2 h-4 w-4" /> Sites
            </TabsTrigger>
            <TabsTrigger value="types" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm">
              <FileType2 className="mr-2 h-4 w-4" /> Document Types
            </TabsTrigger>
          </TabsList>

          {/* --- SITES TAB --- */}
          <TabsContent value="sites" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <DictionaryManager
              title="Sites"
              icon={MapPin}
              description="Manage physical locations (e.g., Factories, HQs) assigned to documents."
              data={sites}
              isLoading={sitesLoading}
              createHook={useCreateSiteMutation}
              updateHook={useUpdateSiteMutation}
              deleteHook={useDeleteSiteMutation}
              fields={[
                {
                  name: "name",
                  label: "Site Name",
                  required: true,
                  placeholder: "e.g. Factory A, Headquarters",
                },
                {
                  name: "location",
                  label: "Location / Address",
                  required: false,
                  placeholder: "e.g. 123 Industrial Ave, Paris",
                  description: "Optional physical address for reference."
                },
              ]}
            />
          </TabsContent>

          {/* --- TYPES TAB --- */}
          <TabsContent value="types" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <DictionaryManager
              title="Document Types"
              icon={FileType2}
              description="Define document classifications and their index prefixes (e.g., Procedure -> PROC)."
              data={types}
              isLoading={typesLoading}
              createHook={useCreateDocumentTypeMutation}
              updateHook={useUpdateDocumentTypeMutation}
              deleteHook={useDeleteDocumentTypeMutation}
              fields={[
                {
                  name: "name",
                  label: "Type Name",
                  required: true,
                  placeholder: "e.g. Standard Operating Procedure",
                },
                {
                  name: "code",
                  label: "Index Code",
                  required: true,
                  placeholder: "e.g. PROC",
                  isCode: true,
                  description: "This code is used as a prefix for generating document IDs (e.g., PROC-001)."
                },
                {
                  name: "description",
                  label: "Description",
                  required: false,
                  placeholder: "Brief description of this document type...",
                },
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}