/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

const threadSchema = new mongoose.Schema(
  {
    text: String,
    created_on: Date,
    bumped_on: Date,
    reported: Boolean,
    delete_password: String,
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }]
  }
);
const replySchema = new mongoose.Schema(
  {
    text: String,
    created_on: Date,
    reported: Boolean,
    delete_password: String
  }
);
const boardSchema = new mongoose.Schema(
  {
    name: String
  }
);
const Thread = mongoose.model('Thread', threadSchema);
const Reply = mongoose.model('Reply', replySchema);
const Board = mongoose.model('Board', boardSchema);

module.exports = function (app) {
  
  app.route('/api/threads/:board')

    .get( async (req, res) => {
      const board = await Board.findOne({name: req.params.board}).exec();

      Thread.find({board: board._id}, (error, data) => {
        if(error) console.log(error);

        res.json(data);
      })
      .populate({path: 'replies', model: Reply, options: {limit: 3}})
      .limit(10)
      .sort({bumped_on: 'desc'})
      .select({reported: false, delete_password: false, board: false});
    })

    .post(async (req, res) => {
      let now = new Date();

      let board = await Board.findOne({name: req.params.board}).exec();

      if(board === null) 
        board = await Board.create({name: req.params.board});

      let thread = new Thread({
        text: req.body.text,
        created_on: now,
        bumped_on: now,
        reported: false,
        delete_password: req.body.delete_password,
        board: board._id,
        replies: []
      });

      thread.save((error, data) => {
          if(error) console.log(error);
          
          res.redirect('/b/' + board.name);
      });
    })

    .put((req, res) => {

      Thread.findByIdAndUpdate(req.body.thred_id, {reported: true}, (error, data) => {
        if(error) console.log(error);
          
        res.send('success');
      });

    })

    .delete(async (req, res) => {
      const thread = await Thread.findById(req.body.thread_id).exec();
      if(thread.delete_password !== req.body.delete_password){
        res.send('incorrect password');

        return;
      }

      await Thread.findByIdAndDelete(thread._id).exec();
      
      res.send('success');
    });
    
  app.route('/api/replies/:board')
  
    .get(async (req, res) => {
      
      let thread = await Thread.findById(
        req.query.thread_id, 
      )
      .populate({ path: 'replies', model: Reply })
      .select({reported: false, delete_password: false, board: false}).exec((error, data) => {
        if(error) console.log(error);

        res.json(data);
      });
    })

    .post((req, res) => {

      let reply = new Reply({
        text: req.body.text,
        created_on: new Date(),
        reported: false,
        delete_password: req.body.delete_password
      });

      reply.save((error, replyData) => {
          if(error) console.log(error);
          
          Thread.findByIdAndUpdate(
            req.body.thread_id, 
            {$push: { replies: replyData._id }},
            (error, data) => {
              if(error) console.log(error);

              res.redirect('/b/' + req.params.board + '/' + req.params.threadid);
          });
      });
    })

    .put((req, res) => {

      Reply.findByIdAndUpdate(req.body.reply_id, {reported: true}, (error, data) => {
        if(error) console.log(error);
          
        res.send('success');
      });

    })

    .delete(async (req, res) => {
      const reply = await Reply.findById(req.body.reply_id).exec();

      if(reply.delete_password !== req.body.delete_password){
        res.send('incorrect password');

        return;
      }

      await Reply.findByIdAndDelete(reply._id).exec();
      
      res.send('success');
    });

};
