import { useState, useEffect } from 'react'
import { saveBoardPosition, addBoardString, removeBoardString, clearBoardStrings } from '../services/boardService'
import { useLiveCase } from './LiveCase'

const isLocalOnly = (id) => String(id).startsWith('draft-')

function onlyLocal(positions) {
  return Object.fromEntries(Object.entries(positions).filter(([id]) => isLocalOnly(id)))
}

export function useSharedBoard(caseId, shared) {
  const [positions, setPositions] = useState({})
  const [strings, setStrings] = useState([])

  // the board part of the shared refresh (see LiveCase.jsx)
  const live = useLiveCase()
  const latest = shared ? live?.data?.board : null

  useEffect(() => {
    if (!latest) return
    setPositions(prev => ({ ...onlyLocal(prev), ...latest.positions }))
    setStrings(latest.strings)
  }, [latest])

  async function save(request) {
    if (!shared || !live) return
    try {
      await live.track(request)
    } catch (err) {
      console.log(err)
    }
  }

  function moveItem(id, pos) {
    setPositions(prev => ({ ...prev, [id]: pos }))
    if (!isLocalOnly(id)) save(() => saveBoardPosition(caseId, id, pos))
  }

  function renameItem(oldId, newId) {
    const pos = positions[oldId]
    setPositions(prev => {
      const { [oldId]: _old, ...rest } = prev
      return pos ? { ...rest, [newId]: pos } : rest
    })
    if (pos) save(() => saveBoardPosition(caseId, newId, pos))
  }

  function forgetItem(id) {
    setPositions(prev => {
      const { [id]: _removed, ...rest } = prev
      return rest
    })
    setStrings(prev => prev.filter(s => s.a !== id && s.b !== id))
  }

  function addString(a, b) {
    setStrings(prev => [...prev, { a, b }])
    save(() => addBoardString(caseId, a, b))
  }

  function removeString(a, b) {
    setStrings(prev => prev.filter(s => !(s.a === a && s.b === b)))
    save(() => removeBoardString(caseId, a, b))
  }

  function clearStrings() {
    setStrings([])
    save(() => clearBoardStrings(caseId))
  }

  return { positions, strings, moveItem, renameItem, forgetItem, addString, removeString, clearStrings }
}
