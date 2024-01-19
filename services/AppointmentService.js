

/*(1-352) */
var appointment = require("../models/Appointment");
/*(2-352) SEMPRE QUE VOU UTILIZAR O MODEL NO MONGOOSE, EU PRECISO INICIALIZÁ-LO ANTES */
var mongoose = require("mongoose");
const Appo = mongoose.model("Appointment", appointment);
/*(6-355) IMPORTAR AppointmentFactory */
var AppointmentFactory = require("../factories/AppointmentFactory");
/*(11-365) IMPORTAR O MAILTRAP */
var mailer = require("nodemailer");



/*(3-352) MÉTODO DE CRIAÇÃO DE SERVIÇOS  */
class AppointmentService{
/*QUANDO EU QUISER CRIAR UM APPOINTMENT, VOU CHAMAR ESSE MÉTODO E PASSAR ESSES DADOS */
    async Create(name, email, description, cpf, date, time){
        var newAppo = new Appo({
            name, 
            email,
            description,
            cpf,
            date,
            time,
            finished: false,
/* (10-363) VOU SETAR O CAMPO NOTIFIED, PORQUE NO MEU CONSOLE ELE ME RETORNA undefined */
            notified: false
        });

/* SE O SALVAMENTO OCORRER COM SUCESSO VOU RETORNAR TRUE */
        try{
            await newAppo.save();
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
/*ESSE SAVE VAI ME RETORNAR UMA PROMISE ISSO SIGNIFICA QUE CONSIGO INSERIR UM AWAIT */
    }
/*(4-354) VOU UTILIZAR TANTO NA PARTE DA BUSCA POR CONSULTA COMO NA PARTE DE CALENDAÁRIO (na hora que eu for exibir
    uma consulta no calendário eu só vou exibir caso ela ainda não esteja finalizada ) MAS NA HORA DA BUSCA
    EU PRECISO EXIBIR AS CONSULTAS INDEPENDENTE SE ESTÁ FINALIZADA OU NÃO */
    async GetAll(showFinished){

/* SE FOR PARA MOSTRAR TODAS AS CONSULTAS INCLUSIVE AS QUE ESTÃO FINALIZADAS VOU CHAMAR MEU MODEL
APPO, VOU RETORNAR TODAS AS CONSULTAS QUE ELE ACHAR */
        if(showFinished){
            return await Appo.find();
        }else{
/* ESTOU PEGANDO NO BANCO DE DADOS AS CONSULTAS "MENOS" AS QUE NÃO ESTÃO FINALIZADAS, E SALVO ESSAS CONSULTAS CHAMADO
 NO ARRAY (appos)*/
/*(5-355) */
            var appos = await Appo.find({'finished': false});
/* APÓS ISSO EU CRIO UM ARRAY VAZIO */
            var appointments = [];

/* PARA CADA CONSULTA EU VOU PERCORRER ESSE ARRAY NO BANCO DE DADOS - var appos = await Appo.find({'finished': false}); */
            appos.forEach(appointment => {

/* SE APPOINTMEND.DATE FOR DIFERENTE DE UNDEFINED OU NULO, VOU PROCESSÁ-LA, VAI PERMITIR QUE CONSULTAS
COM A DATA INVÁLIDA NEM SEJAM PROCESSADAS  */
                if(appointment.date != undefined){
/* CHAMANDO O APPOINTMENTFACTORY QUE EU ACABEI DE IMPORTAR, VAI SER CRIADO UMA CONSULTA COMPLEXA (AppointmentFactory)
APÓS ADICIONAR UMA CONSULTA SIMPLES QUE É (appointment) */
                    appointments.push(AppointmentFactory.Build(appointment))
                }
            });

/* VAI ME RETORNAR OS DADOS QUE AQUI ESTÃO SENDO PROCESSADOS PARA SER USADO NO CALENDÁRIO,  */
            return appointments;
        }
    }

/*(6-358) CRIANDO UM MÉTODO GET QUE VAI RECEBER UM ID DE UM ELEMENTO QUE QUERO BUSCAR*/
    async GetById(id){
        try{
            var event = await Appo.findOne({'_id': id});
            return event;
        }catch(err){
            console.log(err);
        }
    }

/*(7-359) CRIAR UM MÉTODO CHAMADO FINISH QUE VAI FINALIZAR UMA CONSULTA, VOU PASSAR UM ID PARA ESSE METODO
E A OBRIGAÇÃO DESSE MÉTODO É A FINALIZAÇÃO DE UMA CONSULTA */
async Finish(id){   
    try{
        /* DENTRO DESSE PARÂMETRO EU QUERO PASSAR O CAMPO QUE EU QUERO ATUALIZAR, NO CASO É O CAMPO FINISHED 
(3-352) MÉTODO DE CRIAÇÃO DE SERVIÇOS, estou usando async e await que no final das contas me retorna uma promisse
que pode dar certo que no caso é try ou errado que me retorna catcj*/
         await Appo.findByIdAndUpdate(id,{finished: true});
/** CASO A OPERAÇÃO OCORRA COM SUCESSO EU VOU DAR UM RETURN true ESSE RETURN É IMPORTANTE PARA EU SABER SE A OPERAÇÃO
 FOI CONCLUÍDA COM SUCESSO OU NÃO LÁ NO CONTROLLER
 */     return true;
    }catch(err){
        console.log(err)
/* CASO ACONTEÇA ALGUM ERRO, VOU DAR UM RETURN False */
        return false;
        }

    }

/*(8-361) VOU CRIAR UM MÉTODO QUE VOU CHAMAR DE SEARCH */
    async Search(query){
        try{
/* VOU CHAMAR O MODEL APPO, COMO EU TENHO DUAS CONDIÇÕES DE BUSCA, (cpf ou emaiL) VOU INSERIR or() */
        var appos = await Appo.find().or([{email: query},{cpf: query}])
        return appos;
        //console.log(appos)
        }catch(err){
            console.log(err);
            return [];
        }


    }

/*(9-363) VOU CRIAR UMA FUNÇÃO QUE VOU CHAMAR UMA OUTRA FUNÇÃO GETALL (4-354) */
    async SendNotification(){
/* não quero exibir consultas finalizadas vou passar como parâmetro false, vou pegar todas as consultas adicionando
a variável appos */
        var appos = await this.GetAll(false);

/*(12-365) // CRIAR O TRANSPORTER*/
        var transporter = mailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: "465",
            auth: {
                user: "46fee354b64726",
                pass: "54dc0f98f27b96",

            }
        });

/*(10-364) VOU PERCORRER O ARRAY DE CONSULTAS QUE EU RECEBO E PARA CADA CONSULTA VOU EXECUTAR UM CÁCLCULO
MATEMÁTICO */
        appos.forEach(async app =>{
/** VOU PEGAR A DATA ATUAL QUE A CONSULTA COMEÇA QUE É app.start, COM GETTIME VOU PEGAR ESSA HORA EM FORMATO DE 
MILISEGUNDOS
 */         var date = app.start.getTime();
            var hour = 1000 * 60 * 60;
/** GAP. NOSSA DATA - DATA ATUAL */
            var gap = date-Date.now();

/* SE O GAP FOR MENOR OU IGUAL QUE 1h PAR A CONSULTA ACONTECER */
            if(gap <= hour){

/*(13-365) SE APP.NOTIFIED FOR DIFERENTE O EMAIL NÃO FOI ENVIADO */
                if(!app.notified){
/* A PARTIR DO MOMENTO QUE EU SEI QUE AQUELA CONSULTA NÃO FOI NOTIFICADA JA VOU PUXAR O MODEL  */
                    await Appo.findByIdAndUpdate(app.id,{notified: true});
                    transporter.sendMail({
                        from: "Myke Silva <mykedell@corporation.com>",
                        to: app.email,
                        subject: "Sua consulta vai acontecer em breve!",    
                        text: "Sua consulta acontece em 1h"
/** EU ADICIONEI UMA PROMISSE AQUI, PORQUE CASO EU TIVESSE UMA FUNÇÃO LOGO ABAIXO, EU NÃO 
 * QUERO ESPERAR ACABAR O ENVIO DE EMAIL PARA PASSAR PARA A PROXIMA FUNÇÃO !!
 */
                    }).then(() =>{

                    }).catch(err =>{
                        
                    })
                   
                }

            // PASTA factories ARQ AppointmentFactory.js
                //console.log(app.title);
                //console.log("Mande a Notificação!");
                //console.log(appos);
            }
        });
        
    }

}
module.exports = new AppointmentService();

