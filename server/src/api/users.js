const { validateUser } = require("../validation/validate");
const bcrypt = require("bcryptjs");
const { errorHandler } = require("../utils");
const { HttpError } = require("../error");
const { UsersController } = require("../controllers/UsersController");

const getUsers = errorHandler(async (req, res) => {
  const users = await UsersController.getUsers();

  return users;
});

const getUserById = errorHandler(async (req, res) => {
  const { id } = req.params;

  const user = await UsersController.getUserById(id);

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return user;
});

const createUser = errorHandler(async (req, res) => {
  // Gets user input
  const { firstName, lastName, email, password, role } = req.body;

  // Validate user input
  validateUser(firstName, lastName, email, password, role);

  // Checks if the user already exists
  // TODO: Use only the email for the checks?
  const oldUser = await UsersController.getUserByEmail(email);

  if (oldUser.length > 0) {
    throw new HttpError(409, "User already exists");
  }

  // Encrypt password
  const encryptedPassword = await bcrypt.hash(password, 10);

  // Creates the user
  const createdUser = await UsersController.createUser({
    firstName,
    lastName,
    email,
    password: encryptedPassword,
    role,
  });
  
  // TODO: Have to return the created user? Check that the model return first_name instead of firstName
  return createdUser;
});

const deleteUser = errorHandler(async (req, res) => {
  const { id } = req.params;

  const deletedUser = await UsersController.deleteUser(id);

  if (deletedUser === 0) {
    throw new HttpError(404, "User not found");
  }

  return { message: "User deleted" };
});

module.exports = { getUsers, getUserById, createUser, deleteUser };
