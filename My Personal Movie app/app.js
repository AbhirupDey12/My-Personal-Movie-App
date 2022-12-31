const API_KEY = `4380cae87d714774a6b14eca13464018`;
const image_path = `https://image.tmdb.org/t/p/w1280`;

const input = document.querySelector('.search input');
const btn = document.querySelector('.search button')
const main_grid_title = document.querySelector('.favorites h1');
const main_grid = document.querySelector('.favorites .movies-grid');

const trending_el = document.querySelector('.trending .movies-grid') ;

const popup_container = document.querySelector('.popup-container');

// REMEMBER :- Whenever you use either fetch or awit keyword to get the data then always make that particular function async (This is Rule)

function add_click_effect_to_card(cards) {

    cards.forEach(card => {
        card.addEventListener('click', () => show_popup(card));
    });

}


// Search Movies
async function get_movie_by_search(search_term) {

    const resp = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${search_term}`)
    const respData = await resp.json();
    return respData.results;

}

btn.addEventListener('click', add_search_movies_to_dom);


async function add_search_movies_to_dom() {

    const data = await get_movie_by_search(input.value);
    console.log(data);

    main_grid_title.innerText = `Search Results...`
    main_grid.innerHTML = data.map((e) => {
        return `
                <div class="card" data-id="${e.id}">

                    <div class="img">
                        <img src="${image_path + e.poster_path}" alt="">
                    </div>

                    <div class="info">

                        <h2>${e.title}</h2>

                        <div class="single-info">
                            <span>Rate: </span>
                            <span> ${e.vote_average} / 10</span>
                        </div>

                        <div class="single-info">
                            <span>Release Date: </span>
                            <span>${e.release_date}</span>
                        </div>

                    </div>

                </div>
                `
    }).join('');

    // now when we click in the card we want to show a pop up with the movie info 
    const cards = document.querySelectorAll('.card');
    add_click_effect_to_card(cards);
}



// POPUP

async function get_movie_by_id(id) {

    const resp = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`)
    const respData = await resp.json();
    return respData;

}

async function get_movie_by_trailer(id) {

    const resp = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`)
    const respData = await resp.json();
    return respData.results[0].key;

}

async function show_popup(card) {

    popup_container.classList.add('show-popup');

    const movie_id = card.getAttribute('data-id');
    const movie = await get_movie_by_id(movie_id);
    const movie_trailer = await get_movie_by_trailer(movie_id);
    console.log(movie_trailer)
    console.log(image_path + movie.poster_path);
    popup_container.style.background = `linear-gradient(rgba(0, 0, 0, .8), rgba(0, 0, 0, 1)), url(${image_path + movie.poster_path})`

    popup_container.innerHTML =
        `
            <span class="x-icon">&#10006;</span>

            <div class="content">

                <div class="left">
                    <div class="poster-image">
                        <img src="${image_path + movie.poster_path}" alt="">
                    </div>
                    <div class="single-info">
                        <span>Add to favorites:</span>
                        <!-- Unicode for the heart icon -->
                        <span class="heart-icon">&#9829;</span>
                    </div>
                </div>

                <div class="right">
                    <h1>${movie.title}</h1>
                    <h3>${movie.tagline}</h3>
                    <div class="single-info-container">
                        <div class="single-info">
                            <span>Language</span>
                            <span>${movie.spoken_languages[0].name}</span>
                        </div>
                        <div class="single-info">
                            <span>Length:</span>
                            <span> ${movie.runtime} minutes</span>
                        </div>
                        <div class="single-info">
                            <span>Rate</span>
                            <span> ${movie.vote_average} / 10</span>
                        </div>
                        <div class="single-info">
                            <span>Budget:</span>
                            <span>$ ${movie.budget}</span>
                        </div>
                        <div class="single-info">
                            <span>Release Date:</span>
                            <span>${movie.release_date}</span>
                        </div>
                    </div>

                    <div class="genres">
                        <h2>Genres</h2>
                        <ul>
                            ${movie.genres.map(e => `<li>${e.name}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="overview">
                        <h2>Overview</h2>
                        <p>${movie.overview}</p>
                    </div>

                    <div class="trailer">
                        <h2>Trailer</h2>
                        <!-- Iframe for the trailer of the selected movie -->
                        <iframe width="560" height="315" src="https://www.youtube.com/embed/${movie_trailer}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>

                </div>

            </div>
    `;

    const x_icon = document.querySelector('.x-icon')
    x_icon.addEventListener('click', () => popup_container.classList.remove('show-popup'));

    const heart_icon = document.querySelector('.heart-icon');

    heart_icon.addEventListener('click', () => {
        if(heart_icon.classList.contains('change-color')) {
            remove_LS(movie_id)
            heart_icon.classList.remove('change-color')
        } else {
            add_to_LS(movie_id) ;
            heart_icon.classList.add('change-color')
        }
        fetch_favorite_movies() ;
    })

}

function get_LS () {
    const movie_ids = JSON.parse(localStorage.getItem('movie-id')) ;

    return movie_ids == null ? [] : movie_ids ;
}

function add_to_LS (id) {
    const movie_ids = get_LS() ;
    localStorage.setItem('movie-id' , JSON.stringify([...movie_ids , id ]))
}

function remove_LS () {
    const movie_ids = get_LS() ;
    localStorage.setItem( 'movie-id' , JSON.stringify(movie_ids.filter(e => e !== id ))  )
}

fetch_favorite_movies() ;
async function fetch_favorite_movies () {
    main_grid.innerHTML = '' ;
    const movies_LS = await get_LS() ;
    const movies = [] ;
    for(let i = 0 ; i < movies_LS.length ; i++ ) {
        const movie_id = movies_LS[i] ;
        let movie = await get_movie_by_id(movie_id)
        add_favorites_to_dom_from_LS(movie) ;
        movies.push(movie)
    }
}

function add_favorites_to_dom_from_LS ( movie_data )  {
    main_grid.innerHTML += `
    
        <div class="card" data-id="${movie_data.id}">

            <div class="img">
                <img src="${image_path + movie_data.poster_path}" alt="">
            </div>

            <div class="info">

                <h2>${movie_data.title}</h2>

                <div class="single-info">
                    <span>Rate: </span>
                    <span> ${movie_data.vote_average} / 10</span>
                </div>

                <div class="single-info">
                    <span>Release Date: </span>
                    <span>${movie_data.release_date}</span>
                </div>

            </div>

        </div>
    
    `;

    const cards = document.querySelectorAll('.card');
    add_click_effect_to_card(cards);
}

async function get_trending_movies () {

    const resp = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`)
    const respData = await resp.json();
    return respData.results;

}

add_to_dom_trending()
async function add_to_dom_trending () {

    const data = await get_trending_movies() ;
    console.log(data.length) ;

    trending_el.innerHTML = data.map((e) => {
        return `
        
        <div class="card" data-id="${e.id}">

            <div class="img">
                <img src="${image_path + e.poster_path}" alt="">
            </div>

            <div class="info">

                <h2>${e.title}</h2>

                <div class="single-info">
                    <span>Rate: </span>
                    <span> ${e.vote_average} / 10</span>
                </div>

                <div class="single-info">
                    <span>Release Date: </span>
                    <span>${e.release_date}</span>
                </div>

            </div>

        </div>
        
        `
    }).join('') ;

}
