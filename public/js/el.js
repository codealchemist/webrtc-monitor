'use strict';

class El {
  constructor(element) {
    if (typeof element === 'string') {
      element = document.getElementById(element)
    }

    this.$el = element
  }

  get() {
    return this.$el
  }

  show(mode) {
    this.$el.style.display = mode || 'block'
    return this
  }

  hide() {
    this.$el.style.display = 'none'
    return this
  }

  focus() {
    this.$el.focus()
    return this
  }

  html(value) {
    this.$el.innerHTML = value
    return this
  }
}
