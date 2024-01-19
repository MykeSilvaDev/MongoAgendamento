

/*(1-355) CRIANDO MÉTODO CHAMADO BUILD */
class AppointmentFactory{
/* CONSULTA SIMPLES -> vou processar essa consulta dentro desse método build e retornar uma consulta preparada
para ser exibida no calendário, (CONSULTA PREPARADA NO CALENDÁRIO) tem => [id, title, start, end] */
    Build(simpleAppointments){

/*(3-355) PRECISO JUNTAR A HORA COM A DATA, MAS PRIMEIRO EU PRECISO SEPARAr CADA COMPONENTE DA DATA */
        var day = simpleAppointments.date.getDate()+1;
        var month = simpleAppointments.date.getMonth();
        var year = simpleAppointments.date.getFullYear();
        /*CONVERTENDO A HORA PARA NUMERO INTEIRO */
        var hour = Number.parseInt(simpleAppointments.time.split(":")[0]);
        var minutes = Number.parseInt(simpleAppointments.time.split(":")[1]);
/*(4-355) */        
        var startDate = new Date(year, month, day, hour, minutes,0,0)

/*(2-355) VAI MOSTRAR OS DADOS DA CONSULTA*/ 
         var appo = {
            id: simpleAppointments._id,
            title: simpleAppointments.name + " - " + simpleAppointments.description,
            start:  startDate,
            end: startDate,
/*(5-363) */
            notified: simpleAppointments.notified,
/*(6-365) VOU PASSAR O OBJETO REFERENTE AO EMAIL DO CLIENTE, NA DOCUMENTAÇÃO DO NODEMAILER PEDE ISSO*/
            email: simpleAppointments.email

    }


        return appo
    }
}   
module.exports = new AppointmentFactory();

/* RESUMINDO: Criei um objeto com base em outro, cria-se um objeto simples e retorna em um objeto complexo */