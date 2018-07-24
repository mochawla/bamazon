var mysql = require("mysql");
var Table = require('cli-table');
var inquirer = require('inquirer');

var connection = mysql.createConnection ({
    host: "localhost",   
    port: 3306,  
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    //console.log("connected to database");
    menuOptions();
});

function menuOptions() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
            name: 'options'

            
        }
    
    ])
    
    
    .then(answer => {
        switch(answer.options) {
            case "View Products for Sale":
                    showItems();
                    break;
            case "View Low Inventory":
                checkLowInventory();
                    break;
            case "Add to Inventory":
                showItems();
                setTimeout(addInventory, 500)
                    break;
            case "Add New Product":
              addProduct();
              break;

        }       
    });

}

function showItems() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
    
        var table = new Table({
            head: ['ID', 'Product', 'Department', 'Price', 'Quantity']
          , colWidths: [5, 50, 25, 10, 12]
        });

        for(var i = 0; i < res.length; i++) {

            table.push(
            [(JSON.parse(JSON.stringify(res))[i]["id"]), (JSON.parse(JSON.stringify(res))[i]["product_name"]),
            (JSON.parse(JSON.stringify(res))[i]["department_name"]), ("$ "+JSON.parse(JSON.stringify(res))[i]["price"]),
            (JSON.parse(JSON.stringify(res))[i]["stock_quantity"])
            ]);
        }
        
        console.log(table.toString());
        menuOptions(); 
    });
};

function checkLowInventory() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
    
        var table = new Table({
            head: ['ID', 'Product', 'Department', 'Price', 'Quantity'],
            colWidths: [5, 50, 25, 10, 12]
        });

        for(var i = 0; i < res.length; i++) {

            if(res[i].stock_quantity < 5) {
            table.push(
            [(JSON.parse(JSON.stringify(res))[i]["id"]), (JSON.parse(JSON.stringify(res))[i]["product_name"]),
            (JSON.parse(JSON.stringify(res))[i]["department_name"]), ("$ "+JSON.parse(JSON.stringify(res))[i]["price"]),
            (JSON.parse(JSON.stringify(res))[i]["stock_quantity"])
            ]);

            }
        }
        
        console.log(table.toString());
        menuOptions(); 

    });
};



function addInventory() {
    inquirer.prompt([
        {
            type: 'input',
            message: 'Select the id of the product you want to add stock to.',
            name: 'id'
            
        },

        {
            type: 'input',
            message: 'How many items do you want to add to this product?',
            name: 'quantity',
    
        }
    
    ])
    .then(answer => {
        // Use user feedback for... whatever!!
        var selectedQuantity = answer.quantity;
        var selectedId = answer.id;
        var currentQuantity;

        connection.query("SELECT stock_quantity FROM products WHERE id = ?", [selectedId], function(err, res){
          currentQuantity = res[0].stock_quantity;
            
          connection.query("UPDATE products SET ? WHERE id=?", [{stock_quantity: selectedQuantity + currentQuantity}, selectedId], function(err, res){
            if (err) throw err;  
            console.log("product inventory replenished");
            
            });  

            
        })

    })


}



function addProduct() {
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'input',
                message: 'Please enter product name.',
                name: 'product_name'   
            },

            {
                type: 'input',
                message: 'Please enter department name.',              
                name: 'department_name'   
            },

            {
                type: 'input',
                message: 'Please enter product price.',               
                name: 'price'   
            },

            {
                type: 'input',
                message: 'Please enter product quantity.',
                name: 'stock_quantity'               
            },

        ])

        .then(answer => {
            // Use user feedback for... whatever!!
            var selectedName = answer.product_name ;
            var selectedDepartment = answer.department_name ;
            var selectedPrice = answer.price ;
            var selectedQuantity = answer.stock_quantity;
    

              connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)",
              [selectedName, selectedDepartment, selectedPrice, selectedQuantity], function(err, res) {
                if (err) throw err;  
                console.log("product item added");
                menuOptions(); 
                });
                
            })
        })
    
}


