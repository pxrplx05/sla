// bancoDeDados.js
// Este arquivo é responsável por toda a comunicação com o banco de dados SQLite.
// Ele cria a tabela de tarefas (se ainda não existir) e exporta funções prontas
// para inserir e listar tarefas, que serão usadas pelo server.js.

// Importa o pacote "sqlite3". O ".verbose()" deixa as mensagens de erro mais
// detalhadas no terminal, o que ajuda bastante durante o aprendizado.
const sqlite3 = require('sqlite3').verbose();

// Cria (ou abre, se já existir) o arquivo de banco de dados chamado "banco.db".
// Esse arquivo fica salvo na mesma pasta do projeto.
const db = new sqlite3.Database('./banco.db', (erro) => {
  // Esta função de callback roda assim que a conexão com o banco é feita.
  if (erro) {
    // Se "erro" não for nulo, algo deu errado ao abrir o banco.
    console.error('Erro ao conectar ao banco de dados:', erro.message);
  } else {
    // Se não houve erro, a conexão foi bem-sucedida.
    console.log('Conectado ao banco de dados SQLite (banco.db).');
  }
});

// Assim que o banco é aberto, garantimos que a tabela "tarefas" existe.
// "CREATE TABLE IF NOT EXISTS" evita erro caso o servidor seja reiniciado
// várias vezes: se a tabela já existir, esse comando não faz nada.
db.run(`
  CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL
  )
`, (erro) => {
  // Callback executado depois que o comando SQL acima termina de rodar.
  if (erro) {
    // Caso não seja possível criar a tabela, mostramos o erro no terminal.
    console.error('Erro ao criar a tabela de tarefas:', erro.message);
  } else {
    // Se tudo deu certo, avisamos que a tabela está pronta para uso.
    console.log('Tabela "tarefas" pronta para uso.');
  }
});

// Função responsável por inserir uma nova tarefa no banco de dados.
// Recebe a descrição da tarefa (texto) como parâmetro.
function inserirTarefa(descricao) {
  // Funções do sqlite3 usam callback por padrão, então aqui nós as
  // "envolvemos" (wrapping) em uma Promise. Isso permite usar
  // async/await no server.js, deixando o código mais fácil de ler.
  return new Promise((resolve, reject) => {
    // "?" é um placeholder: o valor real é passado no array logo depois,
    // o que evita problemas de segurança (SQL Injection).
    const sql = 'INSERT INTO tarefas (descricao) VALUES (?)';

    // db.run executa comandos que não retornam linhas (INSERT, UPDATE, DELETE).
    // Importante: aqui usamos "function (erro)" (função tradicional, não arrow
    // function), porque precisamos acessar "this.lastID" logo abaixo — e o
    // "this" só funciona dessa forma dentro de uma função tradicional.
    db.run(sql, [descricao], function (erro) {
      if (erro) {
        // Se der erro ao inserir, rejeitamos a Promise com o motivo do erro.
        reject(erro);
      } else {
        // "this.lastID" é o id gerado automaticamente pelo SQLite para a
        // linha que acabamos de inserir (graças ao AUTOINCREMENT).
        resolve({ id: this.lastID, descricao: descricao });
      }
    });
  });
}

// Função responsável por buscar todas as tarefas cadastradas no banco.
function listarTarefas() {
  // Também retorna uma Promise, pelo mesmo motivo da função anterior.
  return new Promise((resolve, reject) => {
    // db.all executa um SELECT e retorna todas as linhas encontradas em um array.
    // O segundo argumento ([]) seria para parâmetros de "?", mas aqui não
    // precisamos de nenhum, por isso o array vazio.
    db.all('SELECT * FROM tarefas', [], (erro, linhas) => {
      if (erro) {
        // Se a consulta falhar, rejeitamos a Promise com o erro.
        reject(erro);
      } else {
        // "linhas" já é um array de objetos, cada um representando uma
        // tarefa (com "id" e "descricao"). Resolvemos a Promise com ele.
        resolve(linhas);
      }
    });
  });
}

// Exporta as duas funções para que o server.js possa importá-las com
// require('./bancoDeDados') e usá-las nas rotas.
module.exports = {
  inserirTarefa,
  listarTarefas
};
