import React, { createContext } from 'react';
import { theme } from '../utils/theme';

// 1. Create the context with the theme as a default value
export const ThemeContext = createContext(theme);

// 2. Create a Provider component
export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};