# Degree Progress Tracker

## Description

A web application designed to help students track their academic progress towards their degree. It allows users to manage courses by semester, categorize them, assign credits and grades, and visualize their completed and remaining credits against predefined or custom degree requirements.

## Live Demo

The application is deployed on GitHub Pages and can be accessed here:
[https://yuvalh159.github.io/degree-progress-tracker/](https://yuvalh159.github.io/degree-progress-tracker/)

## Features

*   **Course Management:** Add, edit, and remove courses for each semester.
*   **Semester Management:** Add and remove semesters as needed.
*   **Categorization:** Assign courses to categories (e.g., Compulsory, General Elective, Specific Electives, etc.).
*   **Credit & Grade Tracking:** Input credits and grades for each course to monitor academic standing.
*   **GPA Calculation:** Automatically calculates Grade Point Average based on completed courses.
*   **Degree Profiles:** Predefined degree requirements for various engineering disciplines (Mechanical, Electrical, Software) with the ability to switch between them.
*   **Customizable Requirements:** Edit credit point requirements for each category.
*   **Custom Categories:** Add new custom course categories to tailor to specific degree needs.
*   **Progress Visualization:** Clear visual indicators (progress bars) for each category showing completed vs. required credits.
*   **Drag & Drop:** Easily move courses between semesters using drag and drop.
*   **Responsive Design:** User interface designed to work across different screen sizes.

## Tech Stack

*   **Frontend:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Language:** JavaScript

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have Node.js and npm (Node Package Manager) installed on your system.
*   [Node.js (which includes npm)](https://nodejs.org/)

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/yuvalh159/degree-progress-tracker.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd degree-progress-tracker
    ```
3.  Install the dependencies:
    ```sh
    npm install
    ```

### Running for Development

To start the development server and view the application in your browser:

```sh
npm run start
```

This will typically open the application at `http://localhost:3000` (or `http://localhost:3000/degree-progress-tracker/` as configured in `vite.config.js` for GitHub Pages deployment).

## Available Scripts

In the project directory, you can run:

*   `npm run start`
    *   Runs the app in development mode with hot reloading.

*   `npm run build`
    *   Builds the app for production to the `dist` folder.

*   `npm run preview`
    *   Serves the production build from the `dist` folder locally to preview it.

*   `npm run test`
    *   Runs tests using Vitest (if tests are configured).

*   `npm run predeploy` & `npm run deploy`
    *   These scripts are used together to build the application and deploy it to GitHub Pages. The `deploy` script uses `gh-pages` to push the contents of the `dist` folder to the `gh-pages` branch.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
