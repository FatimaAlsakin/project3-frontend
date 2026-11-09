import api from "./api";


export async function teamSolveAttempt(cID){
    const response = await api.get(`/solve/${cID}`)
    return response.data

}

export async function postAttemps(cID,attemptData){
    const response = await api.post(`/solve/${cID}`,attemptData)
    return response.data

}

export async function allAtemp(cID){
    const response = await api.get(`/solve/${cID}`)
    return response.data
}

