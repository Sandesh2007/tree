# Tree Org - Visual Data Relationship Manager

A modern Next.js application for creating, visualizing, and managing complex data relationships with an intuitive tree-based interface. Perfect for organizational structures, data modeling, and network analysis.

![Tree Org](https://img.shields.io/badge/Next.js-16.1.3-black)
![React](https://img.shields.io/badge/React-19.2.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

- **Visual Tree Builder** - Drag and drop interface to create complex hierarchical structures
<!--- ⚡ **Real-time Collaboration** - Work together with your team seamlessly-->
<!--- **Team Management** - Organize teams, assign roles, and manage permissions-->
<!--- **Version Control** - Track changes and maintain complete history-->

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- Neo4j Database (for data persistence)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sandesh2007/tree/
cd tree
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following:
```env
NEO4J_URI=your_neo4j_uri
NEO4J_USERNAME=your_username
NEO4J_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

4. Run the development server:
```bash
npm run dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
tree/
├── app/
│   ├── (auth)/          // authentication pages
│   ├── (dashboard)/     // dashboard pages
│   ├── api/             // API routes
│   ├── hooks/           // custom hooks
│   ├── utils/           // util functions
│   ├── page.tsx         // homepage
│   ├── layout.tsx       // root layout
│   └── globals.css      // global css style
├── components/
│   ├── ui/              // UI components (Button, Card, Input, etc.)
│   ├── custom/          // custom components
│   ├── dialogs/         // dialog components
│   ├── form/            // form components
│   └── panel/           // panel components
├── lib/                 // library utilities
├── types/               // type definitions
└── public/              // assets
```


## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Lucide](https://lucide.dev/) - Beautiful icon library

---

Built with ❤️ using Next.js and React
