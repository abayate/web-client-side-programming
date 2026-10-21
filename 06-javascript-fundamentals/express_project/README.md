# 🖤 Voldemort Website - Express.js Application

A dark and immersive website built with Express.js dedicated to Lord Voldemort from the Harry Potter universe.

## Project Structure

```
express_project/
├── public/
│   ├── css/
│   │   └── styles.css          # Dark, themed styling
│   └── js/
│       └── scripts.js           # Client-side interactivity
├── views/
│   ├── index.html              # Home page
│   ├── about.html              # About Voldemort
│   ├── history.html            # Historical timeline
│   ├── achievements.html       # Notable achievements
│   └── 404.html                # 404 error page
├── index.js                    # Main Express server
├── package.json                # Project dependencies
└── README.md                   # This file
```

## Features

✨ **Multiple Pages:**
- Home page with introduction and facts loader
- About page with biographical information
- History page with timeline of events
- Achievements page showcasing Voldemort's deeds
- 404 error page

🎨 **Styling:**
- Dark, gothic theme
- Responsive design (works on mobile, tablet, desktop)
- Smooth animations and transitions
- Custom scrollbar styling

🔧 **Functionality:**
- Fetch API integration to load facts dynamically
- Client-side JavaScript for interactivity
- Keyboard shortcuts (H, A, T, E)
- Click tracking and analytics
- Smooth page transitions

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Step 1: Install Dependencies
```bash
npm install
```

This will install:
- **express**: Web framework for Node.js
- **nodemon** (dev): Auto-restart server on file changes

### Step 2: Run the Server
```bash
npm start
```

Or with nodemon for development:
```bash
npm run dev
```

### Step 3: Access the Website
Open your browser and navigate to:
```
http://localhost:3000
```

## Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Home page |
| `/about` | GET | About Voldemort |
| `/history` | GET | Historical timeline |
| `/achievements` | GET | Notable achievements |
| `/api/facts` | GET | API endpoint - returns Voldemort facts (JSON) |
| `*` (catch-all) | GET | 404 error page |

## API Endpoints

### Get Voldemort Facts
**Endpoint:** `GET /api/facts`

**Response:**
```json
{
  "facts": [
    "Lord Voldemort was born as Tom Marvolo Riddle",
    "He created seven Horcruxes to achieve immortality",
    "..."
  ],
  "count": 5
}
```

## File Descriptions

### Backend Files

#### `index.js` - Main Server File
- Sets up Express server
- Defines all routes
- Serves static files (CSS, JS, images)
- Handles 404 errors
- Includes API endpoint for facts

### Frontend Files

#### `views/index.html` - Home Page
- Welcome message
- Introduction to Voldemort
- Image display
- Button to load facts dynamically
- Key events list

#### `views/about.html` - About Page
- Early life information
- Hogwarts years
- Quest for immortality
- Philosophy and beliefs

#### `views/history.html` - History Page
- Timeline of events from birth to downfall
- Key relationships
- Major historical events (1926-1998)

#### `views/achievements.html` - Achievements Page
- Grid layout showcasing 9 major achievements
- Descriptions of accomplishments
- Legacy and impact section

#### `public/css/styles.css` - Styling
- Dark gothic theme
- Responsive grid layouts
- Hover animations
- Custom scrollbar
- Mobile-friendly design

#### `public/js/scripts.js` - Client-side JavaScript
- Page highlighting in navigation
- Smooth scrolling
- Fetch API for facts loading
- Keyboard shortcuts (H, A, T, E)
- Click tracking
- Console logging and welcome message

## Features in Detail

### 1. Dynamic Facts Loading
Click the "Load Voldemort Facts" button on the home page to fetch facts from the server API.

### 2. Responsive Design
The website works perfectly on:
- Desktop (1920x1080)
- Tablet (768px width)
- Mobile (320px width)

### 3. Keyboard Shortcuts
- **H** - Go to Home
- **A** - Go to About
- **T** - Go to History
- **E** - Go to Achievements

### 4. Dark Theme
- Dark background (#1a1a1a)
- Gold accents (#d4af37)
- Dark red highlights (#8b0000)
- Professional and immersive

## Technologies Used

**Backend:**
- Node.js
- Express.js

**Frontend:**
- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API

## Learning Outcomes

This project demonstrates:
✅ Express.js server setup
✅ Routing and URL handling
✅ Static file serving
✅ API endpoint creation
✅ Frontend-backend communication
✅ Responsive web design
✅ Client-side JavaScript interactivity
✅ Error handling (404 pages)
✅ Project structure best practices

## Future Enhancements

Possible improvements:
- Database integration (MongoDB/SQLite)
- User authentication
- Comments section
- Blog posts about Voldemort
- Image gallery
- Search functionality
- Admin panel
- Email newsletter subscription

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, you can change it:
```javascript
const PORT = process.env.PORT || 3001; // Change 3000 to 3001
```

### Module Not Found
If you get a "Cannot find module" error:
```bash
npm install
```

### Page Not Loading
Make sure the `views/` and `public/` folders exist with the correct file structure.

## License

This project is open source and available under the ISC License.

## Author

Created as an educational project for learning Express.js and web development.

---

**Happy coding! 🖤**
