const mongoose = require('mongoose');
const Joi = require('joi');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const commentSchema = new Schema({
    user_id: {
        type: ObjectId,
        required: true,
        ref: "User",
    },
    board_id: {
        type: ObjectId,
        required: true,
        ref: "Board",
    },
    content: {
        type: String,
        required: true,
    }
}, {timestamps: true});

const commentJoiSchema = Joi.object({
    content: Joi.string().max(200).required(),
});

module.exports = {
    Comment: mongoose.model('Comment', commentSchema),
    commentJoiSchema,
};