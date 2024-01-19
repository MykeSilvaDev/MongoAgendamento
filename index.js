/*                              Aula 348 Setup do Projeto 
                                Aula 349 Formulário de Cadastro 
                                Aula 352 Service de Consulta 
                                Aula 353 Setup do full calendar 
                                Aula 354 Obtendo Resultados 
                                Aula 357 Detecção de cliques no FullCalendar 
                                Aula 358 Página de consulta 
                                Aula 359 Finalizando Consultas 
                                Aula 360 Listagem e preparando busca  
                                Aula 361 Sistema de Busca 
                                Aula 362 Tasks com setinterval 
                                Aula 363 Preparando base para tasks 
                                  */

/*(1-348) */
const express = require ("express");
/*(2-348) CRIANDO A INSTÂNCIA DO EXPRESS */
const app = express();
/*(4-348) CONFIGURAR O BODY-PARSER*/
const bodyParser = require ("body-parser");
/*(7-348) IMPORTAR O MONGOOSE  */
const mongoose = require("mongoose");
/*(12-352) IMPORTAR O APPOITMENT */
const appointmentService = require("./services/AppointmentService");
const AppointmentService = require("./services/AppointmentService");





/*(3-348)                        [ CONFIGURAÇÃO DE ARQUIVOS ESTÁTICOS ] 

Quando eu utilizar o full calendar, preciso colocá-lo  em uma pasta, tanto o css e o javascript e depois puxar 
os dados dessa pasta nas views */
app.use(express.static("public"));

/*(5-348) */
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/*(6-348) ESTOU DIZENDO QUE A MINHA VIEW ENGINE VAI SER O EJS */
app.set('view engine', 'ejs');


/* (8-348)              [ CONEXÃO COM O BANCO DE DADOS MONGO ]
*/
mongoose.connect("mongodb://127.0.0.1:27017/agendamento", {useNewUrlParser: true, useUnifiedTopology: true});


/*(14-353) RENDERIZAR CALENDÁRIO */
/*(9-348) CRIANDO ROTA */
app.get("/", (req, res) => {
    res.render("index");
});

/*(11-349) VOU RENDERIZAR A ROTA CADASTRO DO(ARQUIVO create.ejs) */
app.get("/cadastro", (req, res) => {
    res.render("create")
})

/*(13-352)  */
app.post("/create", async (req, res) => {
    
/*CRIANDO UMA FUNÇÃO DENTRO DA ROTA */
    var status =  await appointmentService.Create(
        req.body.name,
        req.body.email,
        req.body.description,
        req.body.cpf,
        req.body.date,
        req.body.time
    )

    if(status){
/* ASSIM QUE O CADASTRO OCORREU COM SUCESSO, VOU REDIRECIONAR O USUÁRIO PARA A ROTA PRINCIPAL */
        res.redirect("/");
    }else{
        res.send("Ocorreu uma falha!");
    }
});


/*(15-354) CRIANDO UMA ROTA */
app.get("/getcalendar", async (req, res) => {
/* NÃO MOSTRAR AS CONSULTAS QUE ESTÃO FINALIZADAS */
    var appointments = await AppointmentService.GetAll(false);
/* QUANDO EU ACESSAR ESSA ROTA GET CALENDAR, VAI ME RETORNAR OS JSONS COM TODAS AS CONSULTAS */
    res.json(appointments);
});


/*(16-357) CRIANDO UMA NOVA ROTA QUANDO O USUÁRIO CLICAR NAS CONSULTAS, COMO EU VOU FAZER UMA CONSULTA NO BANCO DE DADOS
EU VOU INSERIR ASYNC */
app.get("/event/:id", async (req, res) => {
/*(17-358) ESTOU MANDANDO A MINHA APLICAÇÃO BUSCAR UMA CONSULTA QUE TEM ESSE ID QUE O USUÁRIO VAI PASSAR PELA URL
ARQUIVO (AppointmentSeervice.js 6-358) */
    //console.log(await AppointmentService.GetById(req.params.id))
    var appointment = await AppointmentService.GetById(req.params.id);
    console.log(appointment);
/* ESTOU RENDERIZANDO O ARQ (event.ejs QUE ESTA NA PASTA VIEWS) */
    res.render("event",{appo: appointment});
    //res.json({id: req.params.id});
});


/*(18-359) CRIANDO UMA ROTA QUE VOU ACESSAR ATRÁVES DE UM FORMULÁRIO, ESSA ROTA VAI RECEBER UMA FUNÇÃO ASSÍNCRONA */
app.post("/finish", async (req, res) => {
/* ATRÁVES DO FORMULÁRIO DE FINALIZAÇÃO, VOU ENVIAR O ID PARA A CONSULTA QUE EU QUERO FINALIZAR, NO CORPO DO FORMULÁRIO
EU VOU PEGAR ESSE ID */
    var id =  req.body.id;
/* EU POSSO USAR O RESULT PARA FAZER OQUE QUISER, (Caso o result seja falso,posso mover o usuário para uma tela de erro
posso mostrar uma flash message) */
    var result =  await AppointmentService.Finish(id);
    res.redirect("/")
});

/*(19-360) VOU CRIAR UMA ROTA LIST COM UMA FUNÇÃO ASSÍNCRONA */
app.get("/list", async (req, res) => {

/*(20-361) ESTOU CHAMANDO O ARQUIVO APPOINTMENT SERVICE E CHAMANDO A FUNÇÃO SEARCH E MANDANDO
PESQUISAR ALGUM DADO PARA MIM (EX: pesquisar email@teste.com ) */

/* ESTOU PUXANDO AS CONSULTAS DO MEU SERVICE */
    var appos = await AppointmentService.GetAll(true);
/* VOU RENDERIZAR A ROTA LIST (PASTA VIEWS - ARQ list.ejs), ESTOU PASSANDO PARA A VIEW AS CONSULTAS UM 
ARRAY CHAMADO APPOS  */
    res.render("list",{appos});
    //res.json(appos);
});

/*(21-361) NA HORA QUE EU FIZER A BUSCA EU VOU PASSAR PARA O FORMULÁRIO UM CAMPO CHAMADO SEARCH, OU SEJA
TODA VEZ QUE EU ENVIAR ESSE FORMULÁRIO PARA O BACK-END  */
app.get("/searchresult", async (req, res) => {
    console.log(req.query.search);
/* O RESULTADO DA BUSCA EU VOU SALVAR NA VARIÁVEL APPOS */
    var appos = await AppointmentService.Search(req.query.search)
    res.render("list",{appos});
})

/*(22-362) VOU EXECUTAR UMA FUNÇÃO A CADA 3s PARA VERIFICAR O BANCO DE DADOS E VEJA SE UMA CONSULTA ESTÁ A 1 HORA DE
ACONTECER ENVIE UM EMAIL PARA O PACIENTE a cada 5 segundos vai acontecer esse processo 
*/
var pollTime = 5000;
// FUNÇÃO ASSÍNCRONA
setInterval(async () =>{
/* 23-363) IMPORTAR A FUNÇÃO SENDNOTIFICATION (ARQ AppointmentService 9-363) */
    await AppointmentService.SendNotification();
},pollTime)


/*(10-348) ABRIR SERVIDOR */
app.listen(8080,() =>{});   