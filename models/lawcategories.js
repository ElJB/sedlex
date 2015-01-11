"use strict";
module.exports = function(sequelize, DataTypes) {
  var LawCategories = sequelize.define("LawCategories", {
    source: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return LawCategories;
};