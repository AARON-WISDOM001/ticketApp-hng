# TicketFlow - Ticket Management Application

TicketFlow is a React-based ticket management application built with Vite. It allows users to create, view, edit, and delete tickets with a simple and intuitive interface.

## Features

- User authentication (login/signup)
- Ticket management (CRUD operations)
- Ticket status tracking (Open, In Progress, Closed)
- Priority levels (Low, Medium, High)
- Responsive design using Bootstrap

## Tech Stack

- React 18
- Vite
- Bootstrap 5
- Lucide React Icons

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AARON-WISDOM001/ticketApp-hng.git
   ```

2. Navigate to the project directory:
   ```bash
   cd ticketApp-hng
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5174 is busy).

### Building for Production

To create a production build:

```bash
npm run build
```

### Previewing Production Build

To preview the production build locally:

```bash
npm run preview
```

## Usage

1. Sign up for a new account (your credentials will be stored in localStorage)
2. Log in with your created credentials
3. Navigate to the Dashboard or Tickets page
4. Create, edit, or delete tickets as needed

## Project Structure

- `src/App.jsx` - Main application component
- `src/main.jsx` - Entry point
- `src/index.css` - Global styles
- `src/App.css` - Additional component styles
- `public/` - Static assets
- `vite.config.js` - Vite configuration
- `package.json` - Project dependencies and scripts

## Contributing

Contributions are welcome. Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.
