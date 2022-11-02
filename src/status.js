let dom

export class StatusMessage {
  constructor (text) {
    if (!dom) {
      dom = document.getElementById('status')
    }

    this.div = document.createElement('div')
    dom.appendChild(this.div)

    this.change(text)
  }

  change (text) {
    this.div.innerHTML = text
    dom.scrollTop = dom.scrollHeight
  }
}
