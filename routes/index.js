var express = require("express");
var router = express.Router();
const Habit = require("../models/Habit");
const jwt = require("jsonwebtoken");
const mongoose  = require('mongoose');

router.get('/', function( req, res, next){
  res.json({title: 'Express'});
} );

const authenticateToken = ( req, res, next ) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Acceso denegado, no se proporcionó token');
  try {
    const tokenWithoutBearer = token.replace("Bearer","").trim();;
    const verified= jwt.verify(tokenWithoutBearer, process.env.SECRET_KEY);
    req.user = verified;
    next();
  }catch(error){
    console.error('el error: ',error);
    return res.status(403).send('Acceso denegado, token invalido o expirado');
  }
}

router.get("/habits", authenticateToken, async (req, res) => {
  try {

    //NOTE - =================== =================== =================== =================== =================== 
    //NOTE - 1. Ingeniero: hice algunas modificaciones porque no me funcionaba el código
    //NOTE - 2. en vez de declarar el userId asi: req.user && req.user.userId lo declaré como esta abajo
    //NOTE - 3. Deje de usar ObjectId(userId) porque me decía que estaba deprecado, agradezco tomar en cuenta que por esa
    // razón no lo hice como usted lo sugirió
    //NOTE - =================== =================== =================== =================== =================== 

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let userId = req.user.id;
    console.log('userId',userId)
    const habits = await Habit.find({ 'userId': new mongoose.Types.ObjectId(userId) });
    res.json(habits);
  } catch {
    res.status(500).json({ message: "Error fetching habits" });
  }
});

router.post("/habits",authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    console.log( req.body);
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let userId = req.user.id;
    console.log('userId',userId)
    // let userId= req.user.userId;
    // userId = new mongoose.Types.ObjectId(userId);
    const habit = new Habit({ title, description, userId });
    await habit.save();
    res.json(habit);
  } catch (error) {
    console.error("[DEBUG] Error creating habit:", error);
    res.status(400).json({ message: "Invalid request" });
  }
});

router.delete("/habits/:id", authenticateToken, async (req, res) => {
  console.log(req.params.id);

  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error("Error de delete: ", error);
    res.status(500).json({ message: "Habit not found" });
  }
});

router.patch("/habits/markasdone/:id",authenticateToken, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    habit.lastDone = new Date();
    if (timeDifferenceInHours(habit.lastDone, habit.lastUpdate) < 24) {
      habit.days += timeDifferenceInDays(habit.lastDone, habit.startedAt)  ;
      habit.lastUpdate = new Date();
      habit.save();
      res.status(200).json({ message: "Habit marked as done" });
    } else {
      habit.days = 1;
      habit.lastUpdate = new Date();
      habit.save();
      res.status(200).json({ message: "Habit restarted" });
    }
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ message: "Habit not found" });
  }
});

const timeDifferenceInHours = (date1, date2) => {
  const timeDifferenceMs = Math.abs(date1 - date2);
  return timeDifferenceMs / (1000 * 60 * 60);
};

const timeDifferenceInDays = (date1, date2) => {
  const diifferenceMs = Math.abs(date1 - date2);
  return Math.floor( diifferenceMs / (1000 * 60 * 60 * 24));
  };

module.exports = router;
