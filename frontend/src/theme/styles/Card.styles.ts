import { colors } from '../colors';

export const cardStyles = {
  base: `
    bg-white
    shadow-lg
    rounded-2xl
    overflow-hidden
  `,
  variants: {
    default: 'p-8',
    compact: 'p-4',
  },
  header: {
    base: 'mb-6 text-center',
    title: `text-[${colors.primary}] text-2xl font-bold`,
    subtitle: `text-[${colors.third}] mt-2`,
  }
};
