-- drop table users;
-- drop table albums;
-- create table users (id INT AUTO_INCREMENT PRIMARY KEY,
--                     username varchar(50) NOT NULL,
--                     password varchar(50) NOT NULL,
--                     UNIQUE (username));

-- create table albums (id INT AUTO_INCREMENT PRIMARY KEY,
--                     name varchar(50) NOT NULL,
--                     image varchar(500) NOT NULL,
--                     artist_id int NOT NULL,
--                     UNIQUE (name));
                    
-- create table songs (id INT AUTO_INCREMENT PRIMARY KEY,
--                     name varchar(50) NOT NULL,
--                     song varchar(500) NOT NULL,
--                     album_id int NOT NULL,
--                     UNIQUE (name));

                    
-- select * from users;
-- select * from albums;
-- select * from songs;
SELECT * FROM albums;
SELECT * FROM songs;
-- WHERE name LIKE '%?%';