import mongoose, { Schema } from "mongoose";

// 1st step: Create a Schema
// 2nd step: Create a model based on that Schema

const noteSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        // owner of the note, every query is filtered by this so users only see their own notes
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);
const Note = mongoose.model('Note', noteSchema);
export default Note;
