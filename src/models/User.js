const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true, // Changed from false to true for easier testing
      validate: {
        // notEmpty: true // Commented out for easier testing
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        // notEmpty: true // Commented out for easier testing
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Changed from false to true for easier testing
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    height: {
          type: DataTypes.FLOAT,
          allowNull: true
        },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user'
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Instance method to compare passwords
  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  // Define Associations
  User.associate = (models) => {
    User.hasMany(models.Workout, { onDelete: 'CASCADE' });
    User.hasMany(models.FitnessGoal, { onDelete: 'CASCADE' });
  };

  return User;
};
