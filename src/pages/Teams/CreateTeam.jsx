import { useState } from "react";
import { createTeam } from "../../services/teamService"
import { useNavigate } from "react-router";
import "../../styles/Teams/CreateTeam.css"
import { notyf, errorMessage } from "../../utils/notify"

function CreateTeam() {
    const [formData, setFormData] = useState({
        name: "", description: "",maxMembers: ""
    })
    const [openFile, setOpenFile] = useState(false);
    const navigate = useNavigate()

    function handleChange(event) {
        setFormData({ ...formData, [event.target.name]: event.target.value })
    }
    function handleOpen() {
    setOpenFile(true)
    }

    async function handleSubmit(event) {
        event.preventDefault()
        try {
            await createTeam({ ...formData, maxMembers: Number(formData.maxMembers) })
            notyf.success('Team created!')
            navigate('/teams')
        } catch (err) {
            notyf.error(errorMessage(err, "Could not create team. Please try again."))
        }
    }
    return (
        <div className="createTeamPage">
        {!openFile && (<img className="closedFile" src="/images/isClose.png" onClick={handleOpen}/>)}         
        {openFile && <div className="openedTeamFile"> 
                <img className="openFile" src="/images/cc.png"/>
                <form onSubmit={handleSubmit}>
                <label htmlFor="name">Team Name: </label>
                <input
                    name="name"
                    type="text"
                    id="name"
                    onChange={handleChange}
                    value={formData.name}
                />
                <label htmlFor="description">Description: </label>
                <textarea
                    name="description"
                    id="description"
                    onChange={handleChange}
                    value={formData.description}
                />
                <label htmlFor="maxMembers">Max Members: </label>
                <input
                    name="maxMembers"
                    type="number"
                    min={1}
                    id="maxMembers"
                    onChange={handleChange}
                    value={formData.maxMembers}
                />
                <button>Create</button>
            </form>
            </div>
            }
            

        </div>

    )
}

export default CreateTeam
