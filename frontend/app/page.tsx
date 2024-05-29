`use client`; // With React, this file needs to be a client component in order to use React hooks (useState, useRouter, etc.)
import Link from 'next/link';

const Home = () => {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <Link href="/login">
        <a>Login</a>
      </Link>
    </div>
  );
};

export default Home;