var _ = require('lodash');

function Crud (Model) {
  this.Model = Model;
}

Crud.prototype.find = function (req, res) {
  var criteria = {},
      findMethod = 'find';

  if (req.params.id) {
    criteria._id = req.params.id;
    findMethod = 'findOne';
  }

  if (! _.isEmpty(req.query)) {
    criteria = _.extend(criteria, req.query);
  }

  return this.Model[findMethod](criteria, function (err, documents) {
    if (err) {
      return res.status(501).json(err);
    }

    return res.json(documents);
  });
};

Crud.prototype.create = function (req, res) {
  var document;

  if (req.body) {
    document = new this.Model(req.body);

    document.save(function (err) {
      if (err) {
        return res.status(501).json(err);
      }

      return res.json(document);
    });
  } else {
    return res.status(400).json({ success: false });
  }
};

Crud.prototype.update = function (req, res) {
  if (req.params.id) {
    this.Model.findOne({ _id: req.params.id }, function (err, document) {
      if (err) {
        return res.status(501).json(err);
      }

      document = _.extend(document, req.body);

      document.save(function (err) {
        if (err) {
          return res.status(501).json(err);
        }

        return res.json(document);
      });
    });
  }
};

Crud.prototype.delete = function (req, res) {
  if (req.params.id) {
    this.Model.findOneAndRemove({ _id: req.params.id }, function (err, document) {
      if (err) {
        return res.status(501).json(err);
      }

      return res.json(document);
    });
  } else {
    return res.status(400).json({ success: false });
  }
};

module.exports = Crud;
