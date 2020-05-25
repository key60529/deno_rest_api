import { v4 } from "https://deno.land/std/uuid/mod.ts"
import { readJson } from "https://deno.land/std/fs/mod.ts"

import { Todo } from "../interfaces/Todo.ts"

const path: string = "./src/models/Todos/"
var Todos: Todo[] = []

for await (const dirEntry of Deno.readDir(path)) {
  if (dirEntry.name.search(".json") != -1) {
    const data: Todo = await readJson(path + dirEntry.name)
    Todos.push(data)
  }
}

// Helper functions
const findTodo = (todoId: string): Todo | undefined => Todos.find(({ id }) => id === todoId)
const noRecord = (value: any) => value === null || value === undefined

// Route functions
export const getTodos = ({ response }: { response: any }) => {
  response.status = 200
  response.body = { msg: "Todos fetched!", data: Todos }
  return
}

export const getTodo = async ({params, response}: {params: any; response: any;}) => {
  const todo: Todo | undefined = findTodo(params.id)

  if (noRecord(todo)) {
    response.status = 404
    response.body = { msg: "Todo not found!" }
    return
  }

  response.status = 200
  response.body = { msg: "Todo fetched!", data: todo }
}

export const addTodo = async ({request, response}: {request: any; response: any;}) => {
  const body = await request.body()
  const { name } = await JSON.parse(body.value)

  if (noRecord(name)) {
    response.status = 400
    response.body = { msg: "Name is missing from the request body" }
    return
  } 

  const fileName = v4.generate()
  const newTodo: Todo = {id: fileName, name, isComplete: false}

  const encoder = new TextEncoder();
  const jsonString = JSON.stringify(newTodo)
  const data = encoder.encode(jsonString);
  await Deno.writeFile(path + fileName + ".json", data);

  response.status = 200
  response.body = { msg: "Todo added!", data: newTodo }
}

export const updateTodo = async ({params, request, response}: {params: any; request: any; response: any;}) => {
  const body = await request.body()
  const { isComplete } = await JSON.parse(body.value)

  if (noRecord(isComplete)) {
    response.status = 400
    response.body = { msg: "isComplete is missing from the request body" }
    return
  }

  const todo: Todo | undefined = findTodo(params.id)
  const updatedTodo: any = { ...todo, isComplete }

  const encoder = new TextEncoder();
  const jsonString = JSON.stringify(updatedTodo)
  const data = encoder.encode(jsonString);
  await Deno.writeFile(path + updatedTodo.id + ".json", data, {create: false});

  response.status = 200
  response.body = { msg: "Todo updated!", data: updatedTodo }
}

export const deleteTodo = async ({params, response}: {params: any; response: any;}) => {
  const selectedTodos: Todo = Todos.filter((todo) => todo.id !== params.id)

  await Deno.remove(path + selectedTodos.id + '.json');

  response.status = 200
  response.body = { msg: "Todo deleted!", data: selectedTodos }
}

