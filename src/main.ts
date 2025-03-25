const matrixContainer = document.getElementById("matrix") as HTMLDivElement;
const complementMatrix = document.getElementById("complement-matrix") as HTMLElement;
let currentMatrix : number[][] = [];


function updateMatrixInsertionDiv(matrixSize: number): void{
    matrixContainer.innerHTML = ""; // Limpa a matriz antiga

    complementMatrix.innerText = `x ${matrixSize}`;

    // Criar grid de inputs numéricos
    for (let i = 0; i < matrixSize; i++) {
        const row = document.createElement("div");
        row.classList.add("d-flex", "justify-content-center"); // Bootstrap classes para alinhamento

        for (let j = 0; j < matrixSize; j++) {
            const input = document.createElement("input");
            input.type = "number";
            input.classList.add("form-control", "m-1", "text-center"); // Bootstrap classes para estilo
            input.style.width = "60px"; // Mantém os inputs organizados
            input.dataset.row = i.toString();
            input.dataset.col = j.toString();

            input.value = "0";


            row.appendChild(input);
        }

        matrixContainer.appendChild(row);
    }
}

function updateCurrentMatrix(): void{
    const inputs = matrixContainer.getElementsByTagName("input");
    const size = Math.sqrt(inputs.length); // Descobrir o tamanho baseado na quantidade de inputs

    currentMatrix = Array.from({ length: size }, () => Array(size).fill(0));

    for (let input of inputs) {
        const row = parseInt(input.dataset.row || "0");
        const col = parseInt(input.dataset.col || "0");
        currentMatrix[row][col] = parseFloat(input.value) || 0; // Converte string para número
    }
}

function triangulateMatrix(): [number[][], string[]]{
    if (currentMatrix.length == 0){
        return [[], ["matriz inválida"]] 
    }

    // actions será todas as açoes efetuadas para o calculo, que contera informações em LaTeX para ser parseado pelo MathJax.
    let actions : string[] = []
    
    let n = currentMatrix.length;
    let triangularMatrix = currentMatrix.map(row => [...row]); // Criar uma cópia da matriz

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            let factor = triangularMatrix[j][i] / triangularMatrix[i][i];

            actions.push(`L_{${j+1}} \\leftarrow L_{${j+1}} - (${factor.toFixed(2)}) L_{${i+1}}`);

            for (let k = 0; k < n; k++) {
                triangularMatrix[j][k] -= factor * triangularMatrix[i][k];
            }
        }
    }
    return [triangularMatrix, actions];
}

updateMatrixInsertionDiv(2);
// rodar o tsc main.ts e inser o script em .js no HTML