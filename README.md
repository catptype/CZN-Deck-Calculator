# Chaos Zero Nightmare - Save Data Calculator

> ⚠️ **Disclaimer**
>
> This is a fan-made, non-profit hobby project created purely for fun and educational purposes. There is no commercial benefit associated with this project. It is not affiliated with, authorized, or endorsed by **Smilegate Holdings, Inc.**, **Super Creative**, or **STOVE**, or their affiliates in any way. All characters, images, and other intellectual property from **Chaos Zero Nightmare** are trademarks and copyrights of their respective owners.

An unofficial, fan-made web application for calculating deck costs in the game **Chaos Zero Nightmare**. This tool provides real-time cost tracking for deck modifications, including adding, removing, duplicating, and upgrading cards across multiple decks simultaneously.

Built with a modern frontend stack, this project serves as a practical demonstration of component-based architecture, state management, and internationalization in a Vue.js 3 application.

<div align="center">

**[➡️ View the Live Demo on Vercel](https://czn-deck-calculator.vercel.app/)**

</div>

---

## 📸 Screenshots

| Screenshot 1 | Screenshot 2 |
| :---: | :---: |
| ![Home](docs/images/screenshot1.png) | ![Gacha](docs/images/screenshot2.png) |

---

## 🛠️ Tech Stack

*   **Framework:** Vue.js 3 (Composition API)
*   **Build Tool:** Vite
*   **State Management:** Pinia
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Internationalization:** Vue I18n

---

## ✨ Features

*   **Accurate In-Game Calculations:** Faithfully replicates the game's complex cost calculation rules, providing a realistic and reliable planning experience.
*   **Multi-Deck Management:** Calculate costs for up to three separate decks simultaneously.
*   **Real-Time Cost Calculation:** The total cost updates instantly with every action.
*   **Full "Undo" System:** Every action (Add, Remove, Duplicate, Convert, Upgrade) has a corresponding undo function.
*   **Dynamic Cost Breakdown:** Hover over the total cost to see a detailed, hierarchical breakdown of every cost source.
*   **Internationalization (i18n):** Full support for multiple languages (currently English & Japanese).
*   **Responsive Design:** A clean, modern UI that works seamlessly on desktop and mobile devices.
*   **Type-Safe Codebase:** Built with TypeScript to ensure robustness and maintainability.

---

## 🏗️ Architectural Overview

This project was built with a modern, component-based architecture focused on scalability and separation of concerns.

*   **Centralized State Management (`Pinia`):** A single `multiDeck` acts as the "single source of truth" for all deck data. All business logic and data mutations are handled through store actions, ensuring predictable state changes.
*   **Component Composition:** The UI is broken down into small, single-responsibility components.
    *   `HomeView.vue`: The main page, responsible for global controls (like Shared Tier) and laying out the deck widgets.
    *   `DeckComponent.vue`: A "smart container" widget that fetches data for a single deck and orchestrates its child panels.
    *   **Panel Components** (`SummaryPanel`, `ActionsPanel`, etc.): Dumb components responsible for displaying a specific part of the UI.
    *   `CardComponent.vue`: The smallest reusable component, responsible for rendering a single card and its interactive icon-based actions.
*   **Dynamic Data Loading:** Character preset data is not hardcoded. The application uses Vite's `import.meta.glob` feature in a Vue Composable (`usePresets`) to automatically discover and load all preset configuration files from the `/src/services` directory. This makes adding new characters as simple as adding a new file.
*   **Internationalization (`Vue I18n`):** All user-facing strings are managed in locale files (`/src/locales`). The application is language-agnostic, with components fetching translation keys and using the `t()` function to render the appropriate text.

---

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18.x or higher recommended)
*   npm or yarn

### Installation & Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/catptype/CZN-Deck-Calculator
    cd CZN-Deck-Calculator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    This will start a hot-reloading server, usually on `http://localhost:5173`.
    ```bash
    npm run dev
    ```

### Building for Production

1.  **Generate the static build:**
    This command compiles the application into optimized HTML, CSS, and JS files in the `/dist` directory.
    ```bash
    npm run build
    ```

2.  **Preview the production build:**
    This command serves the `/dist` folder on a local server to test the final product.
    ```bash
    npm run preview
    ```

---

## 📝 Future Improvements

*   Clean up my code, and project directory arrangements