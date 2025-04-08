var express = require("express");
var router = express.Router();
bcrypt = require("bcryptjs");
var User = require("../models/User");
var jwt = require("jsonwebtoken");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/register", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: " Error en el registro", description: error.toString() });
  }
});

router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });
    res.cookie("habitToken", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "PRODUCTION",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ message: "Inicio de Sesión exitoso", token });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: " Error en el login", description: error.toString() });
  }
});

module.exports = router;
