import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'

export const notyf = new Notyf({
  position: { x: 'right', y: 'top' },
  duration: 3500,
  dismissible: true,
})

export function errorMessage(err, fallback = 'Something went wrong, try again.') {
  return err?.response?.data?.message || err?.response?.data?.err || fallback
}
