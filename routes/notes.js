const express = require('express');
const router = express.Router()
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

//Route 1: Get all the notes using :"get" "/api/notes/fetchallnotes" requires login 

router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {

        const notes = await Notes.find({ user: req.user.id })
        res.json(notes)
    }
    catch (error) {
        console.log(error);
        res.status(500).json("Internal Server error")
    }
})
//Route 2: Adds a new notes using :"post" "/api/notes/addnote" requires login 

router.post('/addnote', [
    //    validates the user inputs

    body('tittle', 'Enter a valid title').isLength({ min: 1 }),
    body('tittle', "title can't be blank").exists(),
    body('description', 'description must be at least 10 character').isLength({ min: 1 }),
    body('description', "description can't be blank").exists(),
    // body('author', 'enter a valid author name').isLength({
    //     min: 3
    // })

], fetchuser, async (req, res) => {
    try {


        const { tittle, description, author } = req.body;
        // if there are errors, return bad request and err messages

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Notes({
            tittle, description, author, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote)
    } catch (error) {
        console.log(error);
        res.status(500).json("Internal save Server error")
    }
})


//Route 3: update an exiting note using :"put" "/api/notes/update" requires login 
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { tittle, description, author } = req.body;
    // create a newnote object
    try {


        const newNote = {}
        if (tittle) { newNote.tittle = tittle }
        if (description) { newNote.description = description }
        if (author) { newNote.author = author }

        // find the note to be updated and update it.
        let note = await Notes.findById(req.params.id)
        if (!note) { return res.status(404).send("Not found") }

        //verifying user for update
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }

        note = await Notes.findOneAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json(note)
    } catch (error) {
        console.log(error);
        res.status(500).json("Internal save Server error")
    }
})
//Route 4: delete an exiting note using :"delete" "/api/notes/deltenote" requires login 
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // find the note to be deleted and delete it.
        let note = await Notes.findById(req.params.id)
        if (!note) { return res.status(404).send("Not found") }

        //verify user and note for deletion 
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }

        note = await Notes.findOneAndDelete(req.params.id)
        res.json({ "Success": "Note have been deleted", note: note })

    } catch (error) {
        console.log(error);
        res.status(500).json("Internal save Server error")
    }
})



module.exports = router;