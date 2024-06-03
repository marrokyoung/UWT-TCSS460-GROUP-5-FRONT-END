import * as React from "react";
import { useState, useEffect, useContext, createContext } from "react";
import { useRouter } from "next/navigation";

// Here, we are using the reactAPI to create a context for the authentication
const AuthContext = createContext({ isAuthenticated: false, login: (token: string) => {} });

export default function Authentication ({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // The user is not authenticated by default
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken'); // Check if the user is authenticated by checking if the token is stored in the local storage
        if (token) {
            setIsAuthenticated(true); // Set the user as authenticated
        } else {
            router.push('/auth/login'); // Redirect to the login page if the user is not authenticated
        }
    }, [ router ]);

    // Function that gets called when the user logs in
    const login = (token: string) => {
        localStorage.setItem('authToken', token); // Store the token in the local storage
        setIsAuthenticated(true); // Set the user as authenticated
        router.push('/home');
    }

    return (
        // Here, we are providing the authentication context to the children components
        <AuthContext.Provider value={{ isAuthenticated, login }}>
            {children}
        </AuthContext.Provider>
    );
}

// Here, we are creating a custom hook to use the authentication context (reduces import statements)
export const useAuth = () => useContext(AuthContext);