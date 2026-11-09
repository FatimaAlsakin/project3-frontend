import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from "react-router"
import { getCase , delCase } from '../../services/caseService'
import { createNotes,getAllNotes,deleteNoteById } from "../../services/noteService"
import {postAttemps} from '../../services/solveService'
import CaseBoard from '../../components/CaseBoard'

function SloveAttepmt({user}) {

  const [ Case, setCase ] = useState(null)
  const [ suspects, setSuspects ] = useState([])
  const [ evidance, setEvidence ] = useState([])
  const [formData, setFormData] = useState({
  content:""
  }); 
   const [ Notes, setNotes ] = useState([])
   const [selectedSuspect , setselectedSuspect]= useState(null)
   
   


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

      // Create solveAttempt from user data + selectedSuspect
      async function handleSolveAttempt(event){
        event.preventDefault()
        const check = Case.solutionSuspect == selectedSuspect
        const attemptData = { susbectId: selectedSuspect , isCorrect :check}
        
        const response = await postAttemps(cId, attemptData)
        console.log(response)
        
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
    setEvidence(response.evidence)
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
          <div>
            <CaseBoard Case={Case} suspects={suspects} evidence={evidance} interactive />


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

      <h1>Slove Attemps</h1>
                  <form onSubmit={handleSolveAttempt}>
            <label htmlFor="suspect"> Select a Suspect to Accuse: </label>
            <select 
            name="suspect"
            value={selectedSuspect}
            id="suspect"
            onChange={e => setselectedSuspect(e.target.value)}>

            {suspects.map((oneSuspect) => 
                <option value={oneSuspect._id}> {oneSuspect.name}</option>
            )}

                </select>

                <button>Accuse Suspect</button>
            </form>
      
    </>
  )
}

export default SloveAttepmt