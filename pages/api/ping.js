import withAuthOrSecret from "../../lib/withAuthOrSecret";

function coreHandler(req, res) {
  return res.status(200).json({
    ok: true,
    route: "ping",
    time: new Date().toISOString()
  });
}

export default withAuthOrSecret(coreHandler);
