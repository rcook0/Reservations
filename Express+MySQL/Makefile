.PHONY: up down logs rebuild prisma-migrate prisma-seed sequelize-migrate sequelize-seed

up:
	docker-compose up -d --build

down:
	docker-compose down

logs:
	docker-compose logs -f

rebuild:
	docker-compose up --build -d

prisma-migrate:
	docker-compose exec app sh -lc "npm run db:generate:prisma && npm run db:migrate:prisma"

prisma-seed:
	docker-compose exec app sh -lc "npm run db:seed:prisma"

sequelize-migrate:
	docker-compose exec app sh -lc "npm run db:migrate:sequelize"

sequelize-seed:
	docker-compose exec app sh -lc "npm run db:seed:sequelize"
