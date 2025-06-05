# GameVault API Documentation

This document describes the API endpoints for the GameVault platform, a gaming system with slots, poker, roulette, dice, tournaments, promotions, and user management. All endpoints require authentication via a Bearer token unless specified otherwise.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <your_token>
```

## Error Handling
Errors return a JSON object with a `message` field:
```json
{
  "message": "Invalid credentials"
}
```

## Endpoints

### 1. Authentication

#### POST /auth/register
Register a new user.

**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "player1"
}
```

**Responses**:
- `201 Created`:
  ```json
  {
    "token": "jwt_token",
    "user": { "_id": "123", "email": "user@example.com", "username": "player1" }
  }
  ```
- `400 Bad Request`: If user exists or invalid data.

#### POST /auth/login
Log in an existing user.

**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Responses**:
- `200 OK`:
  ```json
  {
    "token": "jwt_token",
    "user": { "_id": "123", "email": "user@example.com", "username": "player1" }
  }
  ```
- `401 Unauthorized`: Invalid credentials.

---

### 2. Games

#### POST /games/play
Start a game (slots, poker, roulette, dice).

**Headers**:
```
Authorization: Bearer <token>
```

**Body**:
```json
{
  "gameType": "slots",
  "betAmount": 100,
  "txHash": "0x1234" // Optional, unique transaction hash
}
```

**Responses**:
- `200 OK`:
  ```json
  {
    "payout": 150,
    "result": "win",
    "balance": 1150
  }
  ```
- `400 Bad Request`: Insufficient funds, invalid settings, or duplicate txHash.
- `500 Internal Server Error`: Server error.

#### GET /games/settings/:gameType
Get game settings (e.g., RTP, volatility).

**Headers**:
```
Authorization: Bearer <token>
```

**Parameters**:
- `gameType`: `slots`, `poker`, `roulette`, or `dice`.

**Responses**:
- `200 OK`:
  ```json
  {
    "gameType": "slots",
    "rtp": 95,
    "volatility": "medium",
    "winProbability": 0.3,
    "maxPayoutMultiplier": 100
  }
  ```
- `404 Not Found`: Invalid game type.

#### GET /games/history/transactions
Get user transaction history (last 50).

**Headers**:
```
Authorization: Bearer <token>
```

**Responses**:
- `200 OK`:
  ```json
  [
    {
      "_id": "123",
      "user": "user_id",
      "amount": -100,
      "type": "bet",
      "txHash": "0x1234",
      "status": "completed",
      "createdAt": "2025-06-02T13:38:00Z"
    },
    {
      "_id": "124",
      "user": "user_id",
      "amount": 150,
      "type": "payout",
      "status": "completed",
      "createdAt": "2025-06-02T13:38:00Z"
    }
  ]
  ```
- `500 Internal Server Error`: Server error.

#### GET /games/history/games
Get user game history (last 50).

**Headers**:
```
Authorization: Bearer <token>
```

**Responses**:
- `200 OK`:
  ```json
  [
    {
      "_id": "123",
      "user": "user_id",
      "gameType": "slots",
      "betAmount": 100,
      "payout": 150,
      "result": "win",
      "createdAt": "2025-06-02T13:38:00Z"
    },
    {
      "_id": "124",
      "user": "user_id",
      "gameType": "slots",
      "betAmount": 100,
      "payout": 0,
      "result": "loss",
      "createdAt": "2025-06-02T13:37:00Z"
    }
  ]
  ```
- `500 Internal Server Error`: Server error.

---

### 3. Tournaments

#### GET /tournaments
Get all active tournaments.

**Headers**:
```
Authorization: Bearer <token>
```

**Responses**:
- `200 OK`:
  ```json
  [
    {
      "_id": "123",
      "name": "Weekly Slots",
      "status": "active",
      "entryFee": 50,
      "participants": [{ "player": "user_id", "score": 1000 }],
      "endDate": "2025-06-09T00:00:00Z"
    }
  ]
  ```

#### GET /tournaments/me
Get tournaments the user is participating in.

**Headers**:
```
Authorization: Bearer <token>
```

**Responses**:
- `200 OK`:
  ```json
  [
    {
      "_id": "123",
      "name": "Weekly Slots",
      "status": "active",
      "entryFee": 50,
      "participants": [{ "player": "user_id", "score": 1000 }]
    }
  ]
  ```

#### POST /tournaments/:id/join
Join a tournament.

**Headers**:
```
Authorization: Bearer <token>
```

**Parameters**:
- `id`: Tournament ID.

**Responses**:
- `200 OK`:
  ```json
  { "message": "Successfully Joined Tournament" }
  ```
- `400 Bad Request`: Already joined or tournament unavailable.

#### POST /tournaments/:id/score
Add score to a tournament.

**Headers**:
```
Authorization: Bearer <token>
```

**Parameters**:
- `id`: Tournament ID.

**Body**:
```json
{ "score": 500 }
```

**Responses**:
- `200 OK`:
  ```json
  { "message": "Score Added" }
  ```
- `400 Bad Request`: Not a participant or tournament not active.

#### POST /tournaments/:id/finish
Finish a tournament (admin only).

**Headers**:
```
Authorization: Bearer <token>
```

**Parameters**:
- `id`: Tournament ID.

**Responses**:
- `200 OK`:
  ```json
  { "message": "Tournament Finished" }
  ```
- `403 Forbidden`: Not an admin.
- `400 Bad Request`: Tournament not active.

#### GET /tournaments/:id/messages
Get tournament chat messages.

**Headers**:
```
Authorization: Bearer <token>
```

**Parameters**:
- `id`: Tournament ID.

**Responses**:
- `200 OK`:
  ```json
  [
    {
      "_id": "123",
      "user": { "_id": "user_id", "username": "player1" },
      "tournament": "tournament_id",
      "content": "Good luck!",
      "createdAt": "2025-06-02T13:38:00Z"
    }
  ]
  ```

#### POST /tournaments/:id/messages
Send a message to tournament chat.

**Headers**:
```
Authorization: Bearer <token>
```

**Parameters**:
- `id`: Tournament ID.

**Body**:
```json
{ "content": "Good luck!" }
```

**Responses**:
- `201 Created`:
  ```json
  {
    "_id": "123",
    "user": "user_id",
    "tournament": "tournament_id",
    "content": "Good luck!",
    "createdAt": "2025-06-02T13:38:00Z"
  }
  ```
- `403 Forbidden`: User is banned.

#### POST /tournaments/:id/ban
Ban a user from tournament chat (admin only).

**Headers**:
```
Authorization: Bearer <token>
```

**Parameters**:
- `id`: Tournament ID.

**Body**:
```json
{
  "userId": "user_id",
  "bannedUntil": "2025-06-03T00:00:00Z",
  "reason": "Inappropriate behavior"
}
```

**Responses**:
- `201 Created`:
  ```json
  {
    "_id": "123",
    "user": "user_id",
    "tournament": "tournament_id",
    "bannedUntil": "2025-06-03T00:00:00Z",
    "reason": "Inappropriate behavior"
  }
  ```
- `403 Forbidden`: Not an admin.

---

### 4. Deposits

#### POST /deposits
Create a deposit request.

**Headers**:
```
Authorization: Bearer <token>
```

**Body**:
```json
{
  "amount": 500,
  "txHash": "0x5678"
}
```

**Responses**:
- `200 OK`:
  ```json
  { "message": "Deposit Successful" }
  ```
- `400 Bad Request`: Invalid transaction or duplicate txHash.

---

### 5. Admin

#### GET /admin/game-settings
Get all game settings (admin only).

**Headers**:
```
Authorization: Bearer <token>
```

**Responses**:
- `200 OK`:
  ```json
  [
    {
      "gameType": "slots",
      "rtp": 95,
      "volatility": "medium",
      "winProbability": 0.3,
      "maxPayoutMultiplier": 100
    },
    {
      "gameType": "poker",
      "rtp": 97,
      "volatility": "low",
      "winProbability": 0.4,
      "maxPayoutMultiplier": 50
    }
  ]
  ```
- `403 Forbidden`: Not an admin.

#### PUT /admin/game-settings/:gameType
Update game settings (admin only).

**Headers**:
```
Authorization: Bearer <token>
```

**Parameters**:
- `gameType`: `slots`, `poker`, `roulette`, or `dice`.

**Body**:
```json
{
  "rtp": 95,
  "winProbability": 0.3,
  "volatility": "medium",
  "maxPayoutMultiplier": 100
}
```

**Responses**:
- `200 OK`:
  ```json
  {
    "gameType": "slots",
    "rtp": 95,
    "volatility": "medium",
    "winProbability": 0.3,
    "maxPayoutMultiplier": 100
  }
  ```
- `400 Bad Request`: Invalid data.
- `403 Forbidden`: Not an admin.
- `404 Not Found`: Game type not found.

---

### 6. Promotions

#### GET /promotions
Get active promotions.

**Headers**:
```
Authorization: Bearer <token>
```

**Responses**:
- `200 OK`:
  ```json
  [
    {
      "_id": "123",
      "amount": 100,
      "bonusPercentage": 50,
      "lotteryTickets": 5
    }
  ]
  ```

#### POST /promotions (Admin only)
Update promotions.

**Headers**:
```
Authorization: Bearer <token>
```

**Body**:
```json
{
  "bonuses": [
    { "amount": 100, "bonusPercentage": 50, "lotteryTickets": 5 },
    { "amount": 500, "bonusPercentage": 100, "lotteryTickets": 20 }
  ],
  "lottery": {
    "ticketPrice": 10,
    "maxTickets": 1000,
    "ticketsPer100USDT": 2
  },
  "referralPercentage": 5
}
```

**Responses**:
- `200 OK`:
  ```json
  { "message": "Bonuses Updated" }
  ```
- `403 Forbidden`: Not an admin.

---

### Notes
- **Localization**: All error and success messages support multiple languages (en, ru, uk, hi, zh, tg, uz). The response `message` field is translated based on the `Accept-Language` header or default language (en).
- **Rate Limiting**: Applied to all endpoints (100 requests per 15 minutes).
- **WebSocket**: Real-time tournament chat is available via `/socket.io/`. Connect with the same Bearer token.
- **Redis**: Game settings are cached for performance. Updates clear the cache.