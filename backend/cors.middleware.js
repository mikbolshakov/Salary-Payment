/* CORS is a security mechanism that allows a resource from one domain to access another. 
Below we allow access to api of other domains by creating middleware (we get prices from moralis) 
(this is an intermediate link that allows you to send any kind of requests from any domains) */
function cors(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
}

export default cors;
