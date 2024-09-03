import './style.css'
import { PalmToast, ToastPosition, ToastType } from './toast'

let count = 0

document.querySelector('button')?.addEventListener('click', () => {
  const type = (document.querySelector('#toast-type') as HTMLSelectElement).value
  const position = (document.querySelector('#toast-position') as HTMLSelectElement).value

  count++

  new PalmToast({
    text: 'Hello World!',
    heading: `Toast Heading ${count}`,
    position: position as ToastPosition,
    type: type as ToastType,
    duration: 8000,
    dissmissable: false,
  }).showToast()
})
