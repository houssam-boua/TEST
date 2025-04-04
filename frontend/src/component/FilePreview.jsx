import React from 'react';
import EmptyPreview from './file-previews/EmptyPreview';
import UnsupportedPreview from './file-previews/UnsupportedPreview';
import PDFPreview from './file-previews/PDFPreview';
import ImagePreview from './file-previews/ImagePreview';

const FilePreview = ({ file, previewUrl }) => {
  if (!file) return <EmptyPreview />;

  if (file.type.startsWith('image/')) {
    return previewUrl ? (
      <ImagePreview url={previewUrl} /> 
    ) : (
        console.log('Preview URL not available for image file'), // Log the error
      <UnsupportedPreview />
    );
  }

  if (
    file.type.includes('pdf') ||
    file.type.includes('msword') ||
    file.type.includes('wordprocessingml')
  ) {
    return previewUrl ? (
      <PDFPreview url={previewUrl} />
    ) : (
      <UnsupportedPreview />
    );
  }

  return <>console.log('Unsupported file type:', file.type);
 <UnsupportedPreview /></>
};

export default FilePreview;
