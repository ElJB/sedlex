"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("Laws", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      vp_title: {
        type: DataTypes.STRING
      },
      vp_summary: {
        type: DataTypes.TEXT
      },
      vp_content: {
        type: DataTypes.TEXT
      },
      vp_status: {
        type: DataTypes.TEXT
      },
      vp_published: {
        type: DataTypes.DATE
      },
      parliament_folder_url: {
        type: DataTypes.STRING
      },
      nd_folder_url: {
        type: DataTypes.STRING
      },
      nd_law_title: {
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
    migration.dropTable("Laws").done(done);
  }
};