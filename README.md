# 🥾 TrailBharat - Explore All of India

**A beautiful, fast, offline-first app to explore 50+ iconic destinations across all of India.**

🎯 **This is a GitHub Pages version** - No backend server needed. Just upload and deploy!

---

## 📁 What You Have

Three simple files ready to deploy:

1. **`index.html`** (31KB) - Complete app with maps and all features
2. **`data.json`** (45KB) - 50+ destinations, 8 treks, 15 hotels
3. **`sw.js`** (3KB) - Service Worker for offline support

**Total: 79 KB - Lightning fast!**

---

## 🚀 Deploy to GitHub in 5 Minutes

### Step 1: Create Repository
- Go to [github.com/new](https://github.com/new)
- Name: `trailbharat`
- Make it **Public**
- Click **Create**

### Step 2: Upload Files
- Click **Add files → Upload files**
- Select: `index.html`, `data.json`, `sw.js`
- Click **Commit changes**

### Step 3: Enable GitHub Pages
- Go to **Settings → Pages**
- Source: `main` branch, `/root`
- Click **Save**

### Step 4: Your Live Link
```
https://YOUR_USERNAME.github.io/trailbharat
```

**Done!** Share this link with anyone.

---

## 🗺️ 50+ Indian Destinations

### North (18 locations)
Taj Mahal, Golden Temple, Himalayas, Leh-Ladakh, Rishikesh, Kedarnath, Manali, Shimla, Dal Lake, and more...

### South (12 locations)
Kerala Backwaters, Meenakshi Temple, Hampi, Munnar, Ooty, Kanyakumari, Coorg, Mahabalipuram, and more...

### West (8 locations)
Goa Beaches, Jaipur, Jodhpur Fort, Udaipur, Gateway of India, Ajanta Caves, and more...

### East (6 locations)
Darjeeling, Konark Temple, Kolkata, Gangtok, and more...

### Central & Islands (6 locations)
Khajuraho, Orchha, Panchmarhi, Andaman Islands, and more...

---

## ✨ Key Features

🔍 **Search** - Find destinations by name/location  
🗺️ **Map** - Interactive Leaflet map with markers  
🏷️ **Filters** - Filter by region or difficulty  
📱 **Mobile** - Fully responsive, installable PWA  
🌐 **Offline** - Works without internet  
⚡ **Fast** - Loads in <2 seconds  
🎨 **Beautiful** - Modern dark UI with animations  

---

## 🎯 What's Inside

### 8 Adventure Treks
- Everest Base Camp
- Kedarnath Trek  
- Markha Valley
- And more...

### 15 Hotels
- Luxury 5-star
- Budget friendly
- Beach resorts
- Hill stations

### All Features
✅ Real GPS coordinates  
✅ Opening hours & entry fees  
✅ Phone numbers & websites  
✅ Ratings & reviews  
✅ Photos & descriptions  

---

## 📱 Mobile Access

After deploying:

### iOS
1. Open in Safari
2. Share → "Add to Home Screen"
3. Opens as full-screen app

### Android
1. Open in Chrome
2. Menu (⋮) → "Install app"
3. Opens as full-screen app

**Both work offline!**

---

## 🔧 Customize

### Add New Destination
Edit `data.json` and add to `sites` array:

```json
{
  "id": 51,
  "name": "Your Location",
  "emoji": "🏔️",
  "description": "Description here",
  "location": "City, State",
  "region": "North",
  "latitude": 23.5,
  "longitude": 72.5,
  "rating": 4.5,
  "review_count": 100
}
```

Push to GitHub - automatically updates!

### Change Colors
Edit CSS in `index.html`:
```css
--g: #4ade80;  /* Main color */
--bg: #09100a; /* Background */
```

---

## 🌟 Why This Setup?

✅ **No Backend** - Pure static, works on GitHub Pages  
✅ **Completely Free** - Hosting costs $0  
✅ **Fast** - Only 79 KB total  
✅ **Offline** - Works without internet  
✅ **Easy** - Just 3 files to upload  
✅ **Shareable** - GitHub Pages link  
✅ **Customizable** - Edit JSON to add locations  

---

## 📊 Stats

| Metric | Value |
|--------|-------|
| Destinations | 50+ |
| Treks | 8 |
| Hotels | 15 |
| File Size | 79 KB |
| Load Time | <2 seconds |
| Offline Support | ✅ Full |
| Mobile Ready | ✅ PWA |
| Hosting Cost | FREE |

---

## 🎉 You're All Set!

Everything you need is in this folder:

```
outputs/
├── index.html      ← Main app
├── data.json       ← All locations
├── sw.js           ← Offline support
├── README.md       ← This file
└── GITHUB_DEPLOY.md ← Detailed guide
```

Just upload these 3 files to GitHub and you're done! 🚀

---

## 🔗 Deploy Now

1. [Create GitHub Repo](https://github.com/new)
2. Upload 3 files
3. Enable Pages
4. Visit your link
5. Share with everyone!

**Free hosting. Zero cost. Forever.** 💚
