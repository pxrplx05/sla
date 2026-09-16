// server.js
// Este arquivo cria o servidor da aplicação usando Express e disponibiliza
// as duas rotas que o front-end vai consumir com fetch: criar e listar tarefas.

// Importa o Express, o framework que facilita a criação de rotas e do servidor.
const express = require('express');

// Importa o módulo "path" do próprio Node.js, usado para montar caminhos de
// arquivos e pastas de forma segura (funciona em Windows, Linux e Mac).
const path = require('path');

// Importa as funções que criamos no bancoDeDados.js, para não precisar
// escrever comandos SQL diretamente aqui no server.js.
const bancoDeDados = require('./bancoDeDados');

// Cria a aplicação Express. É esse "app" que vamos configurar e, no final,
// colocar para "escutar" requisições.
const app = express();

// Define em qual porta o servidor vai rodar. Os alunos vão acessar o
// back-end em http://localhost:3000.
const PORTA = 3000;

// Middleware que permite ao Express entender requisições cujo corpo (body)
// está em formato JSON. Sem essa linha, "req.body" chegaria undefined nas
// rotas POST.
app.use(express.json());

// Middleware que transforma a pasta "public" em uma pasta de arquivos
// estáticos: tudo que estiver dentro dela (HTML, CSS, JS do front-end)
// fica acessível diretamente pelo navegador, sem precisar criar rotas
// específicas para cada arquivo.
app.use(express.static(path.join(__dirname, 'public')));

// Rota para CRIAR uma nova tarefa.
// Repare que o método é "post" (minúsculo, é assim que o Express identifica
// o verbo HTTP) e a rota é "/tarefas", exatamente como o front-end vai chamar.
app.post('/tarefas', async (req, res) => {
  // "req" (request) traz os dados que chegaram na requisição.
  // "res" (response) é usado para devolver uma resposta ao front-end.

  // Pegamos a descrição da tarefa que o front-end enviou no corpo (body)
  // da requisição, em formato JSON: { "descricao": "..." }.
  const { descricao } = req.body;

  // Validação no back-end: mesmo que o front-end já valide, é uma boa
  // prática o servidor também conferir, pois nem toda requisição vem
  // necessariamente de um formulário validado (pode vir de outro programa).
  if (!descricao || descricao.trim() === '') {
    // Se a descrição não veio ou está vazia, respondemos com o status 400
    // (Bad Request, ou seja, "requisição inválida") e uma mensagem de erro.
    return res.status(400).json({ erro: 'A descrição da tarefa é obrigatória.' });
  }

  // Um bloco try/catch é usado aqui porque a função inserirTarefa acessa o
  // banco de dados, e qualquer operação externa pode falhar inesperadamente.
  try {
    // Chamamos a função do bancoDeDados.js, aguardando (await) o resultado,
    // já que ela retorna uma Promise.
    const novaTarefa = await bancoDeDados.inserirTarefa(descricao.trim());

    // Se deu tudo certo, respondemos com o status 201 (Created, ou seja,
    // "criado com sucesso") e devolvemos a tarefa recém-criada em JSON.
    res.status(201).json(novaTarefa);
  } catch (erro) {
    // Se algo falhar dentro do try (por exemplo, erro no banco de dados),
    // caímos aqui. Mostramos o erro no terminal do servidor...
    console.error('Erro ao inserir tarefa:', erro.message);

    // ...e respondemos ao front-end com o status 500 (Internal Server Error),
    // indicando que o problema foi do lado do servidor.
    res.status(500).json({ erro: 'Não foi possível salvar a tarefa.' });
  }
});

// Rota para LISTAR todas as tarefas cadastradas.
// Aqui o método é "get", pois estamos apenas buscando dados, sem alterá-los.
app.get('/tarefas', async (req, res) => {
  try {
    // Busca todas as tarefas usando a função do bancoDeDados.js.
    const tarefas = await bancoDeDados.listarTarefas();

    // Responde ao front-end com o status 200 (padrão de sucesso) e a lista
    // de tarefas em formato JSON. O Express já entende o array e monta a
    // resposta corretamente.
    res.json(tarefas);
  } catch (erro) {
    // Se a busca no banco falhar, avisamos no terminal do servidor...
    console.error('Erro ao listar tarefas:', erro.message);

    // ...e respondemos ao front-end com status 500, indicando erro interno.
    res.status(500).json({ erro: 'Não foi possível buscar as tarefas.' });
  }
});

// Coloca o servidor para "escutar" requisições na porta definida acima.
// A função de callback roda uma única vez, assim que o servidor sobe.
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
