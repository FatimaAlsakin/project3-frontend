import api from './api'

//Get all teams
export const getAllTeams = async () => {
    try {
        const response = await api.get('/teams')
        return response.data
    } catch (error) {
        console.error('Error fetching teams:', error)
        throw error
    }
}

//Create a new team
export const createTeam = async (formData) => {
    try {
        const response = await api.post('/teams', formData)
        return response.data
    } catch (error) {
        console.error('Error creating team:', error)
        throw error
    }
}


//Join a team
export const joinTeam = async (teamId) => {
    try {
        const response = await api.put(`/teams/${teamId}/join`)
        return response.data
    } catch (error) {
        console.error('Error joining team:', error)
        throw error
    }
}

//Current user's team and members
export const getMyTeam = async () => {
    try {
        const response = await api.get('/teams/my-team')
        return response.data
    } catch (error) {
        console.error('Error fetching my team:', error)
        throw error
    }
}


//Leave a team
export const leaveTeam = async () => {
    try {
        const response = await api.put('/teams/leave')
        return response.data
    } catch (error) {
        console.error('Error leaving team:', error)
        throw error
    }
}