USE SWE;

DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
	uid INT (10) AUTO_INCREMENT NOT NULL,
	username VARCHAR (30) UNIQUE,
	password VARCHAR (60),
    fname VARCHAR (20),
    lname VARCHAR (10),
    gender CHAR,
    address VARCHAR(255),
    email VARCHAR(255),
    joinDate DATE,
    
    CONSTRAINT PK_uid PRIMARY KEY (uid),
    CONSTRAINT CHK_gender CHECK (gender IN ('M', 'F'))
);

DROP TABLE IF EXISTS Staffs;

CREATE TABLE Staffs (
	sid CHAR (6) NOT NULL,
    username VARCHAR (30) UNIQUE,
	password VARCHAR (60),
    fname VARCHAR (20),
    lname VARCHAR (10),
    gender CHAR,
    joinDate DATE,
    permission INT,
    
    CONSTRAINT PK_sid PRIMARY KEY (sid)
);

DROP TABLE IF EXISTS Items;

CREATE TABLE Items (
	sku INT (10) NOT NULL,
    size VARCHAR (2),
    color VARCHAR (10),
    name VARCHAR (50),
    description VARCHAR (255),
    imageUrl VARCHAR (255),
    category VARCHAR (30),    
    buyPrice DECIMAL (10, 2),
    sellPrice DECIMAL (10, 2),
    quantity INT (10),
    minStock INT (10),
    
    CONSTRAINT PK_sku PRIMARY KEY (sku)
);


DROP TABLE IF EXISTS Orders;
CREATE TABLE Sales (
    saleId INT (10) AUTO_INCREMENT NOT NULL,
    uid INT (10),
    totalAmount DECIMAL (10, 2),
    saleDate DATETIME,
    status VARCHAR (30),
    
    CONSTRAINT PK_saleId PRIMARY KEY (saleId),
    CONSTRAINT FK_uid FOREIGN KEY (uid) REFERENCES Users (uid)
);

-- Create a new OrderItems table
CREATE TABLE OrderItems (
    orderItemId INT (10) AUTO_INCREMENT NOT NULL,
    saleId INT (10),
    sku INT (10),
    quantity INT (10),
    price DECIMAL (10, 2),
    
    CONSTRAINT PK_orderItemId PRIMARY KEY (orderItemId),
    CONSTRAINT FK_saleId FOREIGN KEY (saleId) REFERENCES Sales (saleId),
    CONSTRAINT FK_sku FOREIGN KEY (sku) REFERENCES Items (sku)
);
