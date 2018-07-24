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
    showItems();
  });

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

        buyItem();
    });
};


var finalCost = 0;

function buyItem() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'id',
            message: 'Type in the id number for the product you want to purchase.',
            validate: function(value) {       
                if (isNaN(value) === false) {
                  return true;
                }
                return false;
              }
        },

        {
            type: 'input',
            name: 'quantity',
            message: 'How many of this product do you wish to buy?',
            validate: function(value) {       
                if (isNaN(value) === false) {
                  return true;
                }
                return false;
              }
        }
    
    
    ])
    
    
    .then(answer => {
        // Use user feedback for... whatever!!
        var idSelected = answer.id;
        var quantitySelected = answer.quantity;
        connection.query("SELECT * FROM products WHERE id = ?", [idSelected], function(err, res){
            if (err) throw err;
            var stock_quantity = res[0].stock_quantity;
            if(stock_quantity < quantitySelected) {
                console.log("Insufficient Quantity! Please enter an amount equal to or less than the quantity listed for that product.")
                buyItem();

            } else{
                stock_quantity -= quantitySelected;

                var totalCost = quantitySelected * res[0].price;

                console.log("Your total cost for this product is $" + totalCost);
                
                finalCost += totalCost;
                console.log("Your final cost for all purchased products is $" + finalCost);

                connection.query("UPDATE products SET ? WHERE id=?", [{stock_quantity: stock_quantity}, idSelected], function(err, res){
                    if (err) throw err;  
              
                });

                inquirer.prompt([
                    {
                        type: 'confirm',
                        message: 'Would you like to add another product to your current purchase?',
                        name: 'yesOrNo',
                        default: true
                    }
                
                ])
                
                .then(answer => {
                    // Use user feedback for... whatever!!
                    
                        if(answer.yesOrNo) {
                            showItems();
                        
                        } else {
                        
                            console.log("Transaction complete.Thank you for your business.");
                            
                            
                        }
                    
                });



            }
        })
  
    });

   
    


}





