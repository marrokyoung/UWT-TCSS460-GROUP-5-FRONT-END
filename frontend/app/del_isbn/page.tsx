"use client"

import * as React from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';

export default function DeleteBookByISBN() {
  const [isbn, setIsbn] = React.useState<string>('');
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await axios.delete('http://localhost:4000/books/delete_by_isbn', {
        params: {
          isbn13: isbn,
        },
      });

      setMessage(response.data.entry);
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4">Delete Book by ISBN</Typography>
      <form onSubmit={handleDelete}>
        <Box marginBottom={2}>
          <TextField
            label="ISBN"
            type="text"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            fullWidth
            required
          />
        </Box>
        <Button type="submit" variant="contained" color="primary">
          Delete Book
        </Button>
      </form>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
}
