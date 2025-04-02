// components/file-previews/ImagePreview.jsx
const ImagePreview = ({ url, fileName }) => {
  return <img src={url} alt={fileName} className='max-w-full max-h-full' />;
};

export default ImagePreview;
