// import './App.css';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AppRoutes } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import {
  ThemeContextType,
  useTheme,
  ThemeProvider,
} from '@rewind-ui/core';
import { colors } from './theme/colors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const defaultTheme = useTheme();

  const themeContext: ThemeContextType = {
    theme: {
      components: {
        ...defaultTheme.components,
        Button: {
          styles: {
            base: 'rounded-lg transition-colors duration-200',
            variants: {
              primary: `bg-[${colors.primary}] text-white hover:bg-[${colors.primary}]/90`,
            },
          },
        },
        Input: {
          styles: {
            base: 'rounded-lg bg-[#EEF5FF] border-none focus:ring-2',
            variants: {
              default: `focus:border-[${colors.primary}] focus:ring-[${colors.primary}]/20`,
            },
          },
        },
      },
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={themeContext}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
