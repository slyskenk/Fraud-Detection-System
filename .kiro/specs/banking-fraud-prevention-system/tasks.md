# Implementation Plan

- [x] 1. Set up project structure and development environment




  - Create root directory structure with frontend/, backend/, ml/, infra/, and docs/ folders
  - Initialize Git repository with .gitignore for Node.js, Python, and environment files
  - Set up package.json for frontend and backend with TypeScript configuration
  - Set up Python virtual environment and requirements.txt for ML service
  - Configure ESLint, Prettier for code formatting
  - Create Docker Compose file for local development environment
  - _Requirements: 12.1, 16.1, 16.2_

- [x] 2. Implement database schema and migrations





  - Create PostgreSQL database schema with all tables (users, accounts, transactions, ml_scores, fraud_alerts, travel_notices, audit_logs)
  - Implement database migration scripts using TypeORM migrations
  - Add indexes for frequently queried columns
  - Set up database connection pooling configuration
  - Create seed data for development and testing
  - _Requirements: 15.1, 15.5_

- [x] 3. Implement backend authentication system




- [x] 3.1 Create User model and repository

  - Implement User entity with TypeORM decorators
  - Create UserRepository with CRUD operations
  - Implement password hashing with Argon2
  - _Requirements: 14.3, 12.1_

- [x] 3.2 Implement JWT authentication service


  - Create AuthService with login, token generation, and validation methods
  - Implement JWT access token generation (15-minute expiration)
  - Implement refresh token generation (7-day expiration)
  - Create JWT strategy for Passport.js
  - _Requirements: 9.1, 9.2_


- [x] 3.3 Implement token refresh and rotation

  - Create refresh token endpoint
  - Implement token rotation logic (invalidate old, issue new)
  - Store refresh tokens in Redis with expiration
  - _Requirements: 9.3, 9.4_


- [x] 3.4 Implement logout functionality

  - Create logout endpoint
  - Implement token invalidation in Redis
  - Clear HTTP-only cookies
  - _Requirements: 9.5_


- [x] 3.5 Create authentication controllers

  - Implement POST /auth/login endpoint
  - Implement POST /auth/refresh endpoint
  - Implement POST /auth/logout endpoint
  - Add input validation with class-validator
  - _Requirements: 9.1, 9.2, 9.5, 14.1_

- [ ]* 3.6 Write property test for authentication
  - **Property 32: JWT access token issuance**
  - **Validates: Requirements 9.1**

- [ ]* 3.7 Write property test for refresh tokens
  - **Property 33: Refresh token issuance**
  - **Validates: Requirements 9.2**

- [ ]* 3.8 Write property test for token refresh
  - **Property 34: Token refresh capability**
  - **Validates: Requirements 9.3**

- [ ]* 3.9 Write property test for token rotation
  - **Property 35: Refresh token rotation**
  - **Validates: Requirements 9.4**

- [ ]* 3.10 Write property test for logout
  - **Property 36: Logout token invalidation**
  - **Validates: Requirements 9.5**

- [x] 4. Implement rate limiting middleware




- [x] 4.1 Create rate limiting service using Redis


  - Implement RateLimitService with sliding window algorithm
  - Configure general rate limit (100 req/min per user)
  - Configure auth endpoint rate limit (5 req/min per IP)
  - _Requirements: 10.1, 10.3, 10.4_


- [x] 4.2 Create rate limiting middleware

  - Implement NestJS middleware for rate limiting
  - Add Retry-After header to 429 responses
  - Implement counter expiration logic
  - Apply middleware to all routes
  - _Requirements: 10.2, 10.5_

- [ ]* 4.3 Write property test for rate limiting
  - **Property 37: API rate limiting enforcement**
  - **Validates: Requirements 10.1, 10.2**

- [ ]* 4.4 Write property test for auth rate limiting
  - **Property 38: Auth endpoint stricter rate limiting**
  - **Validates: Requirements 10.4**

- [ ]* 4.5 Write property test for counter expiration
  - **Property 39: Rate limit counter expiration**
  - **Validates: Requirements 10.5**

- [ ] 5. Implement Account management system
- [ ] 5.1 Create Account model and repository
  - Implement Account entity with relationships to User
  - Create AccountRepository with CRUD operations
  - Implement account freeze/unfreeze methods
  - _Requirements: 3.1, 12.1_

- [ ] 5.2 Implement AccountService
  - Create getAccount method with caching
  - Implement freezeAccount method with audit logging
  - Implement unfreezeAccount method with audit logging
  - Add validation for account operations
  - _Requirements: 3.1, 3.2, 3.5, 15.2_

- [ ] 5.3 Create Account controllers
  - Implement GET /accounts/:id endpoint
  - Implement POST /accounts/:id/freeze endpoint
  - Implement POST /accounts/:id/unfreeze endpoint
  - Add JWT authentication guard
  - Add authorization check (user owns account)
  - _Requirements: 3.1, 3.5, 12.1_

- [ ]* 5.4 Write property test for account freeze
  - **Property 9: Account freeze blocks transactions**
  - **Validates: Requirements 3.1, 3.4**

- [ ]* 5.5 Write property test for freeze audit logging
  - **Property 10: Freeze/unfreeze audit logging**
  - **Validates: Requirements 3.2, 8.2**

- [ ]* 5.6 Write property test for freeze-unfreeze round trip
  - **Property 12: Freeze-unfreeze round trip**
  - **Validates: Requirements 3.5**

- [ ] 6. Implement Transaction management system
- [ ] 6.1 Create Transaction model and repository
  - Implement Transaction entity with relationships
  - Create TransactionRepository with query methods
  - Implement transaction filtering by account and date range
  - Add pagination support
  - _Requirements: 1.1, 1.5, 12.1_

- [ ] 6.2 Implement TransactionService
  - Create getTransactions method with filtering
  - Implement getRecentTransactions for GuardianBot context
  - Add transaction validation logic
  - Implement frozen account check before processing
  - _Requirements: 1.1, 1.4, 3.4_

- [ ] 6.3 Create Transaction controllers
  - Implement GET /accounts/:id/transactions endpoint
  - Add query parameters for filtering (date range, status)
  - Implement pagination with default limit of 20
  - Add response caching headers
  - _Requirements: 1.1, 1.5_

- [ ]* 6.4 Write property test for multi-account filtering
  - **Property 4: Multi-account transaction filtering**
  - **Validates: Requirements 1.5**

- [ ] 7. Implement Travel Notice system
- [ ] 7.1 Create TravelNotice model and repository
  - Implement TravelNotice entity with date validation
  - Create TravelNoticeRepository with active notice queries
  - Implement automatic expiration check
  - _Requirements: 4.1, 4.3_

- [ ] 7.2 Implement TravelNoticeService
  - Create submitTravelNotice method with validation
  - Implement getActiveNotices method
  - Add date range validation (end >= start)
  - Implement automatic deactivation for expired notices
  - _Requirements: 4.1, 4.3, 4.4_

- [ ] 7.3 Create Travel Notice controllers
  - Implement POST /accounts/:id/travel endpoint
  - Implement GET /accounts/:id/travel endpoint
  - Add input validation for dates and locations
  - _Requirements: 4.1, 4.4_

- [ ]* 7.4 Write property test for travel notice persistence
  - **Property 13: Travel notice persistence**
  - **Validates: Requirements 4.1**

- [ ]* 7.5 Write property test for automatic expiration
  - **Property 15: Travel notice automatic expiration**
  - **Validates: Requirements 4.3**

- [ ]* 7.6 Write property test for display completeness
  - **Property 16: Travel notice display completeness**
  - **Validates: Requirements 4.4**

- [ ]* 7.7 Write property test for overlapping notices
  - **Property 17: Overlapping travel notices application**
  - **Validates: Requirements 4.5**

- [ ] 8. Implement Audit Logging system
- [ ] 8.1 Create AuditLog model and repository
  - Implement AuditLog entity with all required fields
  - Create AuditLogRepository with query methods
  - Add indexes for efficient querying
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 8.2 Implement AuditService
  - Create logAction method for all critical actions
  - Implement structured logging with Winston
  - Add context capture (IP, user agent, request data)
  - Ensure immutability of log entries
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 8.3 Create audit logging interceptor
  - Implement NestJS interceptor for automatic logging
  - Apply to authentication, freeze/unfreeze, and fraud alert endpoints
  - Capture request/response data
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 8.4 Write property test for comprehensive audit logging
  - **Property 31: Comprehensive audit logging**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [ ] 9. Implement ML Service client integration
- [ ] 9.1 Create ML Service HTTP client
  - Implement MLServiceClient with axios
  - Add timeout configuration (500ms)
  - Implement circuit breaker pattern
  - Add retry logic with exponential backoff
  - _Requirements: 5.1_

- [ ] 9.2 Implement FraudService
  - Create scoreTransaction method
  - Implement context building (history, travel notices)
  - Add degraded mode handling (default score 50)
  - Implement score caching in Redis
  - _Requirements: 5.1, 5.2, 5.3, 15.2_

- [ ] 9.3 Create FraudAlert model and service
  - Implement FraudAlert entity
  - Create alert generation logic for high-risk transactions (score > 70)
  - Implement alert resolution tracking
  - _Requirements: 1.2, 8.3_

- [ ] 9.4 Implement transaction simulation endpoint
  - Create POST /transactions/simulate endpoint
  - Implement synthetic transaction generation
  - Mark simulated transactions with is_simulated flag
  - Call ML Service for scoring
  - _Requirements: 20.1, 20.2, 20.3, 20.4_

- [ ]* 9.5 Write property test for simulation marking
  - **Property 57: Simulation transaction marking**
  - **Validates: Requirements 20.2**

- [ ]* 9.6 Write property test for simulation scoring consistency
  - **Property 58: Simulation scoring consistency**
  - **Validates: Requirements 20.3**

- [ ]* 9.7 Write property test for simulation response completeness
  - **Property 59: Simulation response completeness**
  - **Validates: Requirements 20.4**

- [ ]* 9.8 Write property test for batch simulation
  - **Property 60: Batch simulation support**
  - **Validates: Requirements 20.5**

- [ ] 10. Checkpoint - Ensure all backend core tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement ML Fraud Detection Service (Python/FastAPI)
- [ ] 11.1 Set up FastAPI project structure
  - Create FastAPI application with proper folder structure
  - Set up Pydantic models for request/response validation
  - Configure CORS for backend integration
  - Add health check endpoint
  - _Requirements: 5.1, 12.1_

- [ ] 11.2 Implement feature engineering module
  - Create GeoDistanceCalculator for geo-anomaly detection
  - Implement behavioral feature extraction
  - Create merchant risk profiling
  - Implement amount deviation calculation
  - Add feature normalization
  - _Requirements: 6.1, 6.2, 7.4_

- [ ] 11.3 Implement Isolation Forest model
  - Load or train Isolation Forest model
  - Implement prediction method
  - Add model versioning
  - Cache model in memory
  - _Requirements: 5.4_

- [ ] 11.4 Implement XGBoost model
  - Load or train XGBoost model
  - Implement prediction method
  - Add feature importance extraction
  - _Requirements: 5.4_

- [ ] 11.5 Implement LSTM behavioral model
  - Create LSTM model architecture with TensorFlow/Keras
  - Implement sequence preparation (last 20 transactions)
  - Add sequence padding for users with < 20 transactions
  - Implement prediction method
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 11.6 Implement ensemble scoring
  - Create EnsembleScorer combining all three models
  - Implement weighted averaging or voting
  - Normalize final score to 0-100 range
  - _Requirements: 5.4_

- [ ] 11.7 Implement SHAP explainability
  - Integrate SHAP library
  - Create explainer for ensemble model
  - Generate feature importance weights
  - Normalize weights to sum to 1.0
  - Format explanations with descriptions
  - _Requirements: 5.2, 5.5_

- [ ] 11.8 Implement travel notice integration
  - Add travel notice consideration in geo-anomaly calculation
  - Reduce geo-distance weight when location matches active notice
  - _Requirements: 4.2, 6.3_

- [ ] 11.9 Create POST /score endpoint
  - Implement scoring endpoint with Pydantic validation
  - Add request timeout handling
  - Implement error handling with appropriate status codes
  - Add response time tracking
  - _Requirements: 5.1, 5.2, 5.3_

- [ ]* 11.10 Write property test for risk score range
  - **Property 18: ML risk score range**
  - **Validates: Requirements 5.1**

- [ ]* 11.11 Write property test for ML response structure
  - **Property 19: ML response structure completeness**
  - **Validates: Requirements 5.2, 5.3**

- [ ]* 11.12 Write property test for ensemble inclusion
  - **Property 20: Ensemble model inclusion**
  - **Validates: Requirements 5.4**

- [ ]* 11.13 Write property test for feature weight normalization
  - **Property 21: Feature weight normalization**
  - **Validates: Requirements 5.5**

- [ ]* 11.14 Write property test for geo-distance calculation
  - **Property 22: Geo-distance calculation**
  - **Validates: Requirements 6.1**

- [ ]* 11.15 Write property test for high geo-distance risk
  - **Property 23: High geo-distance increases risk**
  - **Validates: Requirements 6.2**

- [ ]* 11.16 Write property test for travel notice geo-anomaly reduction
  - **Property 24: Travel notice reduces geo-anomaly**
  - **Property 14: Travel notice reduces geo-anomaly risk**
  - **Validates: Requirements 4.2, 6.3**

- [ ]* 11.17 Write property test for geo-distance in explanations
  - **Property 25: Significant geo-distance in explanations**
  - **Validates: Requirements 6.5**

- [ ]* 11.18 Write property test for LSTM sequence analysis
  - **Property 26: LSTM sequence analysis**
  - **Validates: Requirements 7.1**

- [ ]* 11.19 Write property test for LSTM contribution
  - **Property 27: LSTM contribution to ensemble**
  - **Validates: Requirements 7.2**

- [ ]* 11.20 Write property test for LSTM sequence padding
  - **Property 28: LSTM sequence padding**
  - **Validates: Requirements 7.3**

- [ ]* 11.21 Write property test for LSTM feature inclusion
  - **Property 29: LSTM feature inclusion**
  - **Validates: Requirements 7.4**

- [ ]* 11.22 Write property test for LSTM features in explanations
  - **Property 30: LSTM features in explanations**
  - **Validates: Requirements 7.5**

- [ ] 12. Checkpoint - Ensure all ML service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement GuardianBot conversational AI service
- [ ] 13.1 Create Gemini API client
  - Implement GeminiClient using Google Generative AI SDK
  - Configure model: gemini-2.5-flash-preview-09-2025
  - Add timeout configuration (3 seconds)
  - Implement error handling and fallback responses
  - _Requirements: 2.2_

- [ ] 13.2 Implement ChatService
  - Create buildContext method (transactions, risk score, alerts)
  - Implement sanitizeInput method for sensitive data
  - Create composeSystemMessage with GuardianBot persona
  - Implement sendMessage method
  - Add conversation history management
  - _Requirements: 2.1, 2.2, 2.5_

- [ ] 13.3 Implement action parsing
  - Create parseAction method to extract JSON actions from responses
  - Validate action structure (action type, confidence)
  - Implement confidence threshold checking (0.90 for freeze)
  - _Requirements: 2.3, 2.4_

- [ ] 13.4 Create Chat controller
  - Implement POST /chat endpoint
  - Add JWT authentication
  - Integrate with ChatService
  - Return structured response with message and optional action
  - _Requirements: 2.1, 2.2, 2.3_

- [ ]* 13.5 Write property test for GuardianBot context initialization
  - **Property 5: GuardianBot context initialization**
  - **Validates: Requirements 2.1**

- [ ]* 13.6 Write property test for action structure
  - **Property 6: GuardianBot action structure**
  - **Validates: Requirements 2.3**

- [ ]* 13.7 Write property test for high-confidence confirmation
  - **Property 7: High-confidence action confirmation**
  - **Validates: Requirements 2.4**

- [ ]* 13.8 Write property test for sensitive data sanitization
  - **Property 8: Sensitive data sanitization**
  - **Validates: Requirements 2.5**

- [ ] 14. Implement security middleware and validation
- [ ] 14.1 Create input validation pipes
  - Implement global validation pipe with class-validator
  - Add whitelist and forbidNonWhitelisted options
  - Create custom validators for business rules
  - _Requirements: 14.1_

- [ ] 14.2 Implement SQL injection prevention
  - Ensure all queries use TypeORM parameterized queries
  - Add query validation
  - _Requirements: 14.2_

- [ ] 14.3 Implement Content Security Policy
  - Add helmet middleware with CSP configuration
  - Configure allowed sources for scripts, styles, images
  - Add X-Frame-Options, HSTS headers
  - _Requirements: 14.5_

- [ ] 14.4 Implement CORS configuration
  - Configure CORS with whitelist of allowed origins
  - Set credentials: true for cookie support
  - _Requirements: 12.1_

- [ ]* 14.5 Write property test for input validation
  - **Property 45: Input validation and sanitization**
  - **Validates: Requirements 14.1**

- [ ]* 14.6 Write property test for SQL injection prevention
  - **Property 46: SQL injection prevention**
  - **Validates: Requirements 14.2**

- [ ]* 14.7 Write property test for password hashing
  - **Property 47: Password hashing with salt**
  - **Validates: Requirements 14.3**

- [ ]* 14.8 Write property test for CSP header
  - **Property 48: CSP header presence**
  - **Validates: Requirements 14.5**

- [ ] 15. Implement caching strategy
- [ ] 15.1 Create CacheService
  - Implement Redis-based caching service
  - Add get, set, delete, and invalidate methods
  - Configure TTL values for different data types
  - _Requirements: 15.2, 15.3_

- [ ] 15.2 Implement cache interceptor
  - Create NestJS interceptor for automatic caching
  - Apply to frequently accessed endpoints (accounts, user profiles)
  - Implement cache key generation
  - _Requirements: 15.2_

- [ ] 15.3 Implement cache invalidation
  - Add cache invalidation on data updates
  - Implement pattern-based invalidation
  - _Requirements: 15.4_

- [ ]* 15.4 Write property test for cache-before-database pattern
  - **Property 50: Cache-before-database pattern**
  - **Validates: Requirements 15.2**

- [ ]* 15.5 Write property test for cache TTL
  - **Property 51: Cache TTL configuration**
  - **Validates: Requirements 15.3**

- [ ]* 15.6 Write property test for cache invalidation
  - **Property 52: Cache invalidation on update**
  - **Validates: Requirements 15.4**

- [ ] 16. Implement database transaction management
- [ ] 16.1 Add transaction decorators
  - Use TypeORM @Transaction decorator for multi-step operations
  - Implement rollback on errors
  - _Requirements: 15.1_

- [ ]* 16.2 Write property test for database atomicity
  - **Property 49: Database transaction atomicity**
  - **Validates: Requirements 15.1**

- [ ] 17. Checkpoint - Ensure all backend integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Implement Frontend project setup
- [ ] 18.1 Initialize React + TypeScript + Vite project
  - Create Vite project with React and TypeScript template
  - Configure tsconfig.json with strict mode
  - Set up folder structure (components/, pages/, services/, hooks/, utils/, styles/)
  - Install dependencies (React Query, React Router, Axios, Tailwind CSS)
  - _Requirements: 12.1, 12.5_

- [ ] 18.2 Configure Tailwind CSS
  - Install and configure Tailwind CSS
  - Create custom theme with banking color palette
  - Add responsive breakpoints
  - _Requirements: 11.1_

- [ ] 18.3 Set up React Query
  - Configure QueryClient with default options
  - Set up QueryClientProvider
  - Configure cache and refetch policies
  - _Requirements: 1.4_

- [ ] 18.4 Set up React Router
  - Configure routes for login, dashboard, transactions, chat
  - Implement protected route wrapper with authentication check
  - Add role-based route guards
  - _Requirements: 12.1_

- [ ] 18.5 Create API client service
  - Implement axios instance with base URL configuration
  - Add request interceptor for JWT token
  - Add response interceptor for error handling
  - Implement token refresh logic
  - _Requirements: 9.3_

- [ ] 19. Implement authentication UI
- [ ] 19.1 Create Login page
  - Implement login form with email and password fields
  - Add form validation
  - Implement login mutation with React Query
  - Store JWT tokens in memory and HTTP-only cookies
  - Redirect to dashboard on success
  - _Requirements: 9.1, 9.2_

- [ ] 19.2 Create authentication context
  - Implement AuthContext with user state
  - Create useAuth hook
  - Add login, logout, and token refresh methods
  - _Requirements: 9.1, 9.5_

- [ ] 19.3 Implement protected route component
  - Create ProtectedRoute wrapper
  - Check authentication status
  - Redirect to login if not authenticated
  - _Requirements: 9.1_

- [ ] 20. Implement Dashboard page
- [ ] 20.1 Create Dashboard layout
  - Implement responsive grid layout
  - Add account summary section
  - Add risk meter component
  - Add recent transactions section
  - Add fraud alerts section
  - _Requirements: 1.1, 1.2, 11.1_

- [ ] 20.2 Create RiskMeter component
  - Implement circular progress indicator
  - Color-code risk levels (green < 30, yellow 30-70, red > 70)
  - Display risk score prominently
  - _Requirements: 1.2_

- [ ] 20.3 Create TransactionList component
  - Implement transaction list with infinite scroll or pagination
  - Display transaction details (amount, merchant, date, status)
  - Add risk indicator badges
  - Highlight high-risk transactions (score > 70)
  - Implement real-time updates with React Query polling
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 20.4 Create TransactionDetailsPanel component
  - Implement slide-out panel for transaction details
  - Display full transaction information
  - Show ML explanations with SHAP weights
  - Format amounts with N$ currency
  - Display location on map (optional)
  - _Requirements: 1.3, 19.1, 19.4_

- [ ] 20.5 Create FraudAlertModal component
  - Implement modal for fraud alerts
  - Display alert severity and description
  - Add quick action buttons (freeze account, contact support)
  - _Requirements: 1.2_

- [ ]* 20.6 Write property test for transaction display completeness
  - **Property 1: Transaction display completeness**
  - **Validates: Requirements 1.1, 1.3**

- [ ]* 20.7 Write property test for high-risk highlighting
  - **Property 2: High-risk transaction highlighting**
  - **Validates: Requirements 1.2**

- [ ]* 20.8 Write property test for real-time updates
  - **Property 3: Real-time transaction updates**
  - **Validates: Requirements 1.4**

- [ ] 21. Implement Account Management UI
- [ ] 21.1 Create AccountOverview component
  - Display account number, type, balance
  - Show freeze status
  - Add freeze/unfreeze buttons
  - _Requirements: 3.1, 3.5_

- [ ] 21.2 Create FreezeAccountModal component
  - Implement confirmation modal for freeze action
  - Add reason input field
  - Call freeze API endpoint
  - Show success/error notifications
  - _Requirements: 3.1, 3.2_

- [ ] 21.3 Implement account filtering
  - Add account selector dropdown
  - Filter transactions by selected account
  - Update URL with account ID
  - _Requirements: 1.5_

- [ ]* 21.4 Write property test for freeze notification
  - **Property 11: Freeze notification delivery**
  - **Validates: Requirements 3.3**

- [ ] 22. Implement Travel Notice UI
- [ ] 22.1 Create TravelNoticeForm component
  - Implement form with destination, start date, end date fields
  - Add country multi-select
  - Validate date range (end >= start)
  - Submit travel notice to API
  - _Requirements: 4.1_

- [ ] 22.2 Create TravelNoticeList component
  - Display active and past travel notices
  - Show status indicators (active/expired)
  - Add edit/delete functionality
  - _Requirements: 4.4_

- [ ] 23. Implement GuardianBot Chat UI
- [ ] 23.1 Create ChatInterface component
  - Implement chat message list with auto-scroll
  - Create message bubbles for user and assistant
  - Add typing indicator
  - Display timestamps
  - _Requirements: 2.1, 2.2_

- [ ] 23.2 Create ChatInput component
  - Implement text input with send button
  - Add keyboard shortcut (Enter to send)
  - Disable input while waiting for response
  - _Requirements: 2.2_

- [ ] 23.3 Implement action confirmation
  - Create ActionConfirmationModal component
  - Display action details and confidence score
  - Require user confirmation for high-confidence actions
  - Execute action on confirmation
  - _Requirements: 2.3, 2.4_

- [ ] 23.4 Implement chat context initialization
  - Load recent transactions on chat open
  - Display current risk score in chat header
  - Show active alerts
  - _Requirements: 2.1_

- [ ] 24. Implement Transaction Simulation UI
- [ ] 24.1 Create SimulationForm component
  - Implement form with amount, merchant category, location fields
  - Add fraud indicator checkboxes
  - Submit simulation request
  - Display simulation results with risk score
  - _Requirements: 20.1, 20.4_

- [ ] 24.2 Create SimulationResults component
  - Display risk score with visual indicator
  - Show SHAP explanations
  - Highlight top risk factors
  - _Requirements: 20.4_

- [ ] 25. Implement utility functions and formatting
- [ ] 25.1 Create currency formatting utility
  - Implement formatCurrency function
  - Format with N$ prefix
  - Add comma separators for thousands
  - Ensure two decimal places
  - _Requirements: 19.1, 19.4_

- [ ] 25.2 Create date formatting utilities
  - Implement formatDate and formatDateTime functions
  - Use locale-aware formatting
  - _Requirements: 1.3_

- [ ] 25.3 Create risk level utilities
  - Implement getRiskLevel function (low/medium/high/critical)
  - Create getRiskColor function for visual indicators
  - _Requirements: 1.2_

- [ ]* 25.4 Write property test for currency formatting
  - **Property 54: Currency formatting consistency**
  - **Validates: Requirements 19.1, 19.4**

- [ ]* 25.5 Write property test for amount precision
  - **Property 55: Amount precision maintenance**
  - **Validates: Requirements 19.2, 19.5**

- [ ]* 25.6 Write property test for currency code in API
  - **Property 56: Currency code in API responses**
  - **Validates: Requirements 19.3**

- [ ] 26. Implement accessibility features
- [ ] 26.1 Add ARIA labels and roles
  - Add aria-label to all interactive elements
  - Implement proper heading hierarchy
  - Add role attributes where needed
  - _Requirements: 11.2, 11.5_

- [ ] 26.2 Implement keyboard navigation
  - Ensure all interactive elements are keyboard accessible
  - Add focus indicators
  - Implement logical tab order
  - Add keyboard shortcuts for common actions
  - _Requirements: 11.2_

- [ ] 26.3 Ensure color contrast compliance
  - Audit all text colors for 4.5:1 contrast ratio
  - Adjust colors as needed
  - Use tools like axe DevTools for validation
  - _Requirements: 11.3_

- [ ] 26.4 Add alt text to images
  - Add descriptive alt text to all images
  - Use empty alt for decorative images
  - _Requirements: 11.4_

- [ ] 26.5 Implement form accessibility
  - Associate labels with inputs
  - Add error announcements with aria-live
  - Implement field validation with clear messages
  - _Requirements: 11.5_

- [ ]* 26.6 Write property test for mobile responsive layout
  - **Property 40: Mobile responsive layout**
  - **Validates: Requirements 11.1**

- [ ]* 26.7 Write property test for keyboard navigation
  - **Property 41: Keyboard navigation**
  - **Validates: Requirements 11.2**

- [ ]* 26.8 Write property test for color contrast
  - **Property 42: Color contrast compliance**
  - **Validates: Requirements 11.3**

- [ ]* 26.9 Write property test for image alt text
  - **Property 43: Image alt text presence**
  - **Validates: Requirements 11.4**

- [ ]* 26.10 Write property test for form accessibility
  - **Property 44: Form accessibility**
  - **Validates: Requirements 11.5**

- [ ] 27. Implement error handling and notifications
- [ ] 27.1 Create ErrorBoundary component
  - Implement React error boundary
  - Display user-friendly error messages
  - Log errors to monitoring service
  - _Requirements: 12.1_

- [ ] 27.2 Create Toast notification system
  - Implement toast component for success/error messages
  - Add auto-dismiss functionality
  - Position toasts appropriately
  - _Requirements: 3.3_

- [ ] 27.3 Implement API error handling
  - Handle 401 (redirect to login)
  - Handle 403 (show permission error)
  - Handle 429 (show rate limit message with retry time)
  - Handle 500 (show generic error)
  - _Requirements: 10.2_

- [ ] 28. Checkpoint - Ensure all frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 29. Create Docker configurations
- [ ] 29.1 Create Dockerfile for frontend
  - Multi-stage build with Node.js and Nginx
  - Copy build artifacts to Nginx
  - Configure Nginx for SPA routing
  - _Requirements: 16.1_

- [ ] 29.2 Create Dockerfile for backend
  - Multi-stage build with Node.js
  - Install production dependencies only
  - Set up health check endpoint
  - _Requirements: 16.1_

- [ ] 29.3 Create Dockerfile for ML service
  - Use Python 3.11 base image
  - Install dependencies from requirements.txt
  - Copy model files
  - Set up health check endpoint
  - _Requirements: 16.1_

- [ ] 29.4 Create Docker Compose configuration
  - Define all services (frontend, backend, ml-service, postgres, redis)
  - Configure networks and volumes
  - Set environment variables
  - Add health checks and depends_on
  - _Requirements: 16.2_

- [ ] 29.5 Create .dockerignore files
  - Exclude node_modules, .git, test files
  - Optimize build context size
  - _Requirements: 16.1_

- [ ] 30. Create Kubernetes manifests
- [ ] 30.1 Create namespace and ConfigMap
  - Define fraud-prevention namespace
  - Create ConfigMap with non-sensitive configuration
  - _Requirements: 16.3_

- [ ] 30.2 Create Secrets manifest
  - Define Secret for JWT_SECRET, GEMINI_API_KEY, database passwords
  - Use base64 encoding
  - _Requirements: 16.3_

- [ ] 30.3 Create Deployment manifests
  - Create deployments for frontend, backend, ml-service
  - Configure replicas (3 for frontend/backend, 2 for ml-service)
  - Set resource requests and limits
  - Add liveness and readiness probes
  - _Requirements: 16.3, 16.4_

- [ ] 30.4 Create Service manifests
  - Create LoadBalancer service for frontend
  - Create ClusterIP services for backend and ml-service
  - Configure port mappings
  - _Requirements: 16.3_

- [ ] 30.5 Create PersistentVolumeClaim for ML models
  - Define PVC for model storage
  - Mount to ml-service pods
  - _Requirements: 16.3_

- [ ]* 30.6 Write property test for horizontal scaling
  - **Property 53: Horizontal scaling support**
  - **Validates: Requirements 16.4**

- [ ] 31. Create Terraform infrastructure code
- [ ] 31.1 Create VPC and networking resources
  - Define VPC with public and private subnets
  - Create Internet Gateway and NAT Gateway
  - Configure route tables
  - _Requirements: 16.5_

- [ ] 31.2 Create EKS cluster
  - Define EKS cluster resource
  - Configure node groups
  - Set up IAM roles and policies
  - _Requirements: 16.5_

- [ ] 31.3 Create RDS PostgreSQL instance
  - Define RDS instance with PostgreSQL 15
  - Configure multi-AZ deployment
  - Set up automated backups
  - Configure security groups
  - _Requirements: 16.5_

- [ ] 31.4 Create ElastiCache Redis cluster
  - Define Redis replication group
  - Configure multi-AZ with automatic failover
  - Enable encryption at rest and in transit
  - _Requirements: 16.5_

- [ ] 31.5 Create Application Load Balancer
  - Define ALB resource
  - Configure target groups
  - Set up health checks
  - Configure SSL/TLS certificates
  - _Requirements: 16.5_

- [ ] 31.6 Create security groups
  - Define security groups for ALB, EKS, RDS, Redis
  - Configure ingress and egress rules
  - Follow principle of least privilege
  - _Requirements: 16.5_

- [ ] 32. Create CI/CD pipeline
- [ ] 32.1 Create GitHub Actions workflow for tests
  - Set up test job with PostgreSQL and Redis services
  - Install dependencies for all services
  - Run unit tests for frontend, backend, ML service
  - Run property-based tests
  - Run integration tests
  - Upload coverage reports
  - _Requirements: 13.5_

- [ ] 32.2 Create security scanning job
  - Run npm audit for frontend and backend
  - Run safety check for Python dependencies
  - Run container security scan with Trivy
  - _Requirements: 14.1_

- [ ] 32.3 Create build and deploy job
  - Build Docker images for all services
  - Push images to container registry
  - Deploy to Kubernetes cluster
  - Run smoke tests after deployment
  - _Requirements: 16.3, 16.4_

- [ ] 32.4 Configure branch protection rules
  - Require passing tests before merge
  - Require code review
  - Prevent force pushes to main
  - _Requirements: 13.5_

- [ ] 33. Create monitoring and observability setup
- [ ] 33.1 Add Prometheus metrics endpoints
  - Add metrics endpoint to backend (/metrics)
  - Add metrics endpoint to ML service (/metrics)
  - Instrument key operations (transaction scoring, API requests)
  - _Requirements: 16.3_

- [ ] 33.2 Create Prometheus configuration
  - Define scrape configs for all services
  - Configure service discovery for Kubernetes pods
  - Set up alerting rules
  - _Requirements: 16.3_

- [ ] 33.3 Create Grafana dashboards
  - Create dashboard for transaction volume and risk scores
  - Create dashboard for ML service performance
  - Create dashboard for API response times
  - Create dashboard for fraud alerts
  - _Requirements: 16.3_

- [ ] 33.4 Set up logging infrastructure
  - Configure structured logging with Winston
  - Set up log aggregation (optional: ELK stack or CloudWatch)
  - Configure log retention policies
  - _Requirements: 8.5_

- [ ] 34. Create comprehensive README
- [ ] 34.1 Write executive summary
  - Explain modern fraud detection capabilities
  - Describe ML + AI integration
  - Highlight GuardianBot features
  - Explain N$ currency support
  - Describe relevance to Namibian banking challenges
  - _Requirements: 17.1_

- [ ] 34.2 Create architecture diagram
  - Create Mermaid or ASCII diagram
  - Show all system components
  - Illustrate data flow
  - _Requirements: 17.3_

- [ ] 34.3 Write "Why this matters to Namibian banks" section
  - Specifically name Standard Bank Namibia, Bank Windhoek, FNB Namibia, Nedbank Namibia, Letshego Financial Services
  - Explain benefits for each institution
  - Highlight fraud prevention ROI
  - _Requirements: 17.2_

- [ ] 34.4 Document features
  - List real-time fraud alerts
  - Describe transaction risk scoring
  - Explain conversational AI (GuardianBot)
  - Detail behavioral analytics
  - Highlight dashboard with N$ values
  - Explain explainable AI (SHAP)
  - Describe compliance & security features
  - _Requirements: 17.1, 18.2_

- [ ] 34.5 Document full tech stack
  - List frontend technologies
  - List backend technologies
  - List ML technologies
  - List infrastructure technologies
  - _Requirements: 17.4_

- [ ] 34.6 Write installation guide
  - Provide prerequisites
  - Document environment variable setup
  - Provide Docker Compose commands
  - Include troubleshooting tips
  - _Requirements: 17.5_

- [ ] 34.7 Add screenshots section
  - Add placeholder for dashboard screenshot
  - Add placeholder for GuardianBot chat screenshot
  - Add placeholder for transaction details screenshot
  - Add placeholder for risk meter screenshot
  - _Requirements: 17.1_

- [ ] 34.8 Write recruiter summary
  - Demonstrate understanding of financial regulation
  - Highlight enterprise-grade system design
  - Showcase modern ML and AI usage
  - Emphasize global best engineering practices
  - _Requirements: 18.1, 18.3, 18.5_

- [ ] 34.9 Add contact details
  - Include email: slyskenk@outlook.com
  - Add LinkedIn profile link
  - _Requirements: 18.4_

- [ ] 35. Create additional documentation
- [ ] 35.1 Create API documentation
  - Document all REST endpoints
  - Include request/response examples
  - Add authentication requirements
  - Document error codes
  - _Requirements: 12.1_

- [ ] 35.2 Create deployment guide
  - Document local development setup
  - Provide Docker Compose deployment steps
  - Document Kubernetes deployment process
  - Include environment configuration guide
  - _Requirements: 16.2, 16.3_

- [ ] 35.3 Create security documentation
  - Document OWASP Top 10 mitigations
  - Explain authentication and authorization
  - Document audit logging
  - Provide security best practices
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 35.4 Create ML model documentation
  - Document model architecture
  - Explain feature engineering
  - Document SHAP explanations
  - Provide model performance metrics
  - _Requirements: 5.2, 5.4_

- [ ]* 36. Write end-to-end tests
  - Test complete user flow: login → view transactions → freeze account
  - Test GuardianBot conversation flow
  - Test travel notice submission flow
  - Test transaction simulation flow
  - _Requirements: 13.3_

- [ ] 37. Final Checkpoint - Complete system integration test
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all services start correctly with Docker Compose
  - Test complete fraud detection workflow end-to-end
  - Verify all API endpoints are functional
  - Confirm frontend displays all features correctly
  - Validate GuardianBot responses
  - Test account freeze/unfreeze functionality
  - Verify travel notices affect fraud scoring
  - Confirm audit logs are created for all critical actions
  - Test rate limiting enforcement
  - Verify currency formatting (N$) throughout the system
  - Confirm accessibility compliance
  - Test mobile responsive layout
  - Verify security headers are present
  - Test error handling and recovery
