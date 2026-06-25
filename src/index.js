const express = require('express');
const { randomUUID } = require('crypto');

const app = express();

app.use(express.json());

// "Banco de dados" em memória — exportado para resetar entre testes
const initialTasks = () => [
  {
    id: randomUUID(),
    title: 'Configurar ambiente do projeto',
    description: 'Instalar dependências e configurar o repositório',
    status: 'done',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: randomUUID(),
    title: 'Criar documentação da API',
    description: 'Escrever exemplos de uso dos endpoints',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let tasks = initialTasks();

const VALID_STATUSES = ['pending', 'in_progress', 'done'];

// Middleware de log (silenciado em testes via NODE_ENV)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
});

// Rota raiz com informações básicas da API
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestão de Tarefas',
    endpoints: {
      'GET /tasks': 'Lista todas as tarefas (aceita ?status=pending|in_progress|done)',
      'GET /tasks/:id': 'Busca uma tarefa pelo id',
      'POST /tasks': 'Cria uma nova tarefa (title obrigatório, description opcional)',
      'PUT /tasks/:id': 'Atualiza uma tarefa existente',
      'PATCH /tasks/:id/status': 'Atualiza apenas o status da tarefa',
      'DELETE /tasks/:id': 'Remove uma tarefa'
    }
  });
});

// Listar tarefas, com filtro opcional por status
app.get('/tasks', (req, res) => {
  const { status } = req.query;

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Status inválido. Use um dos seguintes: ${VALID_STATUSES.join(', ')}`
    });
  }

  const result = status ? tasks.filter(t => t.status === status) : tasks;
  res.json({ count: result.length, tasks: result });
});

// Buscar uma tarefa específica
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }
  res.json(task);
});

// Criar nova tarefa
app.post('/tasks', (req, res) => {
  const { title, description, status } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'O campo "title" é obrigatório' });
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Status inválido. Use um dos seguintes: ${VALID_STATUSES.join(', ')}`
    });
  }

  const newTask = {
    id: randomUUID(),
    title: title.trim(),
    description: description ? String(description).trim() : '',
    status: status || 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Atualizar tarefa existente (título, descrição e/ou status)
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }

  const { title, description, status } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'O campo "title" não pode ser vazio' });
    }
    task.title = title.trim();
  }

  if (description !== undefined) {
    task.description = String(description).trim();
  }

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Status inválido. Use um dos seguintes: ${VALID_STATUSES.join(', ')}`
      });
    }
    task.status = status;
  }

  task.updatedAt = new Date().toISOString();
  res.json(task);
});

// Atualizar apenas o status
app.patch('/tasks/:id/status', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }

  const { status } = req.body;
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `O campo "status" é obrigatório e deve ser um dos seguintes: ${VALID_STATUSES.join(', ')}`
    });
  }

  task.status = status;
  task.updatedAt = new Date().toISOString();
  res.json(task);
});

// Remover tarefa
app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }

  const [removed] = tasks.splice(index, 1);
  res.json({ message: 'Tarefa removida com sucesso', task: removed });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Utilitário usado pelos testes para resetar o estado em memória
app.resetTasks = () => { tasks = initialTasks(); };

module.exports = app;