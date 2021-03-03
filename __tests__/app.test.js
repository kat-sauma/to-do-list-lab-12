require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    const todo = {
      'todo': 'scold my parent',
      'completed': false,
      'importance': 'low'
    };

    const dbTodos = {
      ...todo,
      user_id: 2,
      id: 8
    };

    test('create a todo item', async () => {
      const todo = {
        'todo': 'scold my parent',
        'completed': false,
        'importance': 'low'
      };

      const data = await fakeRequest(app)
        .post('/api/to-dos')
        .send(todo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(dbTodos);
    });

    test('returns to do list todos', async () => {

      const data = await fakeRequest(app)
        .get('/api/to-dos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([dbTodos]);
    });

    test('returns a single todo item with the matching id', async () => {

      const data = await fakeRequest(app)
        .get('/api/to-dos/8')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(dbTodos);
    });

    test('update a todo item', async () => {

      const newTodo = {
        'todo': 'scold my parent',
        'completed': false,
        'importance': 'medium',
        'id': 8,
        'user_id': 2
      };

      await fakeRequest(app)
        .put('/api/to-dos/8')
        .send(newTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const updatedTodo = await fakeRequest(app)
        .get('/api/to-dos/8')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(updatedTodo.body).toEqual(newTodo);
    });

  });
});