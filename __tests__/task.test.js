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
 
// ─────────────────────────────────────────────
// GET /tasks
// ─────────────────────────────────────────────
describe('GET /tasks', () => {
  it('deve retornar todas as tarefas com status 200', async () => {
    const res = await request(app).get('/tasks');
 
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count');
    expect(res.body).toHaveProperty('tasks');
    expect(Array.isArray(res.body.tasks)).toBe(true);
    expect(res.body.count).toBe(res.body.tasks.length);
  });
 
  it('deve filtrar tarefas por status "done"', async () => {
    const res = await request(app).get('/tasks?status=done');
 
    expect(res.status).toBe(200);
    res.body.tasks.forEach(task => {
      expect(task.status).toBe('done');
    });
  });
 
  it('deve filtrar tarefas por status "pending"', async () => {
    const res = await request(app).get('/tasks?status=pending');
 
    expect(res.status).toBe(200);
    res.body.tasks.forEach(task => {
      expect(task.status).toBe('pending');
    });
  });
 
  it('deve retornar 400 para status inválido', async () => {
    const res = await request(app).get('/tasks?status=invalido');
 
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});