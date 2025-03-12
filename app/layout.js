import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

// Define fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata for the application
export const metadata = {
  title: 'The Rushmore Blog',
  description: 'A superflat blog with the Rushmore colour palette',
  icons: {
    icon: '/favicon.ico', // This will look for favicon.ico in the public directory
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header>
          <div className="container">
            <nav>
              <Link href="/" className="logo">
                THE RUSHMORE BLOG
              </Link>
              <div className="nav-links">
                <Link href="/posts">Posts</Link>
                <Link href="/categories">Categories</Link>
                <Link href="/posts/new">New Post</Link>
              </div>
            </nav>
          </div>
        </header>
        
        <main className="container">
          {children}
        </main>
        
        <footer>
          <div className="container">
            <p>© {new Date().getFullYear()} The Rushmore Blog. All rights reserved.</p>
            <p>Built with Next.js and the Rushmore colour palette.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}