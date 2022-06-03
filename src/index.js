const { response } = require("express");
const express = require("express");
const { acceptsEncodings } = require("express/lib/request");
const { request } = require("http");
const { v4: uuidv4 } = require("uuid") 



const app = express();
app.use(express.json());

const customers = []
/**
 * CPF - string
 * name - string
 * id - uuid - universe unique identifier
 * statement - array []
 */

// ******* Middleware *******
function verifyIfExistsAccountCpf(request, response, next){
    const { cpf } = request.headers;

    const customer = customers.find(customer => customer.cpf === cpf);
    
    if(!customer){
        return response.status(400).json({ error: "Customer not found" })
    }
    request.customer = customer;
    return next();
}

function getBalance(statement){
    //reduce transforma todos os valores em apenas 1 (calculo de Entradas-Saidas)
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit'){
            return acc + operation.amount;
        }
        else{
            return acc - operation.amount;
        }
    }, 0); //inicializar reduce em 0

    return balance;
}


//criar conta
app.post("/account", (request, response)=>{
    const { cpf , name } = request.body;
    
    //validar se cpf já existe -> retorna boolean
    const customerAlreadyExists = customers.some((customers) => customers.cpf === cpf);
    if(customerAlreadyExists){
        return response.status(400).json({error: "customer already exists!"});
    }


    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });
    return response.status(201).send();

});

app.get("/statement", verifyIfExistsAccountCpf, (request, response)=> {
    const { customer } = request;
    return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistsAccountCpf, (request, response)=> {
    const { description, amount } = request.body;

    const { customer } = request;
    const statementOperation = {
        description,
        amount,
        createdAt : new Date(),
        type : "credit",
    }
    customer.statement.push(statementOperation);

    return response.status(201).send();
});

app.post("/withdraw", verifyIfExistsAccountCpf, (request, response)=> {
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statement);

    if(balance < amount ){
        return response.status(400).json({error: "Insuficient funds!"});
    }
    const statementOperation = {
        amount,
        createdAt : new Date(),
        type : "debit",
    };
    customer.statement.push(statementOperation);
    return response.status(201).send();
});


app.get("/statement/date", verifyIfExistsAccountCpf, (request, response)=> {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter((statement) => statement.createdAt.toDateString() === 
        new Date(dateFormat).toDateString());
    return response.json(statement);
});

app.put("/account", verifyIfExistsAccountCpf, (request, response)=> {
    const { name } = request.body;
    const { customer } = request;
    customer.name = name;

    return response.status(201).send();
});

app.get("/account", verifyIfExistsAccountCpf, (request, response)=>{
    const { customer } = request;
    return response.json(customer);
})

app.listen(3333);