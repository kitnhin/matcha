CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    gender TEXT,
    sexual_preference TEXT,
    biography TEXT,
    fame INT DEFAULT 0,
    latitude FLOAT,
    longitude FLOAT,
    location TEXT,
    last_seen TIMESTAMP,
    is_online BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_complete BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    profile_pic TEXT
);

CREATE TABLE IF NOT EXISTS tags (
    row SERIAL PRIMARY KEY,
    user_id INT,
    tag TEXT
);

CREATE TABLE IF NOT EXISTS pics (
    row SERIAL PRIMARY KEY,
    user_id INT,
    pic TEXT
);