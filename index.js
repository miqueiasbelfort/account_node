// modulos 
const inquirer = require("inquirer")
const chalk = require("chalk")

const fs = require("fs")

operation()

function operation() {
    inquirer.prompt([
        {
            type: 'list',
            name: "action",
            message: "O que você deseja fazer?",
            choices: [
                'Criar Conta', 
                'Consultar Saldo',
                'Depositar',
                'Sacar',
                'Sair'
            ]
        }
    ]).then((answer) => {
        
        const action = answer['action']
        //console.log(action)
        
        switch(action){
            case "Criar Conta":
                createAccount()
                break
            case "Depositar":
                deposit()
                break
            case "Consultar Saldo":
                getAccountBalance()
                break
            case "Sacar":
                saque()
                break
            case "Sair":
                console.log(chalk.bgBlue.black("Obrigado por usar o account!"))
                process.exit() //Essa função insera o programa
            default:
                console.log(chalk.bgRed.black("404 error"))
        }

    })
      .catch(err => console.log(err))
}

//create an account
const createAccount = () => {
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'))
    console.log(chalk.green("Defina as opções da sua conta a seguir"))
    buildAccount()
}

const buildAccount = () => {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Digite um nome para sua conta:"
        }
    ]).then((answer) => {

        const accountName = answer['accountName']
        console.info(accountName)

        if (!fs.existsSync('account')){ // Se não existir o reposirotio account
            fs.mkdirSync('account') // Criar repositorio account
        } 

        if (fs.existsSync(`account/${accountName}.json`)){ // Se existe accountName.json no repositorio account
            console.log(chalk.bgRed.black("Está conta já existe, escolha outro nome!"))
            buildAccount()
            return
        } 


        fs.writeFileSync( // Criar um aquivo json no repositorio account
            `account/${accountName}.json`, //nome do arquivo
            '{"balance": 0}', // Saldo da conta
            function(err){ //caso der erro
                console.log(err)
            }
        )

        console.log(chalk.green("Parabéns, a sua conta foi criada com sucesso!"))
        operation() // back to init for to choice the options of account


    }).catch(err => console.log(err))
}

// add am amount to user account
const deposit = () => {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual o nome da sua conta?"
        }
    ]).then((answer) => {

        const accountName = answer["accountName"]

        // verificar se a conta existe
        if(!checkAccount(accountName)){ //Se existe accountName em account
            return deposit() // Retorna verdadeiro
        }

        inquirer.prompt([
            {
                name: "amount",
                message: "Quanto você quer depositar?"
            }
        ]).then(answer => {

            const amount = answer["amount"]
            
            // add an amount
            addAmount(accountName, amount)
            operation()

        }).catch(err => console.log(err))

    }).catch(err => console.log(err))
}

// Adicionar balance no accountName
const addAmount = (accountName, amount) => {

    const accountData = getAccount(accountName) //Isso é um objeto
 
    if(!amount){ //Se não existe o balance no objeto
        console.log(chalk.red('Ocorreu um erro, tente novamente!'))
        return deposit()
    }

    //pegar o balance do objeto = amount("Valor depositado") em número + o proprio balance em número
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    // Escrever o arquivo novamente
    fs.writeFileSync(
        `account/${accountName}.json`,
        JSON.stringify(accountData), // Vai trasformar o obj em JSON novamente
        function(err) {console.log(err)}    
    )

    console.log(chalk.green(`Foi depositado R$${amount} na sua conta!`))

}

// Pegar a conta 
const getAccount = (accountName) => {
    
    // ler o aquivo 
    const accountJSON = fs.readFileSync(`account/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r' //Só quer ler o arquivo
    })

    return JSON.parse(accountJSON) //Trasformando JSON em Objeto JavaScript
}


//Mostrar o saldo
const getAccountBalance = () => {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual o nome da sua conta?"
        }
    ]).then(answer => {

        const accountName = answer['accountName']

        // verificar se a conta existe
        if(!checkAccount(accountName)){
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(`Olá, o saldo da sua conta é de R$${accountData.balance}`))
        operation()

    }).catch(err => console.log(err))
}

//Sacar balance
const saque = () => {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual o nome da sua conta?"
        }
    ]).then(answer => {

        const accountName = answer['accountName']

        //Varificando se a conta existe
        if (!checkAccount(accountName)){
            return saque()
        }

        inquirer.prompt([
            {
                name: "amount",
                message: "Quanto você vai querer sacar?"
            }
        ]).then(answer => {

            const amount = answer['amount']

            const accountData = getAccount(accountName)
            
            if(amount > accountData.balance){

                console.log(chalk.bgRed.black(`Quantidade indisponivel!`))
                return operation()

            } else if (!amount){
                console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente!"))
                return operation()
            }

            accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

            // Escrever o arquivo novamente
            fs.writeFileSync(
                `account/${accountName}.json`,
                JSON.stringify(accountData), // Vai trasformar o obj em JSON novamente
                function(err) {console.log(err)}    
            )
            
            console.log(chalk.bgYellow.black(`Saque com sucesso de R$${amount} da sua conta!`))

            operation()

        }).catch(err => console.log(err))
        

    }).catch(err => console.log(err))
}



// Função para saber se a conta existe
function checkAccount(accountName){

    if(!fs.existsSync(`account/${accountName}.json`)){ //Se não existe accountName.json em account
        console.log(chalk.bgRed.black("Está conta Não existe, escolha outro nome!"))
        return false // Retorna Falso
    }
    return true // Se não retorna Verdadeiro
}