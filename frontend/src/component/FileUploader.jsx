import React, { useRef } from 'react';

const FileUploader = ({
  onFileChange,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,image/*',
}) => {
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='flex flex-col items-center justify-center w-full'>
      <label
        htmlFor='dropzone-file'
        className='flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-neutral/40 border-dashed rounded-lg cursor-pointer bg-base-200/10 hover:border-neutral/60 hover:bg-base-200/40 transition-colors duration-300'
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
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
            <span className='font-semibold'>Click to upload or </span>
            drag and drop
          </p>
          <p className='text-xs text-base-500 text-center'>
            SVG, PNG, JPG, GIF, PDF, DOC, XLS (MAX. 10MB)
          </p>
        </div>
        <input
          id='dropzone-file'
          ref={fileInputRef}
          type='file'
          className='hidden'
          onChange={(e) => e.target.files[0] && onFileChange(e.target.files[0])}
          accept={accept}
        />
      </label>
    </div>
  );
};

export default FileUploader;
