const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const cafeSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    road_addr: { // 도로명주소
        type: String,
        required: true,
    },
    region_addr: { // 지번주소
        type: String,
        required: true,
    },
    zip_code: { // 우편번호
        type: String,
        required: true,
    },
    intro: {
        type: String,
        default: null,
    }, 
    menu: {
        type: String,
        default: null,
    },
    image: String,
    operating_time: {
        type: String,
        default: null,
    },
    phone_number: String,
    rating: {
        type: Number,
        default: 0,
    },
    longitude: {
        type: String,
        default: null,
    },
    latitude: {
        type: String,
        default: null,
    }
}, { timestamps: true });

module.exports = mongoose.model('Cafe', cafeSchema);