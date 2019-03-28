var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys");
// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password:keys.key1,
  database: "bamazon_db"
});




// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  console.log("connected as id " + connection.threadId);
  readProducts();
});
function readProducts() {
    console.log("Selecting all products...\n");
    connection.query("SELECT item_id,product_name,price,stock_quantity FROM products  ", function(err, res) {
      if (err) throw err;
      for(var i=0; i<res.length;i++){
        console.log("Item Id: "+res[i].item_id
                      +"|| Item: " +res[i].product_name
                      +"|| Price: "+res[i].price
                      +"||In Stock: "+res[i].stock_quantity
                    );
      }
      start();
    });
  }

  
function start() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
    inquirer
      .prompt([
          {
            type: "input",
            message: "\nEnter the ID of the item you want to purchase.",
            name: "itemId"
          },
          {
            type: "input",
            message: "How many units do you want to purchase?",
            name: "amount"
          }
      
      ])
      .then(function(answer) {
        for (var i = 0; i < res.length; i++) {

            chosenItem = res[i].product_name;
            if (res[i].item_id == answer.itemId && res[i].stock_quantity>=answer.amount) {
              chosenA= answer.amount;
              var newQuantity= res[i].stock_quantity - parseInt(answer.amount);
              console.log("You want to buy " + parseFloat(answer.amount)+" "+ chosenItem +" .Item Successfully placed in the cart");
              connection.query("UPDATE products SET ? WHERE ?",
                            [
                                        {
                                          stock_quantity : newQuantity
                                        },
                                        {
                                          item_id: parseInt(answer.itemId)
                                        }
                             ],
                              function() {
                                             readProducts();
                                          }
                            )
            }
                else if(res[i].item_id == answer.itemId && res[i].stock_quantity<answer.amount){
                console.log("Sorry we don't have enough "+chosenItem+". There are only "+res[i].stock_quantity+" available.");
                start(); 
           }

          }
      });
  });
};
