'use client'

import { extendTheme } from '@chakra-ui/react';
import { Poppins } from 'next/font/google';

// Import the weights and subsets, add any other config here as well
const nextFont = Poppins({
    weight: ['400'],
    subsets: ['latin'],
});

const theme = extendTheme({
    // Set the fonts like this
    fonts: {
        body: nextFont.style.fontFamily,
        heading: nextFont.style.fontFamily,
    },
});

import { ChakraProvider } from '@chakra-ui/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>
}