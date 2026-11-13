import { useState } from "react";
import { useNavigate } from "react-router";
import { signUp } from "../services/authService";
import "../styles/Auth.css"
import { notyf, errorMessage } from "../utils/notify";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    passwordConf: "",
  });
  const [ submitting, setSubmitting ] = useState(false)

  const { username, password, passwordConf } = formData;

  function handleChange(event){
    setFormData({ ...formData, [event.target.name]: event.target.value });

  }


  async function handleSubmit(event){
    event.preventDefault();
    try {
      setSubmitting(true)
      await signUp(formData);
      notyf.success('Account created! Please sign in.')
      navigate('/sign-in')
    } catch (err) {
      notyf.error(errorMessage(err, "Unable to sign up. Please try again."));
      setSubmitting(false)
    }
  }

  function isFormInvalid(){
    return !(username && password && password === passwordConf);
  };

  return (
    <main className="authPage">
      <div className="authForm">
      <h1>Sign Up</h1>
      <p className="authSubtitle">
        Create your account and start investigating
      </p>
      <form onSubmit={handleSubmit}>
        <div className="authField">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            name="username"
            onChange={handleChange}
            required
          />
        </div>
        <div className="authField">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            name="password"
            onChange={handleChange}
            required
          />
        </div>
        <div className="authField">
          <label htmlFor="confirm">Confirm Password:</label>
          <input
            type="password"
            id="confirm"
            value={passwordConf}
            name="passwordConf"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <button className="authButton" disabled={isFormInvalid() || submitting}>{submitting ? 'Signing up...' : 'Sign Up'}</button>
          <button className="cancelButton" onClick={() => navigate("/")}>Cancel</button>
        </div>
      </form>
      </div>
    </main>
  );
}
export default Signup;
