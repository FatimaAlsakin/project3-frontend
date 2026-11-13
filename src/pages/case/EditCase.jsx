import React, { useState, useEffect } from 'react'
import { getCase, putCase, postSuspect, putSuspect, delSuspect } from '../../services/caseService'
import { useNavigate, useParams } from "react-router";
import { addEvidence, editEvidence, deleteEvidence } from "../../services/evidenceService"
import { notyf, errorMessage } from "../../utils/notify"

function EditCase() {

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        incidentDate: '',
        difficulty: 'medium',
        status: 'draft'
    })
    const [caseImageUrl, setCaseImageUrl] = useState('')

    const [suspects, setSuspects] = useState([])
    const [evidence, setEvidence] = useState([])
    const [solutionIndex, setSolutionIndex] = useState(null)

    const [originalSuspectIds, setOriginalSuspectIds] = useState([])
    const [originalEvidenceIds, setOriginalEvidenceIds] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const { cId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        async function loadCase() {
            try {
                const response = await getCase(cId)
                const foundCase = response.case
                const foundSuspects = response.suspects || []
                const foundEvidence = response.evidence || []

                setFormData({
                    title: foundCase.title,
                    description: foundCase.description,
                    location: foundCase.location,
                    incidentDate: foundCase.incidentDate ? foundCase.incidentDate.slice(0, 10) : '',
                    difficulty: foundCase.difficulty,
                    status: foundCase.status
                })
                setCaseImageUrl(foundCase.imageUrl || '')

                setSuspects(foundSuspects.map(({ _id, name, relation, motive, alibi, relationTell, motiveTell, alibiTell, imageUrl }) => ({
                    _id, name, relation, motive, alibi,
                    relationTell: relationTell || '', motiveTell: motiveTell || '', alibiTell: alibiTell || '',
                    imageUrl
                })))

                const solution = foundSuspects.findIndex((suspect) => suspect._id === foundCase.solutionSuspect)
                setSolutionIndex(solution === -1 ? null : solution)

                setEvidence(foundEvidence.map(({ _id, label, title, type, imageUrl, details, foundAt, suspectId, suspectResponse, responseTell }) => {
                    const suspectIndex = foundSuspects.findIndex((suspect) => suspect._id === suspectId)
                    return {
                        _id, label, title, type, imageUrl, details, foundAt: foundAt || '',
                        suspectIndex: suspectIndex === -1 ? '' : String(suspectIndex),
                        suspectResponse: suspectResponse || '', responseTell: responseTell || ''
                    }
                }))

                setOriginalSuspectIds(foundSuspects.map((suspect) => suspect._id))
                setOriginalEvidenceIds(foundEvidence.map((evidenceItem) => evidenceItem._id))
            } catch (err) {
                setError(err.response?.data?.message || 'Could not load the case')
            } finally {
                setLoading(false)
            }
        }
        loadCase()
    }, [cId])

    async function handleSubmit(event){
        event.preventDefault()
        try {
            const savedSuspects = await Promise.all(suspects.map(({ _id, ...suspect }) =>
                _id ? putSuspect(cId, _id, suspect) : postSuspect(cId, suspect)
            ))

            await putCase(cId, {
                ...formData,
                solutionSuspect: solutionIndex === null ? null : savedSuspects[solutionIndex]._id
            })

            await Promise.all(evidence.map(({ _id, suspectIndex, ...evidenceItem }) => {
                const data = {
                    ...evidenceItem,
                    suspectId: suspectIndex === '' ? null : savedSuspects[Number(suspectIndex)]._id
                }
                return _id ? editEvidence(_id, data) : addEvidence(cId, data)
            }))

            const keptSuspectIds = suspects.map((suspect) => suspect._id)
            const keptEvidenceIds = evidence.map((evidenceItem) => evidenceItem._id)
            await Promise.all([
                ...originalSuspectIds.filter((id) => !keptSuspectIds.includes(id)).map((id) => delSuspect(cId, id)),
                ...originalEvidenceIds.filter((id) => !keptEvidenceIds.includes(id)).map((id) => deleteEvidence(id))
            ])

            notyf.success('Case saved!')
            navigate(`/case/${cId}`)
        } catch (err) {
            notyf.error(errorMessage(err, 'Something went wrong saving the case'))
        }
    }

    function handleChange(event){
    const value = event.target.type === 'file' ? event.target.files[0] : event.target.value
    setFormData({...formData, [event.target.name]:value})
    }

    function addSuspectRow(){
        setSuspects([...suspects, { name: '', relation: '', motive: '', alibi: '', relationTell: '', motiveTell: '', alibiTell: '' }])
    }

    function addEvidenceRow(){
        setEvidence([...evidence, { label: '', title: '', type: 'image', imageUrl: '', details: '', foundAt: '', suspectIndex: '', suspectResponse: '', responseTell: '' }])
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

  if (loading) return <p>Loading...</p>

  return (
    <>
        <h1>Edit Case </h1>
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
            {caseImageUrl && !formData.image && (
                <img src={caseImageUrl} alt={formData.title} width="150" />
            )}
            <br />
            <label htmlFor="caseImage">{caseImageUrl ? 'Replace Case Picture: ' : 'Case Picture: '}</label>
            <input
            type="file"
            id="caseImage"
            name="image"
            accept="image/*"
            onChange={handleChange}/>
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
                    {suspect.imageUrl && !suspect.image && (
                        <img src={suspect.imageUrl} alt={suspect.name} width="150" />
                    )}
                    <br />
                    <label htmlFor={`suspectImage${index}`}>{suspect.imageUrl ? 'Replace Photo: ' : 'Photo: '}</label>
                    <input
                    type="file"
                    id={`suspectImage${index}`}
                    name="image"
                    accept="image/*"
                    required={!suspect.imageUrl}
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
                    {evidenceItem.imageUrl && !evidenceItem.image && (
                        <img src={evidenceItem.imageUrl} alt={evidenceItem.title} width="150" />
                    )}
                    <br />
                    <label htmlFor={`image${index}`}>{evidenceItem.imageUrl ? 'Replace Image: ' : 'Image: '}</label>
                    <input
                    type="file"
                    id={`image${index}`}
                    name="image"
                    accept="image/*"
                    required={!evidenceItem.imageUrl}
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
                    {evidenceItem.suspectIndex !== '' && (
                        <>
                            <label htmlFor={`suspectResponse${index}`}>Suspect's answer about this: </label>
                            <textarea
                            id={`suspectResponse${index}`}
                            name="suspectResponse"
                            placeholder="e.g. That's not my glove. I've never seen it before."
                            onChange={(event) => handleEvidenceChange(index, event)}
                            value={evidenceItem.suspectResponse}/>
                            <br />
                            <label htmlFor={`responseTell${index}`}>Body Language (answer): </label>
                            <input
                            type="text"
                            id={`responseTell${index}`}
                            name="responseTell"
                            placeholder="e.g. Hides their hands under the table"
                            onChange={(event) => handleEvidenceChange(index, event)}
                            value={evidenceItem.responseTell}/>
                            <br />
                        </>
                    )}
                    <button type="button" onClick={() => removeEvidenceRow(index)}>Remove Evidence</button>
                </div>
            )}
            <button type="button" onClick={addEvidenceRow}>Add Evidence</button>
            <br />
            <button>Save Changes</button>
        </form>
    </>
  )
}

export default EditCase