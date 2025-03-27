const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');

let ID_USER = 0;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'views/images/');
    },
    filename: (req, file, cb) => {
        cb(null, `image-${ID_USER}` + path.extname(file.originalname));
    }
})
const upload = multer({ storage: storage })

const app = express();

app.use(express.static('public'));
app.use(express.json({ limit: 1024 * 1024 }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..',  'views'));

app.get('/', (req, res) =>  {

    const userLogin = getUserLogin();

    if (userLogin) {
        const files = fs.readdirSync(path.resolve(__dirname, '../views/images'));

        for (const file of files) {
            const imageId = parseInt(file.match(/-\d+\./)?.[0].slice(1, -1));
            if (imageId === userLogin.id) {

                const imagePerfil = fs.readFileSync(path.resolve(__dirname, `../views/images/image-${userLogin.id}${path.extname(file)}`), 'base64');

                res.render('./html/index', { userLogin, imagePerfilBase64: imagePerfil }); 
                return;  
            }
        }

    }

    res.render('./html/index', { userLogin, imagePerfilBase64: undefined });

})

app.get('/register', (req, res) =>  {

    const usersBD = consultUsers();
    res.sendFile(path.resolve(__dirname, '../views/html'))
    res.render('./html/register', usersBD);

})

app.post('/register', upload.single('image'), async (req, res) => {
    const userData = req.body;

    const errors = parseUser(userData);

    if (errors.find(error => error !== undefined)) {
        res.status(400).json(errors);
        return;
    } else {
        const usersBD = consultUsers();

        for (let user of usersBD) {
            for (let key in user) {
                if (key === 'login') {
                    delete user[key];
                    break;
                }
            }
        }

        //Cadastrar usuario alterando arquivo json
        usersBD.push({...userData, id: ID_USER, login: true });
        ID_USER += 1;
        console.log(usersBD);
        fs.writeFileSync(path.resolve(__dirname, '../data/users.json'), JSON.stringify(usersBD));
    }

    res.redirect(301, '../');
})

app.get('/login', (req, res) => {

    res.render('./html/login');

})

app.post('/login', upload.none(), (req, res) => {

    const userData = req.body;

    const usersBD = consultUsers(); 

    const userSearched = usersBD.find(user => user.email === userData.email);

    //Verificando se o usuario existe apartir do email
    if (!userSearched) {
        res.status(400).json({
            mensagem: 'Este email não foi cadastrado.'
        })
        return;
    }

    //Verificando se a senha é igual ao usuario identificado do banco de dados
    if (userData.password !== userSearched.password) {
        res.status(400).json({
            mensagem: 'Essa senha está incorreta.'
        })
        return;
    }

    //Deletando a propriedade de 'login' de todos os usuarios do banco
    for (let user of usersBD) {
        for (let key in user) {
            if (key === 'login') {
                delete user[key];
                break;
            }
        }
    }

    //Adicionado a propriedade de 'login' no usuario logado
    userSearched.login = true;

    fs.writeFileSync(path.resolve(__dirname, '../data/users.json') , JSON.stringify(usersBD));

    res.redirect(301, '../');

})

function parseUser (userData) {
    const { name, email, password } = userData;

    function parseName (name) {
        if (name.length > 20) {
            return 'O nome possui mais de 20 caracteres.';
        } else if (name.length < 3) {
            return 'O nome possui menos de 3 caracteres.';
        }
    }

    function parseEmail (email) {
        if (!/[\w\d]{4,20}@gmail\.com/.test(email)) {
            return 'O email está incorreto';
        }
        const usersBD = consultUsers();

        for (let i = 0; i < usersBD.length; i++) {
            if (usersBD[i].email === email) {
                return 'Este email já existe!';
            }
        }

    } 

    function parsePassword (password) {
        if (password.length > 30) {
            return 'A senha tem mais de 30 caracteres';
        } else if (password.length < 8) {
            return 'A senha tem menos de 8 caracteres';
        }

        if (!password.match(/\d/)) {
            return 'A senha precisa ter pelo menos um número.';
        }
    }

    return [parseName(name), parseEmail(email), parsePassword(password)];
}

function consultUsers () {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/users.json'), 'utf-8'));
}

function getUserLogin () {
    const usersBD = consultUsers();
    return usersBD.find(user => user.login);
}

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Abrindo servidor na porta ${PORT}`);
})