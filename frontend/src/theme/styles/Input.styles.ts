import { colors } from '../colors';

export const inputStyles = {
  base: `
    w-full
    border
    focus:outline-none
    focus:ring-2
    transition-colors
    duration-200
  `,
  variants: {
    default: `
      border-gray-300
      focus:border-[${colors.primary}]
      focus:ring-[${colors.primary}]/20
    `,
    error: `
      border-red-500
      focus:border-red-500
      focus:ring-red-500/20
    `,
  },
  sizes: {
    md: 'h-11 px-4 py-2 text-base rounded-lg',
    lg: 'h-12 px-5 py-2.5 text-lg rounded-lg',
  },
  icon: {
    wrapper: 'relative',
    element: 'absolute top-1/2 transform -translate-y-1/2',
    left: 'left-4',
    right: 'right-4',
    input: 'pl-12',  // For inputs with left icon
  }
};
