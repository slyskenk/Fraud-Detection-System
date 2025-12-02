# Design Document

## Overview

The Advanced Banking Fraud Prevention & Response System is an enterprise-grade, microservices-based platform that combines real-time transaction monitoring, machine learning fraud detection, and conversational AI to protect banking customers from fraudulent activities. The system is architected using Clean Architecture principles with clear separation between presentation, business logic, and data layers.

The platform consists of three primary services:
1. **Frontend Application** - React/TypeScript SPA providing customer and analyst interfaces
2. **Backend API Gateway** - NestJS service handling authentication, business logic, and orchestration
3. **ML Fraud Detection Service** - Python/FastAPI microservice providing real-time fraud scoring

All services communicate via REST APIs and event streams, with PostgreSQL as the primary data store, Redis for caching and rate limiting, and optional message queues (Kafka/RabbitMQ) for event-driven workflows.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Dashboard   │  │ GuardianBot  │  │   Account    │         │
│  │  Component   │  │     Chat     │  │  Management  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                │
│                            │                                    │
│                     React Query State                           │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTPS/REST
┌────────────────────────────┼────────────────────────────────────┐
│                    Backend API Gateway                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Controllers Layer                            │  │
│  │  Auth │ Accounts │ Transactions │ Chat │ Travel          │  │
│  └────┬──────────┬──────────┬───────┬──────┬─────────────────┘  │
│       │          │          │       │      │                    │
│  ┌────┴──────────┴──────────┴───────┴──────┴─────────────────┐  │
│  │              Services Layer                                │  │
│  │  AuthService │ AccountService │ TransactionService │       │  │
│  │  ChatService │ FraudService │ TravelService                │  │
│  └────┬──────────┬──────────┬───────┬──────┬─────────────────┘  │
│       │          │          │       │      │                    │
│  ┌────┴──────────┴──────────┴───────┴──────┴─────────────────┐  │
│  │            Repositories Layer                              │  │
│  │  UserRepo │ AccountRepo │ TransactionRepo │ AuditRepo      │  │
│  └────┬──────────┬──────────┬───────┬──────┬─────────────────┘  │
│       │          │          │       │      │                    │
└───────┼──────────┼──────────┼───────┼──────┼────────────────────┘
        │          │          │       │      │
        │          │          │       │      └──────┐
        │          │          │       │             │
┌───────┴──────────┴──────────┴───────┴─────────────┼─────────────┐
│                  Data Layer                        │             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┴──────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │   Gemini AI API      │  │
│  │   (Primary)  │  │ (Cache/Rate) │  │  (GuardianBot)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
        │
        │ HTTP/REST
        │
┌───────┴─────────────────────────────────────────────────────────┐
│              ML Fraud Detection Service                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  FastAPI Endpoints                        │  │
│  │                    /score                                 │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│  ┌────────────────────┴─────────────────────────────────────┐  │
│  │              Feature Engineering                          │  │
│  │  Geo-distance │ Behavioral │ Merchant Risk │ Amount      │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│  ┌────────────────────┴─────────────────────────────────────┐  │
│  │              Model Ensemble                               │  │
│  │  Isolation Forest │ XGBoost │ LSTM Behavioral            │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│  ┌────────────────────┴─────────────────────────────────────┐  │
│  │              SHAP Explainer                               │  │
│  │         Feature Importance & Weights                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Query for state management and API caching
- React Router for navigation
- Axios for HTTP requests
- Chart.js for data visualization

**Backend:**
- Node.js 20+ with TypeScript
- NestJS framework
- TypeORM for database access
- Passport.js with JWT strategy
- Redis client (ioredis)
- Class-validator for input validation
- Winston for logging

**ML Service:**
- Python 3.11+
- FastAPI framework
- Scikit-learn (Isolation Forest)
- XGBoost
- TensorFlow/Keras (LSTM)
- SHAP for explainability
- Pandas/NumPy for data processing
- Pydantic for validation

**Data Layer:**
- PostgreSQL 15+ (primary database)
- Redis 7+ (caching, rate limiting, sessions)
- Optional: Kafka or RabbitMQ for event streaming

**Infrastructure:**
- Docker & Docker Compose
- Kubernetes (deployment manifests)
- Terraform (infrastructure as code)
- Nginx (reverse proxy)

## Components and Interfaces

### Frontend Components

#### 1. Dashboard Component
**Responsibility:** Display account overview, recent transactions, and risk metrics

**Props Interface:**
```typescript
interface DashboardProps {
  accountId: string;
}

interface DashboardState {
  transactions: Transaction[];
  riskScore: number;
  alerts: FraudAlert[];
  isLoading: boolean;
}
```

**Key Features:**
- Real-time transaction feed with risk indicators
- Risk meter visualization
- Fraud alert notifications
- Quick action buttons (freeze account, contact support)

#### 2. GuardianBot Chat Component
**Responsibility:** Conversational AI interface for security assistance

**Props Interface:**
```typescript
interface GuardianBotProps {
  accountId: string;
  userId: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: BotAction;
}

interface BotAction {
  action: 'freeze_account' | 'unfreeze_account' | 'escalate';
  confidence: number;
  requiresConfirmation: boolean;
}
```

**Key Features:**
- Context-aware conversations with transaction history
- Action suggestions with confidence scores
- User confirmation for critical actions
- Message history persistence

#### 3. Transaction Details Panel
**Responsibility:** Display detailed transaction information and risk explanations

**Props Interface:**
```typescript
interface TransactionDetailsProps {
  transaction: Transaction;
  mlExplanations: MLExplanation[];
}

interface MLExplanation {
  feature: string;
  weight: number;
  description: string;
}
```

#### 4. Travel Notice Form
**Responsibility:** Allow users to submit travel notifications

**Props Interface:**
```typescript
interface TravelNoticeFormProps {
  accountId: string;
  onSubmit: (notice: TravelNotice) => Promise<void>;
}

interface TravelNotice {
  destination: string;
  startDate: Date;
  endDate: Date;
  countries: string[];
}
```

### Backend API Interfaces

#### Authentication Controller
```typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() credentials: LoginDto): Promise<AuthResponse>;
  
  @Post('refresh')
  async refresh(@Req() request: Request): Promise<AuthResponse>;
  
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() request: Request): Promise<void>;
}

interface LoginDto {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: UserDto;
}
```

#### Accounts Controller
```typescript
@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  @Get(':id')
  async getAccount(@Param('id') id: string): Promise<AccountDto>;
  
  @Post(':id/freeze')
  async freezeAccount(
    @Param('id') id: string,
    @Body() reason: FreezeReasonDto
  ): Promise<AccountDto>;
  
  @Post(':id/travel')
  async submitTravelNotice(
    @Param('id') id: string,
    @Body() notice: TravelNoticeDto
  ): Promise<TravelNoticeDto>;
  
  @Get(':id/transactions')
  async getTransactions(
    @Param('id') id: string,
    @Query() filters: TransactionFiltersDto
  ): Promise<TransactionDto[]>;
}
```

#### Transactions Controller
```typescript
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  @Post('simulate')
  async simulateTransaction(
    @Body() simulation: SimulationDto
  ): Promise<TransactionWithScoreDto>;
}

interface SimulationDto {
  accountId: string;
  amount: number;
  merchantCategory: string;
  location: GeoLocation;
  fraudIndicators?: string[];
}

interface TransactionWithScoreDto {
  transaction: TransactionDto;
  riskScore: number;
  modelVersion: string;
  explanations: MLExplanationDto[];
}
```

#### Chat Controller
```typescript
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  @Post()
  async sendMessage(
    @Body() message: ChatMessageDto,
    @Req() request: Request
  ): Promise<ChatResponseDto>;
}

interface ChatMessageDto {
  accountId: string;
  message: string;
  conversationId?: string;
}

interface ChatResponseDto {
  message: string;
  action?: BotActionDto;
  conversationId: string;
}
```

### ML Service API Interface

#### Fraud Scoring Endpoint
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

class GeoLocation(BaseModel):
    latitude: float
    longitude: float
    country: str
    city: Optional[str] = None

class TransactionFeatures(BaseModel):
    transaction_id: str
    user_id: str
    account_id: str
    amount: float = Field(gt=0)
    merchant_category: str
    merchant_risk_level: int = Field(ge=1, le=5)
    location: GeoLocation
    device_fingerprint: str
    timestamp: str
    user_transaction_history: List[dict]
    active_travel_notices: List[dict] = []

class MLExplanation(BaseModel):
    feature: str
    weight: float
    value: Optional[float] = None
    description: str

class FraudScoreResponse(BaseModel):
    risk_score: int = Field(ge=0, le=100)
    model_version: str
    explanations: List[MLExplanation]
    ensemble_scores: dict
    processing_time_ms: float

@app.post("/score", response_model=FraudScoreResponse)
async def score_transaction(features: TransactionFeatures):
    # Implementation details in ML Service section
    pass
```

### Service Layer Interfaces

#### FraudService
```typescript
export interface IFraudService {
  scoreTransaction(transaction: Transaction): Promise<FraudScore>;
  getExplanations(transactionId: string): Promise<MLExplanation[]>;
  simulateTransaction(simulation: TransactionSimulation): Promise<FraudScore>;
}

export class FraudService implements IFraudService {
  constructor(
    private readonly mlClient: MLServiceClient,
    private readonly transactionRepo: ITransactionRepository,
    private readonly travelRepo: ITravelNoticeRepository
  ) {}
  
  async scoreTransaction(transaction: Transaction): Promise<FraudScore> {
    // Fetch user history
    const history = await this.transactionRepo.getUserHistory(
      transaction.userId,
      20
    );
    
    // Fetch active travel notices
    const travelNotices = await this.travelRepo.getActiveNotices(
      transaction.accountId
    );
    
    // Call ML service
    const score = await this.mlClient.score({
      ...transaction,
      userTransactionHistory: history,
      activeTravelNotices: travelNotices
    });
    
    // Store score
    await this.transactionRepo.updateScore(transaction.id, score);
    
    return score;
  }
}
```

#### ChatService
```typescript
export interface IChatService {
  sendMessage(
    userId: string,
    accountId: string,
    message: string,
    conversationId?: string
  ): Promise<ChatResponse>;
}

export class ChatService implements IChatService {
  constructor(
    private readonly geminiClient: GeminiClient,
    private readonly accountService: IAccountService,
    private readonly transactionService: ITransactionService,
    private readonly fraudService: IFraudService
  ) {}
  
  async sendMessage(
    userId: string,
    accountId: string,
    message: string,
    conversationId?: string
  ): Promise<ChatResponse> {
    // Build context
    const context = await this.buildContext(userId, accountId);
    
    // Sanitize user input
    const sanitizedMessage = this.sanitizeInput(message);
    
    // Compose system message
    const systemMessage = this.composeSystemMessage(context);
    
    // Call Gemini API
    const response = await this.geminiClient.chat({
      model: 'gemini-2.5-flash-preview-09-2025',
      systemMessage,
      userMessage: sanitizedMessage,
      conversationId
    });
    
    // Parse potential actions
    const action = this.parseAction(response);
    
    return {
      message: response.content,
      action,
      conversationId: response.conversationId
    };
  }
  
  private async buildContext(
    userId: string,
    accountId: string
  ): Promise<GuardianBotContext> {
    const [account, recentTransactions, alerts] = await Promise.all([
      this.accountService.getAccount(accountId),
      this.transactionService.getRecentTransactions(accountId, 10),
      this.fraudService.getActiveAlerts(accountId)
    ]);
    
    return {
      account,
      recentTransactions,
      alerts,
      currentRiskScore: account.riskScore
    };
  }
}
```

## Data Models

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_email ON users(email);
```

#### Accounts Table
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_number VARCHAR(50) UNIQUE NOT NULL,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings', 'credit')),
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'NAD',
  is_frozen BOOLEAN DEFAULT false,
  frozen_at TIMESTAMP,
  frozen_reason TEXT,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NAD',
  merchant_name VARCHAR(255),
  merchant_category VARCHAR(100),
  merchant_risk_level INTEGER CHECK (merchant_risk_level >= 1 AND merchant_risk_level <= 5),
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_country VARCHAR(100),
  location_city VARCHAR(100),
  device_fingerprint VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'blocked')),
  is_simulated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
```

#### ML Scores Table
```sql
CREATE TABLE ml_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  model_version VARCHAR(50) NOT NULL,
  isolation_forest_score DECIMAL(5, 4),
  xgboost_score DECIMAL(5, 4),
  lstm_score DECIMAL(5, 4),
  ensemble_method VARCHAR(50),
  explanations JSONB NOT NULL,
  processing_time_ms DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ml_scores_transaction_id ON ml_scores(transaction_id);
CREATE INDEX idx_ml_scores_risk_score ON ml_scores(risk_score DESC);
```

#### Fraud Alerts Table
```sql
CREATE TABLE fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  risk_score INTEGER NOT NULL,
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fraud_alerts_account_id ON fraud_alerts(account_id);
CREATE INDEX idx_fraud_alerts_created_at ON fraud_alerts(created_at DESC);
CREATE INDEX idx_fraud_alerts_is_resolved ON fraud_alerts(is_resolved);
```

#### Travel Notices Table
```sql
CREATE TABLE travel_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  destination_country VARCHAR(100) NOT NULL,
  destination_city VARCHAR(100),
  additional_countries TEXT[],
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE INDEX idx_travel_notices_account_id ON travel_notices(account_id);
CREATE INDEX idx_travel_notices_dates ON travel_notices(start_date, end_date);
CREATE INDEX idx_travel_notices_is_active ON travel_notices(is_active);
```

#### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  ip_address INET,
  user_agent TEXT,
  request_data JSONB,
  response_data JSONB,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_account_id ON audit_logs(account_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
```

### TypeScript Domain Models

```typescript
export class User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export class Account {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  isFrozen: boolean;
  frozenAt?: Date;
  frozenReason?: string;
  riskScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Transaction {
  id: string;
  accountId: string;
  transactionType: 'debit' | 'credit';
  amount: number;
  currency: string;
  merchantName?: string;
  merchantCategory?: string;
  merchantRiskLevel?: number;
  location?: GeoLocation;
  deviceFingerprint?: string;
  status: 'pending' | 'completed' | 'failed' | 'blocked';
  isSimulated: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export class GeoLocation {
  latitude: number;
  longitude: number;
  country: string;
  city?: string;
}

export class FraudScore {
  id: string;
  transactionId: string;
  riskScore: number;
  modelVersion: string;
  isolationForestScore: number;
  xgboostScore: number;
  lstmScore: number;
  ensembleMethod: string;
  explanations: MLExplanation[];
  processingTimeMs: number;
  createdAt: Date;
}

export class MLExplanation {
  feature: string;
  weight: number;
  value?: number;
  description: string;
}

export class FraudAlert {
  id: string;
  transactionId: string;
  accountId: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  description?: string;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: Date;
}

export class TravelNotice {
  id: string;
  accountId: string;
  destinationCountry: string;
  destinationCity?: string;
  additionalCountries: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AuditLog {
  id: string;
  userId?: string;
  accountId?: string;
  actionType: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestData?: Record<string, any>;
  responseData?: Record<string, any>;
  status: string;
  errorMessage?: string;
  createdAt: Date;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all testable criteria from the prework, several properties can be consolidated:

**Consolidations:**
- Properties 1.1, 1.3, 1.4 (transaction display) can be combined into a comprehensive transaction display property
- Properties 3.1, 3.4 (freeze blocking transactions) are redundant - one subsumes the other
- Properties 8.1, 8.2, 8.3, 8.4 (audit logging) can be combined into a general audit logging property
- Properties 5.2, 5.3 (ML response structure) can be combined
- Properties 19.1, 19.4 (currency formatting) are redundant

**Unique Properties Retained:**
- Each property below provides distinct validation value
- Properties cover different aspects: UI behavior, ML scoring, security, data integrity
- No further consolidation possible without losing test coverage

### Correctness Properties

**Property 1: Transaction display completeness**
*For any* user with transactions, when the dashboard loads, all transactions should be displayed with risk scores, and selecting any transaction should show complete details including N$ amount, merchant, location, timestamp, and risk explanations.
**Validates: Requirements 1.1, 1.3**

**Property 2: High-risk transaction highlighting**
*For any* transaction with risk score above 70, the UI rendering should include a visual warning indicator.
**Validates: Requirements 1.2**

**Property 3: Real-time transaction updates**
*For any* new transaction added to the backend, the frontend transaction list should update without manual page refresh.
**Validates: Requirements 1.4**

**Property 4: Multi-account transaction filtering**
*For any* set of transactions across multiple accounts, filtering by a specific account ID should return only transactions belonging to that account.
**Validates: Requirements 1.5**

**Property 5: GuardianBot context initialization**
*For any* user opening the chat interface, the initialization should include recent transactions, current risk score, and active alerts.
**Validates: Requirements 2.1**

**Property 6: GuardianBot action structure**
*For any* GuardianBot response containing action indicators, the parsed result should be a valid JSON object with action type and confidence score.
**Validates: Requirements 2.3**

**Property 7: High-confidence action confirmation**
*For any* GuardianBot action with confidence above 0.90, the system should require user confirmation before execution.
**Validates: Requirements 2.4**

**Property 8: Sensitive data sanitization**
*For any* user input containing sensitive patterns (credit card numbers, SSNs, passwords), the sanitized version should mask or remove them before AI processing.
**Validates: Requirements 2.5**

**Property 9: Account freeze blocks transactions**
*For any* account, after freezing, all new transaction attempts should be rejected with freeze status indicated.
**Validates: Requirements 3.1, 3.4**

**Property 10: Freeze/unfreeze audit logging**
*For any* account freeze or unfreeze action, an audit log entry should exist with user ID, account ID, timestamp, and reason.
**Validates: Requirements 3.2, 8.2**

**Property 11: Freeze notification delivery**
*For any* account freeze action, a confirmation notification should be queued or sent to the account owner.
**Validates: Requirements 3.3**

**Property 12: Freeze-unfreeze round trip**
*For any* account, freezing then unfreezing should restore normal transaction capabilities, and both actions should be logged.
**Validates: Requirements 3.5**

**Property 13: Travel notice persistence**
*For any* travel notice submission, the stored record should contain destination location, start date, and end date.
**Validates: Requirements 4.1**

**Property 14: Travel notice reduces geo-anomaly risk**
*For any* transaction occurring in a location matching an active travel notice, the geo-anomaly risk weight should be lower than without the notice.
**Validates: Requirements 4.2**

**Property 15: Travel notice automatic expiration**
*For any* travel notice past its end date, the is_active flag should be false.
**Validates: Requirements 4.3**

**Property 16: Travel notice display completeness**
*For any* user with travel notices, the view should include all active and past notices with correct status indicators.
**Validates: Requirements 4.4**

**Property 17: Overlapping travel notices application**
*For any* transaction with multiple overlapping active travel notices, all applicable notices should be considered in fraud scoring.
**Validates: Requirements 4.5**

**Property 18: ML risk score range**
*For any* transaction submitted for scoring, the returned risk score should be between 0 and 100 inclusive.
**Validates: Requirements 5.1**

**Property 19: ML response structure completeness**
*For any* ML scoring response, it should include SHAP explanations with feature names and weights, and a model version identifier.
**Validates: Requirements 5.2, 5.3**

**Property 20: Ensemble model inclusion**
*For any* ensemble scoring response, all three model scores (Isolation Forest, XGBoost, LSTM) should be present.
**Validates: Requirements 5.4**

**Property 21: Feature weight normalization**
*For any* set of SHAP feature weights, they should sum to 1.0 within floating point tolerance (±0.001).
**Validates: Requirements 5.5**

**Property 22: Geo-distance calculation**
*For any* transaction with location data, a geographical distance value in kilometers should be calculated.
**Validates: Requirements 6.1**

**Property 23: High geo-distance increases risk**
*For any* transaction with geo-distance exceeding the user's 95th percentile, the risk score should be higher than baseline.
**Validates: Requirements 6.2**

**Property 24: Travel notice reduces geo-anomaly**
*For any* transaction matching an active travel notice location, the geo-anomaly contribution to risk score should be reduced.
**Validates: Requirements 6.3**

**Property 25: Significant geo-distance in explanations**
*For any* transaction where geo-distance is a top-3 risk factor, it should appear in SHAP explanations with weight above 0.2.
**Validates: Requirements 6.5**

**Property 26: LSTM sequence analysis**
*For any* transaction scoring, the LSTM model should analyze a sequence of up to 20 previous transactions.
**Validates: Requirements 7.1**

**Property 27: LSTM contribution to ensemble**
*For any* ensemble score, the LSTM behavioral score should be included in the calculation.
**Validates: Requirements 7.2**

**Property 28: LSTM sequence padding**
*For any* user with fewer than 20 historical transactions, the LSTM input sequence should be padded to length 20.
**Validates: Requirements 7.3**

**Property 29: LSTM feature inclusion**
*For any* LSTM behavioral analysis, the input features should include transaction amounts, merchant categories, and time intervals.
**Validates: Requirements 7.4**

**Property 30: LSTM features in explanations**
*For any* scoring response using LSTM, behavioral features should appear in SHAP explanations.
**Validates: Requirements 7.5**

**Property 31: Comprehensive audit logging**
*For any* critical action (login, freeze/unfreeze, fraud alert, bot action), an audit log entry should exist with all required contextual fields.
**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

**Property 32: JWT access token issuance**
*For any* successful authentication, a JWT access token should be issued with 15-minute expiration.
**Validates: Requirements 9.1**

**Property 33: Refresh token issuance**
*For any* successful authentication, a refresh token should be issued with 7-day expiration in a secure HTTP-only cookie.
**Validates: Requirements 9.2**

**Property 34: Token refresh capability**
*For any* expired access token with a valid refresh token, the system should issue a new access token.
**Validates: Requirements 9.3**

**Property 35: Refresh token rotation**
*For any* refresh token usage, the system should issue a new refresh token and invalidate the previous one.
**Validates: Requirements 9.4**

**Property 36: Logout token invalidation**
*For any* user logout, all previously valid tokens for that session should be rejected on subsequent requests.
**Validates: Requirements 9.5**

**Property 37: API rate limiting enforcement**
*For any* user making more than 100 requests per minute, the 101st request should be rejected with HTTP 429.
**Validates: Requirements 10.1, 10.2**

**Property 38: Auth endpoint stricter rate limiting**
*For any* IP address making more than 5 authentication requests per minute, the 6th request should be rejected.
**Validates: Requirements 10.4**

**Property 39: Rate limit counter expiration**
*For any* rate limit counter, it should expire after the time window to prevent indefinite memory growth.
**Validates: Requirements 10.5**

**Property 40: Mobile responsive layout**
*For any* viewport width below 768px, the frontend should display a mobile-optimized responsive layout.
**Validates: Requirements 11.1**

**Property 41: Keyboard navigation**
*For any* interactive element, it should be keyboard navigable with proper tab order.
**Validates: Requirements 11.2**

**Property 42: Color contrast compliance**
*For any* text element, the color contrast ratio should be at least 4.5:1.
**Validates: Requirements 11.3**

**Property 43: Image alt text presence**
*For any* image element, a non-empty alt attribute should be present.
**Validates: Requirements 11.4**

**Property 44: Form accessibility**
*For any* form input, it should have an associated label and error messages should be announced to screen readers.
**Validates: Requirements 11.5**

**Property 45: Input validation and sanitization**
*For any* user input, invalid inputs should be rejected and valid inputs should be sanitized before processing.
**Validates: Requirements 14.1**

**Property 46: SQL injection prevention**
*For any* SQL injection attempt in user input, the query should fail safely without executing malicious code.
**Validates: Requirements 14.2**

**Property 47: Password hashing with salt**
*For any* stored password, it should be hashed using Argon2, and the same password should produce different hashes due to unique salts.
**Validates: Requirements 14.3**

**Property 48: CSP header presence**
*For any* frontend response, a Content Security Policy header should be included.
**Validates: Requirements 14.5**

**Property 49: Database transaction atomicity**
*For any* multi-step database operation, either all steps should complete or none should, maintaining ACID properties.
**Validates: Requirements 15.1**

**Property 50: Cache-before-database pattern**
*For any* frequently accessed data request, the system should check Redis cache before querying PostgreSQL.
**Validates: Requirements 15.2**

**Property 51: Cache TTL configuration**
*For any* cache entry, an appropriate TTL value should be set based on data volatility.
**Validates: Requirements 15.3**

**Property 52: Cache invalidation on update**
*For any* data update, the corresponding cache entry should be invalidated or updated.
**Validates: Requirements 15.4**

**Property 53: Horizontal scaling support**
*For any* system deployment with multiple instances, requests should be distributed and processed correctly across all instances.
**Validates: Requirements 16.4**

**Property 54: Currency formatting consistency**
*For any* monetary amount displayed, it should be formatted with N$ prefix, two decimal places, and comma separators.
**Validates: Requirements 19.1, 19.4**

**Property 55: Amount precision maintenance**
*For any* monetary calculation, the result should maintain precision to two decimal places without rounding errors.
**Validates: Requirements 19.2, 19.5**

**Property 56: Currency code in API responses**
*For any* transaction object in API responses, it should include currency code "NAD".
**Validates: Requirements 19.3**

**Property 57: Simulation transaction marking**
*For any* simulated transaction, the is_simulated flag should be true to distinguish it from real transactions.
**Validates: Requirements 20.2**

**Property 58: Simulation scoring consistency**
*For any* simulated and real transaction with identical features, they should produce identical risk scores.
**Validates: Requirements 20.3**

**Property 59: Simulation response completeness**
*For any* simulation request, the response should include risk score and detailed SHAP explanations.
**Validates: Requirements 20.4**

**Property 60: Batch simulation support**
*For any* batch simulation request with N transactions, the response should contain N results with varied parameters.
**Validates: Requirements 20.5**


## Error Handling

### Error Classification

The system implements a hierarchical error handling strategy with the following error categories:

**1. Validation Errors (400 Bad Request)**
- Invalid input parameters
- Missing required fields
- Format violations (email, phone, dates)
- Business rule violations (negative amounts, invalid date ranges)

**2. Authentication Errors (401 Unauthorized)**
- Invalid credentials
- Expired tokens
- Missing authentication headers
- Invalid JWT signatures

**3. Authorization Errors (403 Forbidden)**
- Insufficient permissions
- Account access violations
- Frozen account operations

**4. Resource Errors (404 Not Found)**
- Non-existent accounts
- Missing transactions
- Unknown user IDs

**5. Rate Limiting Errors (429 Too Many Requests)**
- Exceeded request quota
- Includes Retry-After header

**6. Server Errors (500 Internal Server Error)**
- Database connection failures
- ML service unavailability
- Unexpected exceptions

**7. Service Unavailable (503 Service Unavailable)**
- Maintenance mode
- Dependency service outages
- Circuit breaker open state

### Error Response Format

All API errors follow a consistent JSON structure:

```typescript
interface ErrorResponse {
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message
    details?: any;          // Additional context
    timestamp: string;      // ISO 8601 timestamp
    requestId: string;      // Trace ID for debugging
    path: string;           // Request path
  };
}
```

### Frontend Error Handling

**User-Facing Errors:**
- Display toast notifications for transient errors
- Show inline validation errors on forms
- Provide actionable error messages with recovery steps
- Implement retry mechanisms with exponential backoff

**Technical Errors:**
- Log errors to monitoring service
- Display generic "Something went wrong" message
- Provide support contact information
- Include request ID for support tickets

### ML Service Error Handling

**Scoring Fai
lures:**
- Return default risk score (50) with degraded mode flag
- Log failure details for investigation
- Implement circuit breaker pattern
- Queue transaction for retry scoring
- Alert operations team for persistent failures

**Database Failures:**
- Implement connection pooling with retry logic
- Use read replicas for failover
- Cache critical data in Redis
- Implement graceful degradation
- Return cached data with staleness indicator

**External Service Failures (Gemini AI):**
- Implement timeout controls (5 seconds)
- Provide fallback responses
- Queue messages for retry
- Display service unavailability message to users
- Log failures for monitoring

### Circuit Breaker Pattern

Implement circuit breaker for ML service calls:

```typescript
enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN' // Testing recovery
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: Date | null = null;
  
  private readonly failureThreshold = 5;
  private readonly timeout = 60000; // 60 seconds
  private readonly halfOpenAttempts = 3;
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new ServiceUnavailableError('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }
  
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;
    const elapsed = Date.now() - this.lastFailureTime.getTime();
    return elapsed >= this.timeout;
  }
}
```

### Retry Strategy

Implement exponential backoff for transient failures:

```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries && isRetryable(error)) {
        const delay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.3 * delay;
        await sleep(delay + jitter);
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
}

function isRetryable(error: Error): boolean {
  // Retry on network errors, timeouts, 503, 429
  return (
    error instanceof NetworkError ||
    error instanceof TimeoutError ||
    (error instanceof HttpError && [429, 503].includes(error.status))
  );
}
```

## Testing Strategy

The system employs a comprehensive dual testing approach combining unit tests for specific scenarios and property-based tests for universal correctness guarantees.

### Testing Framework Selection

**Backend (Node.js/TypeScript):**
- **Unit Testing:** Jest
- **Property-Based Testing:** fast-check
- **Integration Testing:** Supertest with Jest
- **E2E Testing:** Playwright

**Frontend (React/TypeScript):**
- **Unit Testing:** Vitest
- **Component Testing:** React Testing Library
- **Property-Based Testing:** fast-check
- **E2E Testing:** Playwright

**ML Service (Python):**
- **Unit Testing:** pytest
- **Property-Based Testing:** Hypothesis
- **Model Testing:** pytest with custom fixtures

### Unit Testing Approach

Unit tests verify specific examples, edge cases, and integration points:

**Backend Unit Tests:**
```typescript
describe('FraudService', () => {
  it('should return risk score 50 when ML service is unavailable', async () => {
    // Test degraded mode behavior
  });
  
  it('should reject negative transaction amounts', async () => {
    // Test input validation
  });
  
  it('should include travel notices in ML scoring context', async () => {
    // Test integration between services
  });
});
```

**Frontend Unit Tests:**
```typescript
describe('TransactionList', () => {
  it('should display empty state when no transactions exist', () => {
    // Test edge case
  });
  
  it('should format N$ amounts with two decimal places', () => {
    // Test specific formatting requirement
  });
  
  it('should highlight transactions with risk score > 70', () => {
    // Test specific threshold behavior
  });
});
```

**ML Service Unit Tests:**
```python
def test_feature_engineering_handles_missing_location():
    """Test edge case: transaction without location data"""
    # Test graceful handling of missing data

def test_shap_weights_sum_to_one():
    """Test specific mathematical requirement"""
    # Test weight normalization
```

### Property-Based Testing Approach

Property-based tests verify universal properties across all valid inputs. Each test runs a minimum of 100 iterations with randomly generated data.

**Configuration:**
```typescript
// fast-check configuration
const config = {
  numRuns: 100,        // Minimum iterations
  verbose: true,
  seed: Date.now(),    // Reproducible failures
  endOnFailure: false  // Find all failures
};
```

**Property Test Structure:**

Each property-based test MUST:
1. Be tagged with a comment referencing the design document property
2. Generate diverse, valid test data
3. Verify the universal property holds
4. Provide clear failure messages

**Example Property Tests:**

```typescript
// Backend Property Test
describe('Property-Based Tests', () => {
  it('Property 18: ML risk score range', async () => {
    /**
     * Feature: banking-fraud-prevention-system, Property 18: ML risk score range
     * For any transaction submitted for scoring, the returned risk score 
     * should be between 0 and 100 inclusive.
     */
    await fc.assert(
      fc.asyncProperty(
        transactionArbitrary(),
        async (transaction) => {
          const score = await fraudService.scoreTransaction(transaction);
          expect(score.riskScore).toBeGreaterThanOrEqual(0);
          expect(score.riskScore).toBeLessThanOrEqual(100);
        }
      ),
      config
    );
  });
  
  it('Property 54: Currency formatting consistency', () => {
    /**
     * Feature: banking-fraud-prevention-system, Property 54: Currency formatting consistency
     * For any monetary amount displayed, it should be formatted with N$ prefix, 
     * two decimal places, and comma separators.
     */
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1000000, noNaN: true }),
        (amount) => {
          const formatted = formatCurrency(amount);
          expect(formatted).toMatch(/^N\$\d{1,3}(,\d{3})*\.\d{2}$/);
        }
      ),
      config
    );
  });
  
  it('Property 9: Account freeze blocks transactions', async () => {
    /**
     * Feature: banking-fraud-prevention-system, Property 9: Account freeze blocks transactions
     * For any account, after freezing, all new transaction attempts should be 
     * rejected with freeze status indicated.
     */
    await fc.assert(
      fc.asyncProperty(
        accountArbitrary(),
        transactionArbitrary(),
        async (account, transaction) => {
          await accountService.freezeAccount(account.id, 'Test freeze');
          
          const result = await transactionService.processTransaction({
            ...transaction,
            accountId: account.id
          });
          
          expect(result.status).toBe('blocked');
          expect(result.reason).toContain('frozen');
        }
      ),
      config
    );
  });
});
```

**Python Property Tests:**
```python
from hypothesis import given, strategies as st
import hypothesis

# Configure Hypothesis
hypothesis.settings.register_profile("ci", max_examples=100)
hypothesis.settings.load_profile("ci")

@given(
    amount=st.floats(min_value=0.01, max_value=1000000),
    merchant_category=st.sampled_from(['retail', 'food', 'travel', 'online']),
    location=st.builds(GeoLocation)
)
def test_property_18_risk_score_range(amount, merchant_category, location):
    """
    Feature: banking-fraud-prevention-system, Property 18: ML risk score range
    For any transaction submitted for scoring, the returned risk score 
    should be between 0 and 100 inclusive.
    """
    transaction = create_transaction(
        amount=amount,
        merchant_category=merchant_category,
        location=location
    )
    
    score = ml_service.score_transaction(transaction)
    
    assert 0 <= score.risk_score <= 100, \
        f"Risk score {score.risk_score} outside valid range [0, 100]"

@given(
    transactions=st.lists(
        st.builds(Transaction),
        min_size=1,
        max_size=20
    )
)
def test_property_26_lstm_sequence_analysis(transactions):
    """
    Feature: banking-fraud-prevention-system, Property 26: LSTM sequence analysis
    For any transaction scoring, the LSTM model should analyze a sequence 
    of up to 20 previous transactions.
    """
    features = feature_engineer.prepare_lstm_features(transactions)
    
    assert features.shape[0] == min(len(transactions), 20), \
        f"LSTM sequence length {features.shape[0]} incorrect"
```

### Test Data Generators (Arbitraries)

Create reusable generators for complex domain objects:

```typescript
// fast-check arbitraries
function transactionArbitrary(): fc.Arbitrary<Transaction> {
  return fc.record({
    id: fc.uuid(),
    accountId: fc.uuid(),
    transactionType: fc.constantFrom('debit', 'credit'),
    amount: fc.double({ min: 0.01, max: 100000, noNaN: true }),
    currency: fc.constant('NAD'),
    merchantName: fc.string({ minLength: 3, maxLength: 50 }),
    merchantCategory: fc.constantFrom('retail', 'food', 'travel', 'online', 'utilities'),
    merchantRiskLevel: fc.integer({ min: 1, max: 5 }),
    location: geoLocationArbitrary(),
    deviceFingerprint: fc.hexaString({ minLength: 32, maxLength: 32 }),
    status: fc.constantFrom('pending', 'completed', 'failed', 'blocked'),
    isSimulated: fc.boolean(),
    createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date() })
  });
}

function geoLocationArbitrary(): fc.Arbitrary<GeoLocation> {
  return fc.record({
    latitude: fc.double({ min: -90, max: 90 }),
    longitude: fc.double({ min: -180, max: 180 }),
    country: fc.constantFrom('Namibia', 'South Africa', 'Botswana', 'Zimbabwe', 'USA', 'UK'),
    city: fc.option(fc.string({ minLength: 3, maxLength: 30 }))
  });
}

function accountArbitrary(): fc.Arbitrary<Account> {
  return fc.record({
    id: fc.uuid(),
    userId: fc.uuid(),
    accountNumber: fc.string({ minLength: 10, maxLength: 12 }).map(s => s.replace(/\D/g, '')),
    accountType: fc.constantFrom('checking', 'savings', 'credit'),
    balance: fc.double({ min: 0, max: 1000000, noNaN: true }),
    currency: fc.constant('NAD'),
    isFrozen: fc.boolean(),
    riskScore: fc.integer({ min: 0, max: 100 }),
    createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date() })
  });
}
```

### Integration Testing

Integration tests verify interactions between components:

```typescript
describe('Transaction Fraud Detection Integration', () => {
  let app: INestApplication;
  let db: Database;
  
  beforeAll(async () => {
    // Set up test database and application
  });
  
  it('should score transaction and create fraud alert when risk is high', async () => {
    // Create test account
    const account = await createTestAccount();
    
    // Submit high-risk transaction
    const response = await request(app.getHttpServer())
      .post('/transactions/simulate')
      .send({
        accountId: account.id,
        amount: 50000,
        merchantCategory: 'online',
        location: { country: 'Russia', latitude: 55.7558, longitude: 37.6173 }
      })
      .expect(200);
    
    // Verify risk score is high
    expect(response.body.riskScore).toBeGreaterThan(70);
    
    // Verify fraud alert was created
    const alerts = await db.fraudAlerts.findByAccountId(account.id);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('high');
  });
});
```

### E2E Testing

End-to-end tests verify complete user workflows:

```typescript
import { test, expect } from '@playwright/test';

test('User can view transaction and freeze account on suspicious activity', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Navigate to dashboard
  await expect(page).toHaveURL('/dashboard');
  
  // View high-risk transaction
  await page.click('[data-testid="transaction-high-risk"]');
  
  // Verify risk details are displayed
  await expect(page.locator('[data-testid="risk-score"]')).toContainText('87');
  await expect(page.locator('[data-testid="risk-explanation"]')).toBeVisible();
  
  // Freeze account
  await page.click('[data-testid="freeze-account-button"]');
  await page.fill('[name="reason"]', 'Suspicious transaction detected');
  await page.click('[data-testid="confirm-freeze"]');
  
  // Verify freeze confirmation
  await expect(page.locator('[data-testid="freeze-status"]')).toContainText('Frozen');
});
```

### ML Model Testing

Specialized tests for machine learning components:

```python
def test_model_performance_on_known_fraud_patterns():
    """Test model correctly identifies known fraud patterns"""
    fraud_patterns = load_fraud_test_cases()
    
    for pattern in fraud_patterns:
        score = ml_service.score_transaction(pattern)
        assert score.risk_score > 70, \
            f"Failed to detect known fraud pattern: {pattern.description}"

def test_model_fairness_across_demographics():
    """Test model doesn't discriminate based on protected attributes"""
    # Generate transactions with varied demographics
    # Verify risk scores are based on behavior, not demographics

def test_shap_explanations_consistency():
    """Test SHAP explanations are consistent across multiple runs"""
    transaction = create_test_transaction()
    
    explanations = [
        ml_service.score_transaction(transaction).explanations
        for _ in range(10)
    ]
    
    # Verify top features are consistent
    top_features = [
        [e.feature for e in exp[:3]]
        for exp in explanations
    ]
    
    assert all(features == top_features[0] for features in top_features), \
        "SHAP explanations are inconsistent across runs"
```

### Test Coverage Requirements

**Minimum Coverage Targets:**
- Unit Test Coverage: 80% line coverage
- Property Test Coverage: All 60 correctness properties must have corresponding tests
- Integration Test Coverage: All API endpoints
- E2E Test Coverage: Critical user workflows (login, view transactions, freeze account, chat with GuardianBot)

**Coverage Exclusions:**
- Generated code (migrations, DTOs)
- Configuration files
- Type definitions

### Continuous Testing

**Pre-commit Hooks:**
- Run unit tests
- Run linting and type checking
- Verify code formatting

**CI Pipeline:**
- Run all unit tests
- Run all property-based tests
- Run integration tests
- Generate coverage reports
- Run security scans (npm audit, Snyk)

**Nightly Builds:**
- Run E2E tests
- Run extended property-based tests (1000+ iterations)
- Run performance benchmarks
- Generate test reports

### Test Documentation

Each test file MUST include:
- Description of what is being tested
- Setup and teardown procedures
- Expected behavior
- Property references for property-based tests

Example:
```typescript
/**
 * FraudService Unit Tests
 * 
 * Tests the fraud detection service including:
 * - ML service integration
 * - Risk score calculation
 * - Alert generation
 * - Error handling and degraded mode
 * 
 * Property-based tests verify:
 * - Property 18: Risk score range (0-100)
 * - Property 19: ML response structure completeness
 * - Property 21: Feature weight normalization
 */
describe('FraudService', () => {
  // Tests...
});
```

## Security Considerations

### OWASP Top 10 Mitigation

**1. Injection Prevention:**
- Use parameterized queries (TypeORM)
- Input validation with class-validator
- Sanitize all user inputs
- Implement Content Security Policy

**2. Broken Authentication:**
- Implement JWT with short expiration (15 minutes)
- Use refresh tokens with rotation
- Enforce strong password policies (min 12 characters, complexity)
- Hash passwords with Argon2
- Implement account lockout after 5 failed attempts

**3. Sensitive Data Exposure:**
- Encrypt data in transit (TLS 1.3)
- Encrypt sensitive data at rest
- Never log passwords or tokens
- Mask sensitive data in logs and error messages
- Use secure HTTP-only cookies for refresh tokens

**4. XML External Entities (XXE):**
- Not applicable (no XML processing)

**5. Broken Access Control:**
- Implement role-based access control (RBAC)
- Verify user owns account before operations
- Use JWT claims for authorization
- Audit all access attempts

**6. Security Misconfiguration:**
- Remove default credentials
- Disable directory listing
- Keep dependencies updated
- Use security headers (CSP, HSTS, X-Frame-Options)
- Implement proper CORS configuration

**7. Cross-Site Scripting (XSS):**
- Sanitize all user inputs
- Use React's built-in XSS protection
- Implement Content Security Policy
- Validate and encode output

**8. Insecure Deserialization:**
- Validate all JSON inputs with Pydantic/class-validator
- Implement type checking
- Reject unexpected fields

**9. Using Components with Known Vulnerabilities:**
- Regular dependency audits (npm audit, Snyk)
- Automated dependency updates (Dependabot)
- Monitor security advisories

**10. Insufficient Logging & Monitoring:**
- Log all authentication attempts
- Log all critical actions (freeze, unfreeze, high-risk transactions)
- Implement audit trail
- Set up alerts for suspicious patterns
- Use structured logging (Winston)

### Additional Security Measures

**API Security:**
- Rate limiting (100 req/min general, 5 req/min auth)
- Request size limits
- Timeout controls
- CORS whitelist
- API versioning

**Database Security:**
- Principle of least privilege
- Separate read/write users
- Connection pooling with limits
- Encrypted connections
- Regular backups

**Infrastructure Security:**
- Container security scanning
- Network segmentation
- Secrets management (environment variables, vault)
- Regular security patches
- DDoS protection

## Performance Considerations

### Response Time Targets

- API endpoints: < 200ms (p95)
- ML scoring: < 500ms (p95)
- Database queries: < 50ms (p95)
- Frontend page load: < 2s (p95)
- GuardianBot response: < 3s (p95)

### Optimization Strategies

**Caching:**
- Cache user profiles (TTL: 5 minutes)
- Cache account data (TTL: 1 minute)
- Cache ML model in memory
- Cache SHAP explainer
- Use Redis for distributed caching

**Database Optimization:**
- Index frequently queried columns
- Use connection pooling
- Implement read replicas
- Partition large tables (transactions by date)
- Use materialized views for analytics

**API Optimization:**
- Implement pagination (default 20 items)
- Use field selection (GraphQL-style)
- Compress responses (gzip)
- Implement HTTP caching headers
- Use CDN for static assets

**ML Service Optimization:**
- Batch prediction support
- Model caching in memory
- Feature caching
- Async processing for non-critical scoring
- GPU acceleration for LSTM

### Scalability

**Horizontal Scaling:**
- Stateless API design
- Load balancer (Nginx/ALB)
- Session storage in Redis
- Database connection pooling
- Message queue for async tasks

**Vertical Scaling:**
- Optimize memory usage
- Efficient algorithms
- Resource monitoring
- Auto-scaling policies

## Deployment Architecture

### Container Strategy

**Docker Images:**
- `fraud-prevention-frontend`: React application with Nginx
- `fraud-prevention-backend`: NestJS API server
- `fraud-prevention-ml`: Python FastAPI ML service
- `postgres:15-alpine`: PostgreSQL database
- `redis:7-alpine`: Redis cache

**Docker Compose (Development):**
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://localhost:4000
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://fraud_user:fraud_pass@postgres:5432/fraud_db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-jwt-secret-key
      - ML_SERVICE_URL=http://ml-service:8000
      - GEMINI_API_KEY=your-gemini-api-key
    depends_on:
      - postgres
      - redis
      - ml-service
  
  ml-service:
    build: ./ml
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/app/models
      - FEATURE_STORE_URL=redis://redis:6379
    volumes:
      - ./ml/models:/app/models
    depends_on:
      - redis
  
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=fraud_db
      - POSTGRES_USER=fraud_user
      - POSTGRES_PASSWORD=fraud_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Deployment

**Production deployment using Kubernetes:**

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: fraud-prevention

---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: fraud-prevention
data:
  DATABASE_URL: "postgresql://fraud_user:fraud_pass@postgres-service:5432/fraud_db"
  REDIS_URL: "redis://redis-service:6379"
  ML_SERVICE_URL: "http://ml-service:8000"

---
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: fraud-prevention
type: Opaque
data:
  JWT_SECRET: <base64-encoded-jwt-secret>
  GEMINI_API_KEY: <base64-encoded-gemini-key>
  POSTGRES_PASSWORD: <base64-encoded-password>

---
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: fraud-prevention
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: fraud-prevention-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: fraud-prevention
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: fraud-prevention-backend:latest
        ports:
        - containerPort: 4000
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# ml-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-service
  namespace: fraud-prevention
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ml-service
  template:
    metadata:
      labels:
        app: ml-service
    spec:
      containers:
      - name: ml-service
        image: fraud-prevention-ml:latest
        ports:
        - containerPort: 8000
        env:
        - name: MODEL_PATH
          value: "/app/models"
        - name: FEATURE_STORE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: REDIS_URL
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        volumeMounts:
        - name: model-storage
          mountPath: /app/models
      volumes:
      - name: model-storage
        persistentVolumeClaim:
          claimName: ml-models-pvc

---
# services.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: fraud-prevention
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer

---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: fraud-prevention
spec:
  selector:
    app: backend
  ports:
  - port: 4000
    targetPort: 4000
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: ml-service
  namespace: fraud-prevention
spec:
  selector:
    app: ml-service
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
```

### Infrastructure as Code (Terraform)

**AWS Infrastructure:**

```hcl
# main.tf
provider "aws" {
  region = var.aws_region
}

# VPC and Networking
resource "aws_vpc" "fraud_prevention_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "fraud-prevention-vpc"
  }
}

resource "aws_subnet" "private_subnets" {
  count             = 2
  vpc_id            = aws_vpc.fraud_prevention_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "fraud-prevention-private-${count.index + 1}"
  }
}

resource "aws_subnet" "public_subnets" {
  count                   = 2
  vpc_id                  = aws_vpc.fraud_prevention_vpc.id
  cidr_block              = "10.0.${count.index + 10}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "fraud-prevention-public-${count.index + 1}"
  }
}

# EKS Cluster
resource "aws_eks_cluster" "fraud_prevention_cluster" {
  name     = "fraud-prevention-cluster"
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = "1.28"

  vpc_config {
    subnet_ids = concat(aws_subnet.private_subnets[*].id, aws_subnet.public_subnets[*].id)
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
  ]
}

# RDS PostgreSQL
resource "aws_db_instance" "fraud_prevention_db" {
  identifier     = "fraud-prevention-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.medium"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type          = "gp3"
  storage_encrypted     = true
  
  db_name  = "fraud_db"
  username = "fraud_user"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.fraud_prevention_db_subnet_group.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "fraud-prevention-db-final-snapshot"
  
  tags = {
    Name = "fraud-prevention-db"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "fraud_prevention_cache_subnet_group" {
  name       = "fraud-prevention-cache-subnet-group"
  subnet_ids = aws_subnet.private_subnets[*].id
}

resource "aws_elasticache_replication_group" "fraud_prevention_redis" {
  replication_group_id       = "fraud-prevention-redis"
  description                = "Redis cluster for fraud prevention system"
  
  node_type                  = "cache.t3.medium"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.fraud_prevention_cache_subnet_group.name
  security_group_ids = [aws_security_group.redis_sg.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = {
    Name = "fraud-prevention-redis"
  }
}

# Application Load Balancer
resource "aws_lb" "fraud_prevention_alb" {
  name               = "fraud-prevention-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public_subnets[*].id

  enable_deletion_protection = false

  tags = {
    Name = "fraud-prevention-alb"
  }
}
```

### Monitoring and Observability

**Prometheus and Grafana Setup:**

```yaml
# monitoring-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring

---
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'fraud-prevention-backend'
      static_configs:
      - targets: ['backend-service.fraud-prevention:4000']
      metrics_path: /metrics
    - job_name: 'fraud-prevention-ml'
      static_configs:
      - targets: ['ml-service.fraud-prevention:8000']
      metrics_path: /metrics
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true

---
# grafana-dashboard.json
{
  "dashboard": {
    "title": "Fraud Prevention System",
    "panels": [
      {
        "title": "Transaction Volume",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(fraud_transactions_total[5m])",
            "legendFormat": "Transactions/sec"
          }
        ]
      },
      {
        "title": "Risk Score Distribution",
        "type": "histogram",
        "targets": [
          {
            "expr": "fraud_risk_score_histogram",
            "legendFormat": "Risk Score"
          }
        ]
      },
      {
        "title": "ML Service Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(ml_service_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Fraud Alerts",
        "type": "stat",
        "targets": [
          {
            "expr": "fraud_alerts_total",
            "legendFormat": "Total Alerts"
          }
        ]
      }
    ]
  }
}
```

### CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: |
          frontend/package-lock.json
          backend/package-lock.json
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
        cache: 'pip'
        cache-dependency-path: ml/requirements.txt
    
    - name: Install Frontend Dependencies
      working-directory: ./frontend
      run: npm ci
    
    - name: Install Backend Dependencies
      working-directory: ./backend
      run: npm ci
    
    - name: Install ML Dependencies
      working-directory: ./ml
      run: |
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
    
    - name: Run Frontend Tests
      working-directory: ./frontend
      run: |
        npm run test:unit
        npm run test:property
    
    - name: Run Backend Tests
      working-directory: ./backend
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379
      run: |
        npm run test:unit
        npm run test:property
        npm run test:integration
    
    - name: Run ML Tests
      working-directory: ./ml
      env:
        REDIS_URL: redis://localhost:6379
      run: |
        pytest tests/unit/
        pytest tests/property/
    
    - name: Run E2E Tests
      run: |
        docker-compose -f docker-compose.test.yml up -d
        npm run test:e2e
        docker-compose -f docker-compose.test.yml down
    
    - name: Upload Coverage Reports
      uses: codecov/codecov-action@v3
      with:
        files: |
          ./frontend/coverage/lcov.info
          ./backend/coverage/lcov.info
          ./ml/coverage.xml

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Security Audit (Frontend)
      working-directory: ./frontend
      run: npm audit --audit-level high
    
    - name: Run Security Audit (Backend)
      working-directory: ./backend
      run: npm audit --audit-level high
    
    - name: Run Security Scan (Python)
      working-directory: ./ml
      run: |
        pip install safety
        safety check
    
    - name: Run Container Security Scan
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'

  build-and-deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and Push Frontend Image
      uses: docker/build-push-action@v5
      with:
        context: ./frontend
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:latest
    
    - name: Build and Push Backend Image
      uses: docker/build-push-action@v5
      with:
        context: ./backend
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:latest
    
    - name: Build and Push ML Service Image
      uses: docker/build-push-action@v5
      with:
        context: ./ml
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-ml:latest
    
    - name: Deploy to Kubernetes
      uses: azure/k8s-deploy@v1
      with:
        manifests: |
          k8s/namespace.yaml
          k8s/configmap.yaml
          k8s/secrets.yaml
          k8s/deployments.yaml
          k8s/services.yaml
        images: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:latest
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:latest
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-ml:latest
        kubeconfig: ${{ secrets.KUBE_CONFIG }}
```

This completes the comprehensive design document for the Advanced Banking Fraud Prevention & Response System. The document now includes all necessary sections covering architecture, components, data models, correctness properties, error handling, testing strategy, security considerations, performance optimization, and deployment architecture with full CI/CD pipeline configuration.