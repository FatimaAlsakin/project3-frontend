import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from "react-router"
import { getCase , delCase } from '../../services/caseService'

function CaseDetails({user}) {

  const [ Case, setCase ] = useState(null)
  const [ suspects, setSuspects ] = useState([])
  const [ evidance, setEvidence ] = useState([])

  const { cId } = useParams()
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
          </div>
        </>
      ) : null}
    </>
  )
}

export default CaseDetails