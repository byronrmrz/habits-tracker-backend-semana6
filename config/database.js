const mongoose = require('mongoose');
require('dotenv').config ();
const express = require('express');

// mongoose.connect(process.env.MONGO_URI,{
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(()=> {
//     console.log('Connected to MongoDB');
// }).catch((err)=>{
//     console.log('Error connecting to MongoDB', err);
// });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error conectando a MongoDB:", err));


module.exports = mongoose; 