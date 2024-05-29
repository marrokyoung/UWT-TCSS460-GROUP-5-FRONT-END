import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import {createTheme, ThemeProvider} from "@mui/material";




export default function Post() {
    return (
        <Container>
            <Box
                sx={{
                    my: 4,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
                    Material UI - Next.js App Router example in TypeScript
                </Typography>
                <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                    Template for TCSS 460 SP24
                </Typography>
                <Link href="/about" color="secondary">
                    Go to the about page
                </Link>
            </Box>
        </Container>
    );
}
