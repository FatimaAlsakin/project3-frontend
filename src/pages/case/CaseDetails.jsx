import React, { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from "react-router"
import { getCase , delCase } from '../../services/caseService'
import Draggable from 'react-draggable'
import { DraggableCore } from 'react-draggable';

function DraggableCard({ children }) {
  const cardRef = useRef(null)
  return (
    <Draggable nodeRef={cardRef}>
      <div className='draggable' ref={cardRef}>
        {children}
      </div>
    </Draggable>
  )
}

function CaseDetails({user}) {

    const nodeRef = useRef(null);


  const [ Case, setCase ] = useState(null)
  const [ suspects, setSuspects ] = useState([])
  const [ evidance, setEvidence ] = useState([])

  const { cId } = useParams()
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
        <Draggable nodeRef={nodeRef}>
          <div className='draggable' ref={nodeRef} >
            <h1>{Case.title}</h1>
            <h3>{Case.description}</h3>
            <p><b>Location:</b> {Case.location}</p>
            <p><b>Date:</b> {Case.incidentDate}</p> 
            
          </div>
        </Draggable>

            <h3>Suspects:</h3>
            {suspects.map((suspect) => (
              <DraggableCard key={suspect._id}>
                {suspect.imageUrl && <img src={suspect.imageUrl} alt={suspect.name} width="150" draggable={false} />}
                <h3><b>Suspect Name:</b> {suspect.name}</h3>
                <p><b>Relation:</b> {suspect.relation}</p>
                <p><b>Motive:</b> {suspect.motive}</p>
                <p><b>Alibi:</b> {suspect.alibi}</p>
              </DraggableCard>
            ))}
            <h3>Evidence:</h3>
            {evidance.map((evidence) => (
              <DraggableCard key={evidence._id}>
                {evidence.imageUrl && <img src={evidence.imageUrl} alt={evidence.title} width="150" draggable={false} />}
                <h3><b>Evidence Title:</b> {evidence.title}</h3>
              </DraggableCard>
            ))}

            {user.isAdmin ? (
              <>
                <button><Link to={`/case/${cId}/edit`}>Edit Case</Link></button>
                <button><Link onClick={() => deleteCase(cId)}>Delete Case</Link></button>
              </>
            ) : null}
        </>
      ) : null}
    </>
  )
}

export default CaseDetails