
const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.getUsers = async (req, res, next) => {

  let {
    recordsPerPage=4,
    pageNumber=0,
    search='',
    sortField='id',
    sortOrder=1
  } = req.query;

  recordsPerPage = parseInt(recordsPerPage);
  pageNumber     = parseInt(pageNumber);

  const skipRecords = Math.max(0,recordsPerPage * pageNumber);

  // anzahl der dokumente abrufen
  const numberOfRecords = await User.estimatedDocumentCount();

  // liste der dokumente abrufen
  if ( recordsPerPage === -1 ) recordsPerPage = undefined;

  const users = await User.find(
    {
      firstName: {
        $regex: search
      }
    }, null, {
      limit: recordsPerPage,
      skip:  skipRecords,
      sort:  { [sortField]: sortOrder }
    }
  );
  // liste und metadaten senden
  res.status(200).send({
    list:  users,
    count: numberOfRecords
  });
};

exports.getUser  = async (req, res, next) => {
  const { id }   = req.params;
  const user     = await User.findById(id);

  res.status(200).send(user);
};

exports.deleteUser = async (req, res, next) => {
  const { id }     = req.params;
  const user       = await User.findByIdAndDelete(id);

  res.status(200).send(user);
};

exports.updateUser = async (req, res, next) => {
  const { id }     = req.params;
  const dt         = req.body;
  const user       = await User.findByIdAndUpdate(id,dt,{new:true});

  res.status(200).send(user);
};

exports.addUser  = async (req, res, next) => {
  const errors   = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const userData = req.body;
  const user     = new User(userData);
  await user.save();

  res.status(200).send(user);
};
