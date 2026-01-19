CA Monk Blog Application

A blog application built with React, TypeScript, TanStack Query, and Tailwind CSS. The app allows users to view, create, and search blogs with a clean, responsive interface.

Features

View all blogs and individual blog details

Create new blog posts via a modal form

Search and filter by title, description, or category

Loading states, error handling, and toast notifications

Responsive design for mobile and desktop

Full TypeScript type safety

TanStack Query for server state management and caching

Technologies

React 18

TypeScript

TanStack Query

Tailwind CSS

Vite

JSON Server (mock backend)

Setup

Clone the repo and install dependencies:

git clone <repo-url>
cd camonk-interview
npm install


Start JSON Server (backend):

npm run server


Start development server (frontend):

npm run dev

Project Structure
src/
 ├─ components/       # UI components and modals
 ├─ services/         # API service layer
 ├─ types.ts          # Type definitions
 └─ App.tsx           # Main app
db.json               # Mock database

Author

Student project built as part of the CA Monk technical assessment.