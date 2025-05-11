# ChronoSpace

> Streamline Projects, Budgets & Approvals in One Place

ChronoSpace is a comprehensive system for managing budgets, projects, and purchase requests built with Next.js 14, Prisma, and Tailwind CSS.

[View Full Changelog](#updates--features)

## ✨ Key Features

### 🔐 User Management & Access Control
- Complete user lifecycle management
- Role-based access control (RBAC)
- Digital certificate management
- Password management
- Activity history/audit log

### 📊 Project Planning
- Project creation and management
- Work division/breakdown
- Timeline management
- Status tracking

### 💰 Budget Management
- Budget planning and tracking
- Budget items management
- Approval system
- Vendor management

### 📝 Purchase Request System
- PR creation and workflow
- Multi-step approval process
- Item management
- Status tracking

### 📄 Document Management
- Document upload and storage
- PDF viewer
- Digital signatures
- QR code generation
- Document verification
- Document history
- Version control
- Access control

## 🛠️ Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** MySQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **Icons:** Lucide Icons, Tabler Icons

## 🚀 Getting Started

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

## 📁 Project Structure

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

## ⚙️ Environment Variables

```env
DATABASE_URL="mysql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Next.js GitHub repository](https://github.com/vercel/next.js)

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📋 Updates & Features

### Initial Release (2025-01-24)
- Core System Setup:
  - Next.js 14 project initialization with TypeScript
  - Authentication system with NextAuth.js
  - Basic layout components (Header, Sidebar)
  - Register and login pages
  - Protected routes implementation

### Authentication & User Management (2025-02-09)
- Enhanced Authentication:
  - Session management
  - Role-based access control (RBAC)
  - Protected route middleware
  - User profile and avatar system
- Workspace Management:
  - Basic workspace layout
  - Vendor management
  - Division management
  - Role management
- UI Improvements:
  - Collapsible sidebar
  - Responsive header
  - Montserrat font integration
  - Theme color system

### Project & Budget Planning (2025-03-01)
- User Access Control:
  - UAC page implementation
  - Access control management
  - Activity logging
  - User session enhancements
- Project Management:
  - Project CRUD operations
  - Work division integration
  - Project status tracking
  - Budget allocation system
- Budget Planning:
  - Budget creation and management
  - Vendor integration
  - Item management
  - Budget status tracking
- Purchase Request System:
  - Basic PR creation
  - Multi-step approval workflow
  - Request tracking
  - Budget integration

### Workflow & Approval System (2025-03-15)
- Enhanced Purchase Request:
  - Approval workflow implementation
  - Request history tracking
  - Status indicators
  - Decline functionality
- Approval Schema:
  - Multi-level approval system
  - Role-based approvers
  - Dynamic step configuration
  - Budget limit validation
- Data Validation:
  - Type safety improvements
  - Error handling enhancements
  - Transaction client usage
  - API route consistency

### Document Management & Security (2025-04-05)
- Document System:
  - Document upload functionality
  - PDF viewer implementation
  - Digital signature integration
  - Document version control
- Security Enhancements:
  - Digital certificate management
  - Password change functionality
  - Activity history logging
  - Access control refinements
- Performance Improvements:
  - Loading state optimizations
  - Error handling refinements
  - UI/UX enhancements
  - Data fetching optimizations

### Document Verification & Stability (2025-04-06)
- Document Verification:
  - QR code generation for signed documents
  - Unique verification code system
  - Document verification page
  - Signature validation system
- PDF Viewer Enhancements:
  - Improved signature pad initialization
  - Reduced flickering during reloads
  - Better error handling for PDF loading
  - Automatic retry mechanism
- Digital Signature Updates:
  - Enhanced signature positioning
  - Improved QR code readability
  - Better signature validation
  - Cleaner verification URLs

### Dashboard & Session Validation (2025-04-11)
- Dashboard View
  - Implemented toggle between dashboard and list view
  - Added search functionality to switch between specific documents
  - Added pagination
- Session Validation
  - Added session validation to prevent unauthenticated access to protected routes

### Purchase Order & Dashboard (2025-04-13)
- Purchase Order
  - Added purchase order creation
  - Added purchase order document generation
  - Added purchase order history
- Dashboard
  - Added dashboard switch between purchase order and request
  - Updated status management for purchase order and request

### Document Management & UI Enhancements (2025-04-17)
- Document Management
  - Enhanced document upload functionality
  - Improved document version control
  - Added document history tracking
  - Implemented document deletion with validation
- UI Improvements
  - Enhanced document viewer interface
  - Improved loading states
  - Better error handling
  - Optimized performance for large documents
- Security
  - Added document access validation
  - Enhanced user permission checks
  - Improved audit logging for document operations

### Purchase Order & Document Integration (2025-04-25)
- Purchase Order Enhancements
  - Improved purchase order document generation
  - Enhanced purchase order history tracking
  - Added purchase order status management
  - Implemented purchase order validation
- Document Integration
  - Added purchase order document attachment
  - Enhanced document preview for purchase orders
  - Improved document versioning for purchase orders
  - Added document access control for purchase orders
- UI/UX Improvements
  - Enhanced purchase order interface
  - Improved document viewer integration
  - Better status indicators
  - Optimized loading states

### Document Verification & Security (2025-05-03)
- Filtering & Searching
  - Added filtering options and searching for Users, Approval Schemas, Projects & Budget Plannings
  - Added searching for Vendors, Roles, Work Divisions
  - Filtering options are by Work Division, Roles & Status
- Update Activity Log

### Profile Picture Upload (2025-05-09)
- Timeline
  - Added timeline post
  - Added timeline management
- Profile
  - Added profile picture update
  - Filter profile picture update from activity
