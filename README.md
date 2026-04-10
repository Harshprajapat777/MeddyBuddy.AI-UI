# HealthBot UI

A React-based chat interface for HealthBot — an AI-powered health assistant that handles appointment booking, medicine reminders, report analysis, and health Q&A.

## Features

- **AI Chat** — multi-turn conversation with intent detection
- **Appointment Booking** — book, view, and cancel doctor appointments via chat or directly
- **Medicine Reminders** — set and manage medication reminders
- **Report Analysis** — upload medical reports (PDF, DOCX, TXT) for AI-powered analysis
- **Health Tips** — daily health tip feed

<img width="1918" height="908" alt="image" src="https://github.com/user-attachments/assets/0e23811d-d428-4b09-b6b3-eb58aec62f6b" />
<img width="732" height="907" alt="image" src="https://github.com/user-attachments/assets/c7879339-19d3-41e6-85b8-9379c36373e5" />
<img width="742" height="901" alt="image" src="https://github.com/user-attachments/assets/b7c4b274-0778-491f-9b53-9f61114d4fa3" />

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- Framer Motion
- React Markdown + remark-gfm
- Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18+
- The [HealthBot backend](../server) running on `http://localhost:8000`

### Install & Run

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

### Build

```bash
npm run build
```

Output goes to `dist/`.

## API

The frontend talks to the backend REST API documented in [`api.md`](./api.md).

Key endpoints:

| Endpoint | Description |
| --- | --- |
| `POST /api/chat` | Send a message, get a reply + intent |
| `GET /api/appointments` | List all appointments |
| `POST /api/appointments` | Book an appointment directly |
| `DELETE /api/appointments/:id` | Cancel an appointment |
| `GET /api/reminders` | List all reminders |
| `POST /api/reminders` | Add a reminder |
| `DELETE /api/reminders/:id` | Delete a reminder |
| `POST /api/report/analyze` | Upload and analyze a medical report |
| `GET /api/health-tips` | Get 5 random health tips |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
