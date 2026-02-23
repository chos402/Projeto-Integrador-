let profissionais = JSON.parse(localStorage.getItem("profissionais")) || [];

const tabela = document.getElementById("tabela");
const form = document.getElementById("formCadastro");
const telefoneInput = document.getElementById("telefone");
const registroInput = document.getElementById("registro");
const fotoInput = document.getElementById("foto");
const botaoSubmit = form.querySelector("button[type='submit']");

let editIndex = null;
let fotoBase64 = null;

const IMAGEM_PADRAO = "imagem_padrao.jpg";
let paginaAtual = 1;
const itensPorPagina = 4;
if (fotoInput) {
    fotoInput.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => fotoBase64 = e.target.result;
            reader.readAsDataURL(file);
        }
    });
}
telefoneInput.addEventListener("input", function () {
    let valor = telefoneInput.value.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.slice(0, 11);
    if (valor.length > 6) {
        telefoneInput.value =
            `(${valor.slice(0, 2)}) ${valor.slice(2, valor.length - 4)}-${valor.slice(-4)}`;
    } else if (valor.length > 2) {
        telefoneInput.value = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    } else if (valor.length > 0) {
        telefoneInput.value = `(${valor}`;
    }
});
function alterarValidacaoRegistro() {
    const cargo = document.getElementById("cargo").value;

    if (!cargo) {
        registroInput.disabled = true;
        registroInput.required = false;
        registroInput.pattern = "";
        registroInput.placeholder = "Selecione o cargo primeiro";
        registroInput.value = "";
        return;
    }
    registroInput.disabled = false;
    registroInput.required = true;
    switch (cargo) {
        case "Médico":
            registroInput.placeholder = "123456-SP";
            registroInput.pattern = "^\\d{4,6}-[A-Za-z]{2}$";
            registroInput.dataset.prefixo = "CRM";
            break;
        case "Enfermeiro":
        case "Técnico de Enfermagem":
            registroInput.placeholder = "123456-ENF";
            registroInput.pattern = "^\\d{4,6}-[A-Za-z]{3}$";
            registroInput.dataset.prefixo = "COREN";
            break;
        case "Fisioterapeuta":
        case "Terapeuta Ocupacional":
            registroInput.placeholder = "123456";
            registroInput.pattern = "^\\d{4,6}$";
            registroInput.dataset.prefixo = "CREFITO";
            break;
        case "Psicólogo":
            registroInput.dataset.prefixo = "CRP";
            break;
        case "Nutricionista":
            registroInput.dataset.prefixo = "CRN";
            break;
        case "Farmacêutico":
            registroInput.dataset.prefixo = "CRF";
            break;
        case "Biomédico":
            registroInput.dataset.prefixo = "CRBM";
            break;
        case "Fonoaudiólogo":
            registroInput.dataset.prefixo = "CREFONO";
            break;
        default:
            registroInput.required = false;
            registroInput.pattern = "";
            registroInput.placeholder = "Registro não obrigatório";
            registroInput.dataset.prefixo = "";
            break;
    }
}
function alterarCampoEspecialidade() {
    const cargo = document.getElementById("cargo").value;
    const container = document.getElementById("campoEspecialidade");
    container.innerHTML = "";
    if (cargo === "Médico") {
        container.innerHTML = `
            <select id="especialidade" required>
                <option value="">Especialidade</option>
                <option>Clínica Geral</option>
                <option>Cardiologia</option>
                <option>Dermatologia</option>
                <option>Endocrinologia</option>
                <option>Ginecologia</option>
                <option>Neurologia</option>
                <option>Ortopedia</option>
                <option>Pediatria</option>
                <option>Psiquiatria</option>
                <option>Urologia</option>
            </select>`;
    }
}
function controlarFiltroEspecialidade() {
    const cargoFiltro = document.getElementById("filtro").value;
    const filtroEspecialidade = document.getElementById("filtroEspecialidade");
    if (cargoFiltro === "Médico") {
        filtroEspecialidade.style.display = "block";
    } else {
        filtroEspecialidade.style.display = "none";
        filtroEspecialidade.value = "Todas";
    }
}
function obterListaFiltrada() {
    const cargoFiltro = document.getElementById("filtro").value;
    const especialidadeFiltro = document.getElementById("filtroEspecialidade").value;
    const statusFiltro = document.getElementById("filtroStatus").value;
    controlarFiltroEspecialidade();
    let lista = profissionais;
    if (cargoFiltro !== "Todos") {
        lista = lista.filter(p => p.cargo === cargoFiltro);
    }
    if (cargoFiltro === "Médico" && especialidadeFiltro !== "Todas") {
        lista = lista.filter(p => p.especialidade === especialidadeFiltro);
    }
    if (statusFiltro !== "Todos") {
        lista = lista.filter(p => p.status === statusFiltro);
    }
    return lista;
}
function filtrar() {
    paginaAtual = 1;
    atualizarTabela(obterListaFiltrada());
}
function atualizarDashboard() {
    const cardsContainer = document.querySelector(".cards");
    if (!cardsContainer) return; 
    cardsContainer.innerHTML = "";
    
}
function salvar() {
    localStorage.setItem("profissionais", JSON.stringify(profissionais));
}
function atualizarTabela(listaFiltrada = null) {
    tabela.innerHTML = `<div class="lista-cards"></div>`;
    const containerCards = tabela.querySelector(".lista-cards");
    let lista = listaFiltrada || profissionais;
    const totalPaginas = Math.ceil(lista.length / itensPorPagina) || 1;
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const itensPagina = lista.slice(inicio, fim);
    itensPagina.forEach((p) => {
        const index = profissionais.indexOf(p);
        const classeInativo = p.status === "Inativo" ? "inativo" : "";
        const foto = p.foto || IMAGEM_PADRAO;
        containerCards.innerHTML += `
            <div class="prof-card ${classeInativo}">
                <img src="${foto}" class="foto-profissional"
                     onerror="this.src='${IMAGEM_PADRAO}'">
                <h3>${p.nome}</h3>
                <p><strong>Cargo:</strong> ${p.cargo}</p>
                <p><strong>Registro:</strong> ${p.registro}</p>
                <p><strong>Especialidade:</strong> ${p.especialidade || "-"}</p>
                <p><strong>Email:</strong> ${p.email}</p>
                <p><strong>Telefone:</strong> ${p.telefone}</p>
                <p><strong>Status:</strong> ${p.status}</p>
                <div class="acoes-card">
                    <button onclick="editar(${index})">✏️</button>
                    <button onclick="alternarStatus(${index})">🔄</button>
                    <button type="button">📅</button>
                    <button type="button">🩺</button>
                    <button onclick="excluir(${index})">🗑</button>
                </div>
            </div>
        `;
    });
  if (lista.length > itensPorPagina) {
    tabela.innerHTML += `
        <div class="paginacao">
            <button onclick="paginaAnterior()" ${paginaAtual === 1 ? "disabled" : ""}>⬅</button>
            <span>Página ${paginaAtual} de ${totalPaginas}</span>
            <button onclick="proximaPagina()" ${paginaAtual === totalPaginas ? "disabled" : ""}>➡</button>
        </div>
    `;
}
}
function paginaAnterior() {
    if (paginaAtual > 1) {
        paginaAtual--;
        atualizarTabela(obterListaFiltrada());
    }
}
function proximaPagina() {
    const lista = obterListaFiltrada();
    const totalPaginas = Math.ceil(lista.length / itensPorPagina) || 1;
    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        atualizarTabela(lista);
    }
}
function excluir(index) {
    if (confirm("Deseja realmente excluir este cadastro?")) {
        profissionais.splice(index, 1);
        salvar();
        filtrar();
        atualizarDashboard();
    }
}
form.addEventListener("submit", function (e) {
    e.preventDefault();
    const especialidadeCampo = document.getElementById("especialidade");
    const novo = {
        nome: nome.value,
        cargo: cargo.value,
        registro: registroInput.disabled
            ? ""
            : `${registroInput.dataset.prefixo} ${registro.value.toUpperCase()}`,
        especialidade: especialidadeCampo ? especialidadeCampo.value : "",
        email: email.value,
        telefone: telefone.value,
        status: "Ativo",
        foto: fotoBase64
    };
    if (editIndex === null) {
        profissionais.push(novo);
    } else {
        profissionais[editIndex] = novo;
        editIndex = null;
        botaoSubmit.innerText = "Cadastrar";
    }
    salvar();
    paginaAtual = 1;
    filtrar();
    atualizarDashboard();
    form.reset();
    fotoBase64 = null;
});

function editar(index) {
    const p = profissionais[index];
    nome.value = p.nome;
    cargo.value = p.cargo;
    alterarCampoEspecialidade();
    alterarValidacaoRegistro();
    fotoBase64 = p.foto || null;
    setTimeout(() => {
        if (p.registro) {
            const partes = p.registro.split(" ");
            registro.value = partes[1];
        }
        if (p.cargo === "Médico") {
            document.getElementById("especialidade").value = p.especialidade;
        }
        email.value = p.email;
        telefone.value = p.telefone;
    }, 50);
    editIndex = index;
    botaoSubmit.innerText = "Atualizar";
}
function alternarStatus(index) {
    profissionais[index].status =
        profissionais[index].status === "Ativo" ? "Inativo" : "Ativo";
    salvar();
    filtrar();
    atualizarDashboard();
}
function mostrarDashboard() {
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("cadastro").style.display = "none";
}
function mostrarCadastro() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("cadastro").style.display = "block";
}

controlarFiltroEspecialidade();
atualizarTabela();
atualizarDashboard();