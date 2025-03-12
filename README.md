# Rushmore Design Blog

## Project Overview

Rushmore Design Blog is a full-stack web application built with Next.js and Supabase, designed to showcase design-related posts with robust commenting and content management features.

## Technologies Used

- **Frontend**: Next.js 14
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Features

### Core Functionality
- Create, read, update, and delete (CRUD) blog posts
- Categorize posts
- Add and manage comments
- Responsive design
- Sorting posts by date

### Detailed Features
- Dynamic routing for individual posts
- Server-side rendering
- Integrated database with Supabase
- Comment system with likes
- User-friendly interface

## Database Schema

### Tables
- **posts**
  - `id`: UUID (Primary Key)
  - `title`: Text
  - `content`: Text
  - `author`: Text
  - `createdAt`: Timestamp
  - `categoryId`: Foreign Key to categories

- **categories**
  - `id`: UUID (Primary Key)
  - `name`: Text
  - `description`: Text

- **comments**
  - `id`: UUID (Primary Key)
  - `content`: Text
  - `likes`: Integer
  - `createdAt`: Timestamp
  - `postId`: Foreign Key to posts

## Assignment Reflection

### Achievements
- [x] Implemented full CRUD functionality for posts
- [x] Created a robust commenting system
- [x] Implemented post sorting
- [x] Developed dynamic routing for posts
- [x] Integrated Supabase for database management

### Challenges
- Handling server-side and client-side state management
- Implementing secure database operations
- Managing complex form submissions and validations

### Learning Outcomes
- Deep understanding of Next.js server actions
- Improved skills in database design
- Enhanced knowledge of full-stack development principles

## Setup and Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/rushmore-design-blog.git
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

## Deployment

Deployed on Vercel:
- Automatically deploys from the main branch
- Environment variables configured in Vercel dashboard

## Future Improvements
- Implement user authentication
- Add rich text editing for posts
- Create more advanced filtering and search functionality
- Implement pagination for posts and comments

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
