# AI Assistant Guide for Degree Progress Tracker

## 1. Project Overview

*   **Project Name**: Degree Progress Tracker
*   **Goal**: To provide students with a web application to track their academic progress towards their degree, manage courses, and visualize their achievements.
*   **Core Features**:
    *   Manual entry and management of courses (name, credits, grade, category, semester).
    *   Semester organization and management.
    *   Calculation of GPA and total completed credit points.
    *   Tracking progress against customizable degree requirements (course categories and target points).
    *   Multiple degree profile management.
    *   User authentication via Firebase (Email/Password).
    *   Data persistence:
        *   Firestore for authenticated users (courses, semesters, degree profiles).
        *   Browser localStorage for guest users.
    *   PDF transcript parsing for automatic extraction and input of course data (currently in development).

## 2. Tech Stack

*   **Frontend Framework**: React (using Vite for project setup and development server)
*   **Language**: JavaScript (ES6+)
*   **Styling**: Tailwind CSS
*   **State Management**:
    *   React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
    *   React Context API (e.g., for Authentication).
*   **Backend & Authentication**: Firebase
    *   Firebase Authentication (Email/Password).
    *   Firestore (NoSQL database for user-specific application data).
*   **PDF Parsing**: `pdfjs-dist` library (client-side).
*   **Build Tool**: Vite
*   **Version Control**: Git & GitHub
*   **Deployment**: GitHub Pages (via GitHub Actions workflow).

## 3. Project Structure Highlights

*   `public/`: Static assets. Vite copies these to the `dist` root during build.
    *   `public/js/pdf.worker.min.mjs`: Locally hosted PDF.js worker script.
*   `src/`: Main source code directory.
    *   `src/App.jsx`: Root application component, handles routing (implicitly via conditional rendering based on auth state), main state logic, and context providers.
    *   `src/main.jsx`: Entry point for the React application, renders `App`.
    *   `src/index.css`: Global styles, Tailwind CSS imports.
    *   `src/components/`: Directory for reusable React components.
        *   `auth/`: Components related to authentication (Login, Signup, EmailVerification).
        *   `PdfProcessor/`: Components related to PDF uploading and parsing (e.g., `PdfUpload.jsx`).
        *   Other UI components (e.g., `Header.jsx`, `SemesterCard.jsx`, `SummaryStats.jsx`).
    *   `src/context/`: React Context definitions (e.g., `AuthContext.jsx`).
    *   `src/hooks/`: Custom React hooks (e.g., `useProgress.js`).
    *   `src/constants.js`: Application-wide constants (e.g., semester options, category colors, initial degree profiles).
    *   `src/firebaseConfig.js`: Firebase application initialization and configuration.
*   `.github/workflows/deploy.yml`: GitHub Actions workflow for building and deploying the application to GitHub Pages on pushes to the `main` branch.
*   `package.json`: Project metadata, dependencies (`dependencies` and `devDependencies`), and npm scripts (e.g., `dev`, `build`, `deploy`, `prepare-pdf-worker`).
*   `vite.config.js`: Vite configuration, including the `base` path for GitHub Pages deployment.
*   `tailwind.config.js`: Configuration for Tailwind CSS.
*   `postcss.config.js`: Configuration for PostCSS (used by Tailwind).
*   `AI_ASSISTANT_GUIDE.md`: This file!

## 4. Development Workflow & AI Collaboration Guidelines

### Common Tasks for AI Assistance:
*   Adding new UI components or modifying existing ones in `src/components/`.
*   Implementing new features or business logic, often involving changes in `App.jsx` and related components.
*   Writing or refining data processing functions (e.g., for PDF parsing, GPA calculation).
*   Interacting with Firebase services (reading/writing to Firestore, user authentication).
*   Managing application state using React hooks and context.
*   Styling components with Tailwind CSS utility classes.
*   Adding or modifying npm scripts in `package.json`.
*   Assisting with Git commands (staging, committing, pushing).
*   Debugging issues across the frontend stack.

### AI Assistant Best Practices:
*   **Understand the Goal First**: Before suggesting code, ensure you understand the objective of the user's request.
*   **File Placement**:
    *   New general-purpose React components should go into `src/components/`. If a component is specific to a larger feature, consider a subdirectory within `src/components/` (e.g., `src/components/FeatureName/MyComponent.jsx`).
    *   New custom hooks go into `src/hooks/`.
    *   New contexts go into `src/context/`.
*   **State Management**: For state local to a component, use `useState`. For state that needs to be shared, evaluate if prop drilling is acceptable or if a Context or lifting state to `App.jsx` (or another shared parent) is more appropriate.
*   **Firebase Interactions**: Firestore read/write operations and Auth logic are primarily managed within `App.jsx` and `AuthContext.jsx`. New interactions should ideally follow similar patterns or be encapsulated in helper functions.
*   **Imports & Usage**: When creating new components or utilities, ensure they are correctly imported and utilized in their parent components or relevant parts of the application.
*   **Code Style**: Follow the existing coding style (component structure, naming conventions, commenting where non-obvious).
*   **Planning & Communication**:
    *   For significant changes, briefly outline your plan, including which files are likely to be affected.
    *   Explain the core logic of new functions or complex changes.
*   **Deployment Awareness**: Remember that the project is deployed to GitHub Pages via a GitHub Actions workflow in `.github/workflows/deploy.yml`, which triggers on pushes to the `main` branch. The `base` path in `vite.config.js` is crucial for this.
*   **Data Persistence**: Be mindful of the dual persistence strategy: Firestore for logged-in users, localStorage for guests. Changes to data structures should consider both.
*   **Error Handling**: Implement robust error handling, especially for async operations, API calls, and data parsing (like the PDF feature). Provide clear feedback to the user.
*   **Tool Usage**:
    *   Use the `edit_file` tool for code changes. Provide clear instructions.
    *   Use `run_terminal_cmd` for git operations, npm scripts, etc. Always explain the command.
    *   Use `read_file` to gather context before making changes.
    *   Use `list_dir` and `file_search` for exploration.

## 5. Key Data Structures (Brief Overview)

*   **`courses` (Array in state, typically in `App.jsx`)**:
    *   `{ id: string, name: string, category: string, credits: number, grade: number | null | string, status: string, semester: string, isEditing: boolean }`
    *   Grade can be numeric, null, or string (e.g., "Pass", "Exempt").
*   **`semesters` (Array of strings in state, typically in `App.jsx`)**:
    *   e.g., `["Fall 2023", "Spring 2024"]`
*   **`requirements` (Object in state, derived from `degreeProfiles`)**:
    *   Maps category names (string) to required credit points (number).
    *   e.g., `{ "Core CS": 40, "Math Elective": 12, ... }`
*   **`degreeProfiles` (Object in state, typically in `App.jsx`)**:
    *   Maps profile names (string) to their respective requirements objects.
    *   e.g., `{ "Computer Science B.Sc.": { "Core CS": 40, ... }, "Software Engineering B.Sc.": { ... } }`

## 6. Getting Started with AI

*   **Read this Document**: Familiarize yourself with the project overview, tech stack, and guidelines provided here.
*   **Ask for Current State**: If starting a new session, ask the user if there are any very recent unpushed changes or specific branches they are working on.
*   **Prioritize Context**: Before writing code, use tools to read relevant existing files to understand current implementations.
*   **Iterative Approach**: For complex features, suggest breaking them down into smaller, manageable steps.
*   **Clarify Ambiguity**: If a request is unclear, ask clarifying questions. However, try to find answers within the codebase or this guide first.

---
This guide is a living document. Please ask the user to update it if major architectural changes occur or if new patterns are established. 