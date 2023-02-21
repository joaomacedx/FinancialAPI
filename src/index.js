const express = require("express");
const {v4: uuid } = require("uuid");

const app = express();
app.use(express.json());

const customers = [];

function verifyIfExistsAccountCpf(request, response, next) {
   const { cpf } = request.header;
   
   const customer = customers.find(
     (customer) => customer.cpf === cpf
     );
   if(!customer){
      return response.statusCode(400).json({
        error: "Customer not found",
      });
    }
    request.customer = customer;
   return next();
};
function getBalance(statement){
  const balance = statement.reduce((acc, operation)=>{
   if(operation.type === 'credit'){
     return acc + operation.amount;
   } else {
     return acc - operation.amount;
   }
 }, 0);
 return balance;
};
app.post("/account", (request, response)=>{
   const { cpf, name } = request.body;
   const customerAlreadyExists = customers.some(
     (customer) => 
       customer.cpf === cpf
   );
   if(customerAlreadyExists){
     return response.status(400).json({
       error: "Customer already Exists"
     });
   }
     customers.push({
     cpf,
     name,
     id: uuid(),
     statement: [],
   });
   
   return response.status(201).send();
});
app.get("/statement/:cpf", verifyIfExistsAccountCpf, (request, response)=>{
   const { customer } = request;
   return response.json(customer.statement);
});
app.post("/deposit", verifyIfExistsAccountCpf, (request, response)=>{
 const { description, amount } = request.body;
 
 const{ customer } = request;

 const statementOperation ={
   description,
   amount,
   created_at: new Date(),
   type:"credit"
 };
 
 customer.statement.push(statementOperation);

 return response.status(201).send();
});
app.post("/withdraw", verifyIfExistsAccountCpf, (request, response)=>{
  const{ amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);
  if(balance < amount){
    return response.status(400).json({error: "Insufficient funds!"})
  }
  const statementOperation ={
    amount,
    created_at: new Date(),
    type:"debit"
  };
  customer.statement.push(statementOperation);

  return response.status(201).send();
 });

 app.get("/statement/date", verifyIfExistsAccountCpf, (request, response)=>{
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + "00:00");
   const statement = customer.statement.filter((statement)=> 
    statement.created_at.toDateString()== 
       new Date(dateFormat).toDateString()
   );


  return response.json(customer.statement);
});
 
app.listen(8080);

