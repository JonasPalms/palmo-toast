export type PalmToastOptions = {
  heading?: string
  text: string
  position?: ToastPosition
  type?: ToastType
  duration?: number
  dissmissable?: boolean
  draggable?: boolean
  showTimer?: boolean
  pauseOnHover?: boolean
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
  private readonly draggable: boolean
  private readonly showTimer: boolean
  private readonly pauseOnHover: boolean
  private toastElement?: HTMLElement
  private timeBar?: HTMLElement
  private closeButton?: HTMLElement
  private toastSpacing = 10
  private positionModifier: 'top' | 'bottom'
  private requestAnimationID?: number
  private isPaused: boolean = false

  constructor(options: PalmToastOptions) {
    this.text = options.text
    this.heading = options.heading
    this.position = options.position ?? ToastPosition.BottomRight
    this.type = options.type ?? ToastType.Default
    this.duration = options.duration ?? 3000
    this.dissmissable = options.dissmissable ?? true
    this.draggable = options.draggable ?? true
    this.showTimer = options.showTimer ?? false
    this.pauseOnHover = options.pauseOnHover ?? true
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

    toast.innerHTML = `
      <strong>${this.heading ?? ''}</strong>
      <p class="toast-body">${this.text}</p>
    `

    if (this.dissmissable) {
      this.addCloseButton(toast)
    }

    if (this.draggable) {
      this.makeDraggable(toast)
    }

    if (this.showTimer) {
      this.addTimeBar(toast)
    }

    return toast
  }

  public showToast() {
    try {
      this.toastElement = this.createToastElement()
      document.body.insertBefore(this.toastElement, document.body.lastChild)

      this.repositionToasts()

      this.beginTimer()
    } catch (error) {
      console.error('An error occurred while generating your PalmToast: \n', error)
    }
  }

  private addCloseButton(toast: HTMLElement) {
    this.closeButton = document.createElement('button')
    this.closeButton.className = 'toast-close'
    this.closeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>close</title><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor" /></svg>
    `
    this.closeButton.addEventListener('click', () => this.removeToast())
    toast.appendChild(this.closeButton)
  }

  private makeDraggable(toast: HTMLElement) {
    console.log(toast)
  }

  private beginTimer() {
    let startTime: number | undefined
    let pausedStartTime: number | undefined
    let pausedDuration: number = 0
    let elapsedTime: number = 0

    // Flags to track hover and focus states
    let isHoverPaused: boolean = false
    let isFocusPaused: boolean = false

    const updateTimerLoop = (timeStamp: number) => {
      if (!startTime) {
        startTime = timeStamp
      }

      console.count('calling')
      elapsedTime = timeStamp - startTime - pausedDuration

      const remainingTime = Math.max(0, this.duration - elapsedTime)

      if (this.timeBar) {
        const percentage = (remainingTime / this.duration) * 100
        this.timeBar.style.width = `${percentage}%`
      }

      if (remainingTime > 0) {
        this.requestAnimationID = requestAnimationFrame(updateTimerLoop)
      } else {
        this.removeToast()
      }
    }

    const pauseTimer = () => {
      if (this.requestAnimationID) {
        cancelAnimationFrame(this.requestAnimationID)
        this.requestAnimationID = undefined
        pausedStartTime = performance.now()
      }
    }

    const resumeTimer = () => {
      if (pausedStartTime) {
        pausedDuration += performance.now() - pausedStartTime
        pausedStartTime = undefined
        this.requestAnimationID = requestAnimationFrame(updateTimerLoop)
      }
    }

    const pause = () => {
      if (!this.isPaused) {
        this.isPaused = true
        pauseTimer()
      }
    }

    const tryResume = () => {
      if (!isHoverPaused && !isFocusPaused && this.isPaused) {
        this.isPaused = false
        resumeTimer()
      }
    }

    // Mouse events for pause/resume
    if (this.pauseOnHover) {
      this.toastElement?.addEventListener('mouseenter', () => {
        isHoverPaused = true
        pause()
      })
      this.toastElement?.addEventListener('mouseleave', () => {
        isHoverPaused = false
        tryResume() // Only resume if focus is also not active
      })

      // Focus events for pause/resume on close button
      this.closeButton?.addEventListener('focus', () => {
        isFocusPaused = true
        pause()
      })
      this.closeButton?.addEventListener('blur', () => {
        isFocusPaused = false
        tryResume() // Only resume if hover is also not active
      })
    }

    // Initially start the timer
    this.requestAnimationID = requestAnimationFrame(updateTimerLoop)
  }
  private addTimeBar(toast: HTMLElement) {
    this.timeBar = document.createElement('div')
    this.timeBar.className = 'toast-time-bar'
    toast.appendChild(this.timeBar)
  }

  private removeToast() {
    if (!this.toastElement) return

    this.toastElement.style.opacity = '0'
    this.toastElement.ontransitionend = () => {
      this.toastElement?.remove()
      this.repositionToasts()
      if (this.requestAnimationID) {
        cancelAnimationFrame(this.requestAnimationID)
        this.requestAnimationID = undefined
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
