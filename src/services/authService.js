
import api from './api'

async function signUp(formData){
    await api.post('/auth/sign-up',formData)
}

async function signIn(formData){
    const response = await api.post('/auth/sign-in',formData)
    localStorage.setItem('token', response.data.accessToken);
    return response.data.user
}



function logout(){

    localStorage.removeItem("token");

}

export {
  signUp,
  signIn,
  logout
};
