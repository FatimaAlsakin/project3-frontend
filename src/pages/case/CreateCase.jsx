import React, { useState, useEffect } from 'react'
import { postCase, postSuspect, putCase } from '../../services/caseService'
import { useNavigate } from "react-router";

function CreateCase() {

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        incidentDate: '',
        difficulty: 'medium',
        status: 'draft'
    })

    const [suspects, setSuspects] = useState([])
    const [solutionIndex, setSolutionIndex] = useState(null)

    const navigate = useNavigate()

    async function handleSubmit(event){
        event.preventDefault()
        const createdCase = await postCase(formData)
        const createdSuspects = await Promise.all(suspects.map((suspect) => postSuspect(createdCase._id, suspect)))
        if (solutionIndex !== null) {
            await putCase(createdCase._id, { solutionSuspect: createdSuspects[solutionIndex]._id })
        }
        navigate('/cases')
    }

    function handleChange(event){
    setFormData({...formData, [event.target.name]:event.target.value})
    }

    function addSuspectRow(){
        setSuspects([...suspects, { name: '', relation: '', motive: '', alibi: '' }])
    }

    function removeSuspectRow(index){
        setSuspects(suspects.filter((suspect, i) => i !== index))
        if (solutionIndex === index) {
            setSolutionIndex(null)
        } else if (solutionIndex > index) {
            setSolutionIndex(solutionIndex - 1)
        }
    }

    function handleSuspectChange(index, event){
        const updatedSuspects = [...suspects]
        updatedSuspects[index] = {...updatedSuspects[index], [event.target.name]:event.target.value}
        setSuspects(updatedSuspects)
    }

  return (
    <>
        <h1>Create New Case </h1>
        <form onSubmit={handleSubmit}>
            <label htmlFor="title">Title: </label>
            <input 
            type="text" 
            id="title" 
            name="title" 
            onChange={handleChange}
            value={formData.title}/>
            <br />
            <label htmlFor="description">Description: </label>
            <textarea 
            type="text"
            id="description" 
            name="description" 
            onChange={handleChange}
            value={formData.description}/>
            <br />
            <label htmlFor="location">Location: </label>
            <input 
            type="text"
            id="location"
            name="location"
            onChange={handleChange}
            value={formData.location}/>
            <br />
            <label htmlFor="incidentDate">Incident Date: </label>
            <input
            type="date"
            id="incidentDate"
            name="incidentDate"
            onChange={handleChange}
            value={formData.incidentDate}/>
            <br />
            <label htmlFor="difficulty">Difficulty: </label>
            <select 
            id="difficulty"
            name="difficulty"
            onChange={handleChange}
            value={formData.difficulty}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>
            <br />
            <label htmlFor="status">Status: </label>
            <select 
            id="status"
            name="status"
            onChange={handleChange}
            value={formData.status}>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="solved">Solved</option>
                <option value="closed">Closed</option>
            </select>
            <br />
            <h2>Suspects</h2>
            {suspects.map((suspect, index) =>
                <div key={index}>
                    <label htmlFor={`name${index}`}>Suspect Name: </label>
                    <input
                    type="text"
                    id={`name${index}`}
                    name="name"
                    required
                    onChange={(event) => handleSuspectChange(index, event)}
                    value={suspect.name}/>
                    <br />
                    <label htmlFor={`relation${index}`}>Relation: </label>
                    <input
                    type="text"
                    id={`relation${index}`}
                    name="relation"
                    required
                    onChange={(event) => handleSuspectChange(index, event)}
                    value={suspect.relation}/>
                    <br />
                    <label htmlFor={`motive${index}`}>Motive: </label>
                    <textarea
                    id={`motive${index}`}
                    name="motive"
                    required
                    onChange={(event) => handleSuspectChange(index, event)}
                    value={suspect.motive}/>
                    <br />
                    <label htmlFor={`alibi${index}`}>Alibi: </label>
                    <textarea
                    id={`alibi${index}`}
                    name="alibi"
                    required
                    onChange={(event) => handleSuspectChange(index, event)}
                    value={suspect.alibi}/>
                    <br />
                    <label htmlFor={`solution${index}`}>Solution Suspect: </label>
                    <input
                    type="checkbox"
                    id={`solution${index}`}
                    checked={solutionIndex === index}
                    disabled={solutionIndex !== null && solutionIndex !== index}
                    onChange={(event) => setSolutionIndex(event.target.checked ? index : null)}/>
                    <br />
                    <button type="button" onClick={() => removeSuspectRow(index)}>Remove Suspect</button>
                </div>
            )}
            <button type="button" onClick={addSuspectRow}>Add Suspect</button>
            <br />
            <button>Create Case</button>
        </form>
    </>
  )
}

export default CreateCase