
# CA Monk Blog Application

A blog application built with React, TypeScript, TanStack Query, and Tailwind CSS. Users can view, create, and search blogs with a clean, responsive interface.
<img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/a5acb164-8590-454f-b22b-fb05914b1756" />

<img width="1919" height="912" alt="image" src="https://github.com/user-attachments/assets/a95e656b-021c-48bc-bc2d-939c6a37e531" />

## Features

- View all blogs and individual blog details
- Create new blog posts via a modal form
- Search and filter by title, description, or category
- Loading states, error handling, and toast notifications
- Responsive design for mobile and desktop
- Full TypeScript type safety
- TanStack Query for server state management and caching
<img width="954" height="902" alt="image" src="https://github.com/user-attachments/assets/32e8ee39-b10f-4ff0-923d-cefe9ca07b3e" />
## Technologies

- React 18
- TypeScript
- TanStack Query
- Tailwind CSS
- Vite
- JSON Server (mock backend)

## Setup

1. Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd CA_Monk
npm install

Start JSON Server (backend):
bash
Copy code
npm run server

Start development server (frontend):
bash
Copy code
npm run dev
The app will open at http://localhost:3000.

Project Structure
bash
Copy code
src/
 ├─ components/    # UI components and modals
 ├─ services/      # API service layer
 ├─ types.ts       # Type definitions
 └─ App.tsx        # Main application component
db.json            # Mock database
Author
Student project built as part of the CA Monk technical assessment.
