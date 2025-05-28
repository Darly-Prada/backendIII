import { Router } from 'express';
import { faker } from '@faker-js/faker';

const router = Router();

// Generar usuarios falsos
router.get('/mockingusers', (req, res) => {
  const users = [];

  for (let i = 0; i < 50; i++) {
    users.push({
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      role: Math.random() < 0.5 ? 'user' : 'admin',
      pets: []
    });
  }

  res.json({
    status: 'success',
    users,
    count: users.length
  });
});

// Generar mascotas falsas
router.get('/mockingpets', (req, res) => {
  const pets = [];

  for (let i = 0; i < 100; i++) {
    pets.push({
      name: faker.person.firstName() + "'s pet",
      specie: faker.animal.type(),
      birthDate: faker.date.past(10),
      owner: faker.person.firstName() + ' ' + faker.person.lastName()
    });
  }

  res.json({
    status: 'success',
    pets,
    count: pets.length
  });
});

export default router;