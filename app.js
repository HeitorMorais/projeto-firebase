const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./projeto-firebase-c8ab0-firebase-adminsdk-44y54-7a2437fb81.json')

initializeApp({
  credential: cert(serviceAccount)
})



const db = getFirestore()

const Agendamento = db.collection("agendamentos")


app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){

    res.render("primeira_pagina")
    
})

app.get("/consulta", function(req, res){
    var agendamentos = [];
    db.collection('agendamentos').get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                agendamentos.push({ id: doc.id, ...doc.data() });
            });
            res.render("consulta", { post: agendamentos });
        })
        .catch((error) => {
            console.error("Erro ao consultar agendamentos: ", error);
        });
})

app.get("/editar/:id", function(req, res){
    var id = req.params.id;
    db.collection('agendamentos').doc(id).get()
        .then((doc) => {
                res.render("editar", { agendamento: doc.data(), id: id });
        })
        .catch((error) => {
            console.error("Erro ao editar: ", error);
        });
})

app.get("/excluir/:id", function(req, res){
    var id = req.params.id;
    db.collection('agendamentos').doc(id).delete()
        .then(() => {
            console.log("Agendamento excluído!");
            res.redirect("/consulta");
        })
        .catch((error) => {
            console.error("Erro ao excluir agendamento: ", error);
        });
})

app.post("/cadastrar", function(req, res){
    db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Cadastrado!');
        res.redirect('/')
    })
})

app.post("/atualizar", function(req, res){
    var id = req.body.id;
    var updatedData = {
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    };
    db.collection('agendamentos').doc(id).update(updatedData)
        .then(() => {
            console.log("Agendamento atualizado com sucesso");
            res.redirect("/consulta");
        })
        .catch((error) => {
            console.error("Erro ao atualizar agendamento: ", error);
        });
})

app.listen(8081, function(){
    console.log("Servidor ativo!, http://localhost:8081")
})