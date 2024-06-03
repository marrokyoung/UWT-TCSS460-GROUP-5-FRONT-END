"use client"
import {AppBar, Box, createTheme, IconButton, ThemeProvider, Toolbar, Typography} from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import {orange, purple} from "@mui/material/colors";

export default function MessagesLayout({
                                         children, // will be a page or nested layout
                                       }: {
  children: React.ReactNode;
}) {
    const defaultTheme = createTheme({
        palette: {
            primary: orange,
            secondary: purple,
        },
    });
  return (
      <html lang="en" suppressHydrationWarning={true}>
      <body>
      <section>
          <ThemeProvider theme={defaultTheme}>
        {/* Include shared UI here e.g. a header or sidebar */}
        <AppBar position="static">
          <Toolbar>
            <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
            >
              Books
            </Typography>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <IconButton href="/library" color="inherit">
                <LibraryBooksIcon />
              </IconButton>
              <IconButton href="/post" color="inherit">
                <UploadFileIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {children}
          </ThemeProvider>
      </section>
      </body>
      </html>
  );
}
