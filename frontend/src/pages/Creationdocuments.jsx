import React, { useState } from 'react';
import CheckboxSelect from '../component/CheckboxSelect';
import { HiArrowUpTray } from 'react-icons/hi2';

const Creationdocuments = () => {
  const [formData, setFormData] = useState({
    file: null,
    doc_category: "",
    doc_status: "",
    doc_path: "",
    doc_owner: "",
    doc_departement: "",
    doc_description: "",
    doc_comment: "",
  });


  const [file, setFile] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const availableTags = ['Urgent', 'Review', 'Archive', 'Confidential'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
  };

  const handleSubmit = async () => {
    
  };

  const handleDelete = () => {
    setFile(null);
    const fileInput = document.getElementById('dropzone-file');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className='container mx-auto p-4'>
      {/* Left side: File Uploader - Full width on mobile, 1/3 on desktop */}
      <form onSubmit={handleSubmit}>
        <div className='max-w-xl space-y-12 mx-auto h-full border-base-300/50 p-4 flex flex-col rounded-md'>
          <div className='mb-0'>
            <div>
              <label
                htmlFor='dropzone-file'
                className='flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral/20 rounded-xl cursor-pointer bg-base-200/10 hover:border-primary/60 hover:bg-base-200/20 transition-colors duration-200 ease-in-out'
              >
                <div className='flex flex-col items-center justify-center p-5 text-center'>
                  <HiArrowUpTray className='w-10 h-10 mb-3 text-primary' />
                  <p className='text-sm text-base-content/80'>
                    <span className='font-medium text-primary'>
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className='text-xs text-base-content/50 mt-1'>
                    PDF, DOC, XLS, or images (MAX. 10MB)
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

              {file && (
                <div className='mt-4 p-3 bg-base-200/30 rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-base-content truncate'>
                        {file.name}
                      </p>
                      <div className='flex gap-4 mt-1 text-xs text-base-content/60'>
                        <span>{Math.round(file.size / 1024)} KB</span>
                        <span>{file.type}</span>
                      </div>
                    </div>
                    <button
                      type='button'
                      onClick={handleDelete}
                      className='btn btn-ghost btn-xs text-error'
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>
              <fieldset className='fieldset'>
                <legend className='fieldset-legend'>Category</legend>
                <input
                  type='text'
                  className='input w-full'
                  defaultValue='Technical'
                  name='doc_category'
                />
              </fieldset>

              <fieldset className='fieldset'>
                <legend className='fieldset-legend'>Status</legend>
                <input
                  type='text'
                  className='input w-full'
                  defaultValue='Draft'
                  name='doc_status'
                />
              </fieldset>
            </div>

            

            

           

            <fieldset className='fieldset'>
              <legend className='fieldset-legend'>Description</legend>
              <textarea
                className='textarea h-24 w-full'
                defaultValue='This is a test document'
                name='doc_description'
              ></textarea>
            </fieldset>

            <fieldset className='fieldset'>
              <legend className='fieldset-legend'>Comment</legend>
              <textarea
                className='textarea h-24 w-full'
                defaultValue='Initial upload'
                name='doc_comment'
              ></textarea>
            </fieldset>

            <CheckboxSelect
              options={availableTags}
              selectedValues={selectedTags}
              onChange={setSelectedTags}
              label='Tags'
              required
              placeholder='Select tags'
            />

            {/* File details */}
          </div>

          {/* Buttons at the bottom */}
          <div className='mt-4 flex flex-col sm:flex-row gap-2 '>
            <button
              type='submit'
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
      </form>
    </div>
  );
};

export default Creationdocuments;
