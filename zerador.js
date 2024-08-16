const fs = require('fs');
const path = require('path');

// Função para transformar chaves em valores
function keysToValues(obj) {
  if (typeof obj === 'object' && obj !== null) {
    const result = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object') {
          // Recursivamente processa objetos e arrays
          result[key] = keysToValues(obj[key]);
        } else {
          // Substitui a chave pelo valor
          result[key] = key;
        }
      }
    }
    return result;
  }
  return obj;
}

function processJsonFile(filePath) {
  try {
    // Lê o arquivo JSON
    const data = fs.readFileSync(filePath, 'utf8');
    // Faz o parsing do JSON
    const jsonData = JSON.parse(data);
    // Converte chaves em valores
    const transformedData = keysToValues(jsonData);
    // Grava o arquivo de volta com as modificações
    fs.writeFileSync(filePath, JSON.stringify(transformedData, null, 2), 'utf8');
    console.log(`Arquivo ${filePath} processado com sucesso.`);
  } catch (error) {
    console.error(`Erro ao processar o arquivo ${filePath}: ${error.message}`);
  }
}

function processJsonFilesInFolder(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Erro ao ler o diretório ${folderPath}: ${err.message}`);
      return;
    }

    files.forEach(file => {
      if (path.extname(file) === '.txt') {
        const filePath = path.join(folderPath, file);
        processJsonFile(filePath);
      }
    });
  });
}

// Exemplo de uso
const folderPath = './Languages/en-us/Modules';  // Substitua pelo caminho da sua pasta
processJsonFilesInFolder(folderPath);
