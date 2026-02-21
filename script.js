let profissionais = JSON.parse(localStorage.getItem("profissionais")) || [];
const tabela = document.getElementById("tabela");
const form = document.getElementById("formCadastro");
let editIndex = null;
function salvar() {
    localStorage.setItem("profissionais", JSON.stringify(profissionais));
}
function atualizarDashboard() {
    document.getElementById("totalProfissionais").innerText = profissionais.length;
    const medicos = profissionais.filter(p => p.cargo === "Médico").length;
    const enfermeiros = profissionais.filter(p => p.cargo === "Enfermeiro").length;
    document.getElementById("totalMedicos").innerText = medicos;
    document.getElementById("totalEnfermeiros").innerText = enfermeiros;
}
function atualizarTabela(lista = profissionais) {
    tabela.innerHTML = "";
    lista.forEach((p, index) => {
        tabela.innerHTML += `
            <tr>
                <td>${p.nome}</td>
                <td>${p.cargo}</td>
                <td>${p.registro}</td>
                <td>${p.especialidade}</td>
                <td>
                    <button onclick="editar(${index})">Editar</button>
                    <button onclick="remover(${index})">Excluir</button>
                </td>
            </tr>
        `;
    });
}
form.addEventListener("submit", function(e) {
    e.preventDefault();
    const novo = {
        nome: nome.value,
        cargo: cargo.value,
        registro: registro.value,
        especialidade: especialidade.value,
        email: email.value,
        telefone: telefone.value
    };

    if (editIndex === null) {

        profissionais.push(novo);
    } else {

        profissionais[editIndex] = novo;
        editIndex = null;
        form.querySelector("button").innerText = "Cadastrar";
    }

    salvar();
    atualizarTabela();
    atualizarDashboard();
    form.reset();
});
function editar(index) {
    const p = profissionais[index];

    nome.value = p.nome;
    cargo.value = p.cargo;
    registro.value = p.registro;
    especialidade.value = p.especialidade;
    email.value = p.email;
    telefone.value = p.telefone;

    editIndex = index;
    form.querySelector("button").innerText = "Atualizar";
    mostrarCadastro();
}
function remover(index) {
    profissionais.splice(index, 1);
    salvar();
    atualizarTabela();
    atualizarDashboard();
}
function filtrar() {
    const filtro = document.getElementById("filtro").value;
    if (filtro === "Todos") {
        atualizarTabela();
    } else {
        atualizarTabela(profissionais.filter(p => p.cargo === filtro));
    }
}
function mostrarDashboard() {
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("cadastro").style.display = "none";
}
function mostrarCadastro() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("cadastro").style.display = "block";
}
atualizarTabela();
atualizarDashboard();