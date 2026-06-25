const request = require('supertest');
const app = require('../src/index')
 
// Reseta as tarefas em memória antes de cada teste para garantir isolamento
beforeEach(() => {
  app.resetTasks();
});
 
// ─────────────────────────────────────────────
// GET /
// ─────────────────────────────────────────────
describe('GET /', () => {
  it('deve retornar informações da API com status 200', async () => {
    const res = await request(app).get('/');
 
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'API de Gestão de Tarefas');
    expect(res.body).toHaveProperty('endpoints');
  });
});
 