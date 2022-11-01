let config

module.exports = {
  init (_config, callback) {
    config = _config
    callback()
  }
}
