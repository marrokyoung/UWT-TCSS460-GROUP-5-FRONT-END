"use client"

import * as React from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';

export default function DeleteBooksByRange() {
  const [minYear, setMinYear] = React.useState<string>('');
  const [maxYear, setMaxYear] = React.useState<string>('');
  const [message, setMessage] = React.useState<string | null>(null);
  const [deletedCount, setDeletedCount] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setDeletedCount(null);

    try {
      const response = await axios.delete('http://localhost:4000/books/delete_by_range', {
        params: {
          min: minYear,
          max: maxYear,
        },
      });

      setMessage(response.data.message);
      setDeletedCount(response.data.deletedCount);
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
      <Typography variant="h4">Delete Books by Publication Year Range</Typography>
      <form onSubmit={handleDelete}>
        <Box marginBottom={2}>
          <TextField
            label="Minimum Publication Year"
            type="number"
            value={minYear}
            onChange={(e) => setMinYear(e.target.value)}
            fullWidth
            required
          />
        </Box>
        <Box marginBottom={2}>
          <TextField
            label="Maximum Publication Year"
            type="number"
            value={maxYear}
            onChange={(e) => setMaxYear(e.target.value)}
            fullWidth
            required
          />
        </Box>
        <Button type="submit" variant="contained" color="primary">
          Delete Books
        </Button>
      </form>
      {message && <Alert severity="success">{message} - {deletedCount} books deleted.</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
}
