//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
require('dotenv').config();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongouser = process.env.MONGOUSER;
const mongopw = process.env.MONGOPW;
mongoose.connect(`mongodb+srv://${mongouser}:${mongopw}@atlascluster.mje0ows.mongodb.net/todolistDB`);
console.log("connected");


const itemsSchema = {
      name: String
}

const Item = mongoose.model("item",itemsSchema);


const item1 = new Item ({
    name: "Welcome to your todo list"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);

async function addItems() {
  try {
await Item.insertMany(defaultItems);
} catch (error) {
  console.error('Error:', error);
}}
// addItems();


app.get("/", function(req, res) {
  (async () => {
    const allItems = await Item.find({});
    if(allItems.length === 0){
      addItems();
      res.redirect("/");
    } else{
  res.render("list", {listTitle: "Today", newListItems: allItems});
 }
})();
});



app.get("/:customListName",function(req,res){
 
  const customListName = _.capitalize(req.params.customListName);
  const list = new List({
    name: customListName,
    items: defaultItems
  });
  (async () => {
    const allListItems = await List.findOne({name:customListName});
    if(!allListItems){
      list.save();
      res.redirect("/" + customListName);
    } else{
  res.render("list", {listTitle: allListItems.name, newListItems: allListItems.items});

 }
})();

  // list.save();
});


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
const item = new Item({
  name: itemName
});

if(listName === "Today") {
  item.save();
  res.redirect("/");
} else {
  (async () => {
    const foundList = await List.findOne({name:listName});
    console.log(foundList);
    foundList.items.push(item);
    console.log(foundList);
   foundList.save();
  res.redirect("/" + listName);
    })();
}
});


app.post("/delete", function(req,res){

  const listName = req.body.listName;
  const checkedItemId = req.body.checkbox;
console.log(listName);
  if (listName === "Today") {

  if(checkedItemId) {
    async function deleteItem() {
  try {
await Item.deleteOne({ _id: checkedItemId });
console.log("ddeleted");
} catch (error) {
  console.error('Error:', error);
}
}
deleteItem();
  }
  res.redirect("/");

  } else {

    if(checkedItemId) {
      async function deleteItem() {
    try {
      // const documentcheck = await List.findOne({"items._id": checkedItemId});
      // documentcheck.items.pull({_id: checkedItemId});
      // await documentcheck.save();
      // console.log(documentcheck);
      await List.updateOne({
        "items._id": checkedItemId
      },
      {
        $pull: {
          "items": {
            _id: checkedItemId
          }
        }
      })
 
    console.log("del 2");
  } catch (error) {
    console.error('Error:', error);
  }
  }
  deleteItem();
    }
    res.redirect("/" + listName);
  
  }
});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

//Export the Express API
module.exports = app;