const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended : true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-nandini:electronics@to-do-list-cluster.dp4zd.mongodb.net/ToDoListDB",{ useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify: false});
// mongoose.set('useFindAndModify', false);

const itemsSchema = {
  name : String,
}

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item(
  {
    name : "Welcome to your todolist"
  }
)

const item2 = new Item(
  {
    name  : "Hit the '+' button to add new items"
  }
)

const item3 = new Item(
  {
    name  : "<-- hit this to delete an item"
  }
)

const defaultItems = [item1,item2,item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

   Item.find({},function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved default Items to the DB");
        }
      });
      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle : "Today",newListItems : foundItems});
    }
  });

});

app.post("/",function(req,res)
{
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  });

  if(listName === "Today")
  {
    item.save();
  res.redirect("/");
  }
  else
  {
    List.findOne({name:listName},function(err,foundList)
    {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
  

});

app.post("/delete",function(req,res)
{
  const checkedItemId = req.body.checkbox;
  const   listName = req.body.listName;

  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err)
  {
    if(!err)
    {
      console.log("Succesfully deleted the checked item");
      res.redirect("/");
    }
  });
  }
  else
  {
    List.findOneAndUpdate({name : listName},{$pull : {items : {_id : checkedItemId}}},function(err,foundList)
    {
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/:customListName",function(req,res)
{
  customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList)
      {
        //create a new list
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else
      {
        //show an existing list
        res.render("list", {listTitle : foundList.name ,newListItems : foundList.items});
      }
    }
  })
})

app.get("/work",function(req,res)
{
  res.render("list",{listTitle : "Work List", newListItems : workItems});
});

app.post("/work",function(req,res)
{
  const item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about",function(req,res){
  res.render("about");
});

app.listen(3000, function(req, res) {
  console.log("Server has started on port 3000");
});
