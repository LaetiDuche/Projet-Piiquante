//Structure du CRUD 
//Ajouter, modifier, voir une sauce, voir toutes les sauces, supprimer une sauce
//Ajout des like ou dislike

const Sauce = require('../models/Sauce');
const fs = require('fs');
const express = require('express');

//Créer une sauce
exports.createSauce = (req, res, next) => {

  //Création du corps de la sauce 
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;

  //Récupération de l'image pour la mettre dans le dossier images et activation des boutons likes
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
    .catch(error => res.status(400).json({ error }));

};

//Modifier une sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      //Récupération du corps et de l'image de la sauce
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    //Mise à jour de la sauce
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
    .catch(error => res.status(400).json({ error }));
};

//Voir toutes les sauces 
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

//Voir une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

//Supprimer une sauce
exports.deleteSauce = (req, res, next) => {

  //Récupération d'une sauce sélectionnée
  Sauce.findOne({ _id: req.params.id })
  
  //Suppression de la sauce par son id et suppression de son image dans le dossier images
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
          .catch(error => res.status(404).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

//Gestion des likes
exports.likeSauce = (req, res, next) => {
  const idUser = req.body.userId;
  const like = req.body.like;

  //Sélection d'une sauce
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {

      switch (like) {
        //Si like
        case 1:
          //Ajout d'un like à la sauce et mise à jour
          Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: +1 }, $push: { usersLiked: idUser } })
            .then(() => res.status(200).json({ message: 'Like ajouté !' }))
            .catch(error => res.status(400).json({ error }));
          break;

        //Si dislike
        case -1:
          //Ajout d'un dislike à la sauce et mise à jour
          Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: +1 }, $push: { usersDisliked: idUser } })
            .then(() => res.status(200).json({ message: 'Dislike ajouté !' }))
            .catch(error => res.status(400).json({ error }));
          break;

          //Suppression du dislike
        case 0:
          if (sauce.usersDisliked.includes(idUser)) {
            Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: idUser } })
              .then(() => res.status(200).json({ message: 'Dislike supprimé' }))
              .catch(error => res.status(400).json({ error }));
          } else {

            //Suppression du like
            Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: idUser } })
              .then(() => res.status(200).json({ message: 'Like supprimé' }))
              .catch(error => res.status(400).json({ error }));
          }
          break;
      }
    })
    .catch(error => res.status(404).json({ error }));
}
const app = express();