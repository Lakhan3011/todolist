// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-lucifer:lucifer%401234@cluster0.z7doz.mongodb.net/todolistDB")

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({
  name: "Welcome to the todoList"
});

const item2 = new Item({
  name: "Click + to add new item in the list"
});

const item3 = new Item({
  name: "<-- press this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems , function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Insert documents successfully into DB");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems });
    }
  });

});


app.get("/:customListName" , function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // Create New List
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        // Display List
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items });
      }
    }
  });
});

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: newItem
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId , function(err){
      if(!err){
        console.log("Successfully deleted checked item");
      }
      res.redirect("/");
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}



app.listen(port , function() {
  console.log("Server started successfully !!");
});
