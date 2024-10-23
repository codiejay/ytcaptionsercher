import ThemeProvider from "./theme-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <head></head>
      <body
        style={{
          backgroundColor: "#F9FAFB",
        }}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
