function getConfig() {
  const VERSION = "1";

  return {
    PORT: 9000,
    API_PREFIX: `/api/v${VERSION}`,
    LOG_PATH: "/var/log",
    MAX_CHUNK_SIZE: 64000, // 64KB
    MAX_RESPONSE_SIZE: 10 * 1000 * 1000 * 1000 // 10GB
  }
}

module.exports = {
  getConfig
}