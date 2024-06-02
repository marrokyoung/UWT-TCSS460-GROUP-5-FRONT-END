'use client'; // With React, this file needs to be a client component in order to use React hooks (useState, useRouter, etc.)

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, Alert, Container, Typography, Box, Link, List, ListItem, ListItemText } from '@mui/material';
import { error } from "console";

/* Various requirements descriptions section that is displayed with improper input */
const passwordRequirements = [
    "Minimum Length: The password must be at least 8 characters long.",
    "Uppercase Letter: The password must contain at least one uppercase letter (A-Z).",
    "Lowercase Letter: The password must contain at least one lowercase letter (a-z).",
    "Digit: The password must contain at least one digit (0-9).",
    "Special Character: The password must contain at least one special character (e.g., !@#$%^&*(),.?\":{}|<>)."
];

const phoneRequirements = [
    "Phone: The phone number must be a valid phone number (e.g., 123-456-7890)."
];

const emailRequirements = [
    "Email: The email must be a valid email address (e.g., test@gmail.com)."
];

const roleRequirements = [
    "Role: The role must be a valid role (e.g., 1-5)."
];
/* End of requirements descriptions section */

/* Took validation functions from backend */
const isValidPassword = (password: string): boolean => {
    if (!password) return false;
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    return true;
};

const isValidPhone = (phone: string): boolean => {
    if (!phone) return false;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

const isValidEmail = (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidRole = (role: string): boolean => {
    if (!role) return false;
    const priorityNumber = parseInt(role, 10);
    if (isNaN(priorityNumber)) return false;
    return Number.isInteger(priorityNumber) && priorityNumber >= 1 && priorityNumber <= 5;
};
/* End of validation functions */

export default function Register() {
    // Lets set up our react state variables
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');
    const [errorMessages, setErrorMessages] = useState<string[]>([]); // If the user has input MULTIPLE wrong registration items, we want to display all of them
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    // Then, lets enter the function that will handle the registration
    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        const errors: string[] = []; // The list of the errors accumulated by the user's input (using errorMessages here overwrites everything)
        setErrorMessages([]); // Clear the error messages on a new registration attempt
        setSuccessMessage('');

        /* Check validation functions before proceeding to query */
        if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }

        if (!isValidEmail(email)) {
            errors.push('Invalid email format');
        }

        if (!isValidPassword(password)) {
            errors.push('Password does not meet the requirements.');
        }

        if (!isValidPhone(phone)) {
            errors.push('Invalid phone number format.');
        }

        if (!isValidRole(role)) {
            errors.push('Invalid role format.');
        }

        // Now, we add this check to see if we have gotten any errors
        if (errors.length > 0) {
            setErrorMessages(errors);
            return;
        }

        // Finally, lets try to register the user
        try {

            const response = await fetch('http://localhost:4000/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, firstname, lastname, username, phone, role }),
            });

            const data = await response.json();

            if (response.ok) {
                // If we successfully registered, lets redirect to the login page
                console.log('Registration successful:', data);
                setSuccessMessage('Registration successful. Redirecting to login...');
                setTimeout(() => {
                    router.push('/auth/login/');
                }, 
                2000);
            } else {
                setErrorMessages(data.message);
                console.error('Registration failed:', data.message);
            }

        } catch (error) {
            setErrorMessages(['An error occurred. Please try again.']);
            console.error('Error:', error);
        }
    };

    return (
        <Container>
            <Box
                sx={{
                    my: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                    Register
                </Typography>
                {errorMessages.length > 0 && (
                    <Alert severity="error" onClose={() => setErrorMessages([])}>
                        <List>
                            {errorMessages.map((error, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={error} />
                                </ListItem>
                            ))}
                        </List>
                        {errorMessages.includes('Password does not meet the requirements.') && (
                            <>
                                <Typography variant="h6" sx={{ mt: 2}}> 
                                    Password Requirements: 
                                </Typography>
                                <List>
                                    {passwordRequirements.map((requirement, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={requirement} />
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}
                        {errorMessages.includes('Invalid phone number format.') && (
                            <>
                                <Typography variant="h6" sx={{ mt: 2}}>
                                    Phone Requirements:
                                </Typography>
                                <List>
                                    {phoneRequirements.map((requirement, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={requirement} />
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}
                        {errorMessages.includes('Invalid email format') && (
                            <>
                                <Typography variant="h6" sx={{ mt: 2}}>
                                    Email Requirements:
                                </Typography>
                                <List>
                                    {emailRequirements.map((requirement, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={requirement} />
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}
                        {errorMessages.includes('Invalid role format.') && (
                            <>
                                <Typography variant="h6" sx={{ mt: 2}}>
                                    Role Requirements:
                                </Typography>
                                <List>
                                    {roleRequirements.map((requirement, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={requirement} />
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}
                    </Alert>
                )}
                {successMessage && (
                    <Alert severity="success" onClose={() => setSuccessMessage('')}>
                        {successMessage}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="firstname"
                        label="First Name"
                        name="firstname"
                        autoFocus
                        value={firstname}
                        onChange={(event) => setFirstname(event.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="lastname"
                        label="Last Name"
                        name="lastname"
                        value={lastname}
                        onChange={(event) => setLastname(event.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email"
                        name="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="phone"
                        label="Phone"
                        name="phone"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="role"
                        label="Role"
                        name="role"
                        value={role}
                        onChange={(event) => setRole(event.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="password"
                        label="Password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="confirmPassword"
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        Register
                    </Button>
                    <Typography variant="body2" align="center">
                        Already have an account? <Link href="/auth/login/">Login</Link>
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};
