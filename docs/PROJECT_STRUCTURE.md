# Project Structure

## Overview

This document describes the directory structure and organization of the Advanced Banking Fraud Prevention & Response System.

## Root Directory

```
Fraud-Detection-System/
├── .git/                   # Git repository
├── .gitignore              # Git ignore patterns
├── docker-compose.yml      # Docker Compose configuration
├── README.md               # Project overview and documentation
├── backend/                # Backend API service
├── frontend/               # Frontend React application
├── ml/                     # Machine Learning service
├── infra/                  # Infrastructure as Code
└── docs/                   # Additional documentation
```

## Backend Service (`/backend`)

```
backend/
├── src/                    # Source code
│   ├── auth/              # Authentication module
│   ├── accounts/          # Account management module
│   ├── transactions/      # Transaction module
│   ├── chat/              # GuardianBot chat module
│   ├── fraud/             # Fraud detection integration
│   ├── travel/            # Travel notice module
│   ├── audit/             # Audit logging module
│   ├── common/            # Shared utilities and decorators
│   ├── config/            # Configuration files
│   └── main.ts            # Application entry point
├── test/                   # Test files
├── .env.example            # Environment variables template
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── Dockerfile              # Docker configuration
├── jest.config.js          # Jest test configuration
├── nest-cli.json           # NestJS CLI configuration
├── package.json            # Node.js dependencies
└── tsconfig.json           # TypeScript configuration
```

### Backend Architecture

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Data access layer
- **Entities**: TypeORM database models
- **DTOs**: Data Transfer Objects for validation
- **Guards**: Authentication and authorization
- **Interceptors**: Request/response transformation
- **Middleware**: Rate limiting, logging

## Frontend Application (`/frontend`)

```
frontend/
├── src/                    # Source code
│   ├── components/        # React components
│   │   ├── common/       # Shared components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── chat/         # GuardianBot chat components
│   │   ├── transactions/ # Transaction components
│   │   └── account/      # Account management components
│   ├── pages/             # Page components
│   ├── services/          # API client services
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── styles/            # Global styles
│   ├── App.tsx            # Root component
│   └── main.tsx           # Application entry point
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── .eslintrc.cjs           # ESLint configuration
├── .prettierrc             # Prettier configuration
├── Dockerfile              # Docker configuration
├── index.html              # HTML template
├── package.json            # Node.js dependencies
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

### Frontend Architecture

- **Pages**: Top-level route components
- **Components**: Reusable UI components
- **Services**: API communication layer
- **Hooks**: Custom React hooks for state and effects
- **Utils**: Helper functions and formatters
- **Types**: TypeScript interfaces and types

## ML Service (`/ml`)

```
ml/
├── app/                    # Application code
│   ├── models/            # ML model implementations
│   │   ├── isolation_forest.py
│   │   ├── xgboost_model.py
│   │   └── lstm_model.py
│   ├── features/          # Feature engineering
│   │   ├── geo_distance.py
│   │   ├── behavioral.py
│   │   └── merchant_risk.py
│   ├── ensemble/          # Ensemble scoring
│   ├── explainability/    # SHAP explanations
│   ├── api/               # FastAPI endpoints
│   └── utils/             # Utility functions
├── tests/                  # Test files
├── models/                 # Trained model files
├── .env.example            # Environment variables template
├── Dockerfile              # Docker configuration
├── main.py                 # Application entry point
├── pytest.ini              # Pytest configuration
├── pyproject.toml          # Python project configuration
└── requirements.txt        # Python dependencies
```

### ML Service Architecture

- **Models**: Individual ML model implementations
- **Features**: Feature extraction and engineering
- **Ensemble**: Model combination logic
- **Explainability**: SHAP-based explanations
- **API**: FastAPI endpoints and request/response models

## Infrastructure (`/infra`)

```
infra/
├── terraform/              # Terraform configurations
│   ├── modules/           # Reusable Terraform modules
│   ├── environments/      # Environment-specific configs
│   └── main.tf            # Main Terraform configuration
├── kubernetes/             # Kubernetes manifests
│   ├── deployments/       # Deployment configurations
│   ├── services/          # Service configurations
│   ├── ingress/           # Ingress configurations
│   └── configmaps/        # ConfigMap definitions
└── scripts/                # Deployment and utility scripts
```

## Documentation (`/docs`)

```
docs/
├── SETUP.md                # Development setup guide
├── PROJECT_STRUCTURE.md    # This file
├── API.md                  # API documentation
├── ARCHITECTURE.md         # Architecture details
├── CONTRIBUTING.md         # Contribution guidelines
└── DEPLOYMENT.md           # Deployment guide
```

## Configuration Files

### Root Level

- **docker-compose.yml**: Orchestrates all services for local development
- **.gitignore**: Specifies files to ignore in version control
- **README.md**: Project overview and quick start guide

### Service Level

Each service has its own configuration files:

- **package.json** (Frontend/Backend): Node.js dependencies and scripts
- **requirements.txt** (ML): Python dependencies
- **tsconfig.json** (Frontend/Backend): TypeScript compiler options
- **.env.example**: Template for environment variables
- **Dockerfile**: Container build instructions

## Development Workflow

1. **Local Development**: Use Docker Compose for full stack
2. **Service Development**: Run individual services locally
3. **Testing**: Each service has its own test suite
4. **Building**: Docker builds for containerization
5. **Deployment**: Kubernetes manifests for production

## Best Practices

- Keep services independent and loosely coupled
- Use environment variables for configuration
- Follow the established directory structure
- Write tests alongside implementation
- Document API changes
- Use TypeScript/Python type annotations
- Follow ESLint/Prettier/Black formatting rules
