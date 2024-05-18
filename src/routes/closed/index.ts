import express, { Router } from 'express';

import { checkToken } from '../../core/middleware';
import { tokenTestRouter } from './tokenTest';
import { booksRouter } from '../closed/books';
import {pool} from "../../core/utilities";

const closedRoutes: Router = express.Router();

closedRoutes.use('/jwt_test', checkToken, tokenTestRouter);
closedRoutes.use('/books', checkToken, booksRouter);


export { closedRoutes };
