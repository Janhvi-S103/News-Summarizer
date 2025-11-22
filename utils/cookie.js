exports.setAuthCookie = (res, token, role) => {
  const cookieName = role === "admin" ? "adminAuth" : "userAuth";

  res.cookie(cookieName, token, { 
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};