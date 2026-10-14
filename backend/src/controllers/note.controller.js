import Note from "../models/note.model.js";

// every query includes user: req.user._id (set by isAuthenticated), so a user can only touch their own notes

const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({user: req.user._id}).sort({createdAt: -1}); // -1 will sort by decreasing order 
        res.status(200).json(notes);
    } catch (error) {
        console.error("Error fetching notes by using getNotes controller", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });        
    }
};

const getNoteById = async (req, res) => {
    try {
        const note = await Note.findOne({_id: req.params.id, user: req.user._id});
        if(!note) return res.status(404).json({
            message: "Note not found!"
        });
        res.status(200).json(note);
    } catch (error) {
        console.log("Internal Server Error", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

const createNotes = async (req, res) => {
    try {
        const {title, content} = req.body;
        const note = new Note({title, content, user: req.user._id});
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

const updateNotes = async (req, res) => {
    try {
        const {title, content} = req.body;
        const updatedNote = await Note.findOneAndUpdate(
            {_id: req.params.id, user: req.user._id},
            {title, content},
            {returnDocument: "after"}
        );

        if(!updatedNote) return res.status(404).json({
            message: "Note not found"
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
        const deletedNote = await Note.findOneAndDelete({_id: req.params.id, user: req.user._id});
        if (!deletedNote) return res.status(404).json({
            message: "Note not found"
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
    deleteNotes,
    getNoteById
};
