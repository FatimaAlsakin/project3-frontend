import { useState, useEffect } from 'react'
import { getMyTeam, leaveTeam } from '../../services/teamService'
import { useNavigate } from 'react-router'

function MyTeam() {
    const [team, setTeam] = useState(null)
    const [members, setMembers] = useState([])
    const navigate = useNavigate()

    async function loadMyTeam() {

        const response = await getMyTeam()
        setTeam(response.team)
        setMembers(response.members)

    }
    async function handleLeave() {
        await leaveTeam()
        navigate('/teams')
        setTeam(null)
        setMembers([])
    }

    useEffect(() => {
        loadMyTeam()
    }, [])

    if (!team) {
        return <p>Loading...</p>
    }


    return (
        <div>
            <h1>My Team</h1>
            <h2>{team.name}</h2>
            <h3>Created By: {team.createdBy.username}</h3>
            <h3>Members:</h3>
            <ul>
                {members.map((oneMember) => (
                    <li key={oneMember._id}>{oneMember.username}</li>
                ))}
            </ul>
            <button onClick={handleLeave}>Leave Team</button>
            
        </div>
    )
}

export default MyTeam
