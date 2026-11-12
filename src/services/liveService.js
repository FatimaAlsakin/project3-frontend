import api from "./api";

// { inTeam, messages, board: { positions, strings }, notes } for one case
export async function getLive(cId) {
    const response = await api.get(`/live/${cId}`)
    return response.data
}
