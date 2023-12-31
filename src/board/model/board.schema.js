const mongoose = require('mongoose');
const Joi = require('joi');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const boardSchema = new Schema({
    user_id: {
        type: ObjectId,
        required: true,
        ref: "User",
    },
    comment_id: [{
        type: ObjectId,
        ref: "Comment",
    }],
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    images: [String],
    animal_type: {
        type: String, // 견종 목록
        default: null,
    }, 
    like_count: {
        type: Number,
        default: 0
    },
    category: { // 자유글, 정보글
        type: String,
        default: null,
    },
}, { timestamps: true });

const boardJoiSchema = Joi.object({
    title: Joi.string().max(50).required(),
    content: Joi.string().max(1000).required(),
});

module.exports = {
    Board: mongoose.model('Board', boardSchema),
    boardJoiSchema,
};