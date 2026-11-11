import api from "./api";

export async function getMessages(cId) {
    const response = await api.get(`/chat/${cId}`)
    return response.data
}

export async function postMessage(cId, text) {
    const response = await api.post(`/chat/${cId}`, { text })
    return response.data
}
