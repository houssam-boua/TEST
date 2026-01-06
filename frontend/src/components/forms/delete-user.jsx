import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DeleteUser = ({ user, onDelete, onCancel, loading, error }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Informational Message */}
      <div className="bg-red-50 text-red-900 p-3 rounded-md text-sm border border-red-200">
        <p className="font-semibold">Are you sure?</p>
        <p>
          This action will permanently delete the user 
          <strong>{user ? ` ${user.username}` : " selected"}</strong>.
        </p>
      </div>

      {/* Error Message (if API fails) */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {typeof error === "string" ? error : "Failed to delete user."}
          </AlertDescription>
        </Alert>
      )}

      {/* Buttons */}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => onDelete(user)} // Pass user back to parent
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete User"
          )}
        </Button>
      </div>
    </div>
  );
};

export default DeleteUser;