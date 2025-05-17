"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Comment.belongsTo(models.User, {
        foreignKey: "userId",
        as: "author",
      });
      Comment.belongsTo(models.Task, {
        foreignKey: "taskId",
        as: "task",
      });
    }
  }
  Comment.init(
    {
      content: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Tasks",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
    },
    {
      sequelize,
      modelName: "Comment",
    }
  );
  return Comment;
};
