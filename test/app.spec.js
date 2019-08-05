const app = require('../src/app');

describe('App', () => {
  it('GET / responds with 200 containing "This app is gonna be awesomesauce!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'This app is gonna be awesomesauce!');
  });
});
