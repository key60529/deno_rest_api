import { Router } from "https://deno.land/x/oak/mod.ts"
import { addTodo, deleteTodo, getTodo, getTodos, updateTodo } from "../controllers/todo.ts"

export const router = new Router()

// main routes
router.get("/", (context) => {
  context.response.body = "Hello world!"
})

// toDo routes
router
  .get("/todos", getTodos)
  .get("/todos/:id", getTodo)
  .delete("/todos/:id", deleteTodo)
  .patch("/todos/:id", updateTodo)
  .post("/todos", addTodo)