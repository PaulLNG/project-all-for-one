'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      username: 'ECSTACYS',
      password: '$2b$10$LSLyuXZD.FnBQwG9K5izNuI6ceu6tyoJbKirOy2YGt/S3S/HWFup6',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      username: 'GONS',
      password: '$10$XR3y1OW9rzvwIxD72B9rMezEj9Z0oMZjt88erO9iWeAnXCCl8UbpC',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      username: 'LANGE',
      password: '$2b$10$PxEu98ovf0pyQdByv2Wsi.pWT1AIfhC0X4zhkQvBfHDrOiXvzOF9.',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
