# BlogInno - Service Innovation Blog Platform

A modern blog platform focused on service innovation, design, and technology. Built with React, TypeScript, TailwindCSS, and Supabase.

## Features

- Modern and responsive UI design
- Admin dashboard for content management
- Article and category management
- Rich text editing
- Image and video uploads
- User authentication

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Supabase account (free tier works fine)

### Setting up Supabase

1. Create a new Supabase project from the [Supabase Dashboard](https://app.supabase.com/)

2. Run the following SQL in the Supabase SQL Editor to create the necessary tables:

```sql
-- Create articles table
CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  content text NOT NULL,
  date text NOT NULL,
  read_time text NOT NULL,
  image_url text NOT NULL,
  video_url text,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Create categories table
CREATE TABLE categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies for articles
CREATE POLICY "Anyone can read articles"
  ON articles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create articles"
  ON articles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own articles"
  ON articles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own articles"
  ON articles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for categories
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

3. Create storage buckets for media files:
   - Go to Storage in your Supabase dashboard
   - Create buckets named "images" and "videos"
   - Set the privacy settings to "Public"

4. Get your Supabase URL and anon key from the API settings in your Supabase dashboard

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/bloginno.git
cd bloginno
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Create a `.env` file in the root directory with your Supabase credentials
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Default Login Credentials

For this demo application, the login credentials are:
- Username: Inno
- Password: 2025

In a production environment, you would set up proper Supabase authentication.

## Deployment

You can deploy this application to any platform that supports Node.js, such as Vercel, Netlify, or Heroku.

Example for Vercel:
```bash
npm install -g vercel
vercel
```

## Technologies Used

- React - Frontend framework
- TypeScript - Type-safe JavaScript
- Tailwind CSS - Utility-first CSS framework
- Lucide Icons - Beautiful icon set
- React Router - Navigation and routing
- Supabase - Backend as a Service (BaaS)
- Vite - Fast development server and build tool

## Project Structure

```
src/
├── components/        # UI components
├── context/           # React context providers
├── lib/               # Utility libraries
├── pages/             # Page components
├── types/             # TypeScript interfaces
└── utils/             # Utility functions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
