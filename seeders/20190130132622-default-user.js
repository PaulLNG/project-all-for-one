'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      username: 'ECSTACYS',
      password: '$2y$10$GsbktMBQPaW167gVq3LW.e1r0t.L9Bia2IFkz2DnKZMcU7PBZHLYy',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      username: 'MOUGA',
      password: '$2y$10$g1yFYIvlBRyQmk2J8vGDXuuzfSMs.Cpfd4y5HDpeCeQr0yi7BJhha',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
