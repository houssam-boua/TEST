import React, { useState } from "react";
import { CirclePicker } from "react-color";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Building, MapPin } from "lucide-react";
import { toast } from "sonner";

// Import your slices
import { 
  useCreateDepartementMutation, 
  useGetSitesQuery 
} from "@/Slices/departementSlice";
import { apiSlice } from "@/Slices/apiSlice";

// Inject createSite if not already in your slices
const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createSite: builder.mutation({
      query: (data) => ({
        url: "/api/sites/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Sites"],
    }),
  }),
  overrideExisting: false, 
});
const { useCreateSiteMutation } = extendedApiSlice;


const CreateDepartement = ({ onSuccess, onCancel }) => {
  const [activeTab, setActiveTab] = useState("department");

  // --- Department Form State ---
  const [deptForm, setDeptForm] = useState({
    dep_name: "",
    dep_color: "#2563eb",
    site: "",
  });

  // --- Site Form State ---
  const [siteForm, setSiteForm] = useState({
    name: "",
    location: "",
  });

  // --- API Hooks ---
  const { data: sites = [], isLoading: sitesLoading } = useGetSitesQuery();
  const [createDepartement, { isLoading: isDeptLoading }] = useCreateDepartementMutation();
  const [createSite, { isLoading: isSiteLoading }] = useCreateSiteMutation();

  // --- Handlers ---

  const handleDeptChange = (e) => {
    const { name, value } = e.target;
    setDeptForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSiteChange = (e) => {
    const { name, value } = e.target;
    setSiteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    if (!deptForm.dep_name || !deptForm.site) {
      toast.error("Le nom et le site sont requis.");
      return;
    }
    try {
      await createDepartement(deptForm).unwrap();
      toast.success("Département créé avec succès !");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Create Dept Error:", err);
      // ✅ Specific Error Handling
      if (err?.data?.dep_name) {
        toast.error(err.data.dep_name[0]);
      } else if (err?.data?.detail) {
        toast.error(err.data.detail);
      } else {
        toast.error("Échec de la création du département. Veuillez réessayer.");
      }
    }
  };

  const handleSiteSubmit = async (e) => {
    e.preventDefault();
    if (!siteForm.name) {
      toast.error("Le nom du site est requis.");
      return;
    }
    try {
      await createSite(siteForm).unwrap();
      toast.success("Site créé avec succès !");
      setSiteForm({ name: "", location: "" });
      setActiveTab("department"); // Switch back to department creation tab
    } catch (err) {
      console.error("Create Site Error:", err);
       // ✅ Specific Error Handling for Site
      if (err?.data?.name) {
         toast.error(`Erreur de nom de site : ${err.data.name[0]}`);
      } else if (err?.data?.detail) {
         toast.error(err.data.detail);
      } else {
         toast.error("Échec de la création du site.");
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="department">Nouveau Département</TabsTrigger>
          <TabsTrigger value="site">Nouveau Site</TabsTrigger>
        </TabsList>

        {/* --- CREATE DEPARTMENT TAB --- */}
        <TabsContent value="department">
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Créer un Département</CardTitle>
              <CardDescription>Ajoutez un nouveau département à un site existant.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleDeptSubmit} className="flex flex-col gap-4">
                
                {/* Site Selection */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="site">Sélectionner un Site</Label>
                  <Select 
                    value={deptForm.site} 
                    onValueChange={(val) => setDeptForm(p => ({ ...p, site: val }))}
                    disabled={sitesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={sitesLoading ? "Chargement des sites..." : "Choisir un site"} />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={String(site.id)}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Vous ne trouvez pas le site ? <button type="button" onClick={() => setActiveTab("site")} className="text-blue-600 hover:underline font-medium">Créer un nouveau site.</button>
                  </p>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dep_name">Nom du Département</Label>
                  <Input
                    id="dep_name"
                    name="dep_name"
                    placeholder="ex. Ressources Humaines"
                    value={deptForm.dep_name}
                    onChange={handleDeptChange}
                    required
                  />
                </div>

                {/* Color */}
                <div className="flex flex-col gap-2">
                  <Label>Étiquette Couleur</Label>
                  <div className="p-3 border rounded-lg bg-slate-50/50">
                    <CirclePicker
                      color={deptForm.dep_color}
                      onChangeComplete={(color) => setDeptForm(p => ({ ...p, dep_color: color.hex }))}
                      width="100%"
                      circleSize={24}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isDeptLoading}>
                    {isDeptLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer Département
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- CREATE SITE TAB --- */}
        <TabsContent value="site">
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Créer un Site</CardTitle>
              <CardDescription>Définissez un nouvel emplacement physique ou une unité organisationnelle.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSiteSubmit} className="flex flex-col gap-4">
                
                <div className="flex flex-col gap-2">
                  <Label htmlFor="site_name">Nom du Site</Label>
                  <div className="relative">
                    <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="site_name"
                      name="name"
                      placeholder="ex. Siège Social, Usine A"
                      className="pl-9"
                      value={siteForm.name}
                      onChange={handleSiteChange}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="location">Emplacement (Optionnel)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      name="location"
                      placeholder="ex. Paris, Lyon"
                      className="pl-9"
                      value={siteForm.location}
                      onChange={handleSiteChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("department")}>
                    Retour
                  </Button>
                  <Button type="submit" disabled={isSiteLoading}>
                    {isSiteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer Site
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateDepartement;