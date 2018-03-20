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
            if (answer.view === "Customer View") {
                customerView();
            }
            else if (answer.view === "Manager View") {
                managerView();
            }
            else {
                console.log("Sorry, this view is currently under construction.");
            }
        })
};

function customerView() {
    inquirer.prompt([
        {
            name: "placeOrder",
            type: "list",
            choices: ["Place an Order", "Exit\n"],
            message: "\n----------------------CUSTOMER VIEW----------------------\nWould you like to place an order with Bamazon? Select [Place an Order] to view available products for sale, or [Exit] to exit."
        }
    ]).then(function(res) {
        if (res.placeOrder === "Place an Order") {
            placeOrder();
        }
        else {
            start();
        }
    })
};

function placeOrder() {
    // query the database for all items being sold
    connection.query("SELECT * FROM products", function(err, results) {
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
            var cartTotal = (selectedItem.price * response.qty).toFixed(2);
            console.log("\n//////////////////////////////////////////////////////////////");
            console.log("           ORDER REVIEW (please review your order):");
            console.log("Item ID: " + selectedItem.item_id);
            console.log("Item Name: " + selectedItem.product_name);
            console.log("Item price (each): $" + selectedItem.price.toFixed(2));
            console.log("QTY: " + response.qty);
            console.log("Cart Total: $" + cartTotal);
            console.log("//////////////////////////////////////////////////////////////");
            console.log("Checking availability...");

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
                        // Adjust inventory level accordingly
                        var updatedQty = parseInt(selectedItem.stock_qty) - parseInt(response.qty);
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
                                console.log("\n==============================================================");
                                console.log("   Order Completed. Thank you for Shopping with Bamazon!");
                                console.log("==============================================================");
                                customerView();
                            }
                        )
                    }
                    else {
                        console.log("Order has been Cancelled");
                        customerView();
                    }
                })
            }
            else {
                console.log("Insufficient Quantity Available!");
                console.log("Please re-enter your order for " + selectedItem.product_name + " in a qty at or below: " + selectedItem.stock_qty);
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
            message: "\n----------------------MANAGER VIEW----------------------\nPlease select one of the following menu options:",
            choices: ["Products for Sale", "Low Inventory", "Add Stock to Existing Inventory", "Add New Product", "Exit"]
        }
    ]).then(function(data) {
        console.log("---" + data.menu + " Menu---");
        // If "Products for Sale", run availForSale function
        if (data.menu === "Products for Sale") {
            availForSale();
        }
        // If "Low Inventory", run lowInventory function
        if (data.menu === "Low Inventory") {
            lowInventory();
        }
        // If "Add Stock to Existing Inventory", run addToExistingInv function
        if (data.menu === "Add Stock to Existing Inventory") {
            addToExistingInv();
        }
        // If "Add New Product", run addNewProduct function
        if (data.menu === "Add New Product") {
            addNewProduct();
        }
        // if exit, exit (run start function);
        if (data.menu === "Exit") {
            start();
        }
    })
};

// Display info for all products for sale INCL (item_id, product_name, price, stock_qty)
function availForSale() {
    connection.query("SELECT item_id, product_name, price, stock_qty FROM products", function(err, results) {
        if (err) throw err;
        console.log("**************************************************************");
        console.log("--------------------------------------------------------------");
        for (var i = 0; i < results.length; i++) { 
            console.log("Item ID: " + results[i].item_id);
            console.log("Product Name: " + results[i].product_name);
            console.log("Price: " + results[i].price.toFixed(2));
            console.log("Current Stock: " + results[i].stock_qty);
            console.log("--------------------------------------------------------------");
        }
        console.log("\n**************************************************************");
        console.log("               END OF AVAILABLE PRODUCTS LIST");
        console.log("**************************************************************");
        managerView(); 
    })
};

// If (stock_qty < 5)...display list of low inventory items (item_id, product_name, price, stock_qty)
function lowInventory() {
    connection.query("SELECT item_id, product_name, price, stock_qty FROM products", function(err, results) {
        if (err) throw err;
        console.log("**************************************************************");
        console.log("--------------------------------------------------------------");
        for (var i = 0; i < results.length; i++) {
            if (results[i].stock_qty < 5) {
                console.log("Item ID: " + results[i].item_id);
                console.log("Product Name: " + results[i].product_name);
                console.log("Price: " + results[i].price.toFixed(2));
                console.log("Current Stock: " + results[i].stock_qty);
                console.log("--------------------------------------------------------------");
            }
        }
        console.log("**************************************************************");
        console.log("                 END OF LOW INVENTORY LIST");
        console.log("**************************************************************");
        console.log("All items that are not listed are adequately stocked.");
        managerView();
    })
};

// Prompt avail products (similar to cust view), enter qty to add (similar to cust view), and update qty on that item
function addToExistingInv() {
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "currentInventory",
                type: "list",
                choices: function() {
                    var currentInvArr = [];
                    for (var i = 0; i < results.length; i++) {
                        currentInvArr.push(results[i].product_name);
                    }
                    return currentInvArr;
                },
                message: "Please select Inventory Item to add quantity to."
            },
            {
                name: "addQTY",
                type: "input",
                message: "Enter QTY to add to inventory."
            }
        ]).then(function(resp) {
            var selectedInvItem;
            for (var i = 0; i < results.length; i++) {
                if (results[i].product_name === resp.currentInventory) {
                    selectedInvItem = results[i];

                    // variable for new stock amount
                    var newQty = parseInt(selectedInvItem.stock_qty) + parseInt(resp.addQTY);

                    console.log("\n###############################################################");
                    console.log("Product Name: " + selectedInvItem.product_name);
                    console.log("Item ID:" + selectedInvItem.item_id);
                    console.log("Previous Stock QTY: " + selectedInvItem.stock_qty);
                    console.log("QTY to add to Existing Inventory: " + resp.addQTY);
                    console.log("Updated Inventory Total: " + newQty);
                    console.log("###############################################################");
                    
                    inquirer.prompt([
                        {
                           name: "confirmStockUpdate",
                           type: "list",
                           message: "Are you sure you want to update inventory accordingly?",
                           choices: ["Yes", "No"] 
                        }
                    ]).then(function(ans) {
                        if (ans.confirmStockUpdate === "Yes") {
                            console.log(newQty);
                            connection.query(
                                "UPDATE products SET ? WHERE ?", 
                                [
                                    {
                                        stock_qty: newQty
                                    },
                                    {
                                        item_id: selectedInvItem.item_id
                                    }
                                ],
                                function(err) {
                                    if (err) throw err;
                                    console.log("\n==============================================================");
                                    console.log("               INVENTORY UPDATE COMPLETED");
                                    console.log("==============================================================");
                                    managerView();
                                }
                            )
                        }
                        else {
                            console.log("Inventory Adjustment Operation Cancelled");
                            managerView();
                        }
                    })
                }
            }
        });
    });
};

// Add new items to inventory: INSERT item_id, product_name, department_name, price, stock_qty). 
function addNewProduct() {
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "newProd",
                type: "input",
                message: "Input Product Name to add to Inventory:"
            },
            {
                name: "dept",
                type: "input",
                message: "Input Department Name."
            },
            {
                name: "price",
                type: "input",
                message: "Input Selling Price."
            },
            {
                name: "stock",
                type: "input",
                message: "Input the Initial Stock Quantity."
            }
        ]).then(function(userInput) {

            console.log("\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            console.log("New Product to Add to Inventory: " + userInput.newProd);
            console.log("Adding to Dept: " + userInput.dept);
            console.log("Selling Price: " + userInput.price);
            console.log("Initial Stock Quantity of: " + userInput.stock);
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");


            // for (var i = 0; i < results.length; i++) {
            //     if (results[i].product_name.toLowerCase() === userInput.newProd.toLowerCase()) {
            //         console.log("\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            //         console.log("      'ADD NEW INVENTORY PRODUCT' OPERATION CANCELLED.");
            //         console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            //         console.log("Cannot add this item -- it is already in the Inventory System.");
            //         managerView();
            //     }
            // }

            connection.query(
                "INSERT INTO products SET ?, ?, ?, ?",
                [
                    {
                        product_name: userInput.newProd
                    },
                    {
                        department_name: userInput.dept
                    },
                    {
                        price: userInput.price
                    },
                    {
                        stock_qty: userInput.stock
                    }
                ],
                function(err) {
                    if (err) throw err;
                    console.log("\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                    console.log("              NEW PRODUCT INFO ADDED TO INVENTORY");
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                    managerView();
                }
            )
        });
    })
}

// prompt to confirm that new product should be added
//     inquirer.prompt([
//         {
//             name: "confirmAdd",
//             type: "list",
//             message: "Are you sure you want to add New Product Details to Inventory?",
//             choices: ["Yes", "No"]
//         }
//     ]).then(function(userSelection) {
//         if (userSelection.confirmAdd === "Yes") {
//             console.log("yes");
//         }
//         else {
//             console.log("Add New Product Operation Cancelled");
//         }
//     })
// }