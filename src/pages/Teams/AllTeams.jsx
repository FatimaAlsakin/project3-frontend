import { useState, useEffect } from "react";
import { getAllTeams, joinTeam, getMyTeam } from "../../services/teamService";
import { Link } from "react-router"
import "../../styles/Teams/AllTeams.css"

function AllTeams() {

    const [teams, setTeams] = useState([])
    const [myTeam, setMyTeam] = useState(null)

    async function loadTeams() {
        const response = await getAllTeams()
        setTeams(response)
    }


    async function loadMyTeam() {
        try {
            const response = await getMyTeam()
            setMyTeam(response.team)
        } catch (error) {
            console.log(error)
            setMyTeam(null)
        }

    }

    useEffect(() => {
        loadTeams()
        loadMyTeam()
    }, [])

    async function handleJoin(teamId) {
        try {
            await joinTeam(teamId)
            await loadMyTeam()
            alert("Joined team successfully!")
        } catch (error) {
            console.log(error)
            alert("Failed to join team")
        }
    }
    return (
        <div className="allTeamsPage">
            <section className="teamsHead">
            <h1>FIND YOUR TEAM</h1>
            <p>Join a detective team or create your own.</p>
            <Link className="createBtn" to="/teams/create">Create Team</Link> 
            </section>

            <section className="filesHead">
                <h2>AVAILABLE TEAMS</h2>
                <div className="teamFiles">
                    
            
            {teams.map((oneTeam) =>
                <div className="oneFile" key={oneTeam._id}>
                    <img className="folderClosed" src="/images/fileClose.png"/>
                    <img className="folderOpen" src="/images/fileOpen.png"/>
                    <h3 className="teamName">{oneTeam.name}</h3>
                    <p className="teamMembers">Members: {oneTeam.totalMembers}</p>
                    <button onClick={() => handleJoin(oneTeam._id)} disabled={myTeam !== null}>
                        Join Team
                    </button>
                </div>
            )}
            </div>
            </section>
        </div>
    )
}

export default AllTeams
