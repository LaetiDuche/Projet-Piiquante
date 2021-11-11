const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes:0,
    dislikes: 0,
    usersLiked:[],
    usersDisliked: []
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
    .catch(error => res.status(400).json({ error }));
  next();
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
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

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

exports.addLike = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ message: 'sauce introuvable !' });
      }
      switch (req.body.like) {
        case 0:
          if (sauce.usersLiked.find((user) => user === req.body.userId)) {
            sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } })
              .then(() => res.status(201).json({ message: 'like changé !' }))
              .catch((error) => res.status(400).json(error));
          }
          if (sauce.usersDisliked.find((user) => user === req.body.userId)) {
            sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } })
              .then(() => res.status(201).json({ message: 'Dislike changé !' }))
              .catch((error) => res.status(400).json(error));
          }
          break;
        case 1:
          if (!sauce.usersLiked.find((user) => user === req.body.userId)) {
            sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $pull: { usersLiked: req.body.userId } })
              .then(() => res.status(201).json({ message: 'like ajouté !' }))
              .catch((error) => res.status(400).json(error));
          }
          break;
        case -1:
          if (!sauce.usersDisliked.find((user) => user === req.body.userId)) {
            sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $pull: { usersDisliked: req.body.userId } })
              .then(() => res.status(201).json({ message: 'dislike ajouté !' }))
              .catch((error) => res.status(400).json(error));
          }
          break;
        default: {
          res.status(400).json({ message: "Bad request: error like !" });
        }
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    })
};