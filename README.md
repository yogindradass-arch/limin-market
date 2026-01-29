# Limin Market 🛍️

**"Where Guyana Limes & Trades"**

A modern classifieds marketplace built for Guyana - combining the simplicity of Craigslist with the reach of Alibaba.

![Limin Market](https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200)

## 🌟 Features

- **Browse Listings** - Hot deals, budget items, and free giveaways
- **Direct Contact** - Click-to-call sellers with phone integration
- **Smart Search** - Filter by category, location, and price
- **Post Listings** - Easy form to sell items (wholesale, local pickup, or standard)
- **User Accounts** - Sign up to manage your listings
- **Mobile First** - Designed for phones, works great on desktop too
- **Favorites** - Save items you're interested in

## 🎨 Design

Built with Limin Market brand colors:
- **Primary**: #FF6B35 (Coral Orange)
- **Secondary**: #00B48D (Caribbean Green)
- **Accent**: #FFC72C (Golden Yellow)
- **Dark**: #2D2D2D (Text)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Visit http://localhost:5174/

## 📦 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Build Tool**: Vite (Rolldown)
- **Hosting**: Vercel (recommended)

## 🗂️ Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx
│   ├── ProductCard.tsx
│   ├── ProductDetailModal.tsx
│   ├── PostListingForm.tsx
│   ├── SearchModal.tsx
│   ├── AuthModal.tsx
│   └── ...
├── context/            # React context providers
│   └── AuthContext.tsx
├── lib/                # Utility functions
│   └── supabase.ts
├── types/              # TypeScript types
│   └── product.ts
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## 📝 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

See `SUPABASE_SETUP.md` for detailed setup instructions.

### Database Schema

Run `supabase-schema.sql` in your Supabase SQL Editor to create:
- Products table
- Favorites table
- User profiles table
- Row-level security policies

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for posting listings
- Phone numbers visible (for direct contact)
- No messaging system (direct calls only)

## 📱 Mobile Features

- Click-to-call phone numbers
- Touch-friendly UI
- Bottom navigation bar
- Floating action button
- Optimized images

## 🎯 Product Categories

- Electronics
- Fashion
- Home & Garden
- Sports & Outdoors
- Vehicles
- Books
- Furniture
- Tools & Equipment
- Toys & Games
- Other

## 📍 Supported Locations

- Georgetown
- New Amsterdam
- Linden
- Anna Regina
- Bartica
- Skeldon
- Rose Hall
- Mahaica
- Other

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

See `DEPLOYMENT.md` for roadmap and future enhancements.

## 🚢 Deployment

### Quick Deploy to Vercel

1. Push code to GitHub
2. Import project on Vercel
3. Add environment variables
4. Deploy!

See `DEPLOYMENT.md` for complete deployment guide.

## 📄 License

MIT License - feel free to use for your own projects!

## 🤝 Contributing

This is a private project, but ideas and feedback are welcome!

## 📞 Contact

For questions about Limin Market:
- Domain: liminmarket.com (coming soon)
- Built for: Guyana 🇬🇾

---

**Built with ❤️ for the Guyanese community**
