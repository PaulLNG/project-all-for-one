'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      username: 'ECSTACYS',
      password: 'SYCATSCE',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      username: 'MOUGA',
      password: 'MOUGA',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
