//Vérification de la requête login et signup grâce au jeton token donné à l'utilisateur

const jwt = require('jsonwebtoken');
require('dotenv').config({path: './.env'});

module.exports = (req, res, next) =>{
  try{
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.SECRET_TOKEN);
    const userId = decodedToken.userId;

    //On compare l'id de l'utilisateur pour vérifier son identité
    
      //Si l'id est incorrecte
    if (req.body.userId && req.body.userId !== userId){
      throw 'User id non valable !';

      //Si l'id est bon, l'uilisateur est connecté
    }else{
      next();
    }
  }catch(error){
    res.status(401).json({error: error | 'Requete non authantifiée !'});
  }
};