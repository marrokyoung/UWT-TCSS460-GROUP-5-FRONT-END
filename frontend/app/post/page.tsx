'use client'
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {Alert,TextField} from "@mui/material";
import {Button} from "@mui/material";
import {useState} from "react";

// const defaultTheme = createTheme();

const parse = (form: { isbn13: any; authors: any; publication_year: any; title: any; original_title: any;}) => {
    let success = true;
    let errors = {
        isbn13:"",
        authors:"",
        publication_year:"",
        title:"",
        original_title:"",
    }
    if (form.isbn13 == null || Number.isInteger(form.isbn13) || form.isbn13.length != 13) {
        success = false;
        errors.isbn13 = "invalid isbn13"
    }
    if (form.authors == null || form.authors.length == 0) {
        success = false;
        errors.authors = "missing author"
    }
    if (form.publication_year == null || !Number.isInteger(Number.parseInt(form.publication_year))) {
        success = false;
        errors.publication_year = "invalid publication year"
    }
    if (form.title == null || form.title.length == 0) {
        success = false;
        errors.title = "invalid title"
    }
    if (form.original_title == null || form.original_title.length == 0) {
        success = false;
        errors.original_title = "invalid original_title"
    }
    return {
        success: success,
        error: {
            fieldErrors: errors
        },
        data: {
            isbn13: form.isbn13,
            authors: form.authors,
            publication_year: form.publication_year,
            title: form.title,
            original_title: form.original_title,
            rating_avg: 0,
            rating_count: 0,
            rating_1_star: 0,
            rating_2_star: 0,
            rating_3_star: 0,
            rating_4_star: 0,
            rating_5_star: 0,
            image_url: "",
            image_small_url: "",
        },
    }
}
interface IAlert {
    showAlert: boolean;
    alertMessage: string;
    alertSeverity: string;
}


const EMPTY_ALERT: IAlert = {
    showAlert: false,
    alertMessage: "",
    alertSeverity: ""
}


export default function Post() {
    const [formState, setFormState] = React.useState<FormState>();
    const [alert, setAlert] = React.useState(EMPTY_ALERT);
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data= new FormData(event.currentTarget);
        const validateFields = parse({
            isbn13: data.get("isbn13"),
            authors: data.get("author"),
            publication_year: data.get("publication year"),
            title: data.get("title"),
            original_title: data.get("original title"),
        });
        console.dir(validateFields)
        if(!validateFields.success) {
            const error: FormState = {
                errors: validateFields.error?.fieldErrors,
            };
            setFormState(error);
            console.dir( validateFields);
            return;
        } else {
            setFormState({});
        }
        fetch("http://localhost:4000/books/create_new_book", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(validateFields.data),

        }).then((response: Response) =>
        response.json().then((body)=> ({body:body, ok: response.ok, status: response.status})))
            .then((response) => {
            console.dir(response);
            if(response.ok) {
                setAlert({
                    showAlert:true,
                    alertMessage:"Book posted!",
                    alertSeverity:"success",
                })
            } else {
                setAlert({
                    showAlert:true,
                    alertMessage:"Book NOT posted! " + response.body.message,
                    alertSeverity:"error",
                })
            }
            return;
        })
    }

    return (
        // <ThemeProvider theme={defaultTheme}>
        <>
            {alert.showAlert &&
                (<Alert
                    severity={alert.alertSeverity as any}
                    onClose={() => setAlert(EMPTY_ALERT)}
                >
                    {alert.alertMessage}
                </Alert>
                )}
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
                    <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                        Post a book
                    </Typography>
                    {/*<Link href="../home" color="secondary">*/}
                    {/*    Go to the home page*/}
                    {/*</Link>*/}
                </Box>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{mt:1}}
                >
                    <TextField
                        error={formState?.errors?.isbn13 != undefined}
                        helperText={formState?.errors?.isbn13 ?? ""}
                        margin={"normal"}
                        required
                        fullWidth
                        id={"isbn13"}
                        label="isbn13"
                        name="isbn13"
                        autoFocus
                    />
                    <TextField
                        error={formState?.errors?.authors != undefined}
                        helperText={formState?.errors?.authors ?? ""}
                        margin={"normal"}
                        required
                        fullWidth
                        id={"author"}
                        label="author"
                        name="author"
                        autoFocus
                    />
                    <TextField
                        error={formState?.errors?.publication_year != undefined}
                        helperText={formState?.errors?.publication_year ?? ""}
                        margin={"normal"}
                        required
                        fullWidth
                        id={"publication year"}
                        label="publication year"
                        name="publication year"
                        autoFocus
                    />
                    <TextField
                        error={formState?.errors?.title != undefined}
                        helperText={formState?.errors?.title ?? ""}
                        margin={"normal"}
                        required
                        fullWidth
                        id={"title"}
                        label="title"
                        name="title"
                        autoFocus
                    />
                    <TextField
                        error={formState?.errors?.original_title != undefined}
                        helperText={formState?.errors?.original_title ?? ""}
                        margin={"normal"}
                        required
                        fullWidth
                        id={"original title"}
                        label="original title"
                        name="original title"
                        autoFocus
                    />
                    <Button
                        type={"submit"}
                        fullWidth
                        variant={"contained"}
                        sx={{mt:3, mb:2}}
                    >
                        Send!
                    </Button>

                </Box>
            </Container>
        </>
        // </ThemeProvider>
    );
}
