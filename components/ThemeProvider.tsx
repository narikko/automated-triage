'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// We replaced the broken import with React.ComponentProps
export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}