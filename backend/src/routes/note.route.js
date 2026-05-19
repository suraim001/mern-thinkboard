import express from "express";
import { createNotes, deleteNotes, getNotes, updateNotes }  from "../controllers/note.controller.js";

const router = express.Router();


router.get('/getnotes', getNotes); // fetch all notes using get method

router.post('/create', createNotes); // create a note using post method

router.put('/update/:id', updateNotes); //update a note using patch or put method

router.delete('/delete/:id', deleteNotes); // delete a note using delete method


export default router;