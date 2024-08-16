const folderPath = './Languages/en-us/Modules';
const fs = require('fs');
const path = require('path');

function removeBOM(buffer) {
  // Verifica e remove o BOM (Byte Order Mark) se presente
  const BOM = '\uFEFF';
  return buffer.toString('utf8').startsWith(BOM)
    ? buffer.toString('utf8').slice(BOM.length)
    : buffer.toString('utf8');
}

function convertFileToUtf8WithoutBOM(filePath) {
  try {
    // Lê o arquivo com a codificação original
    const buffer = fs.readFileSync(filePath);
    // Remove o BOM se presente e converte para UTF-8
    const jsonString = removeBOM(buffer);
    // Escreve o arquivo de volta em UTF-8 sem BOM
    fs.writeFileSync(filePath, jsonString, 'utf8');
    console.log(`Arquivo ${filePath} convertido para UTF-8 sem BOM.`);
  } catch (error) {
    console.error(`Erro ao converter o arquivo ${filePath}: ${error.message}`);
  }
}

function convertJsonFilesInFolder(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Erro ao ler o diretório ${folderPath}: ${err.message}`);
      return;
    }
    
    files.forEach(file => {
      if (path.extname(file) === '.json'|| path.extname(file) === '.txt') {
        const filePath = path.join(folderPath, file);
        convertFileToUtf8WithoutBOM(filePath);
      }
    });
  });
}

// Exemplo de uso
convertJsonFilesInFolder(folderPath);
