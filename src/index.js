const express = require('express')
const { randomUUID } = require('crypto')
const app = express()


// "Banco de dados" em memória
let tasks = [
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

//Constantes de validação de status
const VALID_STATUSES = ['pending', 'in_progress', 'done'];

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



app.listen(3000,()=>{
    console.log("Servidor online!!")
})