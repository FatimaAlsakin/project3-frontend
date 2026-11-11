import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from "react-router"
import { getCase , delCase } from '../../services/caseService'
import { createNotes } from "../../services/noteService"
import { getAllNotes } from "../../services/noteService"
import {deleteNoteById} from "../../services/noteService"
import CaseBoard from '../../components/CaseBoard'

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
    <div className='case-details-page'>
      {Case ? (
        // everything inside <CaseBoard> goes along the bottom of the board
        <CaseBoard Case={Case} suspects={suspects} evidence={evidance}>
          <button type='button' className='board-btn board-back' onClick={() => navigate(-1)} aria-label='Go back'>‹</button>

          {user?.isAdmin && (
            <>
              <Link className='board-btn' to={`/case/${cId}/edit`}>✏️ Edit case</Link>
              <button type='button' className='board-btn danger' onClick={() => deleteCase(cId)}>🗑️ Delete case</button>
            </>
          )}

          {/* anyone signed in can solve: with their team, or alone if they have none */}
          {user ? (
            <Link className='board-btn primary board-solve' to={`/case/${cId}/solve`}>🔍 Start solving</Link>
          ) : (
            <Link className='board-btn primary board-solve' to='/sign-in'>🔒 Sign in to solve</Link>
          )}
        </CaseBoard>
      ) : (
        <p className='solve-loading'>Opening the case file…</p>
      )}
    </div>
  )
}

export default CaseDetails
