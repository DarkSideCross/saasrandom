const spanErrors = document.querySelector('#errors');

document.querySelector('#login-form').addEventListener('submit', async (evt) =>  {
    evt.preventDefault();

    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    const formData = new FormData();

    formData.append('email', email);
    formData.append('password', password);

    const response = await fetch('./login', {
        method: 'POST',
        body: formData
    })
    console.log(response.status);
    if (response.status === 400) {
        console.log('Executando if');
        spanErrors.innerText = (await response.json()).mensagem;
    } else if (response.redirected) {
        location.href = response.url;
    }
    

})