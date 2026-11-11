import api from "./api";

export async function postMessage(cId, text) {
    const response = await api.post(`/chat/${cId}`, { text })
    return response.data
}
