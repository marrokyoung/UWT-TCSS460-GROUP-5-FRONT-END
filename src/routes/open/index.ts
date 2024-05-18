import express, { Router } from 'express';

import { messageRouter } from './message';
// import { booksRouter } from '../closed/books';
const openRoutes: Router = express.Router();

openRoutes.use('/message', messageRouter);
// openRoutes.use('/books', booksRouter);
export { openRoutes };
