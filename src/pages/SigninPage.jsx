// src/components/SignInForm/SignInForm.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router';

import { signIn } from '../services/authService';

import "../styles/Auth.css";
import { notyf, errorMessage } from "../utils/notify";

const SignInForm = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  function handleChange(event){
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event){
    event.preventDefault();
    try {
      const signedInUser = await signIn(formData);

      setUser(signedInUser);
      notyf.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      notyf.error(errorMessage(err, 'Unable to sign in. Please try again.'));
    }
  };

  return (
    <main className='authPage'>
      <div className='authForm'>
      <h1>Sign In</h1>
      <p className="authSubtitle">
        Access your account and continue the investigation
      </p>
      <form autoComplete='off' onSubmit={handleSubmit}>
        <div className='authField'>
          <label htmlFor='email'>Username:</label>
          <input
            type='text'
            autoComplete='off'
            id='username'
            value={formData.username}
            name='username'
            onChange={handleChange}
            required
          />
        </div>
        <div className='authField'>
          <label htmlFor='password'>Password:</label>
          <input
            type='password'
            autoComplete='off'
            id='password'
            value={formData.password}
            name='password'
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <button className="authButton">Sign In</button>
          <button className="cancelButton" type='button' onClick={() => navigate('/')}>Cancel</button>
        </div>
      </form>
      </div>
    </main>
  );
};

export default SignInForm;
