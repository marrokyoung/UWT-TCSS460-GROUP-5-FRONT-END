'use client'; // With React, this file needs to be a client component in order to use React hooks (useState, useRouter, etc.)

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import {createTheme, ThemeProvider} from "@mui/material";


export default function StartingPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/auth/login'); // Redirect to login page
    }, [router]);

    return null; // Return null since the user will be redirected
    // return (
    //     <Container>
    //         <Box
    //             sx={{
    //                 my: 4,
    //                 display: "flex",
    //                 flexDirection: "column",
    //                 justifyContent: "center",
    //                 alignItems: "center",
    //             }}
    //         >
    //             <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
    //                 Material UI - Next.js App Router example in TypeScript
    //             </Typography>
    //             <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
    //                 Main page for TCSS 460 SP24
    //             </Typography>
    //             <Link href="/post" color="secondary">
    //                 Go to the post page
    //             </Link>
    //             <Link href="/auth/login/" color="secondary">
    //                 Go to the login page
    //             </Link>
    //             <Link href="/auth/register/" color="secondary">
    //                 Go to the register page
    //             </Link>
    //         </Box>
    //     </Container>
    // );
}
