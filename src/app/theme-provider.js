"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Fonts } from "../../public/StyleUtils";

const customTheme = extendTheme({
  colors: {
    primary: "#A2252E", // Using a simple color string
    secondary: "#FFD700", // Using hexadecimal color
    // You can add more color options here
  },
});

export default function ThemeProvider({ children }) {
  return (
    <ChakraProvider theme={customTheme}>
      {" "}
      <Fonts />
      {children}
    </ChakraProvider>
  );
}
