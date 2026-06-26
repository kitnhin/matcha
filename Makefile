include backend/database/.env

# creates a database and a user to edit the db
initdb: 
	psql postgres -c "CREATE USER matcha_user WITH PASSWORD '$(DB_PASSWORD)';"
	psql postgres -c "CREATE DATABASE matcha;"
	psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE matcha TO matcha_user;"
	psql -d matcha -c "GRANT ALL ON SCHEMA public TO matcha_user;"
	psql -U matcha_user -h 127.0.0.1 -d matcha -f ./backend/database/setup.sql

dropdb:
	psql postgres -c "DROP DATABASE matcha;"
	psql postgres -c "DROP USER matcha_user;"

install:
	cd backend && python -m venv venv && venv/bin/pip install -r requirements.txt
	cd frontend && npm install

all: dropdb initdb