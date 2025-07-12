import React, { useState } from 'react';
import CheckboxSelect from '../component/CheckboxSelect';
import { HiArrowUpTray } from 'react-icons/hi2';
import { createDocument } from '../services/documentsServices';

const Creationdocuments = () => {
  const [formData, setFormData] = useState({
    file: null,
    doc_category: 'Technical',
    doc_status: 'Draft',
    doc_path: 'test_folder',
    doc_owner: '6',
    doc_departement: '3',
    doc_description: 'This is a test document',
    doc_comment: 'Initial upload',
  });
  const [file, setFile] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const availableTags = ['Urgent', 'Review', 'Archive', 'Confidential'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFormData((prev) => ({ ...prev, file: selectedFile }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const payload = { ...formData };
      // Optionally add tags if your backend supports them
      // payload.tags = selectedTags;
      await createDocument(payload);
      setSuccess('Document created successfully!');
      setFile(null);
      setFormData({
        file: null,
        doc_category: 'Technical',
        doc_status: 'Draft',
        doc_path: 'test_folder',
        doc_owner: '6',
        doc_departement: '3',
        doc_description: 'This is a test document',
        doc_comment: 'Initial upload',
      });
    } catch (err) {
      setError(err.message || 'Failed to create document.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setFile(null);
    setFormData((prev) => ({ ...prev, file: null }));
    const fileInput = document.getElementById('dropzone-file');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className='container mx-auto p-4'>
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
                    </span>
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
                  name='doc_category'
                  value={formData.doc_category}
                  onChange={handleChange}
                  required
                />
              </fieldset>

              <fieldset className='fieldset'>
                <legend className='fieldset-legend'>Status</legend>
                <input
                  type='text'
                  className='input w-full'
                  name='doc_status'
                  value={formData.doc_status}
                  onChange={handleChange}
                  required
                />
              </fieldset>
            </div>
            <fieldset className='fieldset mt-2'>
              <legend className='fieldset-legend'>Path</legend>
              <input
                type='text'
                className='input w-full'
                name='doc_path'
                value={formData.doc_path}
                onChange={handleChange}
                required
              />
            </fieldset>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>
              <fieldset className='fieldset'>
                <legend className='fieldset-legend'>Owner</legend>
                <input
                  type='number'
                  className='input w-full'
                  name='doc_owner'
                  value={formData.doc_owner}
                  onChange={handleChange}
                  required
                />
              </fieldset>
              <fieldset className='fieldset'>
                <legend className='fieldset-legend'>Departement</legend>
                <input
                  type='number'
                  className='input w-full'
                  name='doc_departement'
                  value={formData.doc_departement}
                  onChange={handleChange}
                  required
                />
              </fieldset>
            </div>
            <fieldset className='fieldset'>
              <legend className='fieldset-legend'>Description</legend>
              <textarea
                className='textarea h-24 w-full'
                name='doc_description'
                value={formData.doc_description}
                onChange={handleChange}
                required
              ></textarea>
            </fieldset>
            <fieldset className='fieldset'>
              <legend className='fieldset-legend'>Comment</legend>
              <textarea
                className='textarea h-24 w-full'
                name='doc_comment'
                value={formData.doc_comment}
                onChange={handleChange}
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
            {success && <div className='alert alert-success'>{success}</div>}
            {error && <div className='alert alert-error'>{error}</div>}
            {loading && <div className='alert alert-info'>Uploading...</div>}
          </div>
          <div className='mt-4 flex flex-col sm:flex-row gap-2 '>
            <button
              type='submit'
              disabled={!file || loading}
              className='btn btn-primary flex-1/2 shadow-none disabled:opacity-50 font-medium'
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type='button'
              onClick={handleDelete}
              disabled={!file || loading}
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
