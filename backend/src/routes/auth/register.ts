// express is the framework we're going to use to handle requests
import express, {Request, Response, Router, NextFunction} from 'express';

import jwt from 'jsonwebtoken';

const key = {
    secret: process.env.JSON_WEB_TOKEN,
};

import {
    pool,
    validationFunctions,
    credentialingFunctions,
} from '../../core/utilities';

const isStringProvided = validationFunctions.isStringProvided;
const isNumberProvided = validationFunctions.isNumberProvided;
const generateHash = credentialingFunctions.generateHash;
const generateSalt = credentialingFunctions.generateSalt;

const registerRouter: Router = express.Router();

export interface IUserRequest extends Request {
    id: number;
}


/**
 * @api {} Password Validation
 * 
 * @apiDescription Password Requirements:
 * Minimum Length: The password must be at least 8 characters long.
 * Uppercase Letter: The password must contain at least one uppercase letter (A-Z).
 * Lowercase Letter: The password must contain at least one lowercase letter (a-z).
 * Digit: The password must contain at least one digit (0-9).
 * Special Character: The password must contain at least one special character (e.g., !@#$%^&*(),.?":{}|<>).
 * 
 * @apiName PasswordValidation
 * @apiGroup Auth
 * 
 *  @apiParam {String} password The password to validate. Must adhere to above requirements.
 */
const isValidPassword = (password: string): boolean => {
    if (!isStringProvided(password)) return false;
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    return true;
}

/**
 * @api {} Phone Number Validation
 * 
 * @apiDescription Phone Number Requirements:
 * Only Numeric Characters and Optional Special Characters: The phone number must contain only digits, spaces, dashes, parentheses, and can optionally start with a '+'.
 * Minimum Length: The phone number must contain at least 10 digits (after removing non-digit characters).
 * 
 * @apiName PhoneNumberValidation
 * @apiGroup Auth
 * 
 *  @apiParam {String} phone The phone number to validate. Must adhere to above requirements.
 */
const isValidPhone = (phone: string): boolean => {
    if (!isStringProvided(phone)) return false;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * @api {} Role Validation
 * 
 * @apiDescription Role Requirements:
 * Numeric Value: The priority must be a numeric value.
 * Integer Check: The priority must be an integer.
 * Range: The priority must be within the range of 1 to 5 (inclusive).
 * 
 * @apiName RoleValidation
 * @apiGroup Auth
 * 
 *  @apiParam {String} priority The role to validate. Must adhere to above requirements.
 */
const isValidRole = (priority: string): boolean => {
    if (!isNumberProvided(priority)) return false;
    const priorityNumber = parseInt(priority, 10);
    if (isNaN(priorityNumber)) return false;
    return Number.isInteger(priorityNumber) && priorityNumber >= 1 && priorityNumber <= 5;
};

/**
 * @api {} Email Validation
 * 
 * @apiDescription Email Requirements:
 * Presence of '@' Character: The email must contain exactly one '@' character.
 * Valid Domain Structure: The email must have a valid domain structure, including a domain name and a top-level domain (e.g., example.com).
 * No Special Characters or Spaces: The email should not have any special characters or spaces outside of the local part and domain name.
 * 
 * @apiName EmailValidation
 * @apiGroup Auth
 * 
 * @apiParam {String} email The email to validate. Must adhere to above requirements.
 */
const isValidEmail = (email: string): boolean => {
    if (!isStringProvided(email)) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// middleware functions may be defined elsewhere!
const emailMiddlewareCheck = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    if (isValidEmail(request.body.email)) {
        next();
    } else {
        response.status(400).send({
            message:
                'Invalid or missing email  - please refer to documentation',
        });
    }
};

/**
 * @api {post} /register Request to register a user
 *
 * @apiDescription Document this route. 
 * Password Requirements:
 * Minimum Length: The password must be at least 8 characters long.
 * Uppercase Letter: The password must contain at least one uppercase letter (A-Z).
 * Lowercase Letter: The password must contain at least one lowercase letter (a-z).
 * Digit: The password must contain at least one digit (0-9).
 * Special Character: The password must contain at least one special character (e.g., !@#$%^&*(),.?":{}|<>).
 * 
 * Role Requirements:
 * Numeric Value: The priority must be a numeric value.
 * Integer Check: The priority must be an integer.
 * Range: The priority must be within the range of 1 to 5 (inclusive).
 *
 * @apiName PostAuth
 * @apiGroup Auth
 *
 * @apiBody {String} firstname a users first name
 * @apiBody {String} lastname a users last name
 * @apiBody {String} email a users email *unique
 * @apiBody {String} password a users password
 * @apiBody {String} username a username *unique
 * @apiBody {String} role a role for this user [1-5]
 * @apiBody {String} phone a phone number for this user
 *
 * @apiSuccess (Success 201) {string} accessToken a newly created JWT
 * @apiSuccess (Success 201) {number} id unique user id
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (400: Invalid Password) {String} message "Invalid or missing password  - please refer to documentation"
 * @apiError (400: Invalid Phone) {String} message "Invalid or missing phone number  - please refer to documentation"
 * @apiError (400: Invalid Email) {String} message "Invalid or missing email  - please refer to documentation"
 * @apiError (400: Invalid Role) {String} message "Invalid or missing role  - please refer to documentation"
 * @apiError (400: Username exists) {String} message "Username exists"
 * @apiError (400: Email exists) {String} message "Email exists"
 *
 */
registerRouter.post(
    '/register',
    emailMiddlewareCheck, // these middleware functions may be defined elsewhere!
    (request: Request, response: Response, next: NextFunction) => {
        //Verify that the caller supplied all the parameters
        //In js, empty strings or null values evaluate to false
        if (
            isStringProvided(request.body.firstname) &&
            isStringProvided(request.body.lastname) &&
            isStringProvided(request.body.username)
        ) {
            next();
        } else {
            response.status(400).send({
                message: 'Missing required information',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidPhone(request.body.phone)) {
            next();
            return;
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing phone number  - please refer to documentation',
            });
            return;
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidPassword(request.body.password)) {
            next();
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing password  - please refer to documentation',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidRole(request.body.role)) {
            next();
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing role  - please refer to documentation',
            });
        }
    },
    (request: IUserRequest, response: Response, next: NextFunction) => {
        const theQuery =
            'INSERT INTO Account(firstname, lastname, username, email, phone, create_date, account_role) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING account_id';
        const values = [
            request.body.firstname,
            request.body.lastname,
            request.body.username,
            request.body.email,
            request.body.phone,
            request.body.role,
        ];
        pool.query(theQuery, values)
            .then((result) => {
                //stash the account_id into the request object to be used in the next function
                // NOTE the TYPE for the Request object in this middleware function
                request.id = result.rows[0].account_id;
                next();
            })
            .catch((error) => {
                //log the error
                // console.log(error)
                if (error.constraint == 'account_username_key') {
                    response.status(400).send({
                        message: 'Username exists',
                    });
                } else if (error.constraint == 'account_email_key') {
                    response.status(400).send({
                        message: 'Email exists',
                    });
                } else {
                    //log the error
                    console.error('DB Query error on register');
                    console.error(error);
                    response.status(500).send({
                        message: 'server error - contact support',
                    });
                }
            });
    },
    (request: IUserRequest, response: Response) => {
        //We're storing salted hashes to make our application more secure
        //If you're interested as to what that is, and why we should use it
        //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
        const salt = generateSalt(32);
        const saltedHash = generateHash(request.body.password, salt);

        const theQuery =
            'INSERT INTO Account_Credential(account_id, salted_hash, salt) VALUES ($1, $2, $3)';
        const values = [request.id, saltedHash, salt];
        pool.query(theQuery, values)
            .then(() => {
                const accessToken = jwt.sign(
                    {
                        role: request.body.role,
                        id: request.id,
                    },
                    key.secret,
                    {
                        expiresIn: '14 days', // expires in 14 days
                    }
                );
                //We successfully added the user!
                response.status(201).send({
                    accessToken,
                    id: request.id,
                });
            })
            .catch((error) => {
                /***********************************************************************
                 * If we get an error inserting the PWD, we should go back and remove
                 * the user from the member table. We don't want a member in that table
                 * without a PWD! That implementation is up to you if you want to add
                 * that step.
                 **********************************************************************/

                //log the error
                console.error('DB Query error on register');
                console.error(error);
                response.status(500).send({
                    message: 'server error - contact support',
                });
            });
    }
);

registerRouter.get('/hash_demo', (request, response) => {
    const password = 'password12345';

    const salt = generateSalt(32);
    const saltedHash = generateHash(password, salt);
    const unsaltedHash = generateHash(password, '');

    response.status(200).send({
        salt: salt,
        salted_hash: saltedHash,
        unsalted_hash: unsaltedHash,
    });
});


registerRouter.get('/users', (request: Request, response: Response) => {
    const theQuery = 'SELECT * FROM Account';
    pool.query(theQuery)
        .then((result) => {
            response.status(200).send(result.rows);
        })
        .catch((error) => {
            console.error('DB Query error on register when getting users');
            console.error(error);
            response.status(500).send({
                message: 'server error - contact support',
            });
        });
});


export {registerRouter};