# DopeTech Nepal - E-commerce Platform

A modern, high-performance e-commerce platform built with Next.js 15, React 19, and Supabase.

## 🚀 Features

- **Modern UI/UX**: Built with Tailwind CSS and Radix UI components
- **Real-time Updates**: Live product updates with Supabase subscriptions
- **Admin Panel**: Secure product management interface
- **Image Management**: Dynamic hero carousel and product image handling
- **Responsive Design**: Mobile-first approach with optimized performance
- **SEO Optimized**: Built-in SEO features and structured data
- **Performance**: Optimized bundle size and loading times

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel/Netlify ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dopetechnpsupa-jpg/8292025dope.git
   cd dopetechenhanced-master
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3005](http://localhost:3005) to view the application.

## 🏗️ Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 📁 Project Structure

```
dopetechenhanced-master/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel
│   ├── dopetechadmin/     # DopeTech admin interface
│   ├── product/[id]/      # Product detail pages
│   └── api/               # API routes
├── components/            # Reusable UI components
│   └── ui/               # Radix UI components
├── lib/                  # Utility functions and configurations
├── hooks/                # Custom React hooks
├── contexts/             # React contexts
├── public/               # Static assets
└── vercel-deployment/    # Vercel-specific deployment config
```

## 🔧 Configuration

### Next.js Config
- Optimized for production performance
- Image optimization enabled
- Bundle analysis support
- TypeScript and ESLint integration

### Supabase Setup
- Real-time subscriptions for live updates
- Row Level Security (RLS) policies
- Storage buckets for image management
- Email service integration

## 🚀 Deployment

### Vercel
The project includes a `vercel-deployment/` directory with Vercel-specific configurations.

### Netlify
Use the `netlify.toml` configuration file for Netlify deployment.

## 📊 Performance

- **First Load JS**: ~356 kB
- **Bundle Size**: Optimized with code splitting
- **Image Optimization**: WebP/AVIF support
- **Caching**: Aggressive caching strategies

## 🔒 Security

- Environment variable protection
- Supabase RLS policies
- Admin authentication
- Secure API routes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for DopeTech Nepal** 