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


// { solved: true/false } for the logged in user's team
export async function getSolveStatus(cID){
    const response = await api.get(`/solve/${cID}/status`)
    return response.data
}

// ids of the cases the logged in user's team has solved
export async function getSolvedCases(){
    const response = await api.get('/solve/solved')
    return response.data
}

// ids of the cases the logged in user's team ran out of attempts on
export async function getFailedCases(){
    const response = await api.get('/solve/failed')
    return response.data
}
