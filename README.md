# Live Interaction Studio

Act as an Expert Full-Stack Developer. I want to build a "Real-time TikTok Live Interaction App" using React (Vite), TypeScript, Tailwind CSS, and Supabase.

The goal of this app is to allow viewers to click buttons on their mobile phones, which will instantly trigger animations and sound effects on a streamer's dashboard displayed on a TikTok Live feed via OBS.

Please generate the boilerplate code, file structure, and step-by-step instructions for this project based on the following requirements:

1. Core Architecture (Two Main Routes):

/ (Viewer's Page): A mobile-first, highly responsive interface where users can enter a temporary username. Once entered, they see a grid of interaction buttons (e.g., "Send 🔥", "Send 💖", "Jump Scare").

/live (Streamer's Dashboard): A transparent, desktop-sized screen designed to be an OBS Browser Source. It should listen for real-time events and display pop-up animations (e.g., "[Username] sent 🔥") that disappear after 3 seconds.

2. Supabase Integration (Crucial Rule):

DO NOT save the button clicks to a Postgres database table. We need this to be lightning-fast to handle multiple concurrent users.

Use Supabase Realtime Broadcast to send and receive the interaction payloads (username + action type) directly between clients.

Use Supabase Presence to track and display the exact number of "Live Viewers" currently connected to the app.

3. Required Output:

The terminal commands to initialize the Vite + React + TS project and install necessary dependencies (Tailwind, React Router, Supabase JS).

The Supabase client setup (supabase.ts).

The code for the Viewer Component (Viewer.tsx), focusing on the Broadcast emit logic.

The code for the Dashboard Component (LiveDashboard.tsx), focusing on the Broadcast listen logic, Presence tracking, and the temporary UI pop-up state.

Please ensure the code is clean, modular, and strictly typed with TypeScript interfaces.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/529af51d-8106-4fde-abea-d1bad87634d3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
