import express from "express";
import { createNotes, deleteNotes, getNoteById, getNotes, updateNotes }  from "../controllers/note.controller.js";

const router = express.Router();


router.get('/', getNotes); // fetch all notes using get method
router.get('/:id', getNoteById);

router.post('/', createNotes); // create a note using post method

router.put('/:id', updateNotes); //update a note using patch or put method

router.delete('/:id', deleteNotes); // delete a note using delete method


export default router;