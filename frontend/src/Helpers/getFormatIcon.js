import React from 'react';
import {
  FaRegFilePdf,
  FaRegFileWord,
  FaRegFilePowerpoint,
  FaRegFileImage,
} from 'react-icons/fa6';

export function getFormatIcon(format) {
  const ext = (format || '').toLowerCase();
  if (ext === 'pdf')
    return React.createElement(FaRegFilePdf, {
      className: 'inline text-red-500',
    });
  if (ext === 'doc' || ext === 'docx' || ext === 'word')
    return React.createElement(FaRegFileWord, {
      className: 'inline text-blue-500',
    });
  if (ext === 'xls' || ext === 'xlsx' || ext === 'powerpoint')
    return React.createElement(FaRegFilePowerpoint, {
      className: 'inline text-green-600',
    });
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'].includes(ext))
    return React.createElement(FaRegFileImage, {
      className: 'inline text-yellow-500',
    });
  return null;
}
