//express is the framework we're going to use to handle requests
import express, { NextFunction, Request, Response, Router } from 'express';
//Access the connection to Postgres Database
import { pool, validationFunctions } from '../../core/utilities';

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

interface IUrlIcon {
    large: string;
    small: string;
}

interface IBook {
    isbn13: number;
    authors: string;
    publication: number;
    original_title: string;
    title: string;
    ratings: IRatings;
    icons: IUrlIcon;
}

// use this function to format your response, see line 98 for example
function formatBooks(books): IBook[] {
    return books.map((book) => ({
        isbn13: book.isbn13,
        authors: book.authors,
        publication: book.publication_year,
        original_title: book.original_title,
        title: book.title,
        ratings: {
            average: book.rating_avg,
            count: book.rating_count,
            rating_1: book.rating_1_star,
            rating_2: book.rating_2_star,
            rating_3: book.rating_3_star,
            rating_4: book.rating_4_star,
            rating_5: book.rating_5_star,
        } as IRatings,
        icons: {
            large: book.image_url,
            small: book.image_small_url,
        } as IUrlIcon,
    }));
}

/**
 * @api {get} /books/get_all_books Request to retrieve all books
 *
 * @apiDescription Request to retrieve all books in the DB
 *
 * @apiName GetAllBooks
 * @apiGroup Books
 *
 *
 * @apiSuccess {String[]} books the aggregate of all books as the following string:
 *      "{<code>isbn13</code>: <code>books isbn13</code>,
 *      <code>authors</code>: <code>books authors</code>,
 *      <code>publication</code>: <code>books publication year</code>,
 *      <code>original_title</code>: <code>books original title</code>,
 *      <code>title</code>: <code>books title</code>,
 *      <code>ratings</code>: {
 *          <code>average</code>: <code>books average rating</code>,
 *          <code>count</code>: <code>books count of total ratings</code>,
 *          <code>rating_1</code>: <code>books count of 1 star ratings</code>,
 *          <code>rating_2</code>: <code>books count of 2 star ratings</code>,
 *          <code>rating_3</code>: <code>books count of 3 star ratings</code>,
 *          <code>rating_4</code>: <code>books count of 4 star ratings</code>,
 *          <code>rating_5</code>: <code>books count of 5 star ratings</code>
 *      },
 *      <code>icons</code>: {
 *          <code>large</code>: <code>books large icon</code>,
 *          <code>small</code>: <code>books small icon</code>,
 *      }}"
 *
 *
 * @apiError (404: No Books Found) {string} message "No Books found"
 */
booksRouter.get('/get_all_books', (request: Request, response: Response) => {
    // TODO pagination
    const theQuery = 'SELECT * FROM books';
    const values = [];

    pool.query(theQuery, values)
        .then((result) => {
            if (result.rowCount > 0) {
                response.send({
                    books: formatBooks(result.rows),
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

/**
 * @api {put} /books/update_by_ratings Request to update a books ratings
 *
 * @apiDescription Request to add a specific star rating of a book in the DB
 *
 * @apiName PutRatingsBook
 * @apiGroup Books
 *
 * @apiBody {integer} rating the star rating
 * @apiBody {bigint} isbn13 the isbn number of the book to add the rating to
 *
 * @apiSuccess {String} books "Rating successfully added"
 *
 * @apiError (404: ISBN Not Found) {String} message "ISBN not found, rating not added"
 */
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


/**
 * @api {get} /books/get_by_rating/:rating Retrieve books by average rating
 * @apiDescription Retrieves books from the database that have an average rating of the rating specified, rounded down to the nearest integer.
 * @apiName GetByRating
 * @apiGroup Books
 * @apiParam {Number} rating The minimum average rating to filter books by. Must be between 1 and 5 inclusive.
 * @apiSuccess {Object[]} books Array of books each containing isbn13, authors, publication year, original title, title, average rating, ratings count, icons.
 * @apiError (400: Invalid Rating) {String} message "Invalid rating parameter. Please specify a rating between 1 and 5."
 * @apiError (404: No Books Found) {String} message "No books found with that rating."
 * @apiError (500: Server Error) {String} message "Server error - contact support."
 */
booksRouter.get('/get_by_rating', (request: Request, response: Response) => {
    const ratingParam = request.query.rating;
    const rating = parseInt(ratingParam as string);

    if (isNaN(rating) || rating < 1 || rating > 5) {
        return response.status(400).send({ message: "Invalid rating parameter. Please specify a rating between 1 and 5." });
    }

    const theQuery = 'SELECT * FROM books WHERE FLOOR(rating_avg) = $1';
    const values = [rating];

    pool.query(theQuery, values)
        .then((result) => {
            if (result.rows.length === 0) {
                return response.status(404).send({ message: "No books found with that rating." });
            }
            response.send({
                books: formatBooks(result.rows)
            });
        })
        .catch((error) => {
            console.error('DB Query error on GET /get_by_rating');
            console.error(error);
            response.status(500).send({
                message: 'Server error - contact support',
            });
        });
});




/**
 * @api {delete} /books/delete_by_range/:min/:max Delete books by publication year
 * @apiDescription Deletes book entries from the database based on their publication year falling within a specified range. This endpoint will return the number of deleted records.
 * @apiName DeleteByPublicationYear
 * @apiGroup Books
 * @apiParam (Query Parameter) {Number} min The minimum publication year to filter and delete books by.
 * @apiParam (Query Parameter) {Number} max The maximum publication year to filter and delete books by.
 * @apiSuccess {String} message Confirmation message indicating successful deletion.
 * @apiSuccess {Number} deletedCount The number of books deleted.
 * @apiError (400: Invalid Parameters) {String} message "Invalid date parameters. Please ensure 'min' is less than 'max' and both are valid years."
 * @apiError (404: No Books Found) {String} message "No books found within that date range."
 * @apiError (500: Server Error) {String} message "Server error - contact support."
 */
booksRouter.delete('/delete_by_range', (request, response) => {
    const theQuery = 'DELETE FROM books WHERE publication_year >= $1 AND publication_year <= $2';
    const values = [request.query.min, request.query.max];

    const min = parseInt(request.query.min as string, 10);
    const max = parseInt(request.query.max as string, 10);

    if (isNaN(min) || isNaN(max) || min > max) {
        return response.status(400).send({ message: "Invalid date parameters. Please specify a min and max publication year. min must be less than max." });
    }

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

// "return" the router
export { booksRouter };
