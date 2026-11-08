import api from './api'

export async function getCases(){
    const response = await api.get('/cases')
    return response.data
}

export async function postCase(newCase) {
    const response = await api.post('/cases' , newCase)
    return response.data
}

export async function getCase(cId){
    const response = await api.get(`/cases/${cId}`)
    return response.data    
}

export async function putCase(cId, updatedCase) {
    const response = await api.put(`/cases/${cId}` , updatedCase)
    return response.data
}

export async function delCase(cId) {
    const response = await api.delete(`/cases/${cId}`)
    return response.data    
}

export async function getSuspects(cId){
    const response = await api.get(`/cases/${cId}/suspects`)
    return response.data
}

export async function postSuspect(cId, newSuspect) {
    const response = await api.post(`/cases/${cId}/suspects` , newSuspect)
    return response.data
}

export async function putSuspect(cId, sId, updatedSuspect) {
    const response = await api.put(`/cases/${cId}/suspects/${sId}` , updatedSuspect)
    return response.data
}

export async function delSuspect(cId, sId) {
    const response = await api.delete(`/cases/${cId}/suspects/${sId}`)
    return response.data    
}


