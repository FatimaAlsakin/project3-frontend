import React, { useState, useEffect } from 'react'
import { Link } from "react-router"
import { getCases } from '../../services/caseService'
import { getSolvedCases, getFailedCases } from '../../services/solveService'

function AllCases() {

  const [cases, setCases] = useState([])
  const [solvedIds, setSolvedIds] = useState([])
  const [failedIds, setFailedIds] = useState([])

  async function loadCases() {
    const responsse = await getCases()
    setCases(responsse)
    // only logged in players have solved cases
    if (localStorage.getItem("token")) {
      try {
        const [solved, failed] = await Promise.all([getSolvedCases(), getFailedCases()])
        setSolvedIds(solved)
        setFailedIds(failed)
      } catch (err) { console.log(err) }
    }
  }

  useEffect(()=>{
    loadCases()
  },[])

  return (
    <>
    <h1>All Cases</h1>

    {cases.map((oneCase)=>
    <div key={oneCase._id}>
      <h3>{oneCase.title} {solvedIds.includes(oneCase._id) && <span className='solved-badge'>✅ Solved</span>}
        {failedIds.includes(oneCase._id) && <span className='failed-badge'>❌ Failed</span>}</h3>
      <p>{oneCase.description}</p>
      <Link to= {`/case/${oneCase._id}`}>Explore The Case</Link>
    </div>
    )}
    
    </>
  )
}

export default AllCases