//Importations des fichiers routes des sauces et des users, base de donnée avec MongoDB sécurisée et cors
//Importations du dossier images

const express = require('express');
const app = express();
const path = require('path');

const mongoose = require('mongoose');
require('dotenv').config({path: './.env'});
const helmet = require('helmet');
const cors = require('cors');

//Importations des routes
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

//Connection à MongoDB pour enregistrer la base de donnée des sauces et des utilisateurs
mongoose.connect(process.env.SECRET_DB,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(helmet());

//Sécurisation des requetes multi origine avec cors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

//Importation du dossier images
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(express.json());

app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
app.use(cors());
module.exports = app;