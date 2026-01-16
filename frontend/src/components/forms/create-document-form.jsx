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
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import mlean from "@/lib/mlean"; // ✅ Import mLean
import { useGetDepartementsQuery } from "../../slices/departementSlice";
import { 
  useGetFoldersQuery,
  useGetSitesQuery,
  useGetDocumentTypesQuery,
  useGetDocumentCodesQuery
} from "../../slices/documentSlice";
import { useAuth } from "@/Hooks/useAuth"; // ✅ NEW: Import Auth Hook

export function CreateDocumentForm({ onSubmit, loading }) {
  const { data: departements } = useGetDepartementsQuery();
  const { data: folders } = useGetFoldersQuery();
  const { data: sites } = useGetSitesQuery();          
  const { data: docTypes } = useGetDocumentTypesQuery(); 
  const { data: docCodes } = useGetDocumentCodesQuery();  // ✅ ADD THIS

  // ✅ Get current user and check permissions
  const { user } = useAuth();
  
  // ✅ Check if user can select department/site (Admin OR has permission)
  const canSelectDeptSite = 
    user?.role?.role_name === 'admin' || 
    user?.permissions?.includes('documents.can_create_cross_department');

  // ✅ State for perimeters
  const [perimetersOptions, setPerimetersOptions] = useState([]);

  // ✅ Fetch mLean Perimeters on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await mlean.fetchPerimeters();
        if (!mounted) return;
        const list = Array.isArray(p) ? p : p?.results || [];
        setPerimetersOptions(list);
      } catch (e) {
        console.error("Failed to fetch mLean perimeters", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const form = useForm({
    defaultValues: {
      file: null,
      doc_title: "",
      doc_status_type: "ORIGINAL",
      doc_departement: "",
      parent_folder: "",
      doc_description: "",
      doc_comment: "",
      site: "",           
      document_type: "",  
      doc_perimeters: "",
      document_code: "",
    },
  });

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      field.onChange(file);
      // Auto-fill title if empty
      if (!form.getValues("doc_title")) {
        form.setValue("doc_title", file.name);
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader>
          <CardTitle>Nouveau Document</CardTitle>
          <CardDescription>
            Remplissez les informations ci-dessous pour créer un document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* File Upload */}
              <FormField
                control={form.control}
                name="file"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Fichier</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        onChange={(e) => handleFileChange(e, { onChange })}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              </div>

              {/* ✅ UPDATED ROW: mLean Perimeter (Always) and Site (Permission-based) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                
                {/* mLean Perimeter Field */}
                <FormField
                  control={form.control}
                  name="doc_perimeters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>mLean Perimeter (Required)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Perimeter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {perimetersOptions.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name || p.title || p.label || `#${p.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ✅ Site: Only visible for users with permission */}
                {canSelectDeptSite && (
                  <FormField
                    control={form.control}
                    name="site"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Site" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sites?.map((s) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* ✅ UPDATED ROW: Document Type (Always) and Department (Permission-based) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <FormField
                  control={form.control}
                  name="document_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type Document</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {docTypes?.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                              {t.name} ({t.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Génère l'index (ex: {docTypes?.[0]?.code || "TYPE"}-01)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ✅ Document Code Field (Always) */}
                <FormField
                  control={form.control}
                  name="document_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code de Document</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un code" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {docCodes?.map((dc) => (
                            <SelectItem key={dc.id} value={String(dc.id)}>
                              {dc.code} - {dc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Sélectionnez le code approprié pour ce document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                {/* ✅ Department: Only visible for users with permission */}
                {canSelectDeptSite && (
                  <FormField
                    control={form.control}
                    name="doc_departement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Département</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir un département" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departements?.map((dept) => (
                              <SelectItem key={dept.id} value={String(dept.id)}>
                                {dept.dep_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Parent Folder */}
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="parent_folder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dossier Parent</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un dossier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {folders?.map((fol) => (
                            <SelectItem key={fol.id} value={String(fol.id)}>
                              {fol.fol_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
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
