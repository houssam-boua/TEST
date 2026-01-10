import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetRolesQuery } from "@/slices/rolesSlices";
import { useGetDepartementsQuery, useGetSitesQuery } from "@/slices/departementSlice";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

const EditUser = ({ user, onSubmit, onCancel, loading, error }) => {
  // --- Data Fetching ---
  const { data: rolesData = [], isLoading: loadingRoles } = useGetRolesQuery();
  const { data: depsData = [], isLoading: loadingDeps } = useGetDepartementsQuery();
  const { data: sitesData = [], isLoading: loadingSites } = useGetSitesQuery();

  // --- Form State ---
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    role: "",
    site: "",       
    departement: "",
    password: "",
  });

  // ✅ Track the target department to set AFTER site is initialized
  const [pendingDepartement, setPendingDepartement] = useState(null);

  // --- Force Select re-render ---
  const [formKey, setFormKey] = useState(0);

  // --- Helper: Safely extract ID as String ---
  const extractId = (value) => {
    if (!value) return "";
    if (typeof value === "object" && value.id) return String(value.id);
    return String(value);
  };

  // --- STEP 1: Initialize Basic Fields + Role + Site ---
  useEffect(() => {
    if (!user) return;
    
    // Wait for all dropdown data to load
    const dataReady = rolesData.length > 0 && sitesData.length > 0 && depsData.length > 0;
    if (!dataReady) {
      console.log("⏳ Waiting for dropdown data...");
      return;
    }

    // Extract IDs
    const roleId = extractId(user.role);
    const deptId = extractId(user.departement);

    // Extract Site ID
    let siteId = "";

    // Priority A: Direct site on user
    if (user.site) {
      siteId = extractId(user.site);
    }
    
    // Priority B: Site in departement.site_details
    if (!siteId && user.departement?.site_details) {
      siteId = extractId(user.departement.site_details);
    }

    // Priority C: Site as direct ID in departement.site
    if (!siteId && user.departement?.site) {
      siteId = extractId(user.departement.site);
    }

    // Priority D: Search in departments list
    if (!siteId && deptId) {
      const foundDept = depsData.find((d) => String(d.id) === deptId);
      if (foundDept) {
        siteId = extractId(foundDept.site_details) || extractId(foundDept.site);
      }
    }

    console.log("✅ Step 1: Setting Role + Site", { roleId, siteId, deptId });

    // Set form WITHOUT department first
    setForm({
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      username: user.username || "",
      email: user.email || "",
      password: "",
      role: roleId,
      site: siteId,      // ✅ Set site first
      departement: "",   // ✅ Leave empty for now
    });

    // Store the target department to set in next step
    setPendingDepartement(deptId);

    // Force Select remount
    setFormKey(prev => prev + 1);

  }, [user, rolesData, sitesData, depsData]);

  // --- STEP 2: Set Department AFTER Site is in State ---
  useEffect(() => {
    // Only run if we have a pending department and site is already set
    if (!pendingDepartement || !form.site) return;

    console.log("✅ Step 2: Setting Department", { 
      pendingDepartement, 
      currentSite: form.site 
    });

    // Set the department now that site filter is active
    setForm(prev => ({
      ...prev,
      departement: pendingDepartement
    }));

    // Clear pending
    setPendingDepartement(null);

    // Force another remount to update department Select
    setFormKey(prev => prev + 1);

  }, [form.site, pendingDepartement]);

  // --- Filter Departments ---
  const filteredDepartments = useMemo(() => {
    if (!form.site) return [];
    return depsData.filter((d) => {
      const dSiteId = extractId(d.site) || extractId(d.site_details);
      return dSiteId === form.site;
    });
  }, [depsData, form.site]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name, value) => {
    setForm((p) => {
      if (name === "site") {
        return { ...p, site: value, departement: "" };
      }
      return { ...p, [name]: value };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onSubmit) return;

    const payload = {
      id: user?.id,
      first_name: form.firstName,
      last_name: form.lastName,
      username: form.username,
      email: form.email,
      ...(form.password ? { password: form.password } : {}),
      role: form.role ? parseInt(form.role) : null,
      departement: form.departement ? parseInt(form.departement) : null,
    };
    
    onSubmit(payload);
  };

  const isLoadingData = loadingRoles || loadingSites || loadingDeps;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {typeof error === "string" ? error : "Failed to update user."}
          </AlertDescription>
        </Alert>
      )}

      {isLoadingData && (
        <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading form data...</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Names & Email */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">First Name</label>
          <Input 
            name="firstName" 
            value={form.firstName} 
            onChange={handleChange} 
            required 
            disabled={isLoadingData}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Last Name</label>
          <Input 
            name="lastName" 
            value={form.lastName} 
            onChange={handleChange} 
            required 
            disabled={isLoadingData}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Username</label>
          <Input 
            name="username" 
            value={form.username} 
            onChange={handleChange} 
            required 
            disabled={isLoadingData}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Email</label>
          <Input 
            name="email" 
            type="email" 
            value={form.email} 
            onChange={handleChange} 
            required 
            disabled={isLoadingData}
          />
        </div>

        {/* Role Selection */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm font-medium">Role</label>
          <Select 
            key={`role-${formKey}`}
            value={form.role} 
            onValueChange={(v) => handleSelect("role", v)}
            disabled={loadingRoles || rolesData.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingRoles ? "Loading roles..." : "Select role"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {rolesData.map((r) => (
                  <SelectItem key={String(r.id)} value={String(r.id)}>
                    {r.role_name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Site Selection */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Site</label>
          <Select 
            key={`site-${formKey}`}
            value={form.site} 
            onValueChange={(v) => handleSelect("site", v)}
            disabled={loadingSites || sitesData.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingSites ? "Loading sites..." : "Select Site"} />
            </SelectTrigger>
            <SelectContent>
              {sitesData.map((s) => (
                <SelectItem key={String(s.id)} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department Selection */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Department</label>
          <Select 
            key={`dept-${formKey}-${form.site}`}
            value={form.departement} 
            onValueChange={(v) => handleSelect("departement", v)}
            disabled={!form.site || loadingDeps}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={
                  !form.site 
                    ? "Select a Site first" 
                    : loadingDeps 
                      ? "Loading departments..." 
                      : filteredDepartments.length === 0 
                        ? "No departments in this site" 
                        : "Select Department"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {filteredDepartments.map((d) => (
                <SelectItem key={String(d.id)} value={String(d.id)}>
                  {d.dep_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm font-medium">Password (Optional)</label>
          <Input 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={handleChange} 
            placeholder="Leave blank to keep current" 
            disabled={isLoadingData}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t mt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={loading || isLoadingData}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading || isLoadingData}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditUser;
