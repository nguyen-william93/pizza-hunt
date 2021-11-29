const { Comment, Pizza } = require('../models');

const commentController = {
    //add comment to a pizza
    addComment({ params, body }, res){
        console.log(body)
        Comment.create(body)
        .then(({ _id }) => {
            return Pizza.findOneAndUpdate(
                {_id: params.pizzaId},
                {$push: { comments: _id }},
                {new: true}
            )
        }).then(dbPizzaData => {
            if(!dbPizzaData){
                res.status(400).json({ message: 'No pizza found with this ID'})
                return;
            }
            res.json(dbPizzaData);
        }).catch(err => {
            res.json(err)
        })
    },

    //apply reply
    addReply({ params, body }, res){
        Comment.findOneAndUpdate(
            {_id: params.commentId},
            {$push: { replies: body}},
            {new: true}
        )
        .then(dbPizzaData => {
            if(!dbPizzaData){
                res.status(400).json({ message: "No pizza is found with this ID"});
                return;
            }
            res.json(dbPizzaData);
        })
        .catch(err => console.log(err));
    },

    //remove comment
    removeComment({ params }, res){
        Comment.findOneAndDelete({ _id: params.commentId })
        .then(deletedComment => {
            if(!deletedComment){
                return res.status(400).json({ message: 'No comment can be found with this ID'});
            }
            return Pizza.findOneAndUpdate(
                { _id: params.pizzaId },
                { $pull: { comments: params.commentId }},
                { new: true}
            );
        }).then(dbPizzaData => {
            if(!dbPizzaData){
                res.status(400).json({ message: 'No pizza can be found with this ID'});
                return;
            }
            res.json(dbPizzaData);
        }).catch(err => res.json(err));
    },

    //remove reply
    removeReply({ params}, res){
        Comment.findOneAndUpdate(
            {_id: pararms.commentId},
            {$pull: {replies: {replyId:pararms.replyId}}},
            {new: true}
        )
        .then(dbPizzaData => res.json(dbPizzaData))
        .catch(err => res.json(err));
    }
};

module.exports = commentController;