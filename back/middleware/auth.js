const jwt = require('jsonwebtoken');
/* const cors = require('cors');
app.use(cors()); */
module.exports = (req, res, next) =>{
  try{
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_SECRET_KEY'/* process.env.TOKEN */);
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId){
      throw 'User id non valable !';
    }else{
      next();
    }
  }catch(error){
    res.status(401).json({error: error | 'Requete non authantifiée !'});
  }
};