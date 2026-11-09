import "../styles/Homepage.css"
import { Link } from "react-router"

function Homepage() {
  return (
    <div>
      <main className="homepage">

        <section className="homeIntro">
          <p className="subtitle">A MULTIPLAYER MYSTERY EXPERIENCE</p>

          <h1>
            EVERY CASE HAS A<span className="secret"> SECRET</span>
          </h1>

          <p className="description">
            Investigate clues, question suspects, and work together to uncover the truth.
          </p>

          <div className="buttons">
            <Link to="/cases" className="exploreBtn">Explore Cases</Link>
            <a href="#howToPlay" className="howBtn">How to Play</a>
          </div>

        </section>

      </main>

      <section id="howToPlay" className="howToPlay">
        <h2>HOW TO <span>PLAY</span></h2>
        <p>Team up, investigate, and solve the case before anyone else.</p>

        <div className="playSteps">
          <div className="playStep">
            <img src="/images/step1.png" />
            <h3>01. CREATE OR JOIN A TEAM</h3>
            <p>Sign in, create your own team or join an existing one.</p>
          </div>

          <div className="playStep">
            <img src="/images/step2.png" />
            <h3>02. EXPLORE THE CASE</h3>
            <p>Read the briefing, review suspects, and examine evidence.</p>
          </div>

          <div className="playStep">
            <img src="/images/step3.png" />
            <h3>03. DISCUSS & ANALYZE</h3>
            <p>Share notes with your team and connect the clues.</p>
          </div>

          <div className="playStep">
            <img src="/images/step4.png" />
            <h3>04. SUBMIT YOUR ANSWER</h3>
            <p>Choose the guilty suspect and submit your answer.</p>
          </div>
        </div>
      </section>

      <section className="faqSection">
        <h2>FREQUENTLY ASKED <span>QUESTIONS</span></h2>
        <p className="faqDescription">Everything you need to know before starting your investigation.</p>

        <div className="faqList">
          <details>
            <summary>Do I need an account to play?</summary>
            <p>You can browse cases without an account, but you need to sign in to play.</p>
          </details>

          <details>
            <summary>Can I play without a team?</summary>
            <p>No, you need to create or join a team to start investigating.</p>
          </details>

          <details>
            <summary>How do we solve a case?</summary>
            <p>Review the evidence, discuss with your team, and submit the suspect you believe is guilty.</p>
          </details>

          <details>
            <summary>Can I keep my own investigation notes?</summary>
            <p>Yes, you can write private notes while investigating a case.</p>
          </details>
        </div>
      </section>
    </div>
  )
}

export default Homepage