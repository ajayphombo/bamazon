var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys");
var connection = mysql.createConnection({
  host: "localhost",

  // Your port
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password:keys.key1,
  database: "bamazon_db"
});


var total=0; //this will be used to display total price of chosen items


connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  readProducts();
});
function readProducts() {//welcome message and displays the products after retriving data from "products"
    console.log("Welcome to Bamazon!\n");
    connection.query("SELECT item_id,product_name,price,stock_quantity FROM products  ", function(err, res) {
      if (err) throw err;
      for(var i=0; i<res.length;i++){
        console.log( 
                      "Item Id: "+res[i].item_id
                      +"|| Item: " +res[i].product_name
                      +"|| Price:$ "+res[i].price
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
      .prompt([//prompts and storing user input values
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
        for (var i = 0; i < res.length; i++) {//validates the product and stores the total

            chosenItem = res[i].product_name;
            if (res[i].item_id === parseInt(answer.itemId) && res[i].stock_quantity>=parseInt(answer.amount)) {
              var subTotal= parseInt(answer.amount)*res[i].price;
              total= total+subTotal;
              var newQuantity= res[i].stock_quantity - parseInt(answer.amount);
              console.log("\nYou want to buy " + parseFloat(answer.amount)+" "+ chosenItem +" .Item Successfully placed in the cart. Your total so far is :$"+total);
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
                else if(res[i].item_id === parseInt(answer.itemId) && res[i].stock_quantity<parseInt(answer.amount)){
                console.log("\nSorry we don't have enough "+chosenItem+". There are only "+res[i].stock_quantity+" available.");
                start(); 
           }
           
           /*else if(res[i].item_id !== parseInt(answer.itemId)){
             console.log("\nThe item does not exist! Please Enter a valid ID");
             readProducts();
             break;

           }*///here i will try to put default case where if the ID does not exist it will print a message

          }
      });
  });
};
