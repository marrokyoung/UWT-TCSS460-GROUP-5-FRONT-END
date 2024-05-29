"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../../core/utilities");
const express_1 = __importDefault(require("express"));
const booksRouter = express_1.default.Router();
booksRouter.get('/get_all', (request, response) => {
    const theQuery = 'SELECT * FROM books ORDER BY title';
    utilities_1.pool.query(theQuery)
        .then((result) => {
        response.send({
            books: result.rows,
        });
    })
        .catch((error) => {
        console.error('DB Query error on GET /books');
        console.error(error);
        response.status(500).send({
            message: 'Server error - contact support',
        });
    });
});
booksRouter.get('/get_by_rating', (request, response) => {
    const theQuery = 'SELECT * FROM books WHERE rating_avg >= $1';
    const values = [request.query.rating];
    utilities_1.pool.query(theQuery, values)
        .then((result) => {
        response.send({
            books: result.rows,
        });
    })
        .catch((error) => {
        console.error('DB Query error on GET /booke_by_rating');
        console.error(error);
        response.status(500).send({
            message: 'Server error - contact support',
        });
    });
});
//# sourceMappingURL=books..js.map