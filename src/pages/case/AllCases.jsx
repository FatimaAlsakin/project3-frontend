import React, { useState, useEffect } from 'react'
import { Link } from "react-router"
import { getCases } from '../../services/caseService'
import "../../styles/Cases/AllCases.css"
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
    <section className="casesSection">
      <div className="casesHeader">
          <p>CLASSIFIED INVESTIGATIONS</p>
          <h2>OPEN CASE <span>FILES</span></h2>
          <p>Every case holds a secret. Choose your investigation.</p>
      </div>
        <div className="casesGrid">
    {cases.map((oneCase)=>
    <div className="caseCard" key={oneCase._id}>
      <h3>{oneCase.title}</h3>
      <p>{oneCase.description}</p>
      <Link to= {`/case/${oneCase._id}`}>Explore The Case</Link>
    </div>
    )}
    </div>
    </section>
    </>
  )
}

export default AllCases