# Deployment Guide

## Requirements

- VPS with Alpine Linux
- Docker + Docker Compose installed

## Steps

### 1. Install Docker on Alpine

```sh
apk add docker docker-compose
rc-update add docker default
service docker start
```

### 2. Clone your repo on VPS

```sh
git clone https://github.com/yourusername/resort.git
cd resort
```

### 3. Setup environment

```sh
cp .env.production .env
# edit .env with your values
nano .env
```

### 4. Build and run

```sh
docker-compose up -d --build
```

### 5. Run migrations

```sh
docker-compose exec backend npx prisma migrate deploy
```

### 6. Seed database (optional)

```sh
docker-compose exec backend npm run seed
```

## Useful commands

```sh
# view logs
docker-compose logs -f

# restart services
docker-compose restart

# stop all
docker-compose down

# rebuild after code changes
docker-compose up -d --build
```
