import api from "./api";


export async function createNotes(cID,newComment){
    const response = await api.post(`/note/${cID}`,newComment)
    return response.data

}

export async function getAllNotes(caseId){
    const response = await api.get('/note/' + caseId)
    return response.data
}

export async function getNoteById(cID){
    const response = await api.get(`/note/${cID}`)
    return response.data
}

export async function updateNoteById(nID, updatedNote){
    const response = await api.put(`/note/${nID}`,updatedNote)
    return response.data
}

export async function deleteNoteById(nID){
    const response = await api.delete(`/note/${nID}`)
    return response.data
}
