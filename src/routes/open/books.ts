import {pool} from "../../core/utilities";
import express, {NextFunction, Request, Response, Router} from 'express';
const format = (resultRow) =>
    `{${resultRow.isbn13}}] says: ${resultRow.message}`;

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

/**
 * @api {get} /books/:get_by_Otitle Request to retrieve an entry
 *
 * @apiDescription Request to retrieve the complete entry for <code>original_title</code>.
 *
 * @apiName get_by_Otitle
 * @apiGroup Books
 *
 * @apiParam {string} title the original title to look up.
 *
 * @apiSuccess {String} entry The message associatd with <code>title</code>
 *
 * @apiError (404: Title Not Found) {string} message "Title not found"
 */

booksRouter.get('/:get_by_Otitle', (request: Request, response: Response) => {
    const theQuery = 'SELECT * FROM books WHERE original_title = $1';
    const values = [request.params.get_by_Otitle];

    pool.query(theQuery, values)
        .then((result) => {
            if (result.rowCount == 1) {
                response.send({
                    entry: result.rows[0],
                });
            } else {
                response.status(404).send({
                    message: 'Title not found',
                });
            }
        })
        .catch((error) => {
            //log the error
            console.error('DB Query error on Get /:get_by_title');
            console.error(error);
            response.status(500).send({
                message: 'server error - contact support',
            });
        });
});



/**
 * @api {delete} /message/:isbn Request to remove an entry
 *
 * @apiDescription Request to remove an entry associated with <code>isbn</code> in the DB
 *
 * @apiName Delete by isbn
 * @apiGroup Books
 *
 * @apiParam {String} isbn13 the isbn associated with the entry to delete
 *
 * @apiSuccess {String} entry the string
 *      "Deleted: [<code>isbn13</code>] says: <code>message</code>"
 *
 * @apiError (404: isbn13 Not Found) {String} message "isbn13 not found"
 */

booksRouter.delete('/:isbn13', (request: Request, response: Response) => {
    const theQuery = 'DELETE FROM books WHERE isbn13 = $1 RETURNING *';
    const values = [request.params.isbn13];

    pool.query(theQuery, values)
        .then((result) => {
            if (result.rowCount == 1) {
                response.send({
                    entry: 'Deleted: ' + format(result.rows[0]),
                });
            } else {
                response.status(404).send({
                    message: 'isbn13 not found',
                });
            }
        })
        .catch((error) => {
            console.error('DB Query error on DELETE /:isbn13');
            console.error(error);
            response.status(500).send({
                message: 'server error - contact support',
            });
        });
});

export {booksRouter};


