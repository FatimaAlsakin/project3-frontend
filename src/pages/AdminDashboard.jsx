import { Link } from 'react-router'
import { useState, useEffect } from 'react'
import { getCases } from '../services/caseService'
import { getAllTeams } from '../services/teamService'
import "../styles/AdminDashboard.css"

function AdminDashboard({ user }) {
  const [cases, setCases] = useState([])
  const [error, setError] = useState('')
  const [teams, setTeams] = useState([])

  async function loadCases() {
    try {
      const response = await getCases()
      setCases(response)
    } catch (error) {
      setError('Failed to load cases')
    }
  }
  async function loadTeams() {
    try {
      const response = await getAllTeams()
      setTeams(response)
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    loadCases()
    loadTeams()
  }, [])

  return (
    <div className="adminDashboard">
      <h1>Welcome Back, {user.username}</h1>
      <p>Oversee your cases and investigations</p>

      <div className="adminStats">
        <div className="adminStatCard">
          <h3>Total Cases</h3>
          <h2>{cases.length}</h2>
        </div>

        <div className="adminStatCard">
          <h3>Total Teams</h3>
          <h2>{teams.length}</h2>
        </div>
      </div>


      <h2 className="adminSectionTitle">Quick Actions</h2>


      <div className="adminQuickActions">

        <Link to="/case/create" className="adminActionCard">
          <h3>Create New Case</h3>
          <p>Start a new mystery for detectives to solve.</p>
        </Link>

        <Link to="/teams" className="adminActionCard">
          <h3>Explore Teams</h3>
          <p>View the detective teams in the game.</p>
        </Link>
      </div>
      <div className="adminHeadquarters">
        <div>
          <h2>GAME MASTER HEADQUARTERS</h2>
          <p>
            Every case has a secret. Every detective has a mission.
            You're the one creating the mystery.
          </p>
        </div>
      </div>

    </div>
  )
}

export default AdminDashboard
