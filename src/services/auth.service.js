const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Organisation = require("../models/organisation.models");
const config = require("../config");

async function signup({
  name,
  email,
  password,
  role,
  organisation
}) {
  // Add a log to see exactly what value is being received for the organisation.
  console.log(
    `[AuthService] Signup attempt with : "${organisation}"`
  );

  if (
    !organisation ||
    typeof organisation !== "string" ||
    organisation.trim() === ""
  ) {
    const err = new Error("Organisation name must be a non-empty string.");
    err.status = 400; // Bad Request
    throw err;
  }

  let orgDoc;
  try {
    // Use a case-insensitive regex for a more robust search and trim whitespace.
    const trimmedOrgName = organisation.trim();
    orgDoc = await Organisation.findOne({
      name: { $regex: new RegExp(`^${trimmedOrgName}$`, "i") },
    });

    if (!orgDoc) {
      console.log(
        `[AuthService] Organisation "${trimmedOrgName}" not found. Creating new one.`
      );
      orgDoc = await Organisation.create({ name: trimmedOrgName });
    }
  } catch (error) {
    console.error(
      "[AuthService] Error finding or creating organisation:",
      error
    );
    const err = new Error("Could not find or create the organisation.");
    err.status = 500;
    throw err;
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    organisation: orgDoc._id,
  });

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
