# Project Guidelines

## Git Commits

When making commits:
- Do NOT include "Co-Authored-By" lines in commit messages
- Before committing, always run compile and tests first

## Backend

- All schemas should use UUID for primary keys when creating new models

## Agents

When to invoke each specialized agent:

### Frontend (React)
- Creating new React components
- Implementing UI features
- Working with forms, state management (Zustand), or UI libraries (shadcn/ui)

### Backend (Phoenix)
- Creating new API endpoints
- Implementing business logic in Elixir/Phoenix
- Working with authentication (JWT, Joken) or API responses

### Security Engineer
- Before implementing auth flows
- When handling sensitive data or credentials
- During code review of security-critical features
- When designing new API endpoints exposed publicly

### Data / Persistence
- Designing new schemas or modifying existing ones
- Creating migrations
- Optimizing queries or adding indexes
- When making decisions about data relationships

### QA / Test Strategy
- Before implementing a new feature (to define test plan)
- After completing a feature (to validate coverage)
- When setting up CI/CD pipelines
- When identifying critical paths to test

## Agent Invocation Order

Recommended order for common workflows:

### New Feature (Full Stack)
1. **Data/Persistence** → Design schemas and migrations
2. **Security** → Review data model for security concerns
3. **Backend** → Implement API endpoints
4. **Security** → Review API implementation
5. **Frontend** → Build UI components
6. **QA** → Define and validate test coverage

### New API Endpoint
1. **Data/Persistence** → Schema changes if needed
2. **Backend** → Implement endpoint
3. **Security** → Review before merge

### New UI Feature (Frontend Only)
1. **Frontend** → Implement components
2. **QA** → Validate test coverage

### Schema Changes
1. **Data/Persistence** → Design migration
2. **Security** → Review data exposure
3. **Backend** → Update affected endpoints
