import { colors } from '../colors';

export const buttonStyles = {
  base: `
    font-medium
    transition-all
    duration-200
    flex
    items-center
    justify-center
    disabled:opacity-50
    disabled:cursor-not-allowed
  `,
  variants: {
    primary: `
      bg-[${colors.primary}]
      text-white
      hover:bg-[${colors.primary}]/90
      active:bg-[${colors.primary}]/80
    `,
    secondary: `
      bg-[${colors.secondary}]
      text-[${colors.primary}]
      hover:bg-[${colors.secondary}]/90
      active:bg-[${colors.secondary}]/80
    `,
  },
  sizes: {
    md: 'h-11 px-6 text-base rounded-lg',
    lg: 'h-12 px-8 text-lg rounded-lg',
  },
  fullWidth: 'w-full',
};
