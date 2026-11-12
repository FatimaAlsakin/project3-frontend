import { useState, useEffect } from 'react'
import { getMyTeam, leaveTeam } from '../../services/teamService'
import { useNavigate } from 'react-router'
import "../../styles/Teams/MyTeam.css"

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
        <main className="myTeamPage">
            <div className="myTeamHeader">
                <h1>MY TEAM</h1>
                <p>Your detective squad, ready to solve the next case.</p>
            </div>
            <section className="teamDetails">
            <h2>{team.name}</h2>
            <p>Created By: {team.createdBy.username}</p>
            <p>Members: {members.length} / {team.maxMembers}</p>
            <button onClick={handleLeave}>Leave Team</button>
            </section>
            <section className="teamMembersSection">
                <h2>Team Members</h2>
                {members.map((oneMember) => (
                    <div  className="memberCard" key={oneMember._id}>
                        <img src="/images/member.png" alt="Detective ID" />
                        <h3>{oneMember.username}</h3>
                    </div>
                ))}
            </section>
            
        </main>
    )
}

export default MyTeam
