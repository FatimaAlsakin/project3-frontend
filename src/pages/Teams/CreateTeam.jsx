import { useState } from "react";
import { createTeam } from "../../services/teamService"
import { useNavigate } from "react-router";

function CreateTeam() {
    const [formData, setFormData] = useState({
        name: ""
    })
    const navigate = useNavigate()

    function handleChange(event) {
        setFormData({ ...formData, [event.target.name]: event.target.value })
    }

    async function handleSubmit(event) {
        event.preventDefault()
        await createTeam(formData)
        navigate('/teams')
    }
    return (
        <div>
            <h1>Create Team</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Team Name: </label>
                <input
                    name="name"
                    type="text"
                    id="name"
                    onChange={handleChange}
                    value={formData.name}
                />
                <button>Create</button>
            </form>
        </div>

    )
}

export default CreateTeam
