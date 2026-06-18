const express = require('express')
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



app.listen(3000,()=>{
    console.log("Servidor online!!")
})