/** @format */

import "./home.scss"
const wheelLayout = document.querySelector(".hero__wheel-layout")
const wheelImage = document.querySelector(".hero__wheel-image")
const spinButton = document.querySelector(".hero__spin-button")
const bonusItems = document.querySelector(".hero__bonus-items")
    const spinIcon = document.querySelector(".hero__spin-icon")

if (wheelLayout && wheelImage && spinButton && spinIcon && bonusItems) {
  let isSpinning = false
  let currentRotation = 0
  let stage = 0

  const SPIN_TIME = 4000
  const RESULT_DELAY = 900
  const POPUP_DELAY = 1400

  const openRegistrationPopup = () => {
    if (window.flsPopup?.open) {
      window.flsPopup.open("popup")
    }
  }

  const spinWheel = (targetStage) => {
    isSpinning = true

    wheelLayout.classList.remove("is-finished")
    wheelLayout.classList.add("is-spinning")

 
const fullSpins = 3
const sectorOffset = targetStage === 1 ? 0 : 315
const nextRotation = currentRotation + 360 * fullSpins + sectorOffset
    wheelImage.style.transition = "none"
    wheelImage.style.transform = `rotate(${currentRotation}deg)`

    wheelImage.offsetHeight

    wheelImage.style.transition = `transform ${SPIN_TIME}ms cubic-bezier(.12,.72,.16,1)`
    wheelImage.style.transform = `rotate(${nextRotation}deg)`

    const onSpinEnd = (event) => {
      if (event.propertyName !== "transform") return

      wheelImage.removeEventListener("transitionend", onSpinEnd)

      currentRotation = nextRotation

      wheelLayout.classList.remove("is-spinning")
      wheelLayout.classList.add("is-finished")

      wheelImage.style.transition = "none"
      wheelImage.style.transform = `rotate(${currentRotation}deg)`

      setTimeout(() => {
        if (targetStage === 1) {
          bonusItems.classList.add("is-bonus-left")
          stage = 1
          isSpinning = false
          return
        }

        if (targetStage === 2) {
          bonusItems.classList.add("is-bonus-right")
          stage = 2
          spinButton.disabled = true
          setTimeout(() => {
            openRegistrationPopup()
            isSpinning = false
          }, POPUP_DELAY)
        }
      }, RESULT_DELAY)
    }

    wheelImage.addEventListener("transitionend", onSpinEnd)
  }
wheelLayout.addEventListener("click", () => {
  if (isSpinning) return

  if (stage === 0) {
    spinWheel(1)
    return
  }

  if (stage === 1) {
    spinWheel(2)
  }
})
  // spinButton.addEventListener("click", () => {
  //   if (isSpinning) return

  //   if (stage === 0) {
  //     spinWheel(1)
  //     return
  //   }

  //   if (stage === 1) {
  //     spinWheel(2)
  //   }
  // })
}

 
// Form connection=================================
import { initPasswordToggle } from "./password-toggle.js"
import { initFormValidation } from "./form-validation.js"
import { initPhoneMask } from "./phone-select.js"
document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggle()
  initFormValidation()
  initPhoneMask()
})
