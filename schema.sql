CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
	item_id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
	product_name VARCHAR(75) NOT NULL,
	department_name VARCHAR(75) NOT NULL,
	price DECIMAL (10,2) NOT NULL,
	stock_qty INTEGER
)

SELECT * FROM products;

DROP TABLE products;

INSERT INTO products (product_name, department_name, price, stock_qty)
VALUES ("Fire Stick", "Electronics", 39.99, 62), ("Echo", "Electronics", 49.99, 50), ("Card Against Humanity", "Toy and Games", 25.00, 15), ("Jenga", "Toys and Games", 10.29, 22), ("Play-Doh", "Toys and Games", 7.99, 103), ("Instant Pot", "Home and Kitchen", 99.95, 40), ("Kuerig K55 Coffee Maker", "Home and Kitchen", 78.23, 50), ("Jimi Hendrix-Both Sides of the Sky", "Vinyl", 22.99, 15), ("Michael Jackson-Thriller", "Vinyl", 19.99, 10), ("David Bowie-The Rise and Fall of Ziggy Stardust", "Vinyl", 24.99, 12), ("Fleetwood Mac-Rumors", "Vinyl", 17.50, 8), ("Yoga Mat", "Sporting Goods", 17.29, 32), ("Water Bottle", "Sporting Goods", 16.50, 10), ("Volleyball", "Sporting Goods", 24.97, 20), ("Starbucks Ground Coffee", "Grocery", 9.99, 8), ("Crest Toothpaste", "Grocery", 4.84, 25.00), ("Old Spice Deodorant", "Grocery", 6.49, 11), ("Cliff Bars (qty 10)", "Grocery", 12.99, 20), ("White Cheddar Popcorn", "Grocery", 6.84, 15), ("Pistachios", "Grocery", 7.88, 9);

--isolates full line of info (replace item_id w/ user input)
SELECT * 
FROM products
WHERE item_id = 9;

--updates QTY of isolated line (replace item_id w/ user input)
UPDATE products
SET stock_qty = 10
WHERE item_id = 9;