module.exports = function previewAddress(request, response) {
  const host = request.headers["x-forwarded-host"] || request.headers.host;
  const protocol = request.headers["x-forwarded-proto"] || (request.socket.encrypted ? "https" : "http");
  response.setHeader("Cache-Control", "no-store");
  response.status(200).json({ origin: protocol + "://" + host, publicDemo: true });
};
