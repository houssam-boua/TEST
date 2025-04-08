import React, { useState } from 'react';
import CheckboxSelect from '../CheckboxSelect';

const AddFluxForm = ({ formData, setFormData }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const availableTags = [
    'Document 1.txt',
    'Document 2.pdf',
    'Hello World.docx',
    'Sample Image.jpg',
    'Project Plan.xlsx',
  ];

  return (
    <div className='space-y-4 text-xs'>
      <div className='form-control'>
        <label className='label'>
          <span className='label-text '>Titre</span>
        </label>
        <input
          type='text'
          className='input input-bordered w-full'
          value={formData.titre || ''}
          onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
        />
      </div>
      <div className='form-control'>
        <label className='label'>
          <span className='label-text '>Validateur</span>
        </label>
        <select className='select select-bordered w-full'>
          <option disabled={true}>----</option>
          <option>ELYASS HAFIDI</option>
          <option>Test 2</option>
          <option>Test 4</option>
        </select>
      </div>
      <CheckboxSelect
        options={availableTags}
        selectedValues={selectedTags}
        onChange={setSelectedTags}
        label='Documents'
        required
        placeholder='Selectioner des documents'
      />
    </div>
  );
};

export default AddFluxForm;
