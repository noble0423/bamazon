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
    inquirer    
        .prompt ({
            name: "view",
            type: "list",
            message: "Welcome to Bamazon. Please select a view from the following options:",
            choices: ["Customer View", "Manager View", "Supervisor View"]
        }).then(function(answer) {
            if (answer.view.toLowerCase() === "Customer View".toLowerCase()) {
                customerView();
                console.log("cust view selected");
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
            console.log("Selected Item ID: " + selectedItem.item_id);
            console.log("Selected Item Name: " + selectedItem.product_name);
            console.log("Selected QTY: " + response.qty);
            console.log("Checking availability...");
            // console.log("Quantity Avail: " + selectedItem.stock_qty);
            // if there is enough in stock, allow purchase
            if (response.qty <= selectedItem.stock_qty) {
                console.log("There is enough in stock to complete your order.");
            }
            else {
                console.log("Insufficient Quantity!");
                console.log("Please re-enter your order for " + selectedItem.product_name + " in a qty at our below: " + selectedItem.stock_qty);
                // ask user to re-enter qty under in stock amount?
                customerView();
            }
            

            
            
        });
    });
}