//Enregister les images des utilisateurs dans le dossier images avec des extensions spécifiques

const multer = require('multer');

//Extensions des images acceptées
const MIME_TYPES = {
  'images/jpg': 'jpg',
  'images/jpeg': 'jpg',
  'images/png': 'png'
};

//Enregistrement des images dans le dossier
const storage = multer.diskStorage({
  destination: (req, file, callback) =>{
    callback(null, 'images')
  },
  filename: (req, file, callback) =>{
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage}).single('image');