import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from "react-router"
import { getCase , delCase } from '../../services/caseService'
import { createNotes } from "../../services/noteService"
import { getAllNotes } from "../../services/noteService"
import {deleteNoteById} from "../../services/noteService"

function CaseDetails({user}) {

  const [ Case, setCase ] = useState(null)
  const [ suspects, setSuspects ] = useState([])
  const [ evidance, setEvidence ] = useState([])
  const [formData, setFormData] = useState({
  content:""
  }); 
   const [ Notes, setNotes ] = useState([])

    function handleChange(event){
    setFormData({...formData, [event.target.name]:event.target.value})
  }


  
      const { cId } = useParams()
     const { nID } = useParams()
      
     async function handleSubmit(event){
        event.preventDefault()
        const createNote = await createNotes(cId, formData)
        loadNotes()
       
    
      }
        async function loadNotes(){
       const response = await getAllNotes(cId)
       console.log(response)
       setNotes(response)
     }

         async function deleteNote(nID){
         const deletedNote = await deleteNoteById(nID)
        loadNotes()
       }

  const navigate = useNavigate()

  async function loadCase(cId) {
    const response = await getCase(cId)
    setCase(response.case)
    setSuspects(response.suspects)
    // setEvidence(response.evidence)
  }

  async function deleteCase(cId){
    const response = await delCase(cId)
    navigate("/cases")
  }

  useEffect(()=>{
    loadCase(cId)
  },[cId])

    useEffect(()=>{
      loadNotes()
    },[])

  return (
    <>
      {Case ? (
        <>
          <div className='draggable'>
            <h1>{Case.title}</h1>
            <h3>{Case.description}</h3>
            <div />
            <h3>Suspects:</h3>
            {suspects.map((suspect) => (
              <div key={suspect._id} className='draggable'>
                <h3><b>Suspect Name:</b> {suspect.name}</h3>
                <p><b>Relation:</b> {suspect.relation}</p>
                <p><b>Motive:</b> {suspect.motive}</p>
                <p><b>Alibi:</b> {suspect.alibi}</p>
              </div>
            ))}
            <h3>Evidence:</h3>
            {evidance.map((evidence) => (
              <div key={evidence._id} className='draggable'>
                <h3><b>Evidence Title:</b> {evidence.title}</h3>
              </div>
            ))}

            {user.isAdmin ? (
              <>
                <button><Link to={`/case/${cId}/edit`}>Edit Case</Link></button>
                <button><Link onClick={() => deleteCase(cId)}>Delete Case</Link></button>
              </>
            ) : null}

<h1>Add Note:</h1>
                 <form onSubmit={handleSubmit}>
            <label htmlFor="content">Note: </label>
            <input 
            name="content"
            type="content"
            id="content"
            onChange={handleChange}
            value={formData.content}
            />
                <button>Comment</button>
                </form>

 <h1>All Notes</h1>
{Notes.map((oneNotes)=>
      <div key={oneNotes._id}>
        <h2>{oneNotes.content}</h2>
        

         {user._id ==  oneNotes.userId._id ? (<><button onClick={() => navigate(`/note/${oneNotes._id}/edit`)}>Edit Note</button>
          <button onClick={()=>{deleteNote(oneNotes._id)}}>Delete Note</button>
          </>) : <></>}
      </div>
      )}
          </div>

        </>
      ) : null}
    </>
  )
}

export default CaseDetails