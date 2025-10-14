const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Organisation = require("../models/organisation.models"); // Import Organisation
const config = require("../config");

async function signup({
  name,
  email,
  password,
  role,
  organisation: organisationName,
}) {
  if (!organisationName) {
    throw new Error("Organisation name is required.");
  }
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already in use");

  // Find or create the organisation by name
  let organisation = await Organisation.findOne({ name: organisationName });
  if (!organisation) {
    organisation = new Organisation({ name: organisationName });
    await organisation.save();
  }

  const user = new User({
    name,
    email,
    password,
    role,
    organisation: organisation._id, // Assign the ObjectId
  });
  await user.save();
  return user;
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");
  const match = await user.comparePassword(password);
  if (!match) throw new Error("Invalid credentials");
  const token = jwt.sign(
    { id: user._id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
  return { user, token };
}

module.exports = { signup, login };
