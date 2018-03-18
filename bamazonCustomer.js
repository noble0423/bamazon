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
    inquirer
        .prompt ([{
            name: "item_id",
            type: "input",
            message: "Please enter the Item_ID for the product that you would like to order."
        },
        {
            name: "qty",
            type: "input",
            message: "Please enter the quantity that you would like to order."
        }]).then(function(response) {
            console.log(response);
            // if (response.item_id > 0 && response.item_id < 21 ) {
            //     console.log("valid id entered");
            // }
        });
}