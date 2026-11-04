import { useState, useEffect } from "react";
import { getAllTeams, joinTeam, getMyTeam } from "../../services/teamService";
import { Link } from "react-router"


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
        <div>
            <h1>Browse All Teams</h1>
            <Link to="/teams/create">Create Team</Link>
            {teams.map((oneTeam) =>
                <div key={oneTeam._id}>
                    <h2>{oneTeam.name}</h2>
                    <button onClick={() => handleJoin(oneTeam._id)} disabled={myTeam !== null}>
                        Join Team
                    </button>
                </div>
            )}
        </div>
    )
}

export default AllTeams
