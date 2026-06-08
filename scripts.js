
const formLogin = document.getElementById('formLogin');
if (formLogin) {
    formLogin.onsubmit = function(evento) {
        evento.preventDefault(); 
        
        
        let email = document.getElementById('email').value;
        let senha = document.getElementById('senha').value;
        
        // Enviar para o servidor
        fetch('http://localhost:8000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: senha })
        })
        .then(res => res.json())
        .then(dados => {
            // Salvar o token e ir para as tarefas
            localStorage.setItem('token', dados.access_token);
            alert('Login feito!');
            window.location.href = 'tarefa.html';
        })
        .catch(() => alert('Erro no login'));
    };
}



const formCadastro = document.getElementById('formCadastro');
if (formCadastro) {
    formCadastro.onsubmit = function(evento) {
        evento.preventDefault();
        
        let nome = document.getElementById('nome').value;
        let email = document.getElementById('email').value;
        let senha = document.getElementById('senha').value;
        
        fetch('http://localhost:8000/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nome, email: email, password: senha })
        })
        .then(res => res.json())
        .then(() => {
            alert('Cadastro feito! Faça login.');
            window.location.href = 'login.html';
        })
        .catch(() => alert('Erro no cadastro'));
    };
}



const formTarefa = document.getElementById('formTarefa');
const inputTarefa = document.getElementById('tarefaInput');
const lista = document.getElementById('listaTarefas');
const botaoSair = document.getElementById('botaoSair');


if (botaoSair) {
    botaoSair.onclick = function() {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    };
}


function mostrarTarefas() {
    let token = localStorage.getItem('token');
    
    fetch('http://localhost:8000/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(dados => {
        
        let tarefas = dados.tasks || dados;
        
        
        lista.innerHTML = '';
        
        if (tarefas.length === 0) {
            lista.innerHTML = '<li class="mensagem">Nenhuma tarefa ainda</li>';
            return;
        }
        
        
        for (let i = 0; i < tarefas.length; i++) {
            let t = tarefas[i];
            let texto = t.title || t.description || 'Tarefa';
            let concluida = t.completed || false; 
           
            let item = document.createElement('li');
            item.className = concluida ? 'item-concluido' : 'item-pendente';
            
            
            let textoSpan = document.createElement('span');
            textoSpan.textContent = texto;
            textoSpan.className = 'texto-tarefa';
            
            
            let btnConcluir = document.createElement('button');
            btnConcluir.textContent = '✓ concluida';
            btnConcluir.className = 'btn-concluir';
            btnConcluir.title = 'Marcar como concluída';
            btnConcluir.style.background = '#a6c9ae';
            
            
            let btnDesfazer = document.createElement('button');
            btnDesfazer.textContent = '↺';
            btnDesfazer.className = 'btn-desfazer';
            btnDesfazer.title = 'Desfazer conclusão';
            btnDesfazer.style.background = '#ffc107';
            btnDesfazer.style.color = '#333';
            
            
            let btnEditar = document.createElement('button');
            btnEditar.textContent = 'editar';
            btnEditar.className = 'btn-editar';
            btnEditar.title = 'Editar';
            btnEditar.style.background = '#17a2b8';
            
            
            let btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'deletar';
            btnExcluir.className = 'btn-excluir';
            btnExcluir.title = 'Excluir';
            btnExcluir.style.background = '#be8085';
            
            
            if (concluida) {
                
                btnDesfazer.onclick = function() {
                    desfazerConcluida(t.id);
                };
                item.appendChild(textoSpan);
                item.appendChild(btnDesfazer);
            } else {
                
                btnConcluir.onclick = function() {
                    marcarConcluida(t.id);
                };
                item.appendChild(textoSpan);
                item.appendChild(btnConcluir);
            }
            
            // Botões que aparecem sempre
            btnEditar.onclick = function() {
                editarTarefa(t.id, texto);
            };
            btnExcluir.onclick = function() {
                excluirTarefa(t.id);
            };
            
            item.appendChild(btnEditar);
            item.appendChild(btnExcluir);
            lista.appendChild(item);
        }
    })
    .catch(() => {
        lista.innerHTML = '<li class="mensagem">Erro ao carregar tarefas</li>';
    });
}


function marcarConcluida(id) {
    let token = localStorage.getItem('token');
    
    fetch(`http://localhost:8000/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed: true })
    })
    .then(() => {
        alert(' Tarefa concluída!');
        mostrarTarefas(); // Recarrega a lista
    })
    .catch(() => alert('Erro ao marcar como concluída'));
}


function desfazerConcluida(id) {
    let token = localStorage.getItem('token');
    
    fetch(`http://localhost:8000/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed: false })
    })
    .then(() => {
        alert('↺ Tarefa não está mais concluída!');
        mostrarTarefas(); // Recarrega a lista
    })
    .catch(() => alert('Erro ao desfazer conclusão'));
}


if (formTarefa) {
    formTarefa.onsubmit = function(evento) {
        evento.preventDefault();
        
        let texto = inputTarefa.value.trim();
        if (texto === '') {
            alert('Digite uma tarefa');
            return;
        }
        
        let token = localStorage.getItem('token');
        
        fetch('http://localhost:8000/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                title: texto, 
                description: texto,
                completed: false  
            })
        })
        .then(() => {
            inputTarefa.value = '';
            mostrarTarefas(); // Atualizar a lista
            alert('Tarefa adicionada!');
        })
        .catch(() => alert('Erro ao adicionar'));
    };
}


function excluirTarefa(id) {
    if (!confirm('Excluir esta tarefa?')) return;
    
    let token = localStorage.getItem('token');
    
    fetch(`http://localhost:8000/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => {
        alert(' Excluída!');
        mostrarTarefas();
    })
    .catch(() => alert('Erro ao excluir'));
}


function editarTarefa(id, textoAntigo) {
    let novoTexto = prompt('Editar tarefa:', textoAntigo);
    if (!novoTexto || novoTexto.trim() === '') return;
    
    let token = localStorage.getItem('token');
    
    fetch(`http://localhost:8000/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: novoTexto, description: novoTexto })
    })
    .then(() => {
        alert('✏️ Tarefa editada!');
        mostrarTarefas();
    })
    .catch(() => alert('Erro ao editar'));
}


if (lista) {
    mostrarTarefas();
}
