import React, { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from "react-router"
import { getCase , delCase } from '../../services/caseService'
import Draggable from 'react-draggable'
import { DraggableCore } from 'react-draggable';

function DraggableCard({ children }) {
  const cardRef = useRef(null)
  return (
    <Draggable nodeRef={cardRef}>
      <div className='suspect-card' ref={cardRef}>
        {children}
      </div>
    </Draggable>
  )
}

function FlipCard({ front, back }) {
  const cardRef = useRef(null)
  const [flipped, setFlipped] = useState(false)
  const startPos = useRef({ x: 0, y: 0 })

  return (
    <Draggable
      nodeRef={cardRef}
      onStart={(e, data) => { startPos.current = { x: data.x, y: data.y } }}
      onStop={(e, data) => {
        const moved = Math.abs(data.x - startPos.current.x) + Math.abs(data.y - startPos.current.y)
        if (moved < 5) setFlipped(f => !f)   // barely moved = it was a click
      }}
    >
      <div ref={cardRef} className={`flip-card ${flipped ? 'flipped' : ''}`}>
        <div className='flip-card-inner'>
          <div className='flip-card-front'>{front}</div>
          <div className='flip-card-back'>{back}</div>
        </div>
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
          <div className='case-card' ref={nodeRef} >
            <h1>{Case.title}</h1>
            <h3>{Case.description}</h3>
            <p><b>Location:</b> {Case.location}</p>
            <p><b>Date:</b> {Case.incidentDate}</p> 
            
          </div>
        </Draggable>

            {/* <h3>Suspects:</h3> */}
            {suspects.map((suspect) => (
              <DraggableCard key={suspect._id}>
                {suspect.imageUrl && <img src={suspect.imageUrl} alt={suspect.name} width="150" draggable={false} />}
                <h3><b>Suspect Name:</b> {suspect.name}</h3>
                <p><b>Relation:</b> {suspect.relation}</p>
                <p><b>Motive:</b> {suspect.motive}</p>
                <p><b>Alibi:</b> {suspect.alibi}</p>
              </DraggableCard>
            ))}
            {/* <h3>Evidence:</h3> */}
            {evidance.map((evidence) => (
              <FlipCard
                key={evidence._id}
                front={
                  <>
                    {evidence.imageUrl && <img src={evidence.imageUrl} alt={evidence.title} draggable={false} />}
                  </>
                }
                back={
                  <>
                    <h3><b>Evidence Title:</b> {evidence.title}</h3>
                    <p> {evidence.details}</p> 
                    <br />
                    <p><b>Found At:</b> {evidence.foundAt}</p>
                  </>
                }
              />
            ))}

            {user?.isAdmin ? (
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