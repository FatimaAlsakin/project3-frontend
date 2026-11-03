import api from './api'

export async function getCases(){
    const response = await api.get('/case')
    return response.data
}

export async function postCase(newCase) {
    const response = await api.post('/case' , newCase)
    return response.data
}

export async function getCase(cId){
    const response = await api.get(`/case/${cId}`)
    return response.data    
}

export async function putCase(cId, updatedCase) {
    const response = await api.put(`/case/${cId}` , updatedCase)
    return response.data
}

export async function delCase(cId) {
    const response = await api.delete(`/case/${cId}`)
    return response.data    
}

export async function getSuspects(cId){
    const response = await api.get(`/case/${cId}/suspects`)
    return response.data
}

export async function postSuspect(cId, newSuspect) {
    const response = await api.post(`/case/${cId}/suspects` , newSuspect)
    return response.data
}

export async function putSuspect(cId, updatedSuspect) {
    const response = await api.put(`/case/${cId}/suspects` , updatedSuspect)
    return response.data
}

export async function delSuspect(cId) {
    const response = await api.delete(`/case/${cId}/suspects`)
    return response.data    
}


