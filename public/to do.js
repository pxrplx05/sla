campoItem = document.getElementById("tarefa")
button = document.getElementById("botao")
corpoLista = document.getElementById("lista")


button.addEventListener("click", function () {

    if (campoItem.value == "") {
        alert("Insira uma tarefa")
        return
    }

    descricao = campoItem.value.trim()
    adicionarTarefa(descricao)

})


async function adicionarTarefa(texto) {

    await fetch("http://localhost:3000/tarefas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao: texto })
    })

    campoItem.value = ""

    listarTarefas()
}


async function listarTarefas() {

    const resposta = await fetch("http://localhost:3000/tarefas")
    const tarefas = await resposta.json()

    corpoLista.innerHTML = ""

    tarefas.forEach(function (tarefa) {

        const item = document.createElement("li")

        item.textContent = tarefa.descricao

        corpoLista.appendChild(item)

    })

}