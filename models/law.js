"use strict";
module.exports = function(sequelize, DataTypes) {
  var Law = sequelize.define("Law", {
    vp_title: DataTypes.STRING,
    vp_summary: DataTypes.TEXT,
    vp_content: DataTypes.TEXT,
    vp_status: DataTypes.TEXT,
    vp_published: DataTypes.DATE,
    parliament_folder_url: DataTypes.STRING,
    nd_folder_url: DataTypes.STRING,
    nd_law_title: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Law.belongsToMany(models.Category, {through: models.LawCategories});
      }
    }
  });
  return Law;
};