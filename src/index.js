const express = require('express');

const app = express();

app.listen(8080);

app.get("/courses", (request, response) =>{
   return response.json([
     "Curso 1",
     "Curso 2",
     "Curso 3"
   ]);
})