import { createContext, useContext } from 'react';
import { defaultTheme } from './theme.config';

export const ThemeContext = createContext(defaultTheme);

export const useTheme = () => {
  return useContext(ThemeContext);
};
