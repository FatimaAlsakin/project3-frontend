import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from "react-router"
import { getCase , delCase } from '../../services/caseService'
import {postAttemps} from '../../services/solveService'
import CaseBoard from '../../components/CaseBoard'

function SloveAttepmt({user}) {

  const [ Case, setCase ] = useState(null)
  const [ suspects, setSuspects ] = useState([])
  const [ evidance, setEvidence ] = useState([])
   const [selectedSuspect , setselectedSuspect]= useState("")
   const [result, setResult] = useState(null)

      const { cId } = useParams()

      async function handleSolveAttempt(event){
        event.preventDefault()
        if (!selectedSuspect) {
          setResult({ error: "Pick a suspect first." })
          return
        }
        try {
          const response = await postAttemps(cId, { susbectId: selectedSuspect })
          setResult({ isCorrect: response.isCorrect })
        } catch (err) {
          setResult({ error: err.response?.data?.message || "Something went wrong, try again." })
        }
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

  return (
    <>
      {Case ? (
        <>
          <div>
            <CaseBoard Case={Case} suspects={suspects} evidence={evidance} interactive user={user} />


            {user.isAdmin ? (
              <>
                <button><Link to={`/case/${cId}/edit`}>Edit Case</Link></button>
                <button><Link onClick={() => deleteCase(cId)}>Delete Case</Link></button>
              </>
            ) : null}

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
            onChange={e => { setselectedSuspect(e.target.value); setResult(null) }}>

            <option value="" disabled>-- choose a suspect --</option>
            {suspects.map((oneSuspect) =>
                <option key={oneSuspect._id} value={oneSuspect._id}> {oneSuspect.name}</option>
            )}

                </select>

                <button>Accuse Suspect</button>
            </form>

            {result?.error && <p className='accuse-result'>{result.error}</p>}
            {result && !result.error && (
              <p className='accuse-result'>
                {result.isCorrect
                  ? "✅ Case solved! You caught the culprit."
                  : "❌ Wrong suspect. Keep investigating."}
              </p>
            )}
      
    </>
  )
}

export default SloveAttepmt