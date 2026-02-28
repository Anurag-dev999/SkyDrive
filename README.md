# SkyDrive - Cloud Storage

SkyDrive is a high-performance, visually stunning cloud storage application built with Next.js and Supabase.

## Features

- **Secure Authentication**: Powered by Supabase Auth (Email/Password).
- **File Management**: Upload, rename, trash, and permanently delete files.
- **Categorization**: Filter files by Images, Documents, Videos, and more.
- **Real-Time Storage Tracking**: Visual indicators for storage usage.
- **Sharing**: One-click public sharing for any file.
- **Responsive Design**: Fully optimized for mobile and desktop with dark mode support.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI & Lucide Icons
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **State Management**: React Context API

## Getting Started

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Supabase Setup**:
   - **Create Project**: Go to [supabase.com](https://supabase.com), create a new project, and wait for it to provision.
   - **Database Setup**: Open the `SQL Editor` in Supabase, create a `New query`, paste the contents of [supabase_setup.sql](./supabase_setup.sql), and click **Run**.
   - **Authentication**: In `Authentication` -> `Providers`, ensure `Email` is enabled. You may want to disable "Confirm email" for faster testing.
   - **Storage**: In `Storage`, create a new bucket named `files`. Ensure it is set to **Private**. RLS policies (applied in the SQL step) will manage secure access.

3. **Environment Variables**:
   Create a `.env.local` file in the root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   > **Important:** After adding the variables, restart your dev server so Next.js picks them up.
   
   ### CORS / Network Setup
   Supabase requires you to whitelist the origins that will talk to the API. Open the Supabase dashboard, go to **Settings → API → Allowed request origins** and add:
   - `http://localhost:3000` (or whatever `DEV` URL you're using)
   - `http://127.0.0.1:3000`
   - `https://your-deployed-domain.com` (when you deploy)
   
   Failing to add origin entries will result in the browser throwing a generic `TypeError: Failed to fetch` during signup/login. Also make sure your machine has internet access; a completely offline environment will produce the same error.

4. **Run Locally**:

   npm run dev


## License

MIT

---

**Developed with ❤️ by [Anurag](https://github.com/Anurag-dev999)**
