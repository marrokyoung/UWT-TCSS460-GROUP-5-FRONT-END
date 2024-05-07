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

// "return" the router
export { booksRouter };
