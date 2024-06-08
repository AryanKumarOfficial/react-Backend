const mongoose = require('mongoose')
const { Schema } = mongoose;

const notesSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    tittle: {
        type: String,
        required: true

    },
    description: {
        type: String,
        required: true,
    },

    author: {
        type: String,
        default: "Anonymous"
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("notes", notesSchema);