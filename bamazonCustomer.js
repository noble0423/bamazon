var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon_db"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

function start() {
    inquirer.prompt ([
        {
            name: "view",
            type: "list",
            message: "Welcome to Bamazon. Please select a view from the following options:",
            choices: ["Customer View", "Manager View", "Supervisor View"]
        }
    ]).then(function(answer) {
            if (answer.view.toLowerCase() === "Customer View".toLowerCase()) {
                customerView();
                console.log("cust view selected");
            }
            else if (answer.view === "Manager View") {
                managerView();
                console.log("Mgr View Selected");
            }
            else {
                console.log("Sorry, this view is currently under construction.");
            }
        })
};

function customerView() {
    // query the database for all items being sold
    connection.query("SELECT * FROM products", function(err, results) {
        // console.log(results);
        if (err) throw err;
        // once you have the items, prompt the user for which they'd like to buy
        inquirer.prompt([
            {
                name: "availProd",
                type: "list",
                choices: function() {
                    var availProdArr = [];
                    for (var i = 0; i < results.length; i++) {
                        availProdArr.push(results[i].product_name);
                    }
                    return availProdArr;
                },    
                message: "Please select item."   
            },
            {
                name: "qty",
                type: "input",
                message: "Please enter the quantity that you would like to order."
            }
        ]).then(function(response) {
            // get the information RE the selected item and qty
            var selectedItem;
            for (var i = 0; i < results.length; i++) {
                if (results[i].product_name === response.availProd) {
                    selectedItem = results[i];
                }
            }
            var cartTotal = selectedItem.price * response.qty;
            console.log("//////////////////////////////////////////////////////////////");
            console.log("ORDER REVIEW (please review your order):");
            console.log("Item ID: " + selectedItem.item_id);
            console.log("Item Name: " + selectedItem.product_name);
            console.log("Item price (each): $" + selectedItem.price);
            console.log("QTY: " + response.qty);
            console.log("Cart Total: $" + cartTotal);
            console.log("//////////////////////////////////////////////////////////////");
            console.log("Checking availability...");
            // console.log("Quantity Avail: " + selectedItem.stock_qty);
            // if there is enough in stock, allow purchase
            if (response.qty <= selectedItem.stock_qty) {
                console.log("There is enough in stock to complete your order.");
                inquirer.prompt([
                    {
                        name: "placeOrder",
                        type: "list",
                        message: "Would you like to place your order?",
                        choices: ["Yes", "No"]
                    }
                ]).then(function(answer) {
                    if (answer.placeOrder === "Yes") {
                        // Adjust inventory level accordingly, add total cost to the line item.
                        var updatedQty = (selectedItem.stock_qty - response.qty);
                        // console.log(updatedQty);
                        connection.query(
                            "UPDATE products SET ? WHERE ?",
                            [
                                {
                                    stock_qty: updatedQty
                                },
                                {
                                   item_id: selectedItem.item_id
                                }
                            ],
                            function(err) {
                                if (err) throw err;
                                console.log("==============================================================");
                                console.log("Order Completed. Thank you for Shopping with Bamazon!");
                                console.log("==============================================================");
                                customerView();
                            }
                        )
                    }
                    else {
                        console.log("order cancelled");
                        customerView();
                    }
                })
            }
            else {
                console.log("Insufficient Quantity Available!");
                console.log("Please re-enter your order for " + selectedItem.product_name + " in a qty at our below: " + selectedItem.stock_qty);
                // ask user to re-enter qty under in stock amount?
                customerView();
            }
        });
    });
};

function managerView() {
    inquirer.prompt ([
        {
            name: "menu",
            type: "list",
            message: "Please select one of the following menu options:",
            choices: ["Products for Sale", "Low Inventory", "Add Stock to Existing Inventory", "Add New Product"]
        }
    ]).then(function(data) {
        console.log("Menu selected: " + data.menu);
        // if (data.menu === "Products for Sale")...display table of products for sale INCL (item_id, product_name, price, stock_qty)
        // if (data.menu === "Low Inventory")...If (stock_qty < 5)...(item_id, product_name, price, stock_qty)
        // if (data.menu === "Add Stock to Existing Inventory")...prompt avail products (similar to cust view), enter qty to add (similar to cust view), and update qty on that item
        // if (data.menu === "Add New Product")...INSERT item_id, product_name, department_name, price, stock_qty). 
    })
};