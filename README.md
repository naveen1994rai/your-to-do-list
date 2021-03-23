# Summary
A simple, dynamic and powerful to-do-list for all of your needs. Made with express, node.js, html, css, mongodb and heroku.

## Links to GitHub Repository (Main Branch)
GitHub Project Repository: https://github.com/naveen1994rai/your-to-do-list

## Installation
### Access via Web
The application can be accessed at https://blooming-springs-19411.herokuapp.com/Home. It has been deployed via heroku and the database instance is running on Mongodb Atlas.

To start using the application go to the above link and add items of your choice to the list. The list has a starter template with 2 items Pen and Paper.

To *delete* an item, just check the box and it will be removed from the list.

To *create* a new list, just replace the route parameter with the topic of your choice. For example, to have a groceries list, you may invoke this url https://blooming-springs-19411.herokuapp.com/Groceries.

The route parameter is *capitalized*, so https://blooming-springs-19411.herokuapp.com/groceries would work as well.

### To run locally
1. Clone the repo using :
   `$ git clone https://github.com/naveen1994rai/your-to-do-list.git`
                            or
   `$ git clone git@github.com:naveen1994rai/your-to-do-list.git`
   
2. Install mongodb locally and spin up the server with :
    `$ mongod`

3. Install the application dependencies with :
    `$ cd your-to-do-list`
    `$ npm i`
 
4. Replace heroku database URI with your mongodb local URI :
    `const url = 'mongodb://localhost:27017/toDoListDB';`
  
5. Run the application :
    `$ nodemon app.js`

6. Access localhost:3000 in your browser.

