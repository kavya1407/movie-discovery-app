# 🎬 Movie Discovery App

A responsive full-stack movie discovery application built as a take-home assessment.

The application allows users to discover movies, search for movies, browse categories, sort results, load additional results, view detailed movie information, and maintain a persistent wishlist.

---

## 🚀 Features

- Browse movies without performing a search
- Search movies by title
- Browse curated movie categories
- Sort movies by:
  - Title A → Z
  - Title Z → A
  - Newest First
  - Oldest First
- Pagination using "Load More"
- Movie details page
- Add movies to wishlist
- Remove movies from wishlist
- Wishlist persists across application restarts
- Back navigation preserves the previous browsing/search context
- Loading skeletons
- Loading states
- Empty states
- Error states
- Retry functionality
- Request cancellation for rapid searches
- Backend API abstraction
- Server-side API integration
- API response caching
- API timeout handling
- API rate-limit handling
- Responsive design for desktop and mobile

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- Axios
- CORS
- dotenv

### Database

- PostgreSQL
- Prisma ORM

### External API

- OMDb API

---

## 🏗️ Architecture

The application follows a client-server architecture.

```text
User
 │
 ▼
React Frontend
 │
 │ HTTP requests
 ▼
Node.js + Express Backend
 │
 ├──────────────► OMDb API
 │
 └──────────────► PostgreSQL
                       │
                       ▼
                    Prisma ORM