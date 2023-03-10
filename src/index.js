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
 }

 customer.statement.push(statementOperation);

 return response.status(201).send();
});
app.listen(8080);

