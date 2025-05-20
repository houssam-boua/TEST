import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Toolbar from '../component/Toolbar';
import Table from '../component/Table';
import { HiMiniPlus } from 'react-icons/hi2';
import Modal from '../component/Modal';
import AddFluxForm from '../component/Forms/AddFluxForm';

const FluxTravail = () => {
  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
  });

  const [selectedFlux, setSelectedFlux] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [formData, setFormData] = useState({});

  const headers = ['Titre de flux', 'Validatuer', 'Date de creation', 'Statut'];

  const rows = [
    { id: 1, titre: '', validateur: 'Utilisateur', datecreation: '',status: 'success' },
    
  ];

  const handleSelectedRows = (selectedRows) => {
    setSelectedRows(selectedRows);
  };

  const openModal = (modalType, flux = null) => {
    if (flux) {
      setSelectedFlux(flux);
      setFormData(flux);
    }
    setModalState({ ...modalState, [modalType]: true });
  };

  const closeModal = (modalType) => {
    setModalState({ ...modalState, [modalType]: false });
    setFormData({});
    setSelectedFlux(null);
  };

  const handleAddFlux = () => {
    console.log('Adding flux:', formData);
    // Add your API call here
    closeModal('add');
  };

  const sidebarContent = [
    {
      key: 'add',
      content: (
        <li className='' onClick={() => openModal('add')}>
          <button className='text-inherit flex items-center w-full '>
            <HiMiniPlus size={16} />
            Ajouter
          </button>
        </li>
      ),
    },
  ];

  return (
    <>
      <Toolbar toolBarItems={sidebarContent.map((item) => item.content)} />
      <Table
        headers={headers}
        rows={rows.map((row) => [row.username, row.role, row.status])}
        onSelect={handleSelectedRows}
      />

      <Modal
        isOpen={modalState.add}
        onClose={() => closeModal('add')}
        title='Ajouter un flux de travail'
        onConfirm={handleAddFlux}
        confirmText='Ajouter'
      >
        <AddFluxForm formData={formData} setFormData={setFormData} />
      </Modal>
    </>
  );
};

export default FluxTravail;
