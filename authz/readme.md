
create table role(
    name NVARCHAR(100) NOT NULL PRIMARY KEY,
    access TEXT,
    ui TEXT
);

create table acl(
    userid NVARCHAR(100) NOT NULL PRIMARY KEY,
    roles TEXT 
);