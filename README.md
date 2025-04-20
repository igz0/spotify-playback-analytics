# Spotify Playback Analytics

A web application for analyzing and visualizing your Spotify playback history data.

## Features

- Loading and analyzing Spotify playback history data
- Overview statistics including total tracks played, total listening time, unique artists, and unique tracks
- Top artists and top tracks rankings
- Monthly and hourly playback time graphs
- Filtering by date range

## Technology Stack

- [Next.js](https://nextjs.org/) - React framework (App Router)
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Recharts](https://recharts.org/) - React-based charting library
- [date-fns](https://date-fns.org/) - Date manipulation library
- [Biome](https://biomejs.dev/) - Linter & formatter

## Setup Instructions

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd spotify-history-analyzer
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Access the application in your browser at [http://localhost:3000](http://localhost:3000)

## About Spotify Playback History Data

This application uses extended playback history data downloaded from Spotify. The data should be in JSON format as follows:

```json
[
  {
    "ts": "2020-01-01T12:00:00Z",
    "platform": "Android",
    "ms_played": 180000,
    "master_metadata_track_name": "Track Name",
    "master_metadata_album_artist_name": "Artist Name",
    "master_metadata_album_album_name": "Album Name",
    ...
  },
  ...
]
```

## How to Use

1. Download your extended playback history data from Spotify
   - Log in to [Spotify](https://spotify.com)
   - Open the [Privacy Settings](https://www.spotify.com/account/privacy/) page
   - Select "Extended streaming history" and deselect other options
   - Click the "Request data" button
   - You'll receive an email with your data within 30 days
   - Download `my_spotify_data.zip` using the instructions in the email
   
2. Start the application
   ```bash
   npm run dev
   ```

3. Access the application in your browser at [http://localhost:3000](http://localhost:3000)

4. Upload the downloaded ZIP file (my_spotify_data.zip)
   - The file is processed in the browser and is not uploaded to any server
   - Once processing is complete, you'll be automatically redirected to the dashboard page

5. Analyze your data on the dashboard
   - Filter by date range
   - View your top artists and top tracks
   - Check your monthly and hourly listening patterns
   - See platform usage statistics

## License

MIT
