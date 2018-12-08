/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
const CONNECTION_STRING = process.env.DB;
const assert = require("assert");
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function(app) {
  app
    .route("/api/books")
    .get(function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(
        CONNECTION_STRING,
        function(err, db) {
          const collection = db.collection("book");
          let cursor = collection.find();
          cursor.toArray(function(err, docs) {
            let { title, _id, comments } = docs;
            let _data = docs.map(item => {
              let { title, _id, comments } = item;
              return { title, _id, comments, commentcount: comments.length };
            });
            res.json(_data);
          });
        }
      );
    })
    .post(function(req, res) {
      var { title } = req.body;

      //response will contain new book object including atleast _id and title
      if (!title) {
        return res.send("title could not be empty");
      }
      MongoClient.connect(
        CONNECTION_STRING,
        function(err, db) {
          const collection = db.collection("book");
          let comments = [];
          //           插入操作通过insertId来获取插入记录的id；
          collection.insertOne({ title, comments }, function(err, data) {
            if (err != null) {
              return res.send("error!");
            }
            res.json({ _id: data.insertedId, title, comments });
          });
        }
      );
    })
    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
      MongoClient.connect(
        CONNECTION_STRING,
        function(err, db) {
          const collection = db.collection("book");
          collection.deleteMany({}).then(data => {
            res.send("complete delete successful");
          });
        }
      );
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
      var _id = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      if (!_id) {
        return res.send("no bookid");
      }
      MongoClient.connect(
        CONNECTION_STRING,
        function(err, db) {
          const collection = db.collection("book");
          collection.findOne({ _id: ObjectId(_id) }, function(err, data) {
            if (err) {
              return res.send("no book exists");
            }
            if (data == null) {
              return res.send("no book exists");
            }
            res.json(data);
          });
        }
      );
    })
    .post(function(req, res) {
      var _id = req.params.id;
      var comment = req.body.comment;

      //json res format same as .get
      if (!_id) {
        res.send("no bookid");
      }
      if (!comment) {
        res.send("no comment");
      }
      MongoClient.connect(
        CONNECTION_STRING,
        function(err, db) {
          const collection = db.collection("book");
          collection.findOneAndUpdate(
            { _id: ObjectId(_id) },
            { $push: { comments: comment } },
            { returnOriginal: false },
            function(err, data) {
              if (err) {
                return res.send("update error");
              }
              res.json(data.value);
            }
          );
        }
      );
    })
    .delete(function(req, res) {
      var _id = req.params.id;

      //if successful response will be 'delete successful'
      if (!_id) {
        return res.send("no bookid");
      }
      MongoClient.connect(
        CONNECTION_STRING,
        function(err, db) {
          const collection = db.collection("book");
          collection.findOneAndDelete({ _id: ObjectId(_id) }, function(
            err,
            data
          ) {
            if (!data) {
              return res.send("bookid error");
            }
            res.send("delete successful");
          });
        }
      );
    });
};
