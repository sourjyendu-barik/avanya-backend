const routes = require("express").Router();

const { getMe, logout } = require("../handlers/auth.handlers");

routes.get("/getMe", getMe);
routes.post("/logout", logout);

module.exports = routes;
