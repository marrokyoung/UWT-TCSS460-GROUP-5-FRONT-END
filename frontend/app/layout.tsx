'use client'
import {AppBar, Box, createTheme, IconButton, ThemeProvider, Toolbar, Typography, Tabs, Tab} from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import {orange, purple} from "@mui/material/colors";
import Link from "next/link";
import Authentication from "./auth/authcontext/authcontext";
import { usePathname } from "next/navigation";


export default function MessagesLayout({ children }: { children: React.ReactNode; }) {
  const defaultTheme = createTheme({
    palette: {
      primary: orange,
      secondary: purple,
    },
  });

  // We want the current path name to determine whether or not to show the navigation bar
  const pathname = usePathname();
  const showNavigation = pathname !== "/auth/login" && pathname !== "/auth/register";

  return (
    <Authentication>
      <html lang="en" suppressHydrationWarning={true}>
        <body>
          <section>
            <ThemeProvider theme={defaultTheme}>
              {/* Include shared UI here e.g. a header or sidebar */}
              {showNavigation && (
                <AppBar position="static">
                  <Toolbar>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
                    >
                      Library App
                    </Typography>
                    <Tabs centered>
                      <Link href="/library" color="inherit">
                        <Tab label="View the Library" />
                      </Link>
                      <Link href="/post" color="inherit">
                        <Tab label="Post a Book" />
                      </Link>
                      <Link href="/put" color="inherit">
                        <Tab label="Update a Book's Rating" />
                      </Link>
                    </Tabs>
                  </Toolbar>
                </AppBar>
              )}
              {children}
            </ThemeProvider>
          </section>
        </body>
      </html>
    </Authentication>
  );
}
