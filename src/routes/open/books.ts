import {pool} from "../../core/utilities";
import express, {NextFunction, Request, Response, Router} from 'express';

const booksRouter: Router = express.Router();

interface IRatings {
    average: number;
    count: number;
    rating_1: number;
    rating_2: number;
    rating_3: number;
    rating_4: number;
    rating_5: number;
}





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
booksRouter.delete('/delete_by_range', (request, response) => {
    const theQuery = 'DELETE FROM books WHERE publication_year >= $1 AND publication_year <= $2';
    const values = [request.query.min, request.query.max];

    pool.query(theQuery, values)
        .then((result) => {
            response.send({
                message: 'Books successfully deleted',
                deletedCount: result.rowCount,
            });
        })
        .catch((error) => {
            console.error('DB Query error on DELETE /delete_by_range');
            console.error(error);
            response.status(500).send({
                message: 'Server error - contact support',
            });
        });
});

export {booksRouter};


