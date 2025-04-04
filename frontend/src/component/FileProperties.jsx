// components/FileProperties.jsx
import React from 'react';

const FileProperties = ({ file }) => {
  if (!file) return <p>Aucune fichier</p>;

  return (
    <div className='text-sm  text-base-content/60 truncate'>
      <p>
        <span className='font-bold'>Nom :</span> {file.name}
      </p>
      <p>
        <span className='font-bold'>Chemin : </span>
        {file.path}
      </p>
      <p>
        <span className='font-bold'>Taille : </span>
        {file.size} bytes
      </p>
      <p>
        <span className='font-bold'>Type : </span>
        {file.type}
      </p>
      <p>
        <span className='font-bold'>Date de creation : </span>
        {new Date(file.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

export default FileProperties;
