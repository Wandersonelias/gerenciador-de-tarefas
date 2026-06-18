# API de Gestão de Tarefas

API REST simples em Node.js + Express para demonstração, com armazenamento em memória (os dados são perdidos ao reiniciar o servidor).

## Como executar

```bash
npm install
npm start
```

O servidor inicia em `http://localhost:3000`.

## Endpoints

| Método | Rota                  | Descrição                                  |
|--------|-----------------------|---------------------------------------------|
| GET    | `/tasks`               | Lista todas as tarefas (filtro opcional `?status=`) |
| GET    | `/tasks/:id`            | Busca uma tarefa específica                |
| POST   | `/tasks`               | Cria uma nova tarefa                       |
| PUT    | `/tasks/:id`            | Atualiza título, descrição e/ou status     |
| PATCH  | `/tasks/:id/status`     | Atualiza apenas o status                   |
| DELETE | `/tasks/:id`            | Remove uma tarefa                          |

Status válidos: `pending`, `in_progress`, `done`.

## Exemplos com curl

Criar uma tarefa:
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Estudar Node.js", "description": "Revisar conceitos de Express"}'
```

Listar todas as tarefas:
```bash
curl http://localhost:3000/tasks
```

Listar apenas tarefas pendentes:
```bash
curl "http://localhost:3000/tasks?status=pending"
```

Atualizar o status de uma tarefa:
```bash
curl -X PATCH http://localhost:3000/tasks/SEU_ID_AQUI/status \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

Remover uma tarefa:
```bash
curl -X DELETE http://localhost:3000/tasks/SEU_ID_AQUI
```

