# ChronoSpace

Streamline Projects, Budgets & Approvals in One Place.
ChronoSpace is a comprehensive system for managing budgets, projects, and purchase requests built with Next.js 14, Prisma, and Tailwind CSS.

## Features

- **User Management**
  - Role-based access control
  - User authentication with NextAuth
  - Profile management

- **Project Planning**
  - Create and manage projects
  - Track project status and deadlines
  - Division-based project organization
  - Project timeline visualization

- **Budget Management**
  - Budget planning and allocation
  - Detailed budget items tracking
  - Budget approval workflow
  - Financial reporting

- **Purchase Request**
  - Create purchase requests from budgets
  - Multi-item purchase requests
  - Vendor management
  - Request status tracking

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide Icons

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/budget-management.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

6. Seed the database (optional):
```bash
npm run seed
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/
│   ├── (auth)/        # Authentication pages
│   ├── (protected)/   # Protected routes
│   ├── api/          # API routes
│   └── components/   # Shared components
├── lib/             # Utility functions
├── prisma/         # Database schema and migrations
└── public/         # Static files
```

## Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
