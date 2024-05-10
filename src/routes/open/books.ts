
import {pool} from "../../core/utilities";
import express, {NextFunction, Request, Response, Router} from 'express';

const bookFormat = (resultRow) => `${resultRow.isbn13}, ${resultRow.authors}, ${resultRow.publication_year}, ${resultRow.original_title}, ${resultRow.title}, ${resultRow.rating_avg}, ${resultRow.rating_count}, ${resultRow.rating_1_star}, ${resultRow.rating_2_star}, ${resultRow.rating_3_star}, ${resultRow.rating_4_star}, ${resultRow.rating_5_star}, ${resultRow.image_url}}, ${resultRow.image_small_url}`;

const booksRouter: Router = express.Router();

booksRouter.get('/get_all_books', (request: Request, response: Response) => {
    const theQuery = 'SELECT * FROM books';
    const values = [];

    pool.query(theQuery, values)
        .then((result) => {
            if (result.rowCount > 0) {
                response.send({
                    entries: result.rows,
                });
            } else {
                response.status(404).send({
                    message: "No Books found",
                    code: 404,
                });
            }
        })
        .catch((error) => {
            //log the error
            console.error('DB Query error on GET by priority');
            console.error(error);
            response.status(500).send({
                message: 'server error - contact support',
            });
        });
})


booksRouter.get('/get_by_rating', (request, response) => {
        const theQuery = 'SELECT * FROM books WHERE rating_avg >= $1';
        const values = [request.query.rating];

        pool.query(theQuery, values)
            .then((result) => {
                response.send({
                    books: result.rows,
                });
            })
            .catch((error) => {
                console.error('DB Query error on GET /book_by_rating');
                console.error(error);
                response.status(500).send({
                    message: 'Server error - contact support',
                });
            });
    }
);

// TODO: Change to DELETE
booksRouter.get('/get_by_range', (request, response) => {
    const theQuery = 'SELECT * FROM books WHERE publication_year >= $1 AND publication_year <= $2';
    const values = [request.query.min, request.query.max];

    pool.query(theQuery, values)
        .then((result) => {
            response.send({
                books: result.rows,
            });
        })
        .catch((error) => {
            console.error('DB Query error on GET /book_by_range');
            console.error(error);
            response.status(500).send({
                message: 'Server error - contact support',
            });
        });
});

booksRouter.get('/get_by_isbn', (request: Request, response: Response) => {
    const theQuery = 'SELECT isbn13 FROM books WHERE ISBN = $1';
    const values = [request.query.isbn13];

    pool.query(theQuery, values)
        .then((result) => {
            if (result.rowCount == 1) {
                response.send({
                    entry: result.rows[0],
                });
            } else {
                response.status(404).send({
                    message: 'ISBN not found',
                });
            }
        })
});



// Priority validation removed for now.
booksRouter.post('/create_new_book', (request: Request, response: Response) => {
        const theQuery =
            'INSERT INTO books(ISBN13, Authors, Publication_year, Original_title, title, rating_avg, Rating_count,Rating_1_star,Rating_2_star,Rating_3_star,Rating_4_star,Rating_5_star,Image_url, Image_small_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *';
        const values = [
            request.body.isbn13,
            request.body.authors,
            request.body.publication_year,
            request.body.original_title,
            request.body.title,
            request.body.rating_avg,
            request.body.rating_count,
            request.body.rating_1_star,
            request.body.rating_2_star,
            request.body.rating_3_star,
            request.body.rating_4_star,
            request.body.rating_5_star,
            request.body.image_url,
            request.body.image_small_url,
        ];

        pool.query(theQuery, values)
            .then((result) => {
                // result.rows array are the records returned from the SQL statement.
                // An INSERT statement will return a single row, the row that was inserted.
                response.status(201).send({
                    entry: bookFormat(result.rows[0]),
                });
            })
            .catch((error) => {
                if (
                    error.detail != undefined &&
                    (error.detail as string).endsWith('already exists.')
                ) {
                    console.error('Title exists');
                    response.status(400).send({
                        message: 'Title exists',
                    });
                } else {
                    //log the error
                    console.error('DB Query error on POST');
                    console.error(error);
                    response.status(500).send({
                        message: 'server error - contact support',
                    });
                }
            });
    }
);


export {booksRouter};


