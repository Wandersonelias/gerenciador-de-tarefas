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


// ─────────────────────────────────────────────
// GET /tasks/:id
// ─────────────────────────────────────────────
describe('GET /tasks/:id', () => {
  it('deve retornar uma tarefa existente pelo id', async () => {
    const lista = await request(app).get('/tasks');
    const { id } = lista.body.tasks[0];
 
    const res = await request(app).get(`/tasks/${id}`);
 
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', id);
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('status');
  });
 
  it('deve retornar 404 para id inexistente', async () => {
    const res = await request(app).get('/tasks/id-que-nao-existe');
 
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
 
// ─────────────────────────────────────────────
// POST /tasks
// ─────────────────────────────────────────────
describe('POST /tasks', () => {
  it('deve criar uma tarefa com title e description', async () => {
    const payload = { title: 'Nova tarefa', description: 'Descrição da tarefa' };
    const res = await request(app).post('/tasks').send(payload);
 
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(payload.title);
    expect(res.body.description).toBe(payload.description);
    expect(res.body.status).toBe('pending');
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
  });
 
  it('deve criar tarefa sem description', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Só título' });
 
    expect(res.status).toBe(201);
    expect(res.body.description).toBe('');
  });
 
  it('deve criar tarefa com status customizado', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Em progresso', status: 'in_progress' });
 
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('in_progress');
  });
 
  it('deve retornar 400 quando title está ausente', async () => {
    const res = await request(app).post('/tasks').send({ description: 'Sem título' });
 
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
 
  it('deve retornar 400 quando title é uma string vazia', async () => {
    const res = await request(app).post('/tasks').send({ title: '   ' });
 
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
 
  it('deve retornar 400 para status inválido na criação', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Tarefa', status: 'errado' });
 
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
 
  it('deve incrementar a lista de tarefas após criação', async () => {
    const antes = (await request(app).get('/tasks')).body.count;
 
    await request(app).post('/tasks').send({ title: 'Incrementar lista' });
 
    const depois = (await request(app).get('/tasks')).body.count;
    expect(depois).toBe(antes + 1);
  });
});
 
// ─────────────────────────────────────────────
// PUT /tasks/:id
// ─────────────────────────────────────────────
describe('PUT /tasks/:id', () => {
  it('deve atualizar título, description e status de uma tarefa', async () => {
    const lista = await request(app).get('/tasks');
    const { id } = lista.body.tasks[0];
 
    const res = await request(app)
      .put(`/tasks/${id}`)
      .send({ title: 'Título atualizado', description: 'Nova desc', status: 'in_progress' });
 
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Título atualizado');
    expect(res.body.description).toBe('Nova desc');
    expect(res.body.status).toBe('in_progress');
  });
 
  it('deve atualizar apenas o título sem alterar outros campos', async () => {
    const lista = await request(app).get('/tasks');
    const original = lista.body.tasks[0];
 
    const res = await request(app)
      .put(`/tasks/${original.id}`)
      .send({ title: 'Só título mudou' });
 
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Só título mudou');
    expect(res.body.status).toBe(original.status);
    expect(res.body.description).toBe(original.description);
  });
 
  it('deve retornar 404 para id inexistente', async () => {
    const res = await request(app)
      .put('/tasks/id-invalido')
      .send({ title: 'Algo' });
 
    expect(res.status).toBe(404);
  });
 
  it('deve retornar 400 ao tentar atualizar title para string vazia', async () => {
    const lista = await request(app).get('/tasks');
    const { id } = lista.body.tasks[0];
 
    const res = await request(app).put(`/tasks/${id}`).send({ title: '' });
 
    expect(res.status).toBe(400);
  });
 
  it('deve retornar 400 para status inválido na atualização', async () => {
    const lista = await request(app).get('/tasks');
    const { id } = lista.body.tasks[0];
 
    const res = await request(app).put(`/tasks/${id}`).send({ status: 'errado' });
 
    expect(res.status).toBe(400);
  });
});
 
// ─────────────────────────────────────────────
// PATCH /tasks/:id/status
// ─────────────────────────────────────────────
describe('PATCH /tasks/:id/status', () => {
  it('deve atualizar apenas o status da tarefa', async () => {
    const lista = await request(app).get('/tasks');
    const original = lista.body.tasks[1]; // tarefa "pending"
 
    const res = await request(app)
      .patch(`/tasks/${original.id}/status`)
      .send({ status: 'done' });
 
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
    expect(res.body.title).toBe(original.title); // título não foi alterado
  });
 
  it('deve retornar 404 para id inexistente', async () => {
    const res = await request(app)
      .patch('/tasks/id-invalido/status')
      .send({ status: 'done' });
 
    expect(res.status).toBe(404);
  });
 
  it('deve retornar 400 quando status está ausente', async () => {
    const lista = await request(app).get('/tasks');
    const { id } = lista.body.tasks[0];
 
    const res = await request(app).patch(`/tasks/${id}/status`).send({});
 
    expect(res.status).toBe(400);
  });
 
  it('deve retornar 400 para status inválido', async () => {
    const lista = await request(app).get('/tasks');
    const { id } = lista.body.tasks[0];
 
    const res = await request(app)
      .patch(`/tasks/${id}/status`)
      .send({ status: 'nao_existe' });
 
    expect(res.status).toBe(400);
  });
});
 
// ─────────────────────────────────────────────
// DELETE /tasks/:id
// ─────────────────────────────────────────────
describe('DELETE /tasks/:id', () => {
  it('deve remover uma tarefa existente', async () => {
    const lista = await request(app).get('/tasks');
    const { id } = lista.body.tasks[0];
    const countAntes = lista.body.count;
 
    const res = await request(app).delete(`/tasks/${id}`);
 
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.task.id).toBe(id);
 
    const depois = await request(app).get('/tasks');
    expect(depois.body.count).toBe(countAntes - 1);
  });
 
  it('deve retornar 404 ao tentar remover id inexistente', async () => {
    const res = await request(app).delete('/tasks/id-invalido');
 
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
 
// ─────────────────────────────────────────────
// Rota não encontrada
// ─────────────────────────────────────────────
describe('Rotas inexistentes', () => {
  it('deve retornar 404 para qualquer rota desconhecida', async () => {
    const res = await request(app).get('/rota-que-nao-existe');
 
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});