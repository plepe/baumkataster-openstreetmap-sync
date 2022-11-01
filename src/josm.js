let app

module.exports = {
  init (_app, callback) {
    app = _app
    callback()
  }
}
