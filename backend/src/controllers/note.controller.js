import Note from "../models/Note.model.js";

const getNotes = async (req, res) => {
    try {
        const notes = await Note.find();
        res.status(200).json(notes);
    } catch (error) {
        console.error("Error fetching notes by using getAllNotes controller", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });        
    }
}

const createNotes = async (req, res) => {
    try {
        const {title, content} = req.body;
        const note = new Note({title, content});
        const savedNote = await note.save();
        res.status(201).json({
            message: "Note created successfully.",
            savedNote});
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
        console.error("Error creating note by using createNotes controller", error);
    }
};

 // parameter in the findByIdAndUpdate/findByIdAndDelete method will be exact same as it is provied in the router
const updateNotes = async (req, res) => {
    try {
        const {title, content} = req.body;
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            {title, content},
            {returnDocument: "after"}
        );

        if(!updatedNote) return res.status(404).json({
            message: "Note not found",
            error: error.message
        });

        res.status(200).json({
            message: "Note updated successully.",
            updatedNote
        })
    } catch (error) {
        console.error("Error updating the note by using the updateNotes controller.", error)
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
};

const deleteNotes = async (req, res) => {
    try {
        const {title, content} = req.body;
        const deletedNote = await Note.findByIdAndDelete(req.params.id, 
            {title, content},
            {returnDocument: "after"});
        if (!deletedNote) return res.status(404).json({
            message: "Note not found",
            error: error.message
        });
        res.status(200).json({
            message: "Note deleted successfully."
        })
    } catch (error) {
        console.error("Error deleting note by using deleteNotes controller", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
};


export {
    getNotes,
    createNotes,
    updateNotes,
    deleteNotes
};