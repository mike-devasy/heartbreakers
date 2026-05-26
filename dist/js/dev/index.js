import { b as bodyLock, a as bodyUnlock, c as bodyLockStatus } from "./common.min.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class Popup {
  constructor(options) {
    let config = {
      logging: true,
      init: true,
      //Для кнопок
      attributeOpenButton: "data-fls-popup-link",
      // Атрибут для кнопки, яка викликає попап
      attributeCloseButton: "data-fls-popup-close",
      // Атрибут для кнопки, що закриває попап
      // Для сторонніх об'єктів
      fixElementSelector: "[data-fls-lp]",
      // Атрибут для елементів із лівим паддингом (які fixed)
      // Для об'єкту попапа
      attributeMain: "data-fls-popup",
      youtubeAttribute: "data-fls-popup-youtube",
      // Атрибут для коду youtube
      youtubePlaceAttribute: "data-fls-popup-youtube-place",
      // Атрибут для вставки ролика youtube
      setAutoplayYoutube: true,
      // Зміна класів
      classes: {
        popup: "popup",
        // popupWrapper: 'popup__wrapper',
        popupContent: "data-fls-popup-body",
        popupActive: "data-fls-popup-active",
        // Додається для попапа, коли він відкривається
        bodyActive: "data-fls-popup-open"
        // Додається для боді, коли попап відкритий
      },
      focusCatch: true,
      // Фокус усередині попапа зациклений
      closeEsc: true,
      // Закриття ESC
      bodyLock: true,
      // Блокування скролла
      hashSettings: {
        location: true,
        // Хеш в адресному рядку
        goHash: true
        // Перехід по наявності в адресному рядку
      },
      on: {
        // Події
        beforeOpen: function() {
        },
        afterOpen: function() {
        },
        beforeClose: function() {
        },
        afterClose: function() {
        }
      }
    };
    this.youTubeCode;
    this.isOpen = false;
    this.targetOpen = {
      selector: false,
      element: false
    };
    this.previousOpen = {
      selector: false,
      element: false
    };
    this.lastClosed = {
      selector: false,
      element: false
    };
    this._dataValue = false;
    this.hash = false;
    this._reopen = false;
    this._selectorOpen = false;
    this.lastFocusEl = false;
    this._focusEl = [
      "a[href]",
      'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
      "button:not([disabled]):not([aria-hidden])",
      "select:not([disabled]):not([aria-hidden])",
      "textarea:not([disabled]):not([aria-hidden])",
      "area[href]",
      "iframe",
      "object",
      "embed",
      "[contenteditable]",
      '[tabindex]:not([tabindex^="-"])'
    ];
    this.options = {
      ...config,
      ...options,
      classes: {
        ...config.classes,
        ...options?.classes
      },
      hashSettings: {
        ...config.hashSettings,
        ...options?.hashSettings
      },
      on: {
        ...config.on,
        ...options?.on
      }
    };
    this.bodyLock = false;
    this.options.init ? this.initPopups() : null;
  }
  initPopups() {
    this.buildPopup();
    this.eventsPopup();
  }
  buildPopup() {
  }
  eventsPopup() {
    document.addEventListener("click", (function(e) {
      const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
      if (buttonOpen) {
        e.preventDefault();
        this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
        this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
        if (this._dataValue !== "error") {
          if (!this.isOpen) this.lastFocusEl = buttonOpen;
          this.targetOpen.selector = `${this._dataValue}`;
          this._selectorOpen = true;
          this.open();
          return;
        }
        return;
      }
      const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
      if (buttonClose || !e.target.closest(`[${this.options.classes.popupContent}]`) && this.isOpen) {
        e.preventDefault();
        this.close();
        return;
      }
    }).bind(this));
    document.addEventListener("keydown", (function(e) {
      if (this.options.closeEsc && e.which == 27 && e.code === "Escape" && this.isOpen) {
        e.preventDefault();
        this.close();
        return;
      }
      if (this.options.focusCatch && e.which == 9 && this.isOpen) {
        this._focusCatch(e);
        return;
      }
    }).bind(this));
    if (this.options.hashSettings.goHash) {
      window.addEventListener("hashchange", (function() {
        if (window.location.hash) {
          this._openToHash();
        } else {
          this.close(this.targetOpen.selector);
        }
      }).bind(this));
      if (window.location.hash) {
        this._openToHash();
      }
    }
  }
  open(selectorValue) {
    if (bodyLockStatus) {
      this.bodyLock = document.documentElement.hasAttribute("data-fls-scrolllock") && !this.isOpen ? true : false;
      if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
        this.targetOpen.selector = selectorValue;
        this._selectorOpen = true;
      }
      if (this.isOpen) {
        this._reopen = true;
        this.close();
      }
      if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
      if (!this._reopen) this.previousActiveElement = document.activeElement;
      this.targetOpen.element = document.querySelector(`[${this.options.attributeMain}=${this.targetOpen.selector}]`);
      if (this.targetOpen.element) {
        const codeVideo = this.youTubeCode || this.targetOpen.element.getAttribute(`${this.options.youtubeAttribute}`);
        if (codeVideo) {
          const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;
          const iframe = document.createElement("iframe");
          const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
          iframe.setAttribute("allowfullscreen", "");
          iframe.setAttribute("allow", `${autoplay}; encrypted-media`);
          iframe.setAttribute("src", urlVideo);
          if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
            this.targetOpen.element.querySelector("[data-fls-popup-content]").setAttribute(`${this.options.youtubePlaceAttribute}`, "");
          }
          this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
        }
        if (this.options.hashSettings.location) {
          this._getHash();
          this._setHash();
        }
        this.options.on.beforeOpen(this);
        document.dispatchEvent(new CustomEvent("beforePopupOpen", {
          detail: {
            popup: this
          }
        }));
        this.targetOpen.element.setAttribute(this.options.classes.popupActive, "");
        document.documentElement.setAttribute(this.options.classes.bodyActive, "");
        if (!this._reopen) {
          !this.bodyLock ? bodyLock() : null;
        } else this._reopen = false;
        this.targetOpen.element.setAttribute("aria-hidden", "false");
        this.previousOpen.selector = this.targetOpen.selector;
        this.previousOpen.element = this.targetOpen.element;
        this._selectorOpen = false;
        this.isOpen = true;
        setTimeout(() => {
          this._focusTrap();
        }, 50);
        this.options.on.afterOpen(this);
        document.dispatchEvent(new CustomEvent("afterPopupOpen", {
          detail: {
            popup: this
          }
        }));
      }
    }
  }
  close(selectorValue) {
    if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
      this.previousOpen.selector = selectorValue;
    }
    if (!this.isOpen || !bodyLockStatus) {
      return;
    }
    this.options.on.beforeClose(this);
    document.dispatchEvent(new CustomEvent("beforePopupClose", {
      detail: {
        popup: this
      }
    }));
    if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
      setTimeout(() => {
        this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = "";
      }, 500);
    }
    this.previousOpen.element.removeAttribute(this.options.classes.popupActive);
    this.previousOpen.element.setAttribute("aria-hidden", "true");
    if (!this._reopen) {
      document.documentElement.removeAttribute(this.options.classes.bodyActive);
      !this.bodyLock ? bodyUnlock() : null;
      this.isOpen = false;
    }
    this._removeHash();
    if (this._selectorOpen) {
      this.lastClosed.selector = this.previousOpen.selector;
      this.lastClosed.element = this.previousOpen.element;
    }
    this.options.on.afterClose(this);
    document.dispatchEvent(new CustomEvent("afterPopupClose", {
      detail: {
        popup: this
      }
    }));
    setTimeout(() => {
      this._focusTrap();
    }, 50);
  }
  // Отримання хешу 
  _getHash() {
    if (this.options.hashSettings.location) {
      this.hash = `#${this.targetOpen.selector}`;
    }
  }
  _openToHash() {
    let classInHash = window.location.hash.replace("#", "");
    const openButton = document.querySelector(`[${this.options.attributeOpenButton}="${classInHash}"]`);
    if (openButton) {
      this.youTubeCode = openButton.getAttribute(this.options.youtubeAttribute) ? openButton.getAttribute(this.options.youtubeAttribute) : null;
    }
    if (classInHash) this.open(classInHash);
  }
  // Встановлення хеша
  _setHash() {
    history.pushState("", "", this.hash);
  }
  _removeHash() {
    history.pushState("", "", window.location.href.split("#")[0]);
  }
  _focusCatch(e) {
    const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
    const focusArray = Array.prototype.slice.call(focusable);
    const focusedIndex = focusArray.indexOf(document.activeElement);
    if (e.shiftKey && focusedIndex === 0) {
      focusArray[focusArray.length - 1].focus();
      e.preventDefault();
    }
    if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
      focusArray[0].focus();
      e.preventDefault();
    }
  }
  _focusTrap() {
    const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
    if (!this.isOpen && this.lastFocusEl) {
      this.lastFocusEl.focus();
    } else {
      focusable[0].focus();
    }
  }
}
document.querySelector("[data-fls-popup]") ? window.addEventListener("load", () => window.flsPopup = new Popup({})) : null;
function headerScroll() {
  const header = document.querySelector("[data-fls-header-scroll]");
  const headerShow = header.hasAttribute("data-fls-header-scroll-show");
  const headerShowTimer = header.dataset.flsHeaderScrollShow ? header.dataset.flsHeaderScrollShow : 500;
  const startPoint = header.dataset.flsHeaderScroll ? header.dataset.flsHeaderScroll : 1;
  let scrollDirection = 0;
  let timer;
  document.addEventListener("scroll", function(e) {
    const scrollTop = window.scrollY;
    clearTimeout(timer);
    if (scrollTop >= startPoint) {
      !header.classList.contains("--header-scroll") ? header.classList.add("--header-scroll") : null;
      if (headerShow) {
        if (scrollTop > scrollDirection) {
          header.classList.contains("--header-show") ? header.classList.remove("--header-show") : null;
        } else {
          !header.classList.contains("--header-show") ? header.classList.add("--header-show") : null;
        }
        timer = setTimeout(() => {
          !header.classList.contains("--header-show") ? header.classList.add("--header-show") : null;
        }, headerShowTimer);
      }
    } else {
      header.classList.contains("--header-scroll") ? header.classList.remove("--header-scroll") : null;
      if (headerShow) {
        header.classList.contains("--header-show") ? header.classList.remove("--header-show") : null;
      }
    }
    scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
  });
}
document.querySelector("[data-fls-header-scroll]") ? window.addEventListener("load", headerScroll) : null;
function initPasswordToggle() {
  const toggles = document.querySelectorAll(".field__toggle");
  toggles.forEach((toggle) => {
    const field = toggle.closest(".field");
    const passwordInput = field?.querySelector('input[type="password"], input[type="text"]');
    if (!passwordInput) {
      return;
    }
    toggle.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      toggle.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
    });
  });
}
const SUBMIT_LABEL_DEFAULT = "Sign Up";
const SUBMIT_LABEL_PENDING = "Submitting...";
const SUBMIT_ERROR_MESSAGE = "Adapter is not connected yet.";
const setSubmitButtonState = (button, isPending) => {
  if (!button) {
    return;
  }
  const labelNode = button.querySelector(".register-form__submit-text");
  if (labelNode) {
    labelNode.textContent = isPending ? SUBMIT_LABEL_PENDING : SUBMIT_LABEL_DEFAULT;
  } else {
    button.textContent = isPending ? SUBMIT_LABEL_PENDING : SUBMIT_LABEL_DEFAULT;
  }
  button.disabled = isPending;
  button.classList.toggle("is-loading", isPending);
};
async function handleFormSubmit(form) {
  const submitButton = form.querySelector(".register-form__submit");
  const errorBlock = form.querySelector("#register-form-error");
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  const adapter = window.patrickLandingAdapter;
  setSubmitButtonState(submitButton, true);
  if (errorBlock) {
    errorBlock.hidden = true;
    errorBlock.textContent = "";
  }
  try {
    if (!adapter || typeof adapter.submit !== "function") {
      throw new Error("Missing adapter");
    }
    const response = await adapter.submit(data, { form });
    if (response?.redirectUrl) {
      window.location.assign(response.redirectUrl);
    }
  } catch (error) {
    if (errorBlock) {
      errorBlock.hidden = false;
      errorBlock.textContent = SUBMIT_ERROR_MESSAGE;
    }
  } finally {
    setSubmitButtonState(submitButton, false);
  }
}
const AR_COUNTRY_CODE = "54";
const AR_PHONE_PREFIX = `+${AR_COUNTRY_CODE} `;
const AR_LOCAL_PHONE_LENGTH = 10;
const getPhoneLocalDigits = (phoneNumber = "") => {
  const digits = String(phoneNumber).replace(/\D/g, "");
  return digits.startsWith(AR_COUNTRY_CODE) ? digits.slice(AR_COUNTRY_CODE.length) : digits;
};
const isValidArPhone = (phoneNumber = "") => getPhoneLocalDigits(phoneNumber).length === AR_LOCAL_PHONE_LENGTH;
const normalizePhone = (phoneNumber = "") => {
  const localDigits = getPhoneLocalDigits(phoneNumber);
  return localDigits ? `+${AR_COUNTRY_CODE}${localDigits}` : "";
};
function initFormValidation() {
  const form = document.querySelector("#register-form");
  if (!form) return;
  const phone = form.elements.phone;
  const email = form.elements.email;
  const password = form.elements.password;
  const isAdult = form.elements.isAdult;
  const serverError = form.querySelector("#register-form-error");
  let hasAttemptedSubmit = false;
  const fieldInputs = [phone, email, password];
  const setFieldErrorVisibility = (input, isValid, shouldShow = false) => {
    const field = input?.closest(".field");
    const error = field?.querySelector(".field__error");
    if (!field) return;
    field.classList.toggle("field--invalid", shouldShow && !isValid);
    if (error) {
      error.classList.toggle("shown", shouldShow && !isValid);
    }
  };
  const setCheckboxErrorVisibility = (input, isValid, shouldShow = false) => {
    const field = input?.closest(".check");
    const error = field?.querySelector(".field__error");
    if (!field) return;
    field.classList.toggle("field--invalid", shouldShow && !isValid);
    if (error) {
      error.classList.toggle("shown", shouldShow && !isValid);
    }
  };
  const validateInput = (input, shouldShow = false) => {
    let isValid = false;
    if (input === phone) {
      isValid = isValidArPhone(phone.value);
    }
    if (input === email) {
      const value = email.value.trim();
      isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    if (input === password) {
      isValid = password.value.trim().length >= 8;
    }
    setFieldErrorVisibility(input, isValid, shouldShow);
    return isValid;
  };
  const validateCheckbox = (shouldShow = false) => {
    const isValid = Boolean(isAdult?.checked);
    setCheckboxErrorVisibility(isAdult, isValid, shouldShow);
    return isValid;
  };
  const validateForm = (shouldShow = false) => {
    const fieldsValid = fieldInputs.map((input) => validateInput(input, shouldShow)).every(Boolean);
    const checkboxValid = validateCheckbox(shouldShow);
    return fieldsValid && checkboxValid;
  };
  fieldInputs.forEach((input) => {
    input.addEventListener("input", () => {
      if (serverError) {
        serverError.hidden = true;
        serverError.textContent = "";
      }
      validateForm(hasAttemptedSubmit);
    });
    input.addEventListener("blur", () => {
      validateForm(hasAttemptedSubmit);
    });
  });
  if (isAdult) {
    isAdult.addEventListener("change", () => {
      validateForm(hasAttemptedSubmit);
    });
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hasAttemptedSubmit = true;
    const isFormValid = validateForm(true);
    if (!isFormValid) return;
    if (phone) {
      phone.value = normalizePhone(phone.value);
    }
    await handleFormSubmit(form);
  });
  validateForm();
}
function initPhoneMask() {
  const phoneInput = document.querySelector('input[name="phone"]');
  if (!phoneInput) {
    return;
  }
  if (typeof window.IMask !== "function") {
    return;
  }
  const mask = window.IMask(phoneInput, {
    mask: "+{54} (000) 000 - 0000"
  });
  const getPrefixLength = () => AR_PHONE_PREFIX.length;
  const clampCaretToPrefix = () => {
    const prefixLength = getPrefixLength();
    window.requestAnimationFrame(() => {
      const selectionStart = phoneInput.selectionStart ?? prefixLength;
      const selectionEnd = phoneInput.selectionEnd ?? prefixLength;
      if (selectionStart < prefixLength || selectionEnd < prefixLength) {
        phoneInput.setSelectionRange(prefixLength, prefixLength);
      }
    });
  };
  const hasLocalDigits = () => getPhoneLocalDigits(mask.value).length > 0;
  const ensurePrefixWhileFocused = () => {
    if (document.activeElement !== phoneInput) {
      return;
    }
    if (!hasLocalDigits()) {
      mask.value = AR_PHONE_PREFIX;
    }
    clampCaretToPrefix();
  };
  phoneInput.addEventListener("focus", () => {
    if (!mask.value.trim()) {
      mask.value = AR_PHONE_PREFIX;
      phoneInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
    clampCaretToPrefix();
  });
  phoneInput.addEventListener("blur", () => {
    if (!hasLocalDigits()) {
      mask.value = "";
      phoneInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  phoneInput.addEventListener("click", clampCaretToPrefix);
  phoneInput.addEventListener("input", () => {
    ensurePrefixWhileFocused();
  });
  phoneInput.addEventListener("keyup", () => {
    ensurePrefixWhileFocused();
  });
  phoneInput.addEventListener("keydown", (event) => {
    const prefixLength = getPrefixLength();
    const selectionStart = phoneInput.selectionStart ?? prefixLength;
    const selectionEnd = phoneInput.selectionEnd ?? prefixLength;
    const isPrefixSelected = selectionStart < prefixLength;
    if (event.key === "Backspace" && selectionStart <= prefixLength && selectionEnd <= prefixLength || event.key === "Delete" && isPrefixSelected) {
      event.preventDefault();
      phoneInput.setSelectionRange(prefixLength, prefixLength);
    }
  });
}
const wheelLayout = document.querySelector(".hero__wheel-layout");
const wheelImage = document.querySelector(".hero__wheel-image");
const spinButton = document.querySelector(".hero__spin-button");
const bonusItems = document.querySelector(".hero__bonus-items");
const spinIcon = document.querySelector(".hero__spin-icon");
if (wheelLayout && wheelImage && spinButton && spinIcon && bonusItems) {
  let isSpinning = false;
  let currentRotation = 0;
  let stage = 0;
  const SPIN_TIME = 4e3;
  const RESULT_DELAY = 900;
  const POPUP_DELAY = 1400;
  const openRegistrationPopup = () => {
    if (window.flsPopup?.open) {
      window.flsPopup.open("popup");
    }
  };
  const spinWheel = (targetStage) => {
    isSpinning = true;
    wheelLayout.classList.remove("is-finished");
    wheelLayout.classList.add("is-spinning");
    const fullSpins = 3;
    const sectorOffset = targetStage === 1 ? 0 : 315;
    const nextRotation = currentRotation + 360 * fullSpins + sectorOffset;
    wheelImage.style.transition = "none";
    wheelImage.style.transform = `rotate(${currentRotation}deg)`;
    wheelImage.offsetHeight;
    wheelImage.style.transition = `transform ${SPIN_TIME}ms cubic-bezier(.12,.72,.16,1)`;
    wheelImage.style.transform = `rotate(${nextRotation}deg)`;
    const onSpinEnd = (event) => {
      if (event.propertyName !== "transform") return;
      wheelImage.removeEventListener("transitionend", onSpinEnd);
      currentRotation = nextRotation;
      wheelLayout.classList.remove("is-spinning");
      wheelLayout.classList.add("is-finished");
      wheelImage.style.transition = "none";
      wheelImage.style.transform = `rotate(${currentRotation}deg)`;
      setTimeout(() => {
        if (targetStage === 1) {
          bonusItems.classList.add("is-bonus-left");
          stage = 1;
          isSpinning = false;
          return;
        }
        if (targetStage === 2) {
          bonusItems.classList.add("is-bonus-right");
          stage = 2;
          spinButton.disabled = true;
          setTimeout(() => {
            openRegistrationPopup();
            isSpinning = false;
          }, POPUP_DELAY);
        }
      }, RESULT_DELAY);
    };
    wheelImage.addEventListener("transitionend", onSpinEnd);
  };
  wheelLayout.addEventListener("click", () => {
    if (isSpinning) return;
    if (stage === 0) {
      spinWheel(1);
      return;
    }
    if (stage === 1) {
      spinWheel(2);
    }
  });
}
document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggle();
  initFormValidation();
  initPhoneMask();
});
