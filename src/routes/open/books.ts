//express is the framework we're going to use to handle requests
import express, { NextFunction, Request, Response, Router } from 'express';
//Access the connection to Postgres Database
import { pool, validationFunctions } from '../../core/utilities';

const booksRouter: Router = express.Router();

// TODO: add documentation, pagination, and properly format result
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
                    message: `No Books found`,
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
});

// TODO: add documentation
booksRouter.put(
    '/update_by_ratings',
    (request: Request, response: Response, next: NextFunction) => {
        const rating = request.body.rating;
        const theQuery = `UPDATE books SET rating_${rating}_star = rating_${rating}_star + 1, rating_count = rating_count + 1 WHERE isbn13 = $1`;
        const values = [request.body.isbn13];

        pool.query(theQuery, values)
            .then((result) => {
                if (result.rowCount == 1) {
                    response.send({
                        message: 'Rating successfully added',
                        code: 200,
                    });
                } else {
                    response.status(404).send({
                        message: 'ISBN not found, rating not added',
                        code: 404,
                    });
                }
            })
            .catch((error) => {
                //log the error
                console.error('DB Query error on PUT');
                console.error(error);
                response.status(500).send({
                    message: 'server error - contact support',
                });
            });
    }
);

// "return" the router
export { booksRouter };
