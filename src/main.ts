import './style.css'
import { PalmToast, ToastPosition, ToastType } from './toast'

let count = 0

document.querySelector('button')?.addEventListener('click', () => {
  const type = (document.querySelector('#toast-type') as HTMLSelectElement).value
  const position = (document.querySelector('#toast-position') as HTMLSelectElement).value
  const dissmissable = (document.querySelector('#dissmissable') as HTMLInputElement).checked

  count++

  new PalmToast({
    heading: `Toast Heading ${count}`,
    text: 'lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, quas.',
    position: position as ToastPosition,
    type: type as ToastType,
    duration: 8000,
    dissmissable: dissmissable,
  }).showToast()
})
