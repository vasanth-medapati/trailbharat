# Trail Bharat

## Project Documentation

### Features
- Comprehensive coverage of treks and trails.
- User-friendly interface to navigate through various trekking options.

### Sites Covered
- Detailed information about popular trekking locations across India, including:
  - Himalayas
  - Western Ghats
  - Eastern Ghats
  - Nilgiri Hills

### Trek Trails
- A list of various treks categorized by difficulty level:
  - Easy:
    - Trail 1
    - Trail 2
  - Moderate:
    - Trail 1
    - Trail 2
  - Difficult:
    - Trail 1
    - Trail 2

### Tech Stack
- Frontend: React, Redux
- Backend: Node.js, Express
- Database: MongoDB
- Hosting: GitHub Pages

### Local Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/vasanth-medapati/trailbharat.git
   cd trailbharat
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to `http://localhost:3000`.

### GitHub Pages Deployment Guide
1. Ensure your app is ready for production.
2. Build your app:
   ```bash
   npm run build
   ```
3. Deploy to GitHub Pages using the following command:
   ```bash
   npm run deploy
   ```

### File Structure
```
trailbharat/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   └── styles/
├── .gitignore
├── package.json
└── README.md
```

### Configuration Details
- Environment variables should be set in a `.env` file at the root of the project.
- Use `dotenv` package to access these variables in your code.

---

## Conclusion
This project aims to provide trekkers with all the necessary information and tools to plan their trekking adventures. Enjoy your trek!