const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();
let items = ["Buy Food"];
let workItems = [];



main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb+srv://dhru_3101:Dhrumil3101@cluster0.ffefbz1.mongodb.net/todolistDB");
}

const itemsSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const item1 = new Item({
  name: "Welcome to your ToDo List!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems);

app.get("/", function (req, res) {
  Item.find({})
    .then((data) => {
      if (data.length === 0) {
        Item.insertMany(defaultItems)
          .then(() =>
            console.log("Successfully saved all the defaults items in DB.")
          )
          .catch((err) => console.log(err));
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: data });
      }
    })
    .catch((err) => console.log(err));
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch((err) => console.log(err));
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(() => res.redirect("/"))
      .catch((err) => console.log(err));
  }else{
    List.findOneAndUpdate({name : listName},{$pull : {items :{_id : checkedItemId}}})
      .then(() => res.redirect('/'+listName))
      .catch((err) => console.log(err));
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => console.log(err));
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function (req, res) {
  console.log("Server is running on Port no. 3000.");
});
