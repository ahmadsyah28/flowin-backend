# FLOWIN Backend - TypeScript Setup 🚀

Backend GraphQL server untuk aplikasi FLOWIN yang telah dimigrate ke TypeScript.

## 🎯 Features

- **TypeScript** dengan type safety penuh
- **GraphQL** dengan Apollo Server
- **MongoDB** dengan Mongoose ODM
- **Redis** dengan Upstash (Serverless Redis)
- **JWT Authentication** (ready to implement)
- **Environment Configuration** dengan type validation
- **Path Aliases** untuk import yang clean

## 📁 Project Structure

```
src/
├── config/          # Database & Redis configuration
│   ├── database.ts
│   └── redis.ts
├── graphql/         # GraphQL schema & resolvers
│   ├── index.ts
│   ├── resolvers/
│   │   └── index.ts
│   └── typeDefs/
│       └── index.ts
├── types/           # TypeScript type definitions
│   ├── env.ts
│   ├── graphql.ts
│   └── index.ts
├── utils/           # Utility functions
│   └── index.ts
└── index.ts         # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm atau yarn
- MongoDB Atlas account
- Upstash Redis account

### Installation & Development

```bash
# Install dependencies
npm install

# Development (dengan auto-reload)
npm run dev

# Development dengan nodemon
npm run dev:watch

# Production build
npm run build

# Start production server
npm start

# Type checking only
npm run type-check

# Clean build files
npm run clean
```

## 🔧 Environment Variables

Buat file `.env` di root directory:

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

## 🎨 TypeScript Features

### Path Aliases

```typescript
// Instead of relative imports
import { User } from "../../../types/graphql";

// Use clean aliases
import { User } from "@/types";
import { connectDB } from "@config/database";
```

### Type Safety

```typescript
// GraphQL context with proper typing
interface GraphQLContext {
  req: Request;
  user?: User;
  token?: string;
}

// Environment variables with validation
interface EnvironmentVariables {
  MONGODB_URI: string;
  PORT: string;
  NODE_ENV: "development" | "production" | "test";
}
```

## 🧪 API Testing

### GraphQL Playground

Buka [http://localhost:4000](http://localhost:4000) untuk GraphQL playground.

### Sample Queries

```graphql
# Health check
query {
  hello
  dbStatus
}

# Get current user (membutuhkan authentication)
query {
  me {
    id
    name
    email
  }
}
```

## 📦 Scripts Detail

| Script               | Description                       |
| -------------------- | --------------------------------- |
| `npm run dev`        | Development server dengan ts-node |
| `npm run dev:watch`  | Development dengan auto-reload    |
| `npm run build`      | Compile TypeScript ke JavaScript  |
| `npm start`          | Run production build              |
| `npm run type-check` | Type checking tanpa emit files    |
| `npm run clean`      | Hapus folder dist/                |

## 🔄 Migration Notes

Project ini telah dimigrate dari JavaScript ke TypeScript dengan:

1. ✅ **Type Definitions** - Custom types untuk User, GraphQL context, environment
2. ✅ **Config Files** - Database & Redis dengan proper typing
3. ✅ **GraphQL Schema** - TypeDefs dan Resolvers dengan type safety
4. ✅ **Path Aliases** - Clean imports dengan @ prefixes
5. ✅ **Environment Validation** - Type-safe environment variables
6. ✅ **Error Handling** - Proper error types dan handling

## 🚧 TODO Implementation

Masih perlu diimplementasikan:

- [ ] User authentication & JWT verification
- [ ] Database models dengan Mongoose schemas
- [ ] Registration & login mutations
- [ ] Password hashing dengan bcrypt
- [ ] Input validation & sanitization
- [ ] Rate limiting & security middleware
- [ ] Unit tests dengan Jest

## 🛠️ Development Tips

1. **Type Checking**: Selalu jalankan `npm run type-check` sebelum commit
2. **Path Aliases**: Gunakan `@/` untuk import dari src/
3. **Environment**: Semua env variables sudah typed di `src/types/env.ts`
4. **Error Handling**: Gunakan proper Error instances, bukan string
5. **GraphQL**: Context sudah typed untuk authentication flow

---

Happy coding! 🎉
