import React, { useState } from 'react';

const Creationdocuments = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setPreview({ type: 'image', url: URL.createObjectURL(selectedFile) });
      } else if (
        selectedFile.type === 'application/pdf' ||
        selectedFile.type === 'application/msword' ||
        selectedFile.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        setPreview({
          type: 'document',
          url: URL.createObjectURL(selectedFile),
        });
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = () => {
    console.log('File submitted:', file);
  };

  const handleDelete = () => {
    setFile(null);
    setPreview(null);
    const fileInput = document.getElementById('dropzone-file');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='flex flex-col lg:flex-row gap-1.5'>
        {/* Left side: File Uploader - Full width on mobile, 1/3 on desktop */}
        <div className='w-full lg:w-2/5 border border-base-300/50 p-4 flex flex-col rounded-md'>
          <h2 className='text-lg font-semibold text-base-content pb-3'>
            Télécharger un fichier
          </h2>

          <div className='flex-1'>
            <div className='flex items-center justify-center w-full'>
              <label
                htmlFor='dropzone-file'
                className='flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-neutral/40 border-dashed rounded-lg cursor-pointer bg-base-200/10 hover:border-neutral/60 hover:bg-base-200/40 transition-colors duration-300'
              >
                <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                  <svg
                    className='w-8 h-8 mb-4 text-primary/60'
                    aria-hidden='true'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 20 16'
                  >
                    <path
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
                    />
                  </svg>
                  <p className='mb-2 text-sm text-base-500 text-center'>
                    <span className='font-semibold'>
                      Cliquez pour télécharger ou {''}
                    </span>
                    glisser-déposer
                  </p>
                  <p className='text-xs text-base-500 text-center'>
                    SVG, PNG, JPG, GIF, PDF, DOC, XLS (MAX. 10MB)
                  </p>
                </div>
                <input
                  id='dropzone-file'
                  type='file'
                  className='hidden'
                  onChange={handleFileChange}
                  accept='.pdf, .doc, .docx, .xls, .xlsx, image/*'
                />
              </label>
            </div>

            {file && (
              <div className='mt-4 space-y-1'>
                <p className='text-sm text-base-content/60 truncate'>
                  <span className='font-semibold'>Name:</span> {file.name}
                </p>
                <p className='text-sm text-base-content/60'>
                  <span className='font-semibold'>Size:</span>{' '}
                  {Math.round(file.size / 1024)} KB
                </p>
                <p className='text-sm text-base-content/60'>
                  <span className='font-semibold'>Type:</span> {file.type}
                </p>
              </div>
            )}

            <fieldset className='fieldset mt-2'>
              <legend className='fieldset-legend'>
                Dossier <span className='fieldset-label text-error'>(*)</span>
              </legend>
              <select defaultValue='Pick a browser' className='select w-full'>
                <option disabled={true}>----</option>
                <option>Stagiaires</option>
                <option>Young engineering</option>
                <option>Factures</option>
              </select>

              <fieldset className='fieldset'>
                <legend className='fieldset-legend'>Description</legend>
                <textarea className='textarea h-24 w-full'></textarea>
              </fieldset>
            </fieldset>

            {/* File details */}
          </div>

          {/* Buttons at the bottom */}
          <div className='mt-4 flex flex-col sm:flex-row gap-2 '>
            <button
              onClick={handleSubmit}
              disabled={!file}
              className='btn btn-primary flex-1/2 shadow-none disabled:opacity-50 font-medium'
            >
              Submit
            </button>
            <button
              onClick={handleDelete}
              disabled={!file}
              className='btn flex-1 shadow-none disabled:opacity-50 font-medium'
            >
              Delete
            </button>
          </div>
        </div>

        {/* Right side: Preview Field - Full width on mobile, 2/3 on desktop */}
        <div className='w-full lg:w-4/5 border border-base-300/50  p-2 flex items-center justify-center min-h-[650px] rounded-md'>
          {preview ? (
            preview.type === 'image' ? (
              <img
                src={preview.url}
                alt='File preview'
                className='max-w-full max-h-[70vh] object-contain'
              />
            ) : preview.type === 'document' ? (
              <iframe
                src={preview.url}
                title='Document Preview'
                className='w-full h-[70vh]'
                style={{ border: 'none' }}
              />
            ) : (
              <p className='text-base-500'>Unsupported file type</p>
            )
          ) : (
            <p className='text-base-500'>Aucune fichier</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Creationdocuments;
