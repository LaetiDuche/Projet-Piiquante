//Gestion du login et sign up
//Sécurisation du mot de pass avec bcrypt 
//Sécurisation avec token jwt

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config({path: './.env'});

//Création d'un nouvel utilisateur email et mot de pass crypté
exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur crée !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

//Connexion d'un utilisateur déjà  enregistré
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return req.status(401).json({ error: 'Utilisateur introuvable !' });
      }
      //Vérification du bon mot de pass de l'utilisateur
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return req.status(401).json({ error: 'Mot de pass incorrect !' });
          }
          //On lui attribue un jeton token pour 24H 
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.SECRET_TOKEN,
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};