import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from "react-router"
import { getCase , delCase } from '../../services/caseService'
import { postAttemps, getSolveStatus } from '../../services/solveService'
import CaseBoard from '../../components/CaseBoard'
import TeamChat, { ChatTab } from '../../components/TeamChat'
import { LiveCaseProvider } from '../../components/LiveCase'
import '../../styles/SolveAttempt.css'

function SloveAttepmt({user}) {

  const [ Case, setCase ] = useState(null)
  const [ suspects, setSuspects ] = useState([])
  const [ evidance, setEvidence ] = useState([])
   const [selectedSuspect , setselectedSuspect]= useState("")
   const [result, setResult] = useState(null)
   const [progress, setProgress] = useState({ solved: false, failed: false, attemptsLeft: null, maxAttempts: null })
   const { solved, failed } = progress
   const locked = solved || failed

   // is the team chat open? remembered in this browser
   const [chatOpen, setChatOpen] = useState(() => {
     try { return localStorage.getItem('team-chat-open') !== 'false' } catch { return true }
   })

   useEffect(() => {
     try { localStorage.setItem('team-chat-open', String(chatOpen)) } catch { /* storage unavailable */ }
   }, [chatOpen])

   function loadProgress(){
     getSolveStatus(cId).then(setProgress).catch(err => console.log(err))
   }

      const { cId } = useParams()

      async function accuse(suspectId){
        let outcome
        try {
          const response = await postAttemps(cId, { susbectId: suspectId })
          outcome = { isCorrect: response.isCorrect, attemptsLeft: response.attemptsLeft }
          setProgress(prev => ({
            ...prev,
            solved: response.isCorrect,
            failed: !response.isCorrect && response.attemptsLeft === 0,
            attemptsLeft: response.attemptsLeft,
          }))
        } catch (err) {
          outcome = { error: err.response?.data?.message || "Something went wrong, try again." }
          loadProgress()
        }
        setResult(outcome)
        return outcome
      }

      async function handleSolveAttempt(event){
        event.preventDefault()
        if (!selectedSuspect) {
          setResult({ error: "Pick a suspect first." })
          return
        }
        accuse(selectedSuspect)
      }
  const navigate = useNavigate()

  async function loadCase(cId) {
    const response = await getCase(cId)
    setCase(response.case)
    setSuspects(response.suspects)
    setEvidence(response.evidence)
  }

  async function deleteCase(cId){
    const response = await delCase(cId)
    navigate("/cases")
  }

  useEffect(()=>{
    loadCase(cId)
    loadProgress()
  },[cId])

  return (
    <>
    {/* one shared refresh for the chat, board and notes on this page */}
    <LiveCaseProvider cId={cId}>
    <div className='solve-layout'>
      <aside className={`solve-chat ${chatOpen ? '' : 'closed'}`}>
        {chatOpen
          ? <TeamChat cId={cId} user={user} onClose={() => setChatOpen(false)} />
          : <ChatTab user={user} onOpen={() => setChatOpen(true)} />}
      </aside>

      <main className='solve-main'>
      {Case ? (
        // the board shows the title, attempts left and solved / failed stamp itself;
        // everything inside <CaseBoard> goes along the bottom of the board
        <CaseBoard Case={Case} suspects={suspects} evidence={evidance} interactive user={user} onAccuse={accuse} progress={progress}>
          <button type='button' className='board-btn board-back' onClick={() => navigate(-1)} aria-label='Go back'>‹</button>

          {user.isAdmin && (
            <>
              <Link className='board-btn' to={`/case/${cId}/edit`}>✏️ Edit case</Link>
              <button type='button' className='board-btn danger' onClick={() => deleteCase(cId)}>🗑️ Delete case</button>
            </>
          )}

          <form className='accuse-slip taped' onSubmit={handleSolveAttempt}>
            <label htmlFor="suspect">Who did it?</label>
            <select
              name="suspect"
              value={selectedSuspect}
              id="suspect"
              disabled={locked}
              onChange={e => { setselectedSuspect(e.target.value); setResult(null) }}>
              <option value="" disabled>-- choose a suspect --</option>
              {suspects.map((oneSuspect) =>
                <option key={oneSuspect._id} value={oneSuspect._id}>{oneSuspect.name}</option>
              )}
            </select>
            <button className='board-btn danger' disabled={locked}>🔍 Accuse</button>

            {result?.error && <p className='accuse-result'>{result.error}</p>}
            {result && !result.error && (
              <p className='accuse-result'>
                {result.isCorrect
                  ? "✅ Case solved! You caught the culprit."
                  : result.attemptsLeft === 0
                    ? "❌ Wrong suspect. That was your last attempt."
                    : "❌ Wrong suspect. Keep investigating."}
              </p>
            )}
          </form>
        </CaseBoard>
      ) : (
        <p className='solve-loading'>Opening the case file…</p>
      )}
      </main>
    </div>
    </LiveCaseProvider>
    </>
  )
}

export default SloveAttepmt