import { getDashboard } from "../services/teamService"
import { useState, useEffect } from "react"
function Dashboard({ user }) {
  const [cases, setCases] = useState([])
  const [team, setTeam] = useState(null)


  async function loadDashboard(){
    const response = await getDashboard()
    setCases(response.cases)
    setTeam(response.team)

  }

  useEffect(()=>{
    loadDashboard()
  },[])

  return (
    <div>
        <h1>Welcome {user.username}</h1>

      {team ? <>( <h1>{team.name}</h1>)</> : <h2>You are NOT in tean</h2>}

      {cases.map((oneCase)=>(
    <div key={oneCase._id}>
            <h3>{oneCase.title}</h3>
            <p>{oneCase.description}</p>
          </div>


        
      ))}
        
    </div>
  )
}

export default Dashboard