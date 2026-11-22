module.exports = function customerLink(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed." });
  const { data, id } = request.query;
  if (typeof data === "string") {
    if (request.headers["x-reviewflow-request"] !== "customer-link" || !data.startsWith("#review/") || data.length > 1200) {
      return response.status(400).json({ error: "Invalid customer page." });
    }
    return response.status(200).json({ id: Buffer.from(data, "utf8").toString("base64url") });
  }
  if (typeof id !== "string" || !/^[A-Za-z0-9_-]{1,1600}$/.test(id)) {
    return response.status(404).json({ error: "Customer page not found." });
  }
  const hash = Buffer.from(id, "base64url").toString("utf8");
  if (!hash.startsWith("#review/") || hash.length > 1200) {
    return response.status(404).json({ error: "Customer page not found." });
  }
  return response.status(200).json({ hash });
};
