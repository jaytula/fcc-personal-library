/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

let db
let dbOk = false

MongoClient.connect(MONGODB_CONNECTION_STRING, {useNewUrlParser: true}, async function(err, client) {
  if(err) console.log(err.message)
  db = client.db(process.env.DBNAME)
  try {
    let result = await db.collection('nomatter').findOne({name: 'whatever'});
    dbOk = true
  } catch(err) {
    console.log(err.message)
  }
})

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){ 
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let result = await db.collection('books').find().toArray()
      result.forEach(e => {
        e.commentcount = e.comments ? e.comments.length : 0
      })
      res.json(result)
    })
    
    .post(async function (req, res){
      var title = req.body.title;
      if(!title) return res.status(400).json({status: 'fail', data: 'title is missing'})
    
      //response will contain new book object including atleast _id and title
      try {
        let result = await db.collection('books').insertOne({title, comments: []});
        return res.json(result.ops[0])
      } catch(err) {
        return res.json({status: 'error', data: err.message})
      }  
    })
    
    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
      try {
        let commandResult = await db.collection('books').deleteMany({})
        if(!commandResult.result.ok) throw new Error('deletion attempt not ok')
        res.send('complete delete successful')
      } catch(err) {
        res.status(400).send(err.message)
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      var bookid = req.params.id;
      let objectId
      try {
        objectId = ObjectId(bookid);
        let result = await db.collection('books').findOne({_id: objectId}) 
        if(!result) throw new Error('no book exists')
        res.json(result)
      } catch(err) {
        return res.status(400).send(err.message)
      }
    
            
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(async function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      let objectId
      try {
        objectId = ObjectId(bookid);
        let result = await db.collection('books').findOneAndUpdate(
          {_id: objectId},
          { $push: { comments: comment }},
          { returnOriginal: false}
        )

        if(!result.value) throw new Error('no book exists')
        res.json(result.value)
      } catch(err) {
        console.log(err.message)
        return res.status(400).send(err.message)
      }

      //json res format same as .get
    })
    
    .delete(async function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      try {
        let objectId = ObjectId(bookid)
        let commandResult = await db.collection('books').deleteOne({_id: objectId})
        if(!commandResult.result.n) throw new Error('deletion attempt failure')
        res.send('delete successful')
      } catch(err) {
        res.status(400).send(err.message)
      }
    });
  
};
