# Jira Clone Frontend

This is a React + Vite frontend for the Jira Clone application, built with Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Backend server running on `http://127.0.0.1:8000`

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (using legacy-peer-deps to resolve React 19 conflicts):
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at the URL shown in terminal (usually `http://localhost:5173`).

## 🛠 Tech Stack

- **React.js**: UI Library
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **React Router**: Navigation
- **Axios**: API Client
- **react-beautiful-dnd**: Drag and Drop functionality

## 🔗 Backend Integration

This frontend connects to the FastAPI backend. Ensure the backend is running before using the frontend.

- **Projects**: Create and view projects.
- **Kanban Board**: Drag and drop tasks between To Do, In Progress, Testing, and Done.
- **Tasks**: Create and edit tasks with title, description, and status.

## ✨ Key Features

- **Project Management**: Create projects via the sidebar.
- **Kanban Workflow**: Visualize task progress.
- **Task Details**: Click any task to view/edit details.
- **Partial Updates**: Editing a task only sends changed fields to the backend.
- **Optimistic UI**: Board updates instantly on drag-drop.

## 📝 Notes

- The Drag & Drop library relies on React Strict Mode being handled carefully. If you see warnings, they are likely from `react-beautiful-dnd` legacy support.
- File uploads are supported for new tasks.
