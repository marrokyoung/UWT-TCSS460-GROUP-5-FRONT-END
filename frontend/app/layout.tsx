import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import Link from "next/link";

export default function MessagesLayout({
                                         children, // will be a page or nested layout
                                       }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" suppressHydrationWarning={true}>
      <body>
      <section>
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
      </section>
      </body>
      </html>
  );
}
