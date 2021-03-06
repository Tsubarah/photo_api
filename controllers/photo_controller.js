const debug = require('debug')('media:photo_controller');
const { matchedData, validationResult } = require('express-validator');
const models = require('../models');

// GET all the photos
const index = async (req, res) => {
  
  const user = await models.User.fetchById(req.user.id, { withRelated: ['photos']});

  res.status(200).send({
    status: 'success',
    data: {
      photos: user.related('photos')
    }
  });
}

// GET a specific photo
const show = async (req, res) => {
  
  const user = await models.User.fetchById(req.user.id, { withRelated: ['photos']});

  const photos = user.related('photos').find(photo => photo.id == req.params.photoId);

  if (!photos) {
    return res.status(404).send({
        status: 'fail',
        message: 'Photo could not be found',
    });
  };

  const photoId = await models.Photo.fetchById(req.params.photoId);

  res.status(200).send({
    status: 'success',
    data: {
      photos: photoId
    }
  });
}

// POST a new photo
const store = async (req, res) => {

  // check for any validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).send({ status: 'fail', data: errors.array() });
  }

  // get only the validated data from the request
  const validData = matchedData(req);

  validData.user_id = req.user.id;

  try {
    const photo = await new models.Photo(validData).save();
    debug("Created new photo successfully: %O", photo);

    res.status(200).send({
      status: 'success',
      data: {
        photo
      }
    });

  } catch (error) {
    res.status(500).send({
      status: 'error',
      message: 'Exception thrown in database when creating a new photo.',
    });
    throw error;
  }
}

// PUT (update) a photo
const update = async (req, res) => {

  // get the requested user with related photos
  const user = await models.User.fetchById(req.user.id, { withRelated: ['photos']});

  // get related photos from the user and find the requested photo
  const photo = user.related('photos').find(photo => photo.id == req.params.photoId);
  
  // check if the photo with the id exists
  const photoId = await models.Photo.fetchById(req.params.photoId);

  if (!photo) {
    debug("The photo to update could not be found. %o", { id: photoId });
    res.status(404).send({
      status: 'fail',
      data: 'Photo to update could not be found',
    });
    return;
  }

  // check for any validation errors
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(422).send({ status: 'fail', data: errors.array() });
  }

  // get only the validated data from the request
  const validData = matchedData(req);

  try {
    await photo.save(validData);

    res.status(200).send({
      status: 'success',
      data: {
        photo
      }
    });

  } catch (error) {
    res.status(500).send({
      status: 'error',
      message: 'Exception thrown in database when updating a new photo.',
    });
    throw error;
  }
}

module.exports = {
 index,
 show,
 store,
 update,
}