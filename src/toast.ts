export type PalmToastOptions = {
  heading?: string
  text: string
  position?: ToastPosition
  type?: ToastType
  duration?: number
  dissmissable?: boolean
}

export enum ToastPosition {
  BottomRight = 'bottom-right',
  BottomLeft = 'bottom-left',
  TopRight = 'top-right',
  TopLeft = 'top-left',
}

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Default = 'default',
}

export class PalmToast {
  private readonly text: string
  private readonly heading?: string
  private readonly position: ToastPosition
  private readonly type: ToastType
  private readonly duration: number
  private readonly dissmissable: boolean
  private toastElement?: HTMLElement
  private timeoutID?: number
  private toastSpacing = 10
  private positionModifier: 'top' | 'bottom'

  constructor(options: PalmToastOptions) {
    this.text = options.text
    this.heading = options.heading
    this.position = options.position ?? ToastPosition.BottomRight
    this.type = options.type ?? ToastType.Default
    this.duration = options.duration ?? 3000
    this.dissmissable = options.dissmissable ?? true
    this.positionModifier =
      this.position === ToastPosition.BottomRight || this.position === ToastPosition.BottomLeft
        ? 'bottom'
        : 'top'
  }

  private createToastElement(): HTMLElement {
    const toast = document.createElement('div')
    toast.className = 'toast'
    toast.setAttribute('toast-type', this.type)
    toast.setAttribute('toast-position', this.position)

    const innerHTML = `
      <strong>${this.heading ?? ''}</strong>
      <p class="toast-body">${this.text}</p>
    `
    toast.innerHTML = innerHTML

    if (this.dissmissable) {
      this.addCloseButton(toast)
    }

    return toast
  }

  public showToast() {
    try {
      this.toastElement = this.createToastElement()
      document.body.insertBefore(this.toastElement, document.body.lastChild)

      this.repositionToasts()

      this.timeoutID = window.setTimeout(() => {
        this.removeToast()
      }, this.duration)
    } catch (error) {
      console.error('An error occurred while generating your PalmToast: \n', error)
    }
  }

  private addCloseButton(toast: HTMLElement) {
    const closeButton = document.createElement('button')
    closeButton.className = 'toast-close'
    closeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>close</title><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor" /></svg>
    `
    closeButton.addEventListener('click', () => this.removeToast())
    toast.appendChild(closeButton)
  }

  private removeToast() {
    window.clearTimeout(this.timeoutID)

    if (this.toastElement) {
      this.toastElement.style.opacity = '0'
      this.toastElement.ontransitionend = () => {
        this.toastElement?.remove()
        this.repositionToasts()
      }
    }
  }

  private repositionToasts() {
    const toasts = document.querySelectorAll<HTMLElement>(
      `.toast[toast-position="${this.position}"]`
    )

    for (let i = toasts.length - 1; i >= 0; i--) {
      const toast = toasts[i]
      const totalHeight = toast.clientHeight * (toasts.length - i - 1)
      const spacing = this.toastSpacing * (toasts.length - i - 1)
      toast.style[this.positionModifier] = `${totalHeight + spacing}px`
    }
  }
}
