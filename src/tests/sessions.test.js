import chai from 'chai';
const { expect } = chai;
import request from 'supertest';
import mongoose from 'mongoose';
import { usersService, petsService, adoptionsService } from '../services/index.js';
import app from '../app.js';


describe('Sessions API with MongoDB', function () {
  this.timeout(10000);

  before(async function () {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL);
    }
  });

  after(async function () {
    await mongoose.connection.close();
  });

  const testEmail = 'usuario_prueba@mail.com';


  describe('POST /api/sessions/register', () => {
    it('debe registrar un nuevo usuario', async () => {
      const testEmail = `test${Date.now()}@mail.com`;
  
      const res = await request(app)
        .post('/api/sessions/register')
        .send({
          first_name: 'Test',
          last_name: 'User',
          email: testEmail,
          password: '1234'
        });
  
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('status', 'success');
      expect(res.body).to.have.property('payload').that.is.a('string'); // ID como string
    });
  });

  describe('POST /api/sessions/login', () => {
    it('debe autenticar un usuario registrado', async () => {
      const res = await request(app)
        .post('/api/sessions/login')
        .send({
          email: 'test@mail.com',
          password: '1234'
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status', 'success');
    });
  });



  it('no debe permitir registrar un email ya existente', async () => {
    const testEmail = `test${Date.now()}@mail.com`;
  
    // Registro inicial - debe ser exitoso
    const res1 = await request(app).post('/api/sessions/register').send({
      first_name: 'Test',
      last_name: 'User',
      email: testEmail,
      password: '1234'
    });
    expect(res1.status).to.equal(201);
    expect(res1.body).to.have.property('status', 'success');
  
    // Registro duplicado - debe fallar
    const res2 = await request(app).post('/api/sessions/register').send({
      first_name: 'Test',
      last_name: 'User',
      email: testEmail,  // mismo email
      password: '1234'
    });
    expect(res2.status).to.not.equal(201); // debe ser error, puede ser 400 o 409 según tu backend
    expect(res2.body).to.have.property('status', 'error');
    expect(res2.body).to.have.property('error').that.is.a('string');
  });
  
  


// Test login, contraseña incorrecta
it('no debe autenticar con contraseña incorrecta', async () => {
  const testEmail = `test${Date.now()}@mail.com`;

  await request(app).post('/api/sessions/register').send({
    first_name: 'Test',
    last_name: 'User',
    email: testEmail,
    password: '1234'
  });

  const res = await request(app).post('/api/sessions/login').send({
    email: testEmail,
    password: 'wrongpassword'
  });

  expect(res.status).to.equal(400); 
  expect(res.body).to.have.property('status', 'error');
});

// Test para current 
  describe('GET /api/sessions/current', () => {
    it('debe retornar el usuario actual de la sesión', async () => {
      const agent = request.agent(app);  

      await agent.post('/api/sessions/login').send({
        email: 'test@mail.com',
        password: '1234'
      });

      const res = await agent.get('/api/sessions/current');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status', 'success');
      expect(res.body.payload).to.have.property('email', 'test@mail.com');
    });
  });

  // Test Adoption 
  describe('Adoptions API', function () {
    this.timeout(10000); 

  it('debe obtener todas las adopciones', async () => {
    const res = await request(app).get('/api/adoptions/');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.payload).to.be.an('array');
  });
});

it('debe obtener una adopción específica por ID', async () => {
  // Crear adopción primero para tener ID
  const user = await usersService.create({ first_name: 'Test', last_name: 'User', email: `test${Date.now()}@mail.com`, password: '1234' });
  const pet = await petsService.create({ name: 'Firulais', specie: 'dog', adopted: false });
  const adoption = await adoptionsService.create({ owner: user._id, pet: pet._id });

  const res = await request(app).get(`/api/adoptions/${adoption._id}`);
  expect(res.status).to.equal(200);
  expect(res.body).to.have.property('status', 'success');
  expect(res.body.payload).to.have.property('_id', adoption._id.toString());
});

it('debe permitir que un usuario adopte una mascota', async () => {
  const user = await usersService.create({ 
    first_name: 'Adoptante', 
    last_name: 'Prueba', 
    email: `adopta${Date.now()}@mail.com`, 
    password: '1234' 
  });

  const pet = await petsService.create({ 
    name: 'Michi', 
    specie: 'cat', 
    adopted: false 
  });

  const res = await request(app).post(`/api/adoptions/${user._id}/${pet._id}`);
  
  expect(res.status).to.equal(200);
  expect(res.body).to.have.property('status', 'success');
  expect(res.body).to.have.property('message', 'Pet adopted');

  // Confirmar actualización de mascota
  const updatedPet = await petsService.getBy({ _id: pet._id });
  expect(updatedPet.adopted).to.be.true;
  expect(updatedPet.owner.toString()).to.equal(user._id.toString()); 
});
it('no debe registrar usuario sin email', async () => {
  const res = await request(app)
    .post('/api/sessions/register')
    .send({
      first_name: 'Test',
      last_name: 'User',
      password: '1234'
    });

  expect(res.status).to.be.oneOf([400]);
  expect(res.body).to.have.property('status', 'error');
});

it('no debe permitir login sin password', async () => {
  const res = await request(app)
    .post('/api/sessions/login')
    .send({
      email: testEmail,
    });

  expect(res.status).to.be.oneOf([400]);
  expect(res.body).to.have.property('status', 'error');
});

it('debe rechazar acceso a sesión actual sin cookie', async () => {
  const res = await request(app).get('/api/sessions/current');
  expect(res.status).to.be.oneOf([401, 400]);
  expect(res.body).to.have.property('status', 'error');
});

});
 