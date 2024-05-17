//express is the framework we're going to use to handle requests
import express, { NextFunction, Request, Response, Router } from 'express';
//Access the connection to Postgres Database
import { pool } from '../../core/utilities';

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
 * @api {get} /books/get_all_books/:page/:limit Request to retrieve all books
 *
 * @apiDescription Request to retrieve all books in the DB
 *
 * @apiName GetAllBooks
 * @apiGroup Books
 *
 *
 * @apiSuccess {String[]} pagination information, and the aggregate of all books as the following string:
 *      "{
 *      "pagination" : {
 *      <code>totalShownBooks</code>: <code>totalShownBooks</code>,
 *      <code>totalBooks</code>: <code>totalBooks in DB</code>,
 *      <code>totalPages</code>: <code>totalPages with this limit</code>,
 *      <code>nextPage</code>: <code>nextPage</code>,
 *      <code>currentPage</code>: <code>currentPage</code>,
 *      <code>prevPage</code>: <code>prevPage</code>
 *      },
 *      "books" : [
 *      <code>isbn13</code>: <code>books isbn13</code>,
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
 *      }}]"
 *
 * @apiError (400: Invalid page) {String} message "Invalid page parameter. Please specify a page between 1 and 189."
 * @apiError (400: Invalid limit) {String} message "Invalid limit parameter. Please specify a limit between 1 and 9415."
 * @apiError (404: No Books Found) {string} message "No Books found"
 */
booksRouter.get('/get_all_books/', (request: Request, response: Response) => {
    const page: number = +request.query.page || 1; // Show the user requested page or the first page
    // Make it a number so TypeScript is happy

    // Query to count total number of books
    const countQuery: string = 'SELECT COUNT(*) AS total FROM books';
    pool.query(countQuery)
        .then((result) => {
            const totalBooks: number = parseInt(result.rows[0].total);
            const limit: number = +request.query.limit || 50; // Show only 50 books from DB or the user requested limit
            // and make it a number so ts is happy
            const totalPages: number = Math.ceil(totalBooks / limit);

            // Validate page after calculating totalPages
            if (page < 1 || page > totalPages) {
                response.status(400).send({
                    message: `Invalid page parameter. Please specify a page between 1 and ${totalPages}.`,
                });
                return;
            } // Validate limit after calculating totalBooks
            if (limit < 1 || limit > totalBooks) {
                response.status(400).send({
                    message: `Invalid limit parameter. Please specify a limit between 1 and ${totalBooks}.`,
                });
                return;
            }

            const offset = (page - 1) * limit; // Starting point of where to grab books in DB

            // Main query to retrieve books
            const booksQuery: string = 'SELECT * FROM books LIMIT $1 OFFSET $2';
            const values = [limit, offset];
            return pool.query(booksQuery, values).then((booksResult) => {
                if (booksResult.rowCount > 0) {
                    // if there is a next page, set to page plus 1, if not set to null
                    const nextPage: number | null =
                        page < totalPages ? page + 1 : null;
                    // if there is a previous page, set to page minus 1, if not set to null
                    const prevPage: number | null = page > 1 ? page - 1 : null;

                    response.send({
                        pagination: {
                            // information needed for pagination
                            totalShownBooks: limit,
                            totalBooks: totalBooks,
                            totalPages: totalPages,
                            nextPage: nextPage,
                            currentPage: page,
                            prevPage: prevPage,
                        },
                        books: formatBooks(booksResult.rows),
                    });
                } else {
                    response.status(404).send({
                        message: 'No Books found',
                        code: 404,
                    });
                }
            });
        })
        .catch((error) => {
            // Log the error
            console.error('DB Query error on GET by priority');
            console.error(error);
            response.status(500).send({
                message: 'Server error - contact support',
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
 * @apiSuccess {String} books "Rating successfully added for book with ISBN: <code>isbn13</code>"
 *
 * @apiError (400: Invalid rating) {String} message "Invalid rating. Please specify a rating between 1 and 5."
 * @apiError (400: Invalid ISBN) {String} message "Invalid ISBN. Please specify a 13 digit ISBN."
 * @apiError (404: ISBN Not Found) {String} message "ISBN not found, rating not added"
 */
booksRouter.put(
    '/update_by_ratings',
    (request: Request, response: Response, next: NextFunction) => {
        const rating = +request.body.rating; //make it a number to make ts happy
        const isbn13 = request.body.isbn13;
        const theQuery = `UPDATE books SET rating_${rating}_star = rating_${rating}_star + 1, rating_count = rating_count + 1 WHERE isbn13 = $1`;
        const values = [isbn13];

        if (isNaN(rating) || rating < 1 || rating > 5) {
            return response.status(400).send({
                message:
                    'Invalid rating. Please specify a rating between 1 and 5.',
            });
        }

        const isbn13Regex = /^\d{13}$/; // Regular expression to validate isbn13 (13 digits only)

        if (!isbn13Regex.test(isbn13)) {
            // Validate the isbn13
            return response.status(400).send({
                message: 'Invalid ISBN. Please specify a 13 digit ISBN.',
            });
        }
        pool.query(theQuery, values)
            .then((result) => {
                if (result.rowCount == 1) {
                    response.send({
                        message: `Rating successfully added for book with ISBN: ${isbn13}`,
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
