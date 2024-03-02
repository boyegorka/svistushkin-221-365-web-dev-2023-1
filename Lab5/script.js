'use strict';

let page = 1;
let perPage = 5;
let totalPage = 0;
let totalRecors = 0;
let q = '';

let btnBack = document.querySelector('.footer');
let selectPerPage = document.querySelector('.select-perpage');
let blockBtns = document.querySelector('.block-btns');
let searchBar = document.querySelector('.input');
let autocompleteList = document.querySelector('.autocomplete');


function renderBlockBtns() {
    const begin = (page - 2 > 1) ? page - 2 : 1;
    const end = (page + 2 > totalPage) ? totalPage : page + 2;
    blockBtns.innerHTML = '';
    for (let i = begin; i <= end; i++) {
        const btn = document.createElement('button');
        btn.classList.add('btn');
        btn.textContent = i;
        if (i === page) btn.classList.add('active');
        blockBtns.append(btn);
    }
}

function renderCountRecord() {
    let from = document.querySelector('.from');
    from.textContent = (page - 1) * perPage + 1;
    let to = document.querySelector('.to');
    to.textContent = (page * perPage > totalRecors) ? totalRecors : page * perPage;
    let total = document.querySelector('.total');
    total.textContent = totalRecors;
}

function loadData() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 
        `http://cat-facts-api.std-900.ist.mospolytech.ru/facts?page=${page}&per-page=${perPage}&q=${q}`);
    xhr.send();
    xhr.onload = function () {
        if (xhr.status === 200) {
            let response = JSON.parse(xhr.response);
            let posts = document.querySelector('.posts');
            let template = document.querySelector('#post');
            posts.innerHTML = '';
            for (const record of response.records) {
                let clone = template.content.cloneNode(true);
                let text = clone.querySelector('.upper_post');
                text.textContent = record.text;
                let author = clone.querySelector('.author');
                author.textContent = `${record.user?.name?.first} ${record?.user?.name?.last}`;
                let upvotes = clone.querySelector('.upvotes');
                upvotes.textContent = record.upvotes;
                posts.append(clone);
            }
            totalPage = response._pagination.total_pages;
            totalRecors = response._pagination.total_count;
            renderBlockBtns();
            renderCountRecord();
        } else {
            console.log('Ошибка при выполнении запроса');
        }
    };
    xhr.onerror = function() {
        console.log('Ошибка');
    };
}

function search() {
    q = searchBar.value.trim();
    if (searchBar.value === '') return q = '';
    loadData();

    window.scrollTo(0, 0);
}

function clean(event) {
    if (event && event.target === searchBar) return;
    autocompleteList.innerHTML = '';
}

function autocomplete(event, arr) {
    const value = event.target.value.trim();
    clean();

    for (const phrase of arr) {
        const item = document.createElement("div");

        item.innerHTML = "<strong>" + phrase.substr(0, value.length) + "</strong>";
        item.innerHTML += phrase.substr(value.length);
        
        item.addEventListener("click", function(e) {
            event.target.value = phrase;
            clean(e);
        });
        autocompleteList.append(item);
    }
}

function loadSearch(event) {
    let xhr = new XMLHttpRequest();
    let query = event.target.value.trim();
    if (query === '') {
        clean();
        return;
    }
    xhr.open(
        'GET', 
        `http://cat-facts-api.std-900.ist.mospolytech.ru/autocomplete?q=${query}`
    );
    xhr.responseType = "json";
    xhr.onload = function () {
        autocomplete(event, this.response);
    };
    xhr.send();
}

function clickFooter(event) {
    const target = event.target;
    if (target.classList.contains('btn-back')) {
        if (page - 1 < 1) {
            return;
        }   
        page -= 1;
        loadData();
        return;

    }
    if (target.classList.contains('btn-forward')) {
        if (page + 1 > totalPage) {
            return;
        }   
        page += 1;
        loadData();
        return;

    }
    if (target.classList.contains('btn')) {
        page = +target.textContent;
        loadData();

    }
}

btnBack.addEventListener('click', clickFooter);

document.querySelector('.btn').onclick = search;

selectPerPage.addEventListener('change', (event)=>{
    perPage = +event.target.value;
    loadData();
});

document.addEventListener('click', function(e) {
    clean(e);
});

searchBar.addEventListener(
    'input',
    loadSearch
);

window.onload = loadData;
