const spanErrors = document.querySelector('#errors');
document.querySelector('form').addEventListener('submit', async function (evt) {
    evt.preventDefault();

    const name = document.querySelector('#name').value; 
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const imagePerfil = document.querySelector('#imagePerfil').files[0];
    console.log(imagePerfil)
    const formData = new FormData();

    formData.append('image', imagePerfil);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    

    const response = await fetch('/register', {
        method: 'POST',
        body: formData
    });

    if (response.status === 400) {
        spanErrors.innerText = (await response.json()).join('\n');
    } else if (response.redirected) {
        spanErrors.innerText = '';
        location.href = response.url;
    }

})
