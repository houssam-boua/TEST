const useIconColor = (status) => {
    switch (status) {
        case 'approved':
            return 'text-green-500';
        case 'pending':
            return 'text-yellow-500';
        case 'rejected':
            return 'text-red-500';
        default:
            return 'text-gray-500';
    }  
};
export default useIconColor;