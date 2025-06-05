# Deployment Guide

## Local Deployment
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/gamevault.git
   cd gamevault
   ```
2. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   Edit `.env` files with your credentials (MongoDB, AWS, Redis, etc.).
3. Start services:
   ```bash
   docker-compose up --build
   ```
4. Access the app:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - Grafana: `http://localhost:3000` (admin/admin)
   - Prometheus: `http://localhost:9090`

## Production Deployment (AWS)
1. **Set up MongoDB Atlas**:
   - Create a cluster and enable sharding for `GameHistory` and `Transaction`.
   - Update `MONGODB_URI` in `.env`.
2. **Deploy Backend**:
   - Use AWS ECS with Application Load Balancer (ALB).
   - Configure 3 replicas for Node.js backend.
   - Set up Redis Cluster for `socket.io` and table states.
3. **Deploy Frontend**:
   - Build and host on S3 with CloudFront.
   - Run:
     ```bash
     cd frontend
     npm run build
     aws s3 sync dist/ s3://gamevault-frontend
     ```
4. **Monitoring**:
   - Configure Grafana dashboards for Prometheus metrics.
   - Set up PagerDuty alerts for critical metrics (e.g., CPU > 80%).
5. **Backup and Restore**:
   - Schedule `backup.sh` with AWS Lambda.
   - Use `restore.sh` for recovery from S3.
6. **CI/CD**:
   - Use GitHub Actions (`.github/workflows/deploy.yml`).
   - Example:
     ```yaml
     name: Deploy
     on:
       push:
         branches: [main]
     jobs:
       deploy:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v3
           - name: Deploy to AWS
             run: |
               aws ecs update-service --cluster gamevault --service backend --force-new-deployment
     ```

## Scaling
- **Backend**: Increase ECS replicas based on load.
- **MongoDB**: Add shards for `GameHistory` and `Transaction`.
- **Redis**: Use Redis Cluster for high availability.
- **Socket.io**: Use Redis adapter for WebSocket scaling.

## Fault Tolerance
- Handle Redis/MongoDB failures with retries in `server.js`.
- Implement player reconnection in `PokerTable.jsx` (5-minute timeout).