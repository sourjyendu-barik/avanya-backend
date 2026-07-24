// for localhost
// function setSecureCookie(res, token) {
//   res.cookie("access_token_avanya", token, {
//     httpOnly: true,
//     maxAge: 12 * 60 * 60 * 1000,
//   });

//   return res;
// }

// for deployment
function setSecureCookie(res, token) {
  res.cookie("access_token_avanya", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 12 * 60 * 60 * 1000,
  });

  return res;
}

module.exports = { setSecureCookie };
