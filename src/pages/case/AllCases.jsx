import React, { useState, useEffect } from 'react'
import { Link } from "react-router"
import { getCases } from '../../services/caseService'

function AllCases() {

  const [cases, setCases] = useState([])

  async function loadCases() {
    const responsse = await getCases()
    setCases(responsse)
  }

  useEffect(()=>{
    loadCases()
  },[])

  return (
    <>
    <h1>All Cases</h1>

    {cases.map((oneCase)=>
    <div key={oneCase._id}>
      <h3>{oneCase.title}</h3>
      <p>{oneCase.description}</p>
      <Link to= {`/case/${oneCase._id}`}>Explore The Case</Link>
    </div>
    )}
    
    </>
  )
}

export default AllCases