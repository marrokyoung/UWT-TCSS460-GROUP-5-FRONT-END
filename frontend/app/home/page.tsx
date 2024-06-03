'use client'

import * as React from "react";
import { Box, Container, Typography} from "@mui/material";

export default function Home() {
    // This is the main page for our app. We enclosed it in our "ClosedRoute" compoenent so that it is only accessible to authenticated users
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
                        Welcome to the Book Management App
                    </Typography>
                    <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                        Select an option from the tabs above to get started
                    </Typography>
                </Box>
            </Container>
    );
}