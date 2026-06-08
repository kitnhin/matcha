include backend/database/.env

# creates a database and a user to edit the db
initdb: 
	psql postgres -c "CREATE USER matcha_user WITH PASSWORD '$(DB_PASSWORD)';"
	psql postgres -c "CREATE DATABASE matcha;"
	psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE matcha TO matcha_user;"
	psql -d matcha -c "GRANT ALL ON SCHEMA public TO matcha_user;"
	psql -U matcha_user -d matcha -f ./backend/database/setup.sql

dropdb:
	psql postgres -c "DROP DATABASE matcha;"
	psql postgres -c "DROP USER matcha_user;"

addv:
	psql -U matcha_user -d matcha -c \
	"INSERT INTO users (email, username, first_name, last_name, password, is_verified) \
	VALUES ('ethanlimck@gmail.com', 'kit', 'L', 'K', \
	'$$(python -c "import bcrypt; print(bcrypt.hashpw(b\"123\", bcrypt.gensalt()).decode())")', \
	TRUE);"

all: dropdb initdb