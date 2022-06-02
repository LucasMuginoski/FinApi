const { response } = require("express");
const express = require("express");
const { request } = require("http");
const { v4: uuidv4 } = require("uuid") 



const app = express();
app.use(express.json());

const costumers = []

/**
 * CPF - string
 * name - string
 * id - uuid - universe unique identifier
 * statment - array []
 */
app.post("/account", (request, response)=>{
    const {cpf , name} = request.body;
    const id = uuidv4();
    
    costumers.push({
        cpf,
        name,
        id,
        statament: []
    });
    return response.status(201).send();

})

app.listen(3333);