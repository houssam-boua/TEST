import React from "react";
import { useParams } from "react-router-dom";
import FolderManager from "@/components/FolderManager";

export default function ConsulteFoldersManager() {
  const { folderId } = useParams();
  const initial = folderId ? decodeURIComponent(folderId) : "/Documents";
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 md:py-6 px-4">
        <FolderManager initialPath={initial} />
      </div>
    </div>
  );
}
