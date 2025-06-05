# Promotions in GameVault

## Overview
Promotions include deposit bonuses, a lottery, and a referral program, configurable via the admin panel.

## Deposit Bonuses
- **Logic**: Bonuses for deposits ≥100, 300, 500, or 1000 USDT (e.g., 10%, 15%, 20%, 25%).
- **Config**: Set via `AdminPromotions.jsx` (POST `/api/admin/promotions/bonuses`).
- **Storage**: `Promotion` model (type: 'deposit').
- **API**:
  - `POST /api/admin/promotions/bonuses`: Set bonus tiers (admin).
  - `GET /api/promotions/bonuses`: Get current bonuses.
- **Frontend**: Displayed in `Promotions.jsx`.

## Lottery
- **Logic**:
  - Deposits ≥100 USDT grant eligibility (tickets per 100 USDT set by admin, e.g., 2 or 10).
  - Ticket price set by admin (e.g., 2 USDT). Users buy tickets manually.
  - Weekly draw (Monday, 00:00), 50% ticket sales to prize pool (50%, 30%, 20% for 1–3 places).
- **Config**: Set via `AdminPromotions.jsx` (POST `/api/admin/promotions/lottery`).
- **Storage**: Settings in `Promotion` (type: 'lottery'), draws in `Lottery`.
- **Cron**: `lotteryCron.js` runs weekly.
- **API**:
  - `POST /api/admin/promotions/lottery`: Set ticketsPer100USDT, ticketPrice (admin).
  - `POST /api/promotions/lottery/buy`: Buy tickets.
  - `GET /api/promotions/lottery`: Get lottery, tickets, price.
  - `GET /api/promotions/lottery/history`: Get draw history.
- **Frontend**: `Promotions.jsx` shows tickets, buy button, history.

## Referral Program
- **Logic**:
  - Users get a unique referral code at registration.
  - Referrer earns a percentage (set by admin, e.g., 5%) of referred users' deposits.
- **Config**: Set via `AdminPromotions.jsx` (POST `/api/admin/promotions/referral`).
- **Storage**: `Referral` model, codes in `User`.
- **API**:
  - `POST /api/admin/promotions/referral`: Set percentage (admin).
  - `GET /api/promotions/referral`: Get code, stats.
- **Frontend**: `Promotions.jsx` shows code, earnings.

## Example
1. Admin sets: 10% bonus for 100 USDT, 2 tickets per 100 USDT, 2 USDT/ticket, 5% referral.
2. User deposits 300 USDT:
   - Gets 15% bonus (45 USDT).
   - Eligible for 6 tickets (2 per 100 USDT).
3. User buys 3 tickets for 6 USDT.
4. User refers another who deposits 100 USDT, earning 5 USDT (5%).
5. Lottery draw awards 50% of ticket sales to top 3.

## Scaling (2M users/month)
- **MongoDB**: Indexes on `Promotion.type`, `Lottery.drawDate`, `Referral.user`.
- **Redis**: Cache bonuses, lottery settings (TTL=10s).
- **Rate Limit**: 50 req/min for `/api/promotions/*`.
- **Cron**: Optimized for quick execution.