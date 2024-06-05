'use client'
import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Alert } from '@mui/material';

interface FormState {
  isbn13: string;
  rating: string;
  errors: {
    isbn13?: string;
    rating?: string;
  };
}

const UpdateBookRatingsForm = () => {
  const [formState, setFormState] = useState<FormState>({ isbn13: '', rating: '', errors: {} });
  const [alert, setAlert] = useState({ showAlert: false, alertMessage: '', alertSeverity: '' });

  const validateForm = (): boolean => {
    const errors: { isbn13?: string; rating?: string; } = {};
    let isValid = true;

    const isbn13Regex = /^\d{13}$/;
    if (!isbn13Regex.test(formState.isbn13)) {
      errors.isbn13 = 'ISBN must be exactly 13 digits';
      isValid = false;
    }

    const rating = parseInt(formState.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
      isValid = false;
    }

    setFormState(prevState => ({ ...prevState, errors }));
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    fetch("http://localhost:4000/books/update_by_ratings", {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isbn13: formState.isbn13,
        rating: formState.rating
      }),
    }).then(response => 
      response.json().then(data => ({ status: response.status, body: data }))
    ).then(({ status, body }) => {
      if (status === 200) {
        setAlert({ showAlert: true, alertMessage: "Rating successfully added!", alertSeverity: "success" });
      } else {
        setAlert({ showAlert: true, alertMessage: "Failed to add rating: ${body.message}", alertSeverity: "error" });
      }
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prevState => ({ ...prevState, [event.target.name]: event.target.value }));
  };

  return (
    <>
      {alert.showAlert && (
        <Alert
          severity={alert.alertSeverity as any}
          onClose={() => setAlert({ showAlert: false, alertMessage: '', alertSeverity: '' })}
        >
          {alert.alertMessage}
        </Alert>
      )}
      <Container component="main" maxWidth="xs">
        <Box sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
            Update Book Rating
          </Typography>
          {/*<Link href="../home" color="secondary">*/}
          {/*  Go to the home page*/}
          {/*</Link>*/}
        </Box>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            error={!!formState.errors.isbn13}
            helperText={formState.errors.isbn13 || ""}
            margin="normal"
            required
            fullWidth
            id="isbn13"
            label="ISBN-13"
            name="isbn13"
            autoFocus
            onChange={handleChange}
          />
          <TextField
            error={!!formState.errors.rating}
            helperText={formState.errors.rating || ""}
            margin="normal"
            required
            fullWidth
            name="rating"
            label="Rating (1-5)"
            type="number"
            id="rating"
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Add Rating
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default UpdateBookRatingsForm;
