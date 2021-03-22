const express       = require("express");
const body_parser   = require("body-parser");
const mongoose      = require('mongoose');
const _             = require("lodash");
const date          = require(__dirname + "/date.js");
let   app           = express();

//Specify the databse server address and the database we want to connect to.
//A new database will be created if it doesn't exist.
const url = process.env.DATABASE_URI;

//Connect to the DB.
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

//Mongoose specific variables.
const toDoListItemSchema    = new mongoose.Schema({ name: String });
const toDoListItems         = new mongoose.model('Item', toDoListItemSchema);
const listTopicSchema       = new mongoose.Schema({ name: String, items: [toDoListItemSchema]});
const toDoListTopics = new mongoose.model('Topic', listTopicSchema);

//Server specific configs.
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

let error_message;
let defaultItemsArray = _addDefaultItems();


function _initializeDB() {
    console.log("Creating a default topic(Home) with default items.");
    _checkForHomeItems();
}

app.set("view engine", "ejs");
app.use(body_parser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
    let current_date = date.getDate();
    //check for items in the default/home topic.
    toDoListTopics.findOne({ name: 'Home' }, function (err, doc) {
        if (!err) {
            if (doc) {
                res.render("index", { title: "Home", userItems: doc.items, error: error_message });
            }
        }
    }); 
});

app.post("/", function (req, res) {
    error_message = "";
    let enteredItem = req.body.requestedItem;
    let listTopic = req.body.type;
    console.log("User has requested to add " + enteredItem + " under the topic " + listTopic);
    if (enteredItem.length > 0) {
        const userInput = new toDoListItems({ name: enteredItem });
        toDoListItems.create(userInput, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully inserted document in items collection.");
                //Update the items array for the listTopic.
                toDoListTopics.findOne({ name: listTopic }, function (err, doc) {
                    if (!err) {
                        if (doc) {
                            const existingItems = doc.items;
                            existingItems.push(userInput);
                            toDoListTopics.findOneAndUpdate({ name: listTopic }, { $set: { items: existingItems } }, {useFindAndModify : false} ,function (err) {
                                if (!err) {
                                    console.log("Successfully updated items list for " + listTopic + " topic.");
                                } else {
                                    console.log(err);
                                }
                            });
                        }
                    }
                });
            }
        });
    }
    res.redirect('/' + listTopic);
});

app.get('/:topic', function (req, res) {
    const userListName = _.capitalize(req.params.topic);
    //check if this list already exists.
    toDoListTopics.findOne({ name: userListName }, function (err, doc) {
        if (!doc) {
            console.log(userListName +  " topic doesn't exists. Creating a new document for this topic.");
            toDoListTopics.create({ name: userListName, items: defaultItemsArray }, function (err, doc) {
                if (!err) {
                    if (doc) {
                        console.log("New topic has been created with default items.");
                        console.log(doc);
                        console.log("Redirecting to self route.");
                        res.redirect('/' + userListName);
                    }
                }
            });
        } else {
            console.log("Topic already exists.");
            console.log(doc);
            res.render("index", { title: doc.name, userItems: doc.items, error: error_message });
        }
    });
});

app.post('/delete', function (req, res) {
    const itemToDelete = req.body.checkbox;
    const topicToDeleteFrom = req.body.listTopic;
    console.log("User has requested a delete operation from " + topicToDeleteFrom);
    if (itemToDelete.length > 0) {
        //Deleting from items list.
        toDoListItems.findByIdAndDelete(itemToDelete, function (err, doc, response) {
            if (!err) {
                if (doc) {
                    console.log("The following document was successfully deleted from items collection.");
                    console.log(doc);
                }
            }
        });
        toDoListTopics.findOneAndUpdate({ name: topicToDeleteFrom }, { $pull: { items: { _id: itemToDelete } } }, { useFindAndModify: false }, function (err) {
            if (!err) {
                console.log("Successfully updated items array for " + topicToDeleteFrom + " topic.");
            } else {
                console.log(err);
            }
        });
    }
    res.redirect('/' + topicToDeleteFrom);
})


app.listen(port, function () {
    console.log("Server is up and running on port " + port);
});

_initializeDB();

function _checkForHomeItems() {
    toDoListTopics.findOne({ name: 'Home' }, function (err, doc) {
        if (!doc) {
            console.log("Home topic doesn't exist.");
            console.log("Creating and adding default items to the Home topic.");
            //defaultItemsArray = _addDefaultItems();

            toDoListTopics.create({ name: 'Home', items: defaultItemsArray }, function (err, doc) {
                if (!err) {
                    if (doc) {
                        console.log("Default items were added to the Home topic in the topics collection.");
                        console.log(doc);
                    }
                } else {
                    console.log(err);
                }
            });
            return defaultItemsArray;
        } else {
            console.log("Home list exists.");
            return doc.items;
        }
    });
}

function _addDefaultItems() {
    const item1 = new toDoListItems({ name: "Pen"});
    const item2 = new toDoListItems({ name: "Paper" });
    const defaultItemsArray = [item1, item2];
    console.log("Inserting default items in items collection if empty.");
    toDoListItems.find({}, function (err, doc) {
        if (!err) {
            if (doc.length > 0) {
                console.log("Items already exist in the items collection.");
            } else {
                toDoListItems.insertMany(defaultItemsArray, function (err, docs) {
                    if (!err) {
                        if (docs) {
                            console.log("Following default items are added to the items collections.");
                            console.log(docs);
                        }
                    } else {
                        console.log(err);
                    }
                });
            }
        }
    });

    return defaultItemsArray;
}
