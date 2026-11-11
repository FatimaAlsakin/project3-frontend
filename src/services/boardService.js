import api from "./api";

export async function saveBoardPosition(cId, itemId, { x, y }) {
    const response = await api.put(`/board/${cId}/positions/${itemId}`, { x, y })
    return response.data
}

export async function addBoardString(cId, a, b) {
    const response = await api.post(`/board/${cId}/strings`, { a, b })
    return response.data
}

export async function removeBoardString(cId, a, b) {
    const response = await api.delete(`/board/${cId}/strings/${a}/${b}`)
    return response.data
}

export async function clearBoardStrings(cId) {
    const response = await api.delete(`/board/${cId}/strings`)
    return response.data
}
