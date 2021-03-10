const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const findUser = users.find(user => user.username === username)

  if (!findUser) {
    return response.status(404).json({ error: 'User not found' })
  }

  request.user = findUser
  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const findUser = users.find(user => user.username === username)
  if (findUser) return response.status(400).json({ error: 'User already exists' })

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(user)

  return response.status(200).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(201).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request
  const { title, deadline } = request.body

  const findTodo = user.todos.find(todo => todo.id === id)

  if (!findTodo) {
    return response.status(404).json({ error: 'TODO not found' })
  }

  Object.assign(findTodo, { title, deadline })

  return response.status(200).json(user)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const findTodo = user.todos.find(todo => todo.id === id)

  if (!findTodo) {
    return response.status(404).json({ error: 'TODO not found' })
  }

  Object.assign(findTodo, { done: true })
  return response.status(200).json(findTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  let { user } = request

  const findTodo = user.todos.find(todo => todo.id === id)

  if (!findTodo) {
    return response.status(404).json({ error: 'TODO not found' })
  }

  const todoIdx = user.todos.indexOf(findTodo, 0)

  users.find(u => {
    if (u.username === user.username) {
      u.todos.splice(todoIdx, 1)
    }
  })

  return response.status(204)
});

module.exports = app;