# Courseiq-backend Project Structure

This project follows a modular **NestJS** architecture, making it highly scalable, maintainable, and easy to understand.

## Project Directory Structure

```text
d:/pizone/Courseiq-backend/
├── src/                        # Application Core Logic
│   ├── auth/                   # Authentication module (Sign Up, Login, Token Refresh, Logout)
│   │   └── dto/                # Data Transfer Objects for Auth validation
│   ├── common/                 # Global filters, decorators, and interceptors
│   ├── config/                 # Configurations (Database Setup, Ensure DB, Swagger Specs)
│   ├── databaseSchema/         # TypeORM Entities (User, Role, Language, BlacklistedToken)
│   ├── languages/              # Multilingual translations (en.ts, hi.ts)
│   ├── middlewares/            # Request middlewares (Auth, Locale detection, Exception filters)
│   ├── migrations/             # TypeORM Database migrations
│   ├── roles/                  # Roles CRUD module with validation & translations
│   │   └── dto/                # Data Transfer Objects for Role CRUD validation
│   ├── users/                  # Users management module
│   ├── utils/                  # Core utilities (Logger, Migration Runner, Translation Helper)
│   ├── app.controller.ts       # Base Controller
│   ├── app.module.ts           # Main application module (wiring dependencies)
│   ├── app.service.ts          # Base Service
│   └── main.ts                 # MAIN ENTRY POINT of the application
├── dist/                       # Production compiled output
├── logs/                       # Database and server log files
├── test/                       # E2E & Unit test configuration
├── .env.development            # Environment configurations (Development DB credentials, etc.)
├── .env.production             # Environment configurations (Production DB credentials, etc.)
├── nest-cli.json               # NestJS CLI configuration
├── package.json                # Project dependencies and script scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## Key Components

### 1. Entry Point (`src/main.ts`)
- Configures environment variables, ensures database existence, applies programmatic migrations, registers global pipes/filters/CORS, and starts the HTTP server.

### 2. Core Modules (`src/`)
- **auth/**: Logic for sign-up, login, and JWT tokens refresh/blacklist validation.
- **roles/**: Fully localized CRUD system for Role entity with validations.
- **languages/**: Dictionary translations supporting English (`en.ts`) & Hindi (`hi.ts`) with a custom translation middleware.
- **databaseSchema/**: TypeORM schemas mapping PostgreSQL database tables.

### 3. Localization Middleware
- Automatically detects the user request language from the `?lang=hi` query parameter or `Accept-Language` headers, running translations dynamically.

### 4. Database Setup & Seed
- Programmatically creates the database if it doesn't exist, runs migrations, and seeds default roles (`admin`, `instructor`, `student`), languages, and the default admin user account.

## 🛠 Setup & Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Environment**:
    - Update DB credentials inside `.env.development` or `.env.production`.

3.  **Run Development Server**:
    ```bash
    npm run start:dev
    ```
    Access the API at: [http://localhost:3000](http://localhost:3000)
    Access Swagger API documentation at: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

4.  **Production Build**:
    ```bash
    npm run build
    npm run start:prod
    ```

## API Documentation (Swagger)
- Interactive API docs are available at `http://localhost:3000/api/docs` where you can inspect and try out all routes (Auth, Roles, Users).
