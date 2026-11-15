import { getDashboard } from "../services/teamService"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router"
import "../styles/Dashboard.css"

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

function SolvedCases({ solvedCases }) {
  if (solvedCases.length === 0) {
    return <p className="dashboardEmpty">No cases solved yet.</p>
  }
  return (
    <div className="dashboardCases">
      {solvedCases.map(({ case: oneCase, solvedBy, solvedAt }) => (
        <Link to={`/case/${oneCase._id}/solve`} className="dashboardCaseCard" key={oneCase._id}>
          <h4>{oneCase.title}</h4>
          <p>{oneCase.description}</p>
          <span className="dashboardMeta">
            Solved {formatDate(solvedAt)}{solvedBy ? ` by ${solvedBy}` : ""}
          </span>
          <br />
          <p className="dashboardStatus solved">Solved</p>
        </Link>
      ))}
    </div>
  )
}

function FailedCases({ failedCases = [] }) {
  if (failedCases.length === 0) {
    return <p className="dashboardEmpty">No closed cases.</p>
  }
  return (
    <div className="dashboardCases">
      {failedCases.map(({ case: oneCase, closedBy, closedAt }) => (
        <Link to={`/case/${oneCase._id}/solve`} className="dashboardCaseCard closed" key={oneCase._id}>
          <h4>{oneCase.title}</h4>
          <p>{oneCase.description}</p>
          <span className="dashboardMeta">
            Closed {formatDate(closedAt)}{closedBy ? ` after a wrong guess by ${closedBy}` : ""}
          </span>
          <br />
          <p className="dashboardStatus closed">Closed</p>
        </Link>
      ))}
    </div>
  )
}

function Dashboard({ user }) {
  const [currentTeam, setCurrentTeam] = useState(null)
  const [pastTeams, setPastTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function loadDashboard() {
    try {
      const response = await getDashboard()
      setCurrentTeam(response.currentTeam)
      setPastTeams(response.pastTeams)
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load your dashboard.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  return (
    <main className="dashboardPage">
      <h1>Welcome, {user.username}</h1>

      {loading && <p className="dashboardEmpty">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="dashboardSection">
            <h2>My Team</h2>
            {currentTeam ? (
              <>
                <div className="dashboardTeamHeader">
                  <h3>{currentTeam.team?.name || "Deleted team"}</h3>
                  <button className="dashboardButton" onClick={() => navigate("/teams/my-team")}>View My Team</button>
                </div>
                <p className="dashboardMembers">
                  Members: {currentTeam.members.map((member) => member.username).join(", ")}
                </p>
                <h4 className="dashboardSubheading">This team cases:  ({currentTeam.solvedCases.length})</h4>
                <SolvedCases solvedCases={currentTeam.solvedCases} />
                <br />
                <FailedCases failedCases={currentTeam.failedCases} />
              </>
            ) : (
              <p className="dashboardEmpty">
                You're not in a team right now. <Link to="/teams">Find a team</Link>
              </p>
            )}
          </section>

          {pastTeams.length > 0 && (
            <section className="dashboardSection">
              <h2>Past Teams</h2>
              {pastTeams.map(({ team, leftAt, solvedCases, failedCases }, index) => (
                <div className="dashboardPastTeam" key={team?._id || index}>
                  <h3>{team?.name || "Deleted team"}</h3>
                  {leftAt && <p className="dashboardMeta">Left {formatDate(leftAt)}</p>}
                  <h4 className="dashboardSubheading">Cases solved with this team ({solvedCases.length})</h4>
                  <SolvedCases solvedCases={solvedCases} />
                  <h4 className="dashboardSubheading">Cases closed with this team ({failedCases?.length || 0})</h4>
                  <FailedCases failedCases={failedCases} />
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </main>
  )
}

export default Dashboard
