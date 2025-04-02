// components/FileViewer.jsx
import React, { useState, useEffect } from 'react';
import PDFPreview from './file-previews/PDFPreview';
import ImagePreview from './file-previews/ImagePreview';
import TextPreview from './file-previews/TextPreview';
import DefaultPreview from './file-previews/DefaultPreview';

const FileViewer = ({ file, onError }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) return;

    const fetchFileContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(file.path);
        if (!response.ok) throw new Error('Failed to fetch file content');

        if (file.path.endsWith('.pdf')) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setContent(<PDFPreview url={url} fileName={file.name} />);
        } 
        else if (file.path.endsWith('.txt') || file.path.endsWith('.md')) {
          const text = await response.text();
          setContent(<TextPreview content={text} fileName={file.name} />);
        } 
        else if (file.path.endsWith('.jpg') || file.path.endsWith('.png')) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setContent(<ImagePreview url={url} fileName={file.name} />);
        } 
        else {
          const text = await response.text();
          setContent(<TextPreview content={text} fileName={file.name} />);
        }
      } catch (err) {
        setError(err.message);
        onError?.(err.message);
        setContent(<DefaultPreview fileName={file.name} />);
      } finally {
        setLoading(false);
      }
    };

    fetchFileContent();
  }, [file, onError]);

  if (loading) return <p className="text-base-500">Loading file...</p>;
  if (error) return <p className="text-error">{error}</p>;
  if (!file) return <p className="text-base-500">Select a file to preview</p>;
  
  return content || <DefaultPreview fileName={file.name} />;
};

export default FileViewer;