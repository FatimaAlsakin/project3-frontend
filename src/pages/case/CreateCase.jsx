import React, { useState, useEffect } from 'react'
import { postCase, postSuspect, putCase } from '../../services/caseService'
import { useNavigate } from "react-router";
import { addEvidence } from "../../services/evidenceService"

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
    const [evidence, setEvidence] = useState([])
    const [solutionIndex, setSolutionIndex] = useState(null)

    const [error, setError] = useState('')

    const navigate = useNavigate()

    async function handleSubmit(event){
        event.preventDefault()
        setError('')
        try {
            const createdCase = await postCase(formData)
            const createdSuspects = await Promise.all(suspects.map((suspect) => postSuspect(createdCase._id, suspect)))
            if (solutionIndex !== null) {
                await putCase(createdCase._id, { solutionSuspect: createdSuspects[solutionIndex]._id })
            }
            await Promise.all(evidence.map(({ suspectIndex, ...evidenceItem }) => addEvidence(createdCase._id, {
                ...evidenceItem,
                suspectId: suspectIndex === '' ? null : createdSuspects[Number(suspectIndex)]._id
            })))
            navigate('/cases')
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.err || 'Something went wrong creating the case')
        }
    }

    function handleChange(event){
    setFormData({...formData, [event.target.name]:event.target.value})
    }

    function addSuspectRow(){
        setSuspects([...suspects, { name: '', relation: '', motive: '', alibi: '', relationTell: '', motiveTell: '', alibiTell: '' }])
    }

    function addEvidenceRow(){
        setEvidence([...evidence, { label: '', title: '', type: 'image', imageUrl: '', details: '', foundAt: '', suspectIndex: '' }])
    }

    function removeSuspectRow(index){
        setSuspects(suspects.filter((suspect, i) => i !== index))
        if (solutionIndex === index) {
            setSolutionIndex(null)
        } else if (solutionIndex > index) {
            setSolutionIndex(solutionIndex - 1)
        }
        setEvidence(evidence.map((evidenceItem) => {
            const suspectIndex = Number(evidenceItem.suspectIndex)
            if (evidenceItem.suspectIndex === '' || suspectIndex < index) {
                return evidenceItem
            }
            return {...evidenceItem, suspectIndex: suspectIndex === index ? '' : String(suspectIndex - 1)}
        }))
    }

    function handleSuspectChange(index, event){
        const updatedSuspects = [...suspects]
        const value = event.target.type === 'file' ? event.target.files[0] : event.target.value
        updatedSuspects[index] = {...updatedSuspects[index], [event.target.name]:value}
        setSuspects(updatedSuspects)
    }

    function removeEvidenceRow(index){
        setEvidence(evidence.filter((evidenceItem, i) => i !== index))
    }

    function handleEvidenceChange(index, event){
        const value = event.target.type === 'file' ? event.target.files[0] : event.target.value
        const updatedEvidence = [...evidence]
        updatedEvidence[index] = {...updatedEvidence[index], [event.target.name]:value}
        setEvidence(updatedEvidence)
    }

  return (
    <>
        <h1>Create New Case </h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
            <label htmlFor="title">Title: </label>
            <input 
            type="text" 
            id="title" 
            name="title" 
            required
            onChange={handleChange}
            value={formData.title}/>
            <br />
            <label htmlFor="description">Description: </label>
            <textarea 
            type="text"
            id="description" 
            name="description" 
            required
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
                    <label htmlFor={`relationTell${index}`}>Body Language (relation): </label>
                    <input
                    type="text"
                    id={`relationTell${index}`}
                    name="relationTell"
                    placeholder="e.g. Smiles warmly"
                    onChange={(event) => handleSuspectChange(index, event)}
                    value={suspect.relationTell}/>
                    <br />
                    <label htmlFor={`motive${index}`}>Motive: </label>
                    <textarea
                    id={`motive${index}`}
                    name="motive"
                    required
                    onChange={(event) => handleSuspectChange(index, event)}
                    value={suspect.motive}/>
                    <br />
                    <label htmlFor={`motiveTell${index}`}>Body Language (motive): </label>
                    <input
                    type="text"
                    id={`motiveTell${index}`}
                    name="motiveTell"
                    placeholder="e.g. Crosses arms defensively"
                    onChange={(event) => handleSuspectChange(index, event)}
                    value={suspect.motiveTell}/>
                    <br />
                    <label htmlFor={`alibi${index}`}>Alibi: </label>
                    <textarea
                    id={`alibi${index}`}
                    name="alibi"
                    required
                    onChange={(event) => handleSuspectChange(index, event)}
                    value={suspect.alibi}/>
                    <br />
                    <label htmlFor={`alibiTell${index}`}>Body Language (alibi): </label>
                    <input
                    type="text"
                    id={`alibiTell${index}`}
                    name="alibiTell"
                    placeholder="e.g. Glances at the door before answering"
                    onChange={(event) => handleSuspectChange(index, event)}
                    value={suspect.alibiTell}/>
                    <br />
                    <label htmlFor={`suspectImage${index}`}>Photo: </label>
                    <input
                    type="file"
                    id={`suspectImage${index}`}
                    name="image"
                    accept="image/*"
                    required
                    onChange={(event) => handleSuspectChange(index, event)}/>
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
            <h2>Evidence</h2>
            {evidence.map((evidenceItem, index) =>
                <div key={index}>
                    <label htmlFor={`label${index}`}>Label: </label>
                    <input
                    type="text"
                    id={`label${index}`}
                    name="label"
                    required
                    onChange={(event) => handleEvidenceChange(index, event)}
                    value={evidenceItem.label}/>
                    <br />
                    <label htmlFor={`title${index}`}>Title: </label>
                    <input
                    type="text"
                    id={`title${index}`}
                    name="title"
                    required
                    onChange={(event) => handleEvidenceChange(index, event)}
                    value={evidenceItem.title}/>
                    <br />
                    <label htmlFor={`image${index}`}>Image: </label>
                    <input
                    type="file"
                    id={`image${index}`}
                    name="image"
                    accept="image/*"
                    required
                    onChange={(event) => handleEvidenceChange(index, event)}/>
                    <br />
                    <label htmlFor={`details${index}`}>Details: </label>
                    <textarea
                    id={`details${index}`}
                    name="details"
                    required
                    onChange={(event) => handleEvidenceChange(index, event)}
                    value={evidenceItem.details}/>
                    <br />
                    <label htmlFor={`foundAt${index}`}>Found At: </label>
                    <input
                    type="text"
                    id={`foundAt${index}`}
                    name="foundAt"
                    onChange={(event) => handleEvidenceChange(index, event)}
                    value={evidenceItem.foundAt}/>
                    <br />
                    <label htmlFor={`suspectIndex${index}`}>Suspect: </label>
                    <select
                    id={`suspectIndex${index}`}
                    name="suspectIndex"
                    onChange={(event) => handleEvidenceChange(index, event)}
                    value={evidenceItem.suspectIndex}>
                        <option value="">No Suspect</option>
                        {suspects.map((suspect, suspectIndex) =>
                            <option key={suspectIndex} value={suspectIndex}>{suspect.name || `Suspect ${suspectIndex + 1}`}</option>
                        )}
                    </select>
                    <br />
                    <button type="button" onClick={() => removeEvidenceRow(index)}>Remove Evidence</button>
                </div>
            )}
            <button type="button" onClick={addEvidenceRow}>Add Evidence</button>
            <br />
            <button>Create Case</button>
        </form>
    </>
  )
}

export default CreateCase