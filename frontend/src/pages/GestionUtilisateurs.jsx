import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiArrowDownTray,
  HiArrowUpTray,
  HiMiniPlus,
  HiOutlinePencil,
  HiOutlineTrash,
} from 'react-icons/hi2';
import Toolbar from '../component/Toolbar';
import Table from '../component/Table';
import Modal from '../component/Modal';
import AddUserForm from '../component/Forms/AddUserForm';
import EditUserForm from '../component/Forms/EditUserForm';
import DeleteConfirmation from '../component/Forms/DeleteConfirmation';

const GestionUtilisateurs = () => {
  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
    delete: false,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [formData, setFormData] = useState({});

  const headers = ["Nom d'utilisateur", 'Role', 'Statut'];
  const rows = [
    { id: 1, username: 'John Doe', role: 'Utilisateur', status: 'success' },
    { id: 2, username: 'Jane Smith', role: 'Admin', status: 'error' },
    { id: 3, username: 'Sam Green', role: 'Utilisateur', status: 'en attente' },
  ];

  const handleSelectedRows = (selectedRows) => {
    setSelectedRows(selectedRows);
  };

  const openModal = (modalType, user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData(user);
    }
    setModalState({ ...modalState, [modalType]: true });
  };

  const closeModal = (modalType) => {
    setModalState({ ...modalState, [modalType]: false });
    setFormData({});
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    console.log('Adding user:', formData);
    // Add your API call here
    closeModal('add');
  };

  const handleEditUser = () => {
    console.log('Editing user:', selectedUser.id, formData);
    // Add your API call here
    closeModal('edit');
  };

  const handleDeleteUser = () => {
    console.log('Deleting user:', selectedUser.id);
    // Add your API call here
    closeModal('delete');
  };

  const sidebarContent = [
    {
      key: 'view',
      content: (
        <li className=''>
          <Link className='text-inherit flex items-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='size-4'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
              />
            </svg>
            Prevu
          </Link>
        </li>
      ),
    },
    {
      key: 'add',
      content: (
        <li
          className=''
          onClick={() => openModal('add')}
        >
          <button className='text-inherit flex items-center w-full '>
            <HiMiniPlus size={16} />
            Ajouter
          </button>
        </li>
      ),
    },
    {
      key: 'edit',
      content: (
        <li
          className=''
          onClick={() =>
            selectedRows.length === 1 &&
            openModal('edit', rows[selectedRows[0]])
          }
          disabled={selectedRows.length !== 1}
        >
          <button
            className={`text-inherit flex items-center w-full  ${selectedRows.length !== 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={selectedRows.length !== 1}
          >
            <HiOutlinePencil size={16} />
            Editer
          </button>
        </li>
      ),
    },
    {
      key: 'delete',
      content: (
        <li
          className=''
          onClick={() =>
            selectedRows.length > 0 &&
            openModal('delete', rows[selectedRows[0]])
          }
          disabled={selectedRows.length === 0}
        >
          <button
            className={`text-inherit flex items-center w-full  ${selectedRows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={selectedRows.length === 0}
          >
            <HiOutlineTrash size={16} />
            Supprimer
          </button>
        </li>
      ),
    },
    {
      key: 'import',
      content: (
        <li className=''>
          <Link className='text-inherit flex items-center '>
            <HiArrowUpTray size={16} />
            Importer
          </Link>
        </li>
      ),
    },
    {
      key: 'export',
      content: (
        <li className=''>
          <Link className='text-inherit flex items-center '>
            <HiArrowDownTray size={16} />
            Exporter
          </Link>
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

      {/* Add User Modal */}
      <Modal
        isOpen={modalState.add}
        onClose={() => closeModal('add')}
        title='Ajouter un utilisateur'
        onConfirm={handleAddUser}
        confirmText='Ajouter'
      >
        <AddUserForm formData={formData} setFormData={setFormData} />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={modalState.edit}
        onClose={() => closeModal('edit')}
        title="Modifier l'utilisateur"
        onConfirm={handleEditUser}
        confirmText='Enregistrer'
      >
        <EditUserForm formData={formData} setFormData={setFormData} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modalState.delete}
        onClose={() => closeModal('delete')}
        title='Confirmer la suppression'
        onConfirm={handleDeleteUser}
        confirmText='Supprimer'
        confirmColor='btn-error'
      >
        <DeleteConfirmation itemName={selectedUser?.username} />
      </Modal>
    </>
  );
};

export default GestionUtilisateurs;
