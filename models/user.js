'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
	  username: {
		    type: DataTypes.STRING
		  },
	  password: {
	    type: DataTypes.STRING
	  },
	  local_key: {
		    type: DataTypes.STRING , allowNull: true, defaultValue: null 
		  }
  });
  User.associate = function(models) {
    // associations can be defined here
  };
 
 
  return User;
};
