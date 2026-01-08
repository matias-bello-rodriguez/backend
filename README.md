# Backend Autobox Refactored

This is a refactored backend for Autobox using NestJS and TypeORM, based on the provided SQL schema.

## Prerequisites

- Node.js
- MySQL Database

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=auto_box
JWT_SECRET=your_jwt_secret
PORT=3000
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Modules Implemented

- **Auth**: Login and Registration (JWT based)
- **Users**: User management
- **Vehicles**: Vehicle management and search
- **Inspections**: Inspection management
- **Payments**: Payment management

## Database Schema

The database schema is based on the `sql.sql` file provided.
Entities are located in `src/entities`.

## API Documentation

The API endpoints follow the structure defined in the original `API_REFERENCE.md`.
