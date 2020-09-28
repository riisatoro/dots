function getToken(name) {
    let csrf = document.querySelector('[name=csrfmiddlewaretoken]').value
    return csrf;
}

export default getToken;