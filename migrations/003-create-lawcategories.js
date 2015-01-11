"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("LawCategories", {
      LawId: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      CategoryId: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      source: {
        type: DataTypes.STRING
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }).done(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable("LawCategories").done(done);
  }
};