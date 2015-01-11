"use strict";
module.exports = function(sequelize, DataTypes) {
  var Category = sequelize.define("Category", {
    title: DataTypes.STRING,
    color: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Category.belongsToMany(models.Law, {through: models.LawCategories});
      }
    }
  });
  return Category;
};