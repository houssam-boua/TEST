// Pages/CreateWorkflow.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetUsersByRoleAndDeptQuery } from "@/slices/userSlice";
import { useGetDocumentsQuery } from "@/slices/documentSlice";
import { useCreateWorkflowMutation } from "@/slices/workflowSlice";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Info, Ban, ShieldCheck } from "lucide-react";

// Validation schema
const workflowSchema = z.object({
  nom: z.string().min(1, "Workflow name is required"),
  description: z.string().min(1, "Description is required"),
  documentId: z.string().min(1, "Document is required"),
  authorId: z.string().min(1, "Author is required"),
  reviewerId: z.string().min(1, "Reviewer is required"),
  approverId: z.string().min(1, "Approver is required"),
  publisherId: z.string().min(1, "Publisher is required"),
});

export default function CreateWorkflowPage() {
  const navigate = useNavigate();
  const [createWorkflow, { isLoading: isSubmitting }] = useCreateWorkflowMutation();
  
  // 1. Fetch Documents
  const { data: documentsData = [], isLoading: documentsLoading } = useGetDocumentsQuery();
  
  // Normalize documents data
  const documents = Array.isArray(documentsData)
    ? documentsData
    : Array.isArray(documentsData?.results)
    ? documentsData.results
    : [];

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [selectedDeptName, setSelectedDeptName] = useState(""); 
  const [documentHasNoDept, setDocumentHasNoDept] = useState(false);

  const form = useForm({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      nom: "",
      description: "",
      documentId: "",
      authorId: "",
      reviewerId: "",
      approverId: "",
      publisherId: "",
    },
  });

  // Watch document selection to trigger department update
  const selectedDocId = form.watch("documentId");

  useEffect(() => {
    if (selectedDocId) {
      const doc = documents.find((d) => String(d.id) === String(selectedDocId));

      if (doc) {
        // Priority 1: Check if details were pre-fetched by backend serializer (doc_departement_details)
        let deptId = null;
        let deptName = null; // Start null so we can detect if missing

        // Checking various potential field names from API response
        const deptSource = 
          doc.doc_departement_details || 
          doc.doc_departement ||         
          doc.departement ||             
          doc.department;                

        if (deptSource) {
          if (typeof deptSource === 'object') {
            // Best case: We have the full object
            deptId = deptSource.id;
            deptName = deptSource.dep_name || deptSource.name; 
          } else {
            // Fallback: We only have the ID (integer)
            deptId = deptSource; 
            // We won't set a "Department #3" name here, we'll leave it null
            // so the UI can show a generic "Document's Department" message instead of an ugly ID.
          }
        }

        if (deptId) {
          setSelectedDeptId(deptId);
          setSelectedDeptName(deptName); // Can be null if we only have ID
          setDocumentHasNoDept(false);
          
          // Reset user fields when department changes to ensure validity
          form.setValue("authorId", "");
          form.setValue("reviewerId", "");
          form.setValue("approverId", "");
          form.setValue("publisherId", "");
        } else {
          setSelectedDeptId(null);
          setSelectedDeptName("");
          setDocumentHasNoDept(true); 
        }
      }
    } else {
        setSelectedDeptId(null);
        setSelectedDeptName("");
        setDocumentHasNoDept(false);
    }
  }, [selectedDocId, documents, form]);

  // 2. Fetch Users filtered by Department AND Role
  const { data: authors = [], isFetching: loadingAuthors } = useGetUsersByRoleAndDeptQuery(
    { departmentId: selectedDeptId, role: 'Author' },
    { skip: !selectedDeptId }
  );

  const { data: reviewers = [], isFetching: loadingReviewers } = useGetUsersByRoleAndDeptQuery(
    { departmentId: selectedDeptId, role: 'Reviewer' },
    { skip: !selectedDeptId }
  );

  const { data: approvers = [], isFetching: loadingApprovers } = useGetUsersByRoleAndDeptQuery(
    { departmentId: selectedDeptId, role: 'Approver' },
    { skip: !selectedDeptId }
  );

  const { data: publishers = [], isFetching: loadingPublishers } = useGetUsersByRoleAndDeptQuery(
    { departmentId: selectedDeptId, role: 'Publisher' },
    { skip: !selectedDeptId }
  );

  const handleSubmit = async (values) => {
    setError(null);
    setSuccess(false);

    // NOTE: Frontend segregation check removed to rely on backend validation.
    // The backend has access to the full User model to correctly verify Admin status.

    try {
      const payload = {
        nom: values.nom,
        description: values.description,
        document: parseInt(values.documentId, 10),
        author: parseInt(values.authorId, 10),
        reviewer: parseInt(values.reviewerId, 10),
        approver: parseInt(values.approverId, 10),
        publisher: parseInt(values.publisherId, 10),
      };

      const result = await createWorkflow(payload).unwrap();
      setSuccess(true);
      
      setTimeout(() => {
        navigate(`/workflows/${result.id}`);
      }, 1500);
    } catch (err) {
      console.error("Failed to create workflow:", err);
      // Backend error will be displayed here if validation fails
      const errorMsg = err?.data?.error || err?.data?.detail || 
                       (err?.data?.approver ? err.data.approver[0] : "Failed to create workflow");
      setError(errorMsg);
    }
  };

  if (documentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Workflow</CardTitle>
          <CardDescription>
            Configure the sequential validation process for a document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-900 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Workflow created successfully! Redirecting...</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workflow Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Quality Procedure Review" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the purpose..." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- Document Selection --- */}
              <FormField
                control={form.control}
                name="documentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a document" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documents.map((doc) => (
                          <SelectItem key={doc.id} value={String(doc.id)}>
                            {doc.doc_title || doc.doc_path || `Document ${doc.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecting a document will automatically filter available users based on its department.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- User Assignments Area --- */}
              {selectedDeptId ? (
                <div className="space-y-6 border-t pt-6">
                  {/* ✅ Professional Message Badge */}
                  <div className="flex items-center gap-3 mb-2 bg-slate-50 p-3 rounded-md border border-slate-100">
                    <ShieldCheck className="h-5 w-5 text-indigo-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">
                        Restricted Selection Mode
                      </span>
                      <span className="text-xs text-slate-500">
                        You are viewing users from the <strong>{selectedDeptName || "Document's Department"}</strong> + Administrators.
                      </span>
                    </div>
                  </div>
                  
                  {/* Step 1: Author */}
                  <FormField
                    control={form.control}
                    name="authorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Step 1: Author (Draft)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={loadingAuthors}>
                              <SelectValue placeholder={loadingAuthors ? "Loading..." : "Select Author"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {authors.map((user) => (
                              <SelectItem key={user.id} value={String(user.id)}>
                                {user.first_name} {user.last_name} ({user.username}) 
                                {(user.is_superuser || user.is_staff) && " 🛡️"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Step 2: Reviewer */}
                  <FormField
                    control={form.control}
                    name="reviewerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Step 2: Reviewer</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={loadingReviewers}>
                              <SelectValue placeholder={loadingReviewers ? "Loading..." : "Select Reviewer"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {reviewers.map((user) => (
                              <SelectItem key={user.id} value={String(user.id)}>
                                {user.first_name} {user.last_name} ({user.username})
                                {(user.is_superuser || user.is_staff) && " 🛡️"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Step 3: Approver */}
                  <FormField
                    control={form.control}
                    name="approverId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Step 3: Approver (Signatory)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={loadingApprovers}>
                              <SelectValue placeholder={loadingApprovers ? "Loading..." : "Select Approver"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {approvers.map((user) => (
                              <SelectItem key={user.id} value={String(user.id)}>
                                {user.first_name} {user.last_name} ({user.username})
                                {(user.is_superuser || user.is_staff) && " 🛡️"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Must be different from Author, unless Admin.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Step 4: Publisher */}
                  <FormField
                    control={form.control}
                    name="publisherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Step 4: Publisher</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={loadingPublishers}>
                              <SelectValue placeholder={loadingPublishers ? "Loading..." : "Select Publisher"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {publishers.map((user) => (
                              <SelectItem key={user.id} value={String(user.id)}>
                                {user.first_name} {user.last_name} ({user.username})
                                {(user.is_superuser || user.is_staff) && " 🛡️"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <div className={`rounded-md p-4 border ${documentHasNoDept ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex">
                    {documentHasNoDept ? <Ban className="h-5 w-5 text-red-400" /> : <Info className="h-5 w-5 text-blue-400" />}
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${documentHasNoDept ? 'text-red-800' : 'text-blue-800'}`}>
                        {documentHasNoDept ? "Missing Department Data" : "No Document Selected"}
                      </h3>
                      <div className={`mt-2 text-sm ${documentHasNoDept ? 'text-red-700' : 'text-blue-700'}`}>
                        {documentHasNoDept 
                          ? "This document is not assigned to any department. Please check document settings." 
                          : "Please select a document above to load the eligible users."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isSubmitting || !selectedDeptId} className="w-1/3">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Workflow"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/workflows")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
