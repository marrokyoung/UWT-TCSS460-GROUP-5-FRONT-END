"use client";

import * as React from "react";
import axios, { AxiosError } from "axios";
import { IBook } from '../../../backend/src/routes/closed/books';
import { Container, Box, Typography, Link, Card, CardContent, CardActions, CardMedia, TextField, Select, MenuItem, FormControl, InputLabel, Pagination, Rating, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { CircularProgress } from "@mui/material";
import { borders } from '@mui/system';

function isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
}

export default function LibraryPage() {
    const [books, setBooks] = React.useState<IBook[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');
    const [searchBy, setSearchBy] = React.useState('title');
    const [searchLabel, setSearchLabel] = React.useState('Search by Title');
    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(10);
    const [totalPages, setTotalPages] = React.useState(1);
    const [open, setOpen] = React.useState(false);
    const [selectedBook, setSelectedBook] = React.useState<IBook | null>(null);

    const handleClickOpen = (book: IBook) => {
        setSelectedBook(book);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedBook(null);
    };

    const fetchBooks = async () => {
        try {
            let response;
            const params = { page, limit };
            switch (searchBy) {
                case 'title':
                    response = search === '' 
                        ? await axios.get('http://localhost:4000/books/get_all_books', { params })
                        : await axios.get('http://localhost:4000/books/get_by_title', { params: { ...params, title: search } });
                    break;
                case 'author':
                    response = search === '' 
                        ? await axios.get('http://localhost:4000/books/get_all_books', { params })
                        : await axios.get(`http://localhost:4000/books/get_by_author/${search}`, { params });
                    break;
                case 'isbn13':
                    response = search === '' 
                        ? await axios.get('http://localhost:4000/books/get_all_books', { params })
                        : await axios.get('http://localhost:4000/books/get_by_isbn', { params: { ...params, isbn: search } });
                    break;
                case 'ratings.average':
                    response = search === '' 
                        ? await axios.get('http://localhost:4000/books/get_all_books', { params })
                        : await axios.get('http://localhost:4000/books/get_by_rating', { params: { ...params, rating: search } });
                    break;
                case 'year':
                    response = search === '' 
                        ? await axios.get('http://localhost:4000/books/get_all_books', { params })
                        : await axios.get(`http://localhost:4000/books/get_by_year/${search}`, { params: { ...params, year: search } });
                    break;
                default:
                    throw new Error("Invalid search parameter");
            }
            console.log('Response data:', response.data); // Debug: Log response data
            setBooks(response.data.books || (response.data.entry ? [response.data.entry] : []));
            setTotalPages(response.data.pagination ? response.data.pagination.totalPages : 1);
            setError(null); // Clear any previous error
            setLoading(false);
        } catch (err) {
            let errorMessage = 'An unknown error occurred';
            if (isAxiosError(err)) {
                if (err.response?.status === 404) {
                    errorMessage = 'No books found';
                } else {
                    errorMessage = err.response?.data?.message || err.message || errorMessage;
                }
            }
            console.error('Error fetching books:', errorMessage, err);
            setError(errorMessage);
            setBooks([]); // Clear books if there's an error
            setTotalPages(1); // Reset total pages if there's an error
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchBooks();
    }, [searchBy, search, page, limit]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleSearchByChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value as string;
        setSearchBy(value);

        let label = 'Search by Title';
        if (value === 'author') {
            label = 'Search by Author';
        } else if (value === 'isbn13') {
            label = 'Search by ISBN';
        } else if (value === 'ratings.average') {
            label = 'Search by Avg. Rating and higher';
        } else if (value === 'year') {
            label = 'Search by Year';
        }
        setSearchLabel(label);
        setSearch(''); // Clear the search field when changing search criteria
        setPage(1); // Reset to first page on search criteria change
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleLimitChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setLimit(Number(event.target.value));
    };

    if (loading) {
        return (
            <Container>
                <Box
                    sx={{
                        my: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

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
                <Typography variant="h2" component="h1" sx={{ mb: 2, color: 'black' }}>
                    Start Browsing Now
                </Typography>
                {/*<Link href="/post" color="secondary">*/}
                {/*    Go to the about page*/}
                {/*</Link>*/}
                <Box sx={{ mt: 4, width: '100%', maxWidth: 800 }}>
                    <Box sx={{ display: 'flex', mb: 4, alignItems: 'center' }}>
                        <FormControl sx={{ mr: 2, minWidth: 120 }}>
                            <InputLabel id="search-by-label" sx={{ backgroundColor: 'white', padding: '0 4px' }}>Search By</InputLabel>
                            <Select
                                labelId="search-by-label"
                                id="search-by"
                                value={searchBy}
                                onChange={handleSearchByChange}
                                sx={{ backgroundColor: 'white' }}
                            >
                                <MenuItem value="title">Title</MenuItem>
                                <MenuItem value="author">Author</MenuItem>
                                <MenuItem value="isbn13">ISBN</MenuItem>
                                <MenuItem value="ratings.average">Avg. Rating</MenuItem>
                                <MenuItem value="year">Year</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            id="search"
                            label={searchLabel}
                            variant="outlined"
                            value={search}
                            onChange={handleSearchChange}
                            fullWidth
                            sx={{ backgroundColor: 'white' }}
                            InputLabelProps={{
                                style: { color: 'black' } // Change color to black for better visibility
                            }}
                        />
                    </Box>
                    {error ? (
                        <Typography variant="body1" sx={{ color: 'white' }}>{error}</Typography>
                    ) : books.length > 0 ? (
                        books.map((book, index) => {
                            console.log('Book image URL:', book.icons?.small);
                            return (
                                <Card key={book.isbn13 || index} sx={{ mb: 2, display: 'flex', backgroundColor: 'white', color: 'white',  borderRadius: '16px', borderColor: 'primary.main'}} onClick={() => handleClickOpen(book)}>
                                    <CardMedia
                                        component="img"
                                        sx={{ width: 150 }}
                                        image={book.icons?.small || ''}
                                        alt={book.title}
                                    />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <CardContent>
                                            <Typography variant="h5" component="div" sx={{ color: 'black' }}>
                                                {book.title || 'No title available'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'gray' }}>
                                                by {book.authors || 'Unknown author'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'gray' }}>
                                                ISBN: {book.isbn13 || 'Unknown'}
                                            </Typography>
                                            <Rating
                                                name={`rating-${book.isbn13}`}
                                                value={book.ratings?.average || 0}
                                                precision={0.1}
                                                readOnly
                                            />
                                        </CardContent>
                                    </Box>
                                </Card>
                            );
                        })
                    ) : (
                        <Typography variant="body1" sx={{ color: 'white' }}>No books found</Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    color: 'black', // Color of the page numbers
                                },
                            }}
                        />
                        <FormControl sx={{ ml: 2, minWidth: 80 }}>
                            <InputLabel id="limit-label" sx={{ backgroundColor: 'white' }}>Limit</InputLabel>
                            <Select
                                labelId="limit-label"
                                id="limit"
                                value={limit}
                                onChange={handleLimitChange}
                                sx={{ backgroundColor: 'white' }}
                            >
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={20}>20</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Box>
            <Dialog open={open} onClose={handleClose} aria-labelledby="book-dialog-title" aria-describedby="book-dialog-description">
                <DialogTitle id="book-dialog-title">{selectedBook?.title}</DialogTitle>
                <DialogContent>
                    <CardMedia
                        component="img"
                        sx={{ width: '100%' }}
                        image={selectedBook?.icons.large}
                        alt={selectedBook?.title}
                    />
                    <DialogContentText id="book-dialog-description">
                        <Typography variant="body2" sx={{ color: 'gray' }}>
                            by {selectedBook?.authors || 'Unknown author'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'gray' }}>
                            Published: {selectedBook?.publication}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'gray' }}>
                            ISBN: {selectedBook?.isbn13 || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'gray' }}>
                            1 Rating: {selectedBook?.ratings.rating_1 ?? 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'gray' }}>
                            2 Rating: {selectedBook?.ratings.rating_2 ?? 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'gray' }}>
                            3 Rating: {selectedBook?.ratings.rating_3 ?? 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'gray' }}>
                            4 Rating: {selectedBook?.ratings.rating_4 ?? 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'gray' }}>
                            5 Rating: {selectedBook?.ratings.rating_5 ?? 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'gray' }}>
                            Total Ratings: {selectedBook?.ratings.count ?? 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'gray' }}>
                            Average Rating: {selectedBook?.ratings.average ?? 'N/A'}
                        </Typography>
                        <Rating
                            name={`rating-${selectedBook?.isbn13}`}
                            value={selectedBook?.ratings?.average || 0}
                            precision={0.1}
                            readOnly
                        />
                        {/* Add more detailed information here */}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
