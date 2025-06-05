# Tournaments in GameVault

## Overview
Tournaments allow players to compete in games (poker, slots, roulette, dice) for a prize pool. Features include rebuy, knockout, auto-completion, and moderated chat. See `promotions.md` for related bonuses and lottery.

## Mechanics
1. **Creation**:
   - Admin creates via `CreateTournamentForm.jsx`.
   - Fields: name, description, gameType, entryFee, maxPlayers, startDate, endDate, prizes (e.g., [50, 30, 20]), rebuyLimit, knockoutBounty, initialPoints.
   - Stored in `Tournament` model.
2. **Joining**:
   - Players join via `/api/tournaments/join/:id`.
   - Entry fee deducted from balance.
   - Added to `participants` with `initialPoints` (default: 1000).
3. **Rebuy**:
   - Players with low score (<=10% of initialPoints) can rebuy up to `rebuyLimit` (default: 2).
   - Rebuy available until 50% of tournament duration.
   - Costs `entryFee`, resets score to `initialPoints`.
4. **Knockout**:
   - Players with 0 score are knocked out.
   - Knocking out a player awards `knockoutBounty` (e.g., $10).
   - 70% prize pool for top places, 30% for bounties.
5. **Gameplay**:
   - Players earn points via `/api/tournaments/addScore/:id`.
   - Points tracked in `participants.players.score`.
   - Knockout if score <= 0 and no rebuy available.
6. **Completion**:
   - Auto-completes at `endDate` via cron (every 5 min).
   - Manual completion via `/api/admin/tournaments/finish/:id`.
   - Players ranked by score.
   - Prizes distributed (70% for top, 30% for bounties).
7. **Chat**:
   - Real-time via `TournamentChat.jsx` (Socket.IO).
   - Messages filtered with `bad-words`.
   - Admins can delete messages or ban users (24h) via Socket.IO.

## API
- **POST /api/tournaments**: Create tournament (admin).
- **GET /api/tournaments**: List active tournaments.
- **POST /api/tournaments/join/:id**: Join tournament.
- **POST /api/tournaments/rebuy/:id**: Rebuy in tournament.
- **POST /api/tournaments/addScore/:id**: Add score.
- **POST /api/admin/tournaments/finish/:id**: Finish tournament (admin).
- **GET /api/tournaments/:id/messages**: Get chat messages.

## Frontend
- **CreateTournamentForm.jsx**: Admin form for tournaments.
- **TournamentChat.jsx**: Chat with admin moderation (delete, ban).
- **Leaderboard.jsx**: Displays player rankings.

## Example
1. Admin creates "Poker Cup" ($50 entry, prizes: [60%, 30%, 10%], 2 rebuys, $10 bounty).
2. Players A, B, C join, paying $50 each, starting with 1000 points.
3. A loses points, rebuys for $50, gets 1000 points.
4. B knocks out C, earns $10 bounty.
5. Tournament auto-ends:
   - A (2000 points) wins $63 (60% of $150 * 0.7).
   - B (1500 points) wins $31.5 (30%).
   - B also gets $10 for knockout.

## Limitations
- No multi-table tournaments.
- Chat bans are 24h only.

## Recommendations
- Add multi-table support.
- Allow customizable ban durations.
- Integrate with promotions (e.g., bonus entry via lottery).