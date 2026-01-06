import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DeleteRoleForm({
  onConfirm,
  onCancel,
  loading,
  error, // ✅ Added error display
}) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="bg-red-50 text-red-900 p-4 rounded-md text-sm border border-red-200">
        <p className="font-semibold">Warning: This action cannot be undone.</p>
        <p className="mt-1">
          Deleting this role will remove it from the system. Users currently assigned to this role may lose access.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to delete role.</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end gap-3 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          variant="destructive" 
          onClick={onConfirm} 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete Role"
          )}
        </Button>
      </div>
    </div>
  );
}