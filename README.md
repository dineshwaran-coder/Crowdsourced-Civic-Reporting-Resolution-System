# Crowdsourced Civic Issue Reporting and Resolution System
### Theme: Clean & Green Technology (SIH 2025 Problem Statement: SIH25031)

CivicGreen is a premium web platform designed to connect citizens directly with municipal authorities. Citizens can pin environmental issues (potholes, trash piles, broken streetlights) on an interactive map, upload image evidence, and trace the status of their reports in real-time. Officials can manage tickets, update progress, and upload resolution proof.

---

## Key Features

1. **Dual-Mode Backend Engine**:
   - **Database**: Automatically runs using a local JSON database fallback (`server/data/db.json`) if MongoDB Atlas (`MONGO_URI`) is missing or disconnected. It instantly upgrades to MongoDB Atlas if a uri is configured.
   - **File Uploads**: Saves images locally to the server filesystem (`server/uploads/`) if Cloudinary credentials are empty, and uploads to Cloudinary dynamically if configured.
2. **Citizen Portal**:
   - **Report Issue**: Category selection, detailed description, drag-and-drop photo uploader.
   - **Interactive Location Pinning**: Leaflet map binding. Click to select location, includes **Automatic Reverse Geocoding** (OSM Nominatim) to resolve coordinates into human-readable addresses instantly.
   - **Tracking Dashboard**: Monitor reports through a visual status timeline (Pending &rarr; In Progress &rarr; Resolved).
3. **Govt Official Portal**:
   - **Analytics Dashboard**: Interactive status charts (custom SVG donut graphs) and department category distributions.
   - **Automatic Filters**: Defaults to the official's specific department category upon login.
   - **Ticket Management**: Mark issues "In Progress" or "Resolved" with official comments and upload "Resolution Proof Images".

---

## Setup & Running Guide

### Prerequisites
- Node.js installed on your machine.

### Installation
1. Install dependencies for the root, client, and server:
   ```bash
   npm run install-all
   ```

2. *(Optional)* Configure your database and image storage by creating or updating `server/.env`:
   ```env
   PORT=5000
   JWT_SECRET=sih_civic_reporting_system_secret_key
   
   # MongoDB Atlas Connection String
   MONGO_URI=mongodb+srv://...
   
   # Cloudinary Image Hosting Credentials
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Start Development Server
Run the root script to boot both the Express server (port 5000) and the Vite client (port 5173) concurrently:
```bash
npm run dev
```

---

## Technical Stack
- **Frontend**: React.js, React Router v6, Leaflet Maps, Lucide Icons, Custom Glassmorphic CSS.
- **Backend**: Node.js, Express.js, JWT Authentication, Multer.
- **Database**: Mongoose / MongoDB Atlas (Production) & Local File System JSON Store (Local Dev fallback).
- **Hosting / Storage**: Cloudinary (Production) & Local disk upload (Local Dev fallback).
