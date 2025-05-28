import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const generateMockUsers = async (count) => {
  const users = [];
  const hashedPassword = await bcrypt.hash("coder123", 10);

  for (let i = 0; i < count; i++) {
    users.push({
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password: hashedPassword,
      role: Math.random() < 0.5 ? 'user' : 'admin',
      pets: []
    });
  }

  return users;
};

export default generateMockUsers;