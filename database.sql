CREATE DATABASE IF NOT EXISTS tabulatory_db;
USE tabulatory_db;

CREATE TABLE IF NOT EXISTS songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    bpm INT NOT NULL
);

INSERT INTO songs (id, title, file_path, bpm) VALUES
(1, 'Przykładowy Utwór 1', 'tabs/mojsong.gp', 120),
(2, 'Przykładowy Utwór 2', 'files/song2.gp4', 140);
