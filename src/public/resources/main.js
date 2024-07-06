// Seta as informações necessárias para excluir um cidadão
function setRemove(element) {
  const id = element.getAttribute("data-id");
  const name = element.getAttribute("data-name");
  document.getElementById("citizen-name").innerText = name;
  document.getElementById("delete-btn").setAttribute("data-id", id);
}

// Função para excluir um cidadão
async function remove(element) {
  this.disabled = true;
  document.getElementById("delete-btn-spinner").classList.remove("d-none");
  let id = element.getAttribute("data-id");
  const url = `/api/citizen/${id}`;
  console.log(url);

  const response = await fetch(url, {
    method: "DELETE"
  });

  if (response.ok) {
    // console.log(await response.body.getReader().read().then(({ value }) => new TextDecoder().decode(value)));
    const data = await response.json();
    triggerToast(data['message']);
    document.getElementById(`citizen-${id}`).remove();
  } else {
    console.error(await response.json()['message']);
  }

  document.getElementById("delete-btn-spinner").classList.add("d-none");
  this.disabled = false;
  const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
  modal.hide();
}

// Seta as informações necessárias para atualizar um cidadão
function setUpdate(element) {
  const id = element.getAttribute("data-id");
  const name = element.getAttribute("data-name");
  document.getElementById("citizen-id").innerText = id;
  document.getElementById("update-id").value = id;
  document.getElementById("update-name").value = name;
}

// Função para atualizar um cidadão
document.getElementById('update-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  document.getElementById('update-btn').disabled = true;
  document.getElementById("update-btn-spinner").classList.remove("d-none");

  const formData = new FormData(this);
  let id = formData.get('id');
  const url = `/api/citizen/${id}`;
  const name = document.getElementById("update-name").value;
  console.log({ id, name, url });

  if (!name) {
    triggerToast("O campo nome é obrigatório", "danger");
    document.getElementById("update-btn-spinner").classList.add("d-none");
    document.getElementById('update-btn').disabled = false;
    return;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (response.ok) {
    const data = await response.json();
    triggerToast(data['message']);
    document.getElementById(`citizen-${id}`).querySelector("div:nth-child(2)").innerText = name;
    document.getElementById(`citizen-${id}`)
      .querySelector("div:nth-child(3)")
      .querySelector("button:nth-child(1)")
      .setAttribute('data-name', name);
    document.getElementById(`citizen-${id}`)
      .querySelector("div:nth-child(3)")
      .querySelector("button:nth-child(2)")
      .setAttribute('data-name', name);
  } else {
    const data = await response.json();
    console.error(data['message']);
    triggerToast(data['message'], "danger");
    document.getElementById("update-btn-spinner").classList.add("d-none");
    return
  }

  document.getElementById("update-btn-spinner").classList.add("d-none");
  document.getElementById('update-btn').disabled = false;
  const modal = bootstrap.Modal.getInstance(document.getElementById('updateModal'));
  modal.hide();
})

// Função para exibir um toast
function triggerToast(message, type = 'success') {
  const toast = new bootstrap.Toast(document.querySelector('.toast'));
  document.querySelector('.toast-body').innerText = message;
  document.querySelector('.toast').classList.add(`bg-${type}-subtle`);

  toast.show();
}

// Evento para salvar um novo cidadão
document.getElementById("form-new").addEventListener("submit", async function (e) {
  e.preventDefault();

  var saveSpinner = document.getElementById("save-btn-spinner");
  var saveBtn = document.getElementById("save-btn");
  saveSpinner.classList.remove("d-none");
  saveBtn.disabled = true;

  const formData = new FormData(this);
  const url = this.action;
  const method = this.method;

  if (!formData.get('name')) {
    triggerToast("O campo nome é obrigatório", "danger");
    saveSpinner.classList.add("d-none");
    saveBtn.disabled = false;
    return;
  }

  const response = await fetch(url, {
    method: method,
    body: formData
  });

  if (response.ok) {
    // console.log(await response.body.getReader().read().then(({ value }) => new TextDecoder().decode(value)));
    const data = await response.json();
    triggerToast(data['message']);

    const citizenRow = document.createElement("div");
    citizenRow.classList.add("list-group-item", "row", "py-2", "d-flex");
    citizenRow.id = `citizen-${data.id}`;
    citizenRow.innerHTML = `
      <div class="col-3">${data.id}</div>
      <div class="col-6">${formData.get('name')}</div>
      <div class="col-3 btn-group d-flex justify-content-center">
        <button class="btn btn-primary" title="editar" data-id="${data.id}" data-name="${formData.get('name')}" onclick="setUpdate(this)"
            data-bs-toggle="modal" data-bs-target="#updateModal">
          <i class="fa-solid fa-pencil"></i> Editar
        </button>
        <button class="btn btn-danger" title="excluir" data-id="${data.id}" data-name="${formData.get('name')}" onclick="setRemove(this)"
          data-bs-toggle="modal" data-bs-target="#deleteModal">
          <i class="fa-solid fa-trash"></i> Excluir
        </button>
      </div>
    `;

    document.getElementById("citizen-wrapper").prepend(citizenRow);
  } else {
    console.error(await response.json()['message']);
  }

  saveSpinner.classList.add("d-none");
  saveBtn.disabled = false;
});

// Evento para procurar um cidadão pelo NIS
document.getElementById('search-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  document.getElementById("load-btn").classList.add("d-none");
  document.getElementById("load-btn").disabled = true;
  document.getElementById("back-btn").classList.remove("d-none");

  const citizenWrapper = document.getElementById("citizen-wrapper");
  citizenWrapper.innerHTML = `
    <div id="loader-div" class="d-flex justify-content-center">
      <div class="spinner-border m-5" style="width: 3rem; height: 3rem;" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>
  `;
  const searchInput = document.getElementById('search-input').value;

  if (!searchInput) {
    document.getElementById("back-btn").classList.add("d-none");
    let hasMoreItems = await loadCitizen();
    document.getElementById("load-btn").classList.remove("d-none");
    document.getElementById("loader-div").remove();

    if (!hasMoreItems) {
      document.getElementById("load-btn").disabled = true;
      document.getElementById("load-btn").innerHTML = "Não há mais cidadãos para mostrar";
    }

    return;
  }

  const url = `/api/citizen/${searchInput}`;
  const response = await fetch(url);

  if (response.ok) {
    const data = await response.json();

    citizenWrapper.innerHTML = '';
    const citizenRow = document.createElement("div");
    citizenRow.classList.add("list-group-item", "row", "py-2", "d-flex");

    if (!data.id) {
      citizenRow.innerHTML = `
        <div class="col-12">Nenhum cidadão com o NIS informado foi encontrado.</div>
      `;

      citizenWrapper.appendChild(citizenRow);
      return;
    }

    citizenRow.innerHTML = `
      <div class="col-3">${data.id}</div>
      <div class="col-6">${data.name}</div>
      <div class="col-3 btn-group d-flex justify-content-center">
        <button class="btn btn-primary" title="editar" data-id="${data.id}" data-name="${data.name}" onclick="setUpdate(this)"
            data-bs-toggle="modal" data-bs-target="#updateModal">
          <i class="fa-solid fa-pencil"></i> Editar
        </button>
        <button class="btn btn-danger" title="excluir" data-id="${data.id} data-name="${data.name}" onclick="setRemove(this)"
            data-bs-toggle="modal" data-bs-target="#deleteModal">
          <i class="fa-solid fa-trash"></i> Excluir
        </button>
      </div>
    `;

    citizenWrapper.appendChild(citizenRow);
  } else {
    console.error(await response.json()['message']);
    if (response.status === 404) {
      citizenWrapper.innerHTML = '';

      const citizenRow = document.createElement("div");
      citizenRow.classList.add("list-group-item", "row", "py-2", "d-flex");

      citizenRow.innerHTML = `
        <div class="col-12">Nenhum cidadão com o NIS informado foi encontrado.</div>
      `;

      citizenWrapper.appendChild(citizenRow);
    }
  }
});

// Ação para voltar a exibir todos os cidadãos
document.getElementById('back-btn').addEventListener('click', async function () {
  document.getElementById("load-btn").classList.remove("d-none");
  document.getElementById("back-btn").classList.add("d-none");
  document.getElementById("search-input").value = '';
  document.getElementById("search-input").focus();

  document.getElementById("citizen-wrapper").innerHTML = `
    <div id="loader-div" class="d-flex justify-content-center">
      <div class="spinner-border m-5" style="width: 3rem; height: 3rem;" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>
  `;

  let hasMoreItems = await loadCitizen();
  document.getElementById("load-btn").classList.remove("d-none");
  document.getElementById("loader-div").remove();

  if (!hasMoreItems) {
    document.getElementById("load-btn").disabled = true;
    document.getElementById("load-btn").innerHTML = "Não há mais cidadãos para mostrar";
  }
});

// Função para carregar mais uma página de cidadãos
async function loadCitizen() {
  const limit = 10;

  const citizenWrapper = document.getElementById("citizen-wrapper");
  const offset = document.querySelectorAll(".list-group-item").length;
  const response = await fetch(`/api/citizen?limit=${limit}&offset=${offset}`);

  if (response.ok) {
    const data = await response.json();

    data.forEach(citizen => {
      const citizenRow = document.createElement("div");
      citizenRow.classList.add("list-group-item", "row", "py-2", "d-flex");
      citizenRow.id = `citizen-${citizen.id}`;
      citizenRow.innerHTML = `
        <div class="col-3">${citizen.id}</div>
        <div class="col-6">${citizen.name}</div>
        <div class="col-3 btn-group d-flex justify-content-center">
          <button class="btn btn-primary" title="editar" data-id="${citizen.id}" data-name="${citizen.name}" onclick="setUpdate(this)"
            data-bs-toggle="modal" data-bs-target="#updateModal">
            <i class="fa-solid fa-pencil"></i> Editar
          </button>
          <button class="btn btn-danger" title="excluir" data-id="${citizen.id}" data-name="${citizen.name}" onclick="setRemove(this)"
            data-bs-toggle="modal" data-bs-target="#deleteModal">
            <i class="fa-solid fa-trash"></i> Excluir
          </button>
        </div>
      `;

      citizenWrapper.appendChild(citizenRow);
    });

    if (data.length === 0 || data.length < limit) {
      return false;
    }
  } else {
    const citizenRow = document.createElement("div");
    citizenRow.classList.add("list-group-item", "row", "py-2", "d-flex");
    console.error(await response.json()['message']);
    triggerToast("Erro ao carregar cidadãos", "danger");
    citizenWrapper.innerHTML = `
      <h4 class="fw-light">Não existem cidadãos cadastrados. Use o formulário acima para adicionar um novo cidadão.<h4>
    `;

    return false;
  }
  console.log(offset);
  return true
}

// Evento para carregar os cidadãos ao carregar a página
document.addEventListener("DOMContentLoaded", async function (event) {
  let hasMoreItems = await loadCitizen();
  document.getElementById("load-btn").classList.remove("d-none");
  document.getElementById("loader-div").remove();
  if (!hasMoreItems) {
    document.getElementById("load-btn").disabled = true;
    document.getElementById("load-btn").innerHTML = "Não há mais cidadãos para mostrar";
  }
});

// Evento para carregar mais cidadãos
document.getElementById('load-btn').addEventListener('click', async () => {
  document.getElementById('load-btn').disabled = true;
  document.getElementById('load-btn-spinner').classList.remove('d-none');
  let hasMoreItems = await loadCitizen();

  if (!hasMoreItems) {
    document.getElementById("load-btn").disabled = true;
    document.getElementById("load-btn").innerHTML = "Não há mais cidadãos";
  }
  document.getElementById('load-btn-spinner').classList.add('d-none');
  document.getElementById('load-btn').disabled = false;
});
