const authService = require("../services/auth.service");

async function signup(req, res, next) {
  try {
    // ADDING THIS LOG to see exactly what the frontend sends.
    console.log("Received signup request with body:", req.body);

    const user = await authService.signup(req.body);
    res
      .status(201)
      .json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { user, token } = await authService.login(req.body);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login };
