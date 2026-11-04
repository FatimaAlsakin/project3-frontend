import api from './api'
//Add evidence
export const addEvidence = async(caseId, formData) => {
    try{
        const response = await api.post(`/evidence/${caseId}`, formData)
        return response.data
    }
    catch (err) {
        console.error('Error adding evidence:', err)
        throw err
    }
}

//Edit evidence
export const editEvidence = async(evidenceId, formData) => {
    try{
        const response = await api.put(`/evidence/${evidenceId}`, formData)
        return response.data
    }
    catch (err) {
        console.error('Error editing evidence:', err)
        throw err
    }
}


//Delete evidence from a case
export const deleteEvidence = async(evidenceId)=>{
    try{
        const response = await api.delete(`/evidence/${evidenceId}`)
        return response.data
    }
    catch(err){
        console.error('Error deleting evidence:', err)
        throw err
    }
}