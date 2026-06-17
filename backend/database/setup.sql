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
    profile_pic TEXT,
    age INT,
    last_seen TIMESTAMP,
    is_online BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_complete BOOLEAN DEFAULT FALSE,
    verification_token TEXT
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

CREATE TABLE IF NOT EXISTS likes (
    row SERIAL PRIMARY KEY,
    liker_id INT,
    liked_id INT,
    UNIQUE (liker_id, liked_id)
);

CREATE TABLE IF NOT EXISTS views (
    row SERIAL PRIMARY KEY,
    viewer_id INT,
    viewed_id INT,
    UNIQUE (viewer_id, viewed_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() --auto put time when insert
);

-- Separated tags and pics into own tables cuz imagine ltr need get all users wif certain tag,
-- if use TEXT[] inside users table, gonna be quite diff to find all users wif that tag
-- gonna be diff to edit the tags oso if tags r deleted or modified (extract, join etc)
