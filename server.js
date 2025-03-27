const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// Inicializar o servidor Express
const app = express();
const port = 3000;

// Middleware para lidar com dados do formulário
app.use(bodyParser.urlencoded({ extended: true }));

// Função para obter a data e hora atual
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19); // Formato: YYYY-MM-DD HH:MM:SS
};

// Função para atualizar a confirmação no arquivo CSV
const updateRSVP = (nome, confirmacao, dataResposta, callback) => {
  // Ler o arquivo CSV
  fs.readFile('rsvp.csv', 'utf8', (err, data) => {
    if (err) {
      return callback(err);
    }

    // Separar o conteúdo do arquivo em linhas
    const linhas = data.split('\n');

    // Procurar por uma linha que contenha o nome
    let encontrado = false;
    for (let i = 1; i < linhas.length; i++) {
      const [nomeExistente] = linhas[i].split(',').map(item => item.trim());
      if (nomeExistente === nome) {
        // Substituir a linha com a nova confirmação e data
        linhas[i] = `${nome}, ${confirmacao}, ${dataResposta}`;
        encontrado = true;
        break;
      }
    }

    // Se o nome não foi encontrado, adicionar uma nova linha
    if (!encontrado) {
      linhas.push(`${nome}, ${confirmacao}, ${dataResposta}`);
    }

    // Recriar o arquivo CSV com as linhas atualizadas
    fs.writeFile('rsvp.csv', linhas.join('\n'), 'utf8', (err) => {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  });
};

// Rota para servir o formulário de RSVP
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Rota para processar as submissões do formulário
app.post('/submit', (req, res) => {
  const { nome, confirmacao } = req.body;
  const dataResposta = getCurrentDate(); // Obtém a data e hora atual

  // Atualizar o RSVP no arquivo CSV
  updateRSVP(nome, confirmacao, dataResposta, (err) => {
    if (err) {
      console.error('Erro ao salvar os dados:', err);
      return res.status(500).send('Erro ao salvar os dados.');
    }
    console.log('RSVP salvo:', `${nome}, ${confirmacao}, ${dataResposta}`);
    res.send('<h1>Obrigado por confirmar sua presença ou ausência!</h1><p>Em breve, enviaremos mais informações.</p>');
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
