import React from 'react'
import { CreateDocumentForm } from '../components/forms/create-document-form';

const CreateDocument = () => {

    const handleCreateDocument = async (formData, values) => {
        // Handle document creation logic here
        console.log("Creating document with data:", values);
    };

  return (
    <div className="flex min-h-svh w-full items-start justify-center p-6 md:p-10 bg-muted/5">
      <div className="w-full  space-y-4">
        <CreateDocumentForm onCreate={handleCreateDocument} />
      </div>
    </div>
  );
}

export default CreateDocument