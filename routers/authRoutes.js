const routes = require("express").Router();
const { signIn } = require("../handlers/auth.handlers");

routes.post("/login", signIn);
routes.post("/callback", signIn);

module.exports = routes;
