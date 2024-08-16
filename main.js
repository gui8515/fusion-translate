const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configurações
const targetLanguage = 'es-es'; // Substitua pelo código do idioma de destino
const directoryPath = './Languages/en-us/Modules'; // Substitua pelo caminho do seu diretório
const outputDirectory = `./Languages/${targetLanguage}/Modules`;
const url = 'http://localhost:11434/api/generate';
const model = "fusion-translate";
const stream = false;
const system = `
PARAMETER temperature 0
SYSTEM """
You are a specialized agent for app translations, particularly for interfaces in Clickteam Fusion 2.5. Your primary role is to assist with translating and reviewing texts to ensure they are clear, accurate, and adapted to the app's context. You should have a deep understanding of technical terminology, especially in the areas of game and app development.
Guidelines:
Format and Structure: Preserve the original text’s format, including placeholders (e.g., #placeholders#, %0, %o, %1), HTML tags, and other formatting elements. The translation must fit correctly into the app’s layout without altering the placeholders or formatting. Do not add new lines or alter the line structure of the original text.
Translation Only: Provide translations only. Do not add explanations, comments, or notes about the translated terms. Respond solely with the translated text.
Non-Translatable Elements: Do not translate placeholders like #placeholders# or parameters such as %0, %o, %1. These should remain exactly as they appear in the original text.
Technical Terminology: Use appropriate technical terms related to game and app development. Ensure that the terminology is consistent with industry standards and best practices.
Important Terms:
string = texto
flag = flag
frame = frame
"""
`;
let contar=0
let contar1=1
let contarfile=0
let contarfile1=1
let nomeArquivo=''
// Função para traduzir texto usando Ollama
async function translateText(text) {
    const prompt = `Translate "${text}" into ${targetLanguage}.`;
    try {
        console.time('Translate')
        const response = await axios.post(url, { model, stream, prompt });
        console.log(contarfile1,"/",contarfile," - ", contar1,"/",contar)
        console.log( "Arquivo: ",`\x1b[34m ${nomeArquivo} \x1b[0m`, )
        console.log("Original:",`\x1b[33m ${text} \x1b[0m`, )
        console.log("Tradução:",`\x1b[32m ${response.data.response.trim()} \x1b[0m`, )
        contar1++
        if(contar1 >= contar) {contar1 = 0}
        
        console.timeEnd("Translate"),
        console.log("\n\n");

        return response.data.response.trim();
    } catch (error) {
        console.error('Error translating text:', error.response ? error.response.data : error.message);
        return text; // Retorna o texto original em caso de erro
    }
}

// Função recursiva para traduzir valores dentro de um objeto
async function translateObject(obj) {
    const translatedObj = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            translatedObj[key] = await translateText(value);
            
        } else if (typeof value === 'object' && value !== null) {
            translatedObj[key] = await translateObject(value);
        } else {
            translatedObj[key] = value; // Copia outros tipos de dados sem tradução
        }
    }

    return translatedObj;
}

function countObjects(obj) {
    let count = 0;

    function countKeys(o) {
        if (typeof o === 'object' && o !== null) {
            if (Array.isArray(o)) {
                // Se for um array, percorra cada item
                for (const item of o) {
                    countKeys(item);
                }
            } else {
                // Se for um objeto, conte as chaves
                count += Object.keys(o).length;
                // Percorra cada chave
                for (const key in o) {
                    if (o.hasOwnProperty(key)) {
                        countKeys(o[key]);
                    }
                }
            }
        }
    }

    countKeys(obj);
    return count;
}

// Função para ler arquivos JSON do diretório e traduzi-los
async function translateFiles() {
    // Verifica se o diretório de saída existe e cria se necessário
    if (!fs.existsSync(outputDirectory)){
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    // Lê todos os arquivos do diretório
    const files = fs.readdirSync(directoryPath);
    contarfile = files.length
    for (const file of files) {
        nomeArquivo =  path.join(directoryPath, file);
        const filePath = path.join(directoryPath, file);

        if (fs.lstatSync(filePath).isFile() && path.extname(file) === '.txt') {
            // Lê o conteúdo do arquivo JSON
            const data = fs.readFileSync(filePath, 'utf-8');
            const jsonData = JSON.parse(data);

            // contar passos
            contar = countObjects(jsonData)
            // Traduz o JSON inteiro, considerando objetos aninhados
            const translatedData = await translateObject(jsonData);

            // Salva o arquivo traduzido no diretório de saída
            const outputFilePath = path.join(outputDirectory, file);
            fs.writeFileSync(outputFilePath, JSON.stringify(translatedData, null, 2), 'utf-8');
            contarfile1++
            console.log(`Translated file saved to ${outputFilePath}`);
            if (contarfile1 >= contarfile) {
                console.timeEnd('Total')
            }
        }
    }
}

// Executa a função de tradução
console.time('Total')

translateFiles().catch(console.error);
