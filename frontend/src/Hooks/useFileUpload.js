// hooks/useFileUpload.js
import { useState, useCallback, useEffect } from 'react';

const useFileUpload = () => {
  const [fileData, setFileData] = useState({
    file: null,
    previewUrl: null,
    type: null,
  });

  const handleFileChange = useCallback((selectedFile) => {
    if (!selectedFile) return;

    // Create preview URL only for supported types
    let previewUrl = null;
    if (
      selectedFile.type.startsWith('image/') ||
      selectedFile.type === 'application/pdf' ||
      selectedFile.type === 'application/msword' ||
      selectedFile.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      previewUrl = URL.createObjectURL(selectedFile);
    }

    setFileData({
      file: selectedFile,
      previewUrl,
      type: selectedFile.type,
    });
  }, []);

  const handleDelete = useCallback(() => {
    // Clean up existing preview URL
    if (fileData.previewUrl) {
      URL.revokeObjectURL(fileData.previewUrl);
    }
    setFileData({
      file: null,
      previewUrl: null,
      type: null,
    });
  }, [fileData.previewUrl]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (fileData.previewUrl) {
        URL.revokeObjectURL(fileData.previewUrl);
      }
    };
  }, [fileData.previewUrl]);

  return {
    file: fileData.file,
    previewUrl: fileData.previewUrl,
    fileType: fileData.type,
    handleFileChange,
    handleDelete,
  };
};

export default useFileUpload;
