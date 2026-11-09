import React from 'react'
import {updateNoteById,getNoteById} from "../services/noteService"
import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";

function EditNote() {

          const [formData, setFormData] = useState({
  content:""
  }); 

      const navigate = useNavigate()
          function handleChange(event){
      setFormData({...formData, [event.target.name]:event.target.value})
    }


    const {cID} = useParams()
    const { nId } = useParams()
    console.log(nId)

        async function loadNote(){
    const response = await getNoteById(nId)
    setFormData(response)
  }

    useEffect(()=>{
    loadNote()
  },[])
  
      async function handleSubmit(event){
        event.preventDefault()
        const updateNote = await updateNoteById(nId,formData)
        navigate("/case/" + updateNote.caseId)
    
      }
  return (
    <div>
        
     <h1>Notes</h1> 
     <form onSubmit={handleSubmit}>
            <label htmlFor="content">Note: </label>
            <input 
            name="content"
            type="content"
            id="content"
            onChange={handleChange}
            value={formData.content}
            />
                <button>Edit Note</button>
                </form>

    </div>
  )
}

export default EditNote
