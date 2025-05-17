"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Task, { foreignKey: "createdById" }); 
      User.hasMany(models.Task, { foreignKey: "assignedToId" });
    }
  }
  User.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      failedAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      lastFailedAttempt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      emailIsVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otpExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      otpFailedAttempt: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      },
      role: {
        type: DataTypes.ENUM("Admin", "Regular User"),
        defaultValue: "Regular User",
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
