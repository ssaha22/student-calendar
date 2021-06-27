CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    section TEXT,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (user_id) REFERENCES users ON DELETE CASCADE
);

CREATE TABLE course_times (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    day TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    google_calendar_event_id TEXT,
    FOREIGN KEY (course_id) REFERENCES courses ON DELETE CASCADE
);

CREATE TABLE links (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses ON DELETE CASCADE
);

CREATE TABLE additional_sections (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    section TEXT,
    FOREIGN KEY (course_id) REFERENCES courses ON DELETE CASCADE
);

CREATE TABLE additional_section_times (
    id SERIAL PRIMARY KEY,
    section_id INTEGER NOT NULL,
    day TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    google_calendar_event_id TEXT,
    FOREIGN KEY (section_id) REFERENCES additional_sections ON DELETE CASCADE
);

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    due_time TIME, 
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (course_id) REFERENCES courses ON DELETE CASCADE
);

CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    FOREIGN KEY (course_id) REFERENCES courses ON DELETE CASCADE
);

CREATE TABLE google_api_info (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    refresh_token TEXT NOT NULL,
    calendar_id TEXT,
    time_zone TEXT,
    FOREIGN KEY (user_id) REFERENCES users ON DELETE CASCADE
);
