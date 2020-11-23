const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function createToken(user, SECRET_KEY, expiresIn) {
  const { id, name, email, username } = user;
  const payload = {
    id,
    name,
    email,
    username,
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

async function register(input) {
  const newUser = input;
  newUser.email = newUser.email.toLowerCase();
  newUser.username = newUser.username.toLowerCase();

  const { email, username, password } = newUser;

  // Revisar si el email esta en uso
  const foundEmail = await User.findOne({ email });
  if (foundEmail) {
    throw new Error("Username o email no valido");
  }

  // Revisar si el username esta en uso
  const foundUsername = await User.findOne({ username });
  if (foundUsername) {
    throw new Error("Username o email no valido");
  }

  // Encriptar
  const salt = await bcrypt.genSaltSync(10);
  newUser.password = await bcrypt.hash(password, salt);

  try {
    const user = new User(newUser);
    user.save();
    return user;
  } catch (error) {
    console.log(error);
  }
}

async function login(input) {
  const { email, password } = input;

  const userFound = await User.findOne({ email: email.toLowerCase() });
  if (!userFound) {
    throw new Error("Error en el email o contraseña");
  }

  const passwordSuccess = await bcrypt.compare(password, userFound.password);
  if (!passwordSuccess) {
    throw new Error("Error en el email o contraseña");
  }

  token = createToken(
    userFound,
    process.env.SECRET_KEY,
    process.env.EXPIRES_IN
  );

  return {
    token,
  };
}

async function getUser(id, username) {
  let user = null;
  if (id) {
    user = await User.findById(id);
  } else if (username) {
    user = await User.findOne({ username });
  }

  if (!user) {
    throw new Error("El usuario no existe");
  }

  return user;
}

module.exports = {
  register,
  login,
  getUser,
};
