# GreyCells Tech Consulting Website

A modern IT consulting company website with contact form and admin panel for managing submissions.

## Features

- Modern, responsive design
- Contact form with SQLite database storage
- Admin panel to view and manage submissions
- Services and products showcase
- Testimonials slider

## Quick Start (Local)

```bash
cd techventure-website
pip install -r requirements.txt
python app.py
```

Visit http://localhost:8080

## Deployment to GitHub

### 1. Create a new GitHub repository
1. Go to https://github.com/new
2. Repository name: `greycells-tech-consulting`
3. Make it Public or Private
4. Click "Create repository"

### 2. Push your code

```bash
cd techventure-website
git init
git add .
git commit -m "Initial commit - GreyCells Tech Consulting website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/greycells-tech-consulting.git
git push -u origin main
```

## Deployment to Render.com (Free)

1. **Push to GitHub** first (steps above)

2. **Create a Web Service on Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `greycells-tech`
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `gunicorn app:app`
     - Plan: Free

3. **Environment Variables:**
   - No additional vars needed (SQLite works out of box)

4. **Deploy:**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Your site will be live at `https://greycells-tech.onrender.com`

## Deployment to Railway

1. **Push to GitHub** first

2. **Deploy on Railway:**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway auto-detects Python/Flask
   - Click "Deploy"

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact form |
| GET | `/api/contacts` | Get all submissions |
| DELETE | `/api/contacts/<id>` | Delete a submission |

## Project Structure

```
techventure-website/
├── app.py              # Flask backend
├── requirements.txt    # Python dependencies
├── Procfile           # Deployment config
├── .gitignore         # Git ignore rules
├── index.html         # Main HTML
├── script.js          # Frontend JavaScript
└── styles.css         # Styles
```

## Technologies

- **Backend:** Flask, SQLite
- **Frontend:** HTML5, CSS3, JavaScript
- **Deployment:** Render.com / Railway / GitHub Pages (static only)

## License

MIT
