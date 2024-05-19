const express = require("express");
const db = require("../Models");
const jwt = require("jsonwebtoken");
 const User = db.users;


 exports.saveUser = async (req, res, next) => {
 try {
   const username = await User.findOne({
     where: {
       userName: req.body.userName,
     },
   });
   if (username) {
     return res.json(409).send("username already taken");
   }

   const emailcheck = await User.findOne({
     where: {
       email: req.body.email,
     },
   });

   if (emailcheck) {
     return res.json(409).send("Authentication failed");
   }

   next();
 } catch (error) {
   console.log(error);
 }
};

exports.authenticate = (req, res, next) => {
    const token = req.cookies.jwt;
  
    if (!token) {
      return res.status(401).send("Access Denied: No Token Provided!");
    }
  
    try {
      const verified = jwt.verify(token, process.env.SECRET_KEY);
      req.user = verified;
      next(); // to pass the execution off to the next middleware
    } catch (err) {
      res.status(400).send("Invalid Token");
    }
  };
