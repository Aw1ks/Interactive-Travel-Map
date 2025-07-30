// ------ ПОЛУЧЕНИЕ ИНФОРМАЦИИ О СТРАНЕ ------
fetch('api/country/')
    .then(response => response.json())
    .then(data => {
        country_info = data;
    })
    .catch(error => {
        console.error('Ошибка загрузки country.json:', error);
    });

// ------ ПОЛУЧЕНИЕ ИНФОРМАЦИИ ПОСТА ------
fetch('api/post/')
    .then(response => response.json())
    .then(data => {
        post_info = data;
    })
    .catch(error => {
        console.error('Ошибка загрузки post.json:', error);
    })

/* ------ ФУНКЦИЯ ДЛЯ ОТКРЫТИЯ ОКНА С ИНФОЙ СТРАНЫ | ГОРОДА------ */ 
let activePopup = null;

function openCustomPopup(content) {
    if (activePopup) {
        document.body.removeChild(activePopup);
        activePopup = null;
    }

    const popupDiv = document.createElement('div');
    popupDiv.className = 'custom-popup';

    const popup_container = document.createElement('div');
    popup_container.className = 'popup-container';

    /* ------ТЕКСТОВАЯ ИНФОРМАЦИЯ------ */
    const background_heading = document.createElement('div');
    background_heading.className = 'background-heading'
    background_heading.style.backgroundImage = `url('${content.country_information.image}')`;
    
    const heading = document.createElement('h2');
    heading.className = 'country-name';
    heading.textContent = content.country;
    
    const country_information_container = document.createElement('div');
    country_information_container.className = 'country-information_container';
    
    const country_description = document.createElement('div');
    country_description.className = 'country-description';
    country_description.textContent = content.country_information.description

    /* ------ИНФОРМАЦИЯ О СТРАНЕ------ */
    const country_information_wrapper = document.createElement('div');
    country_information_wrapper.className = 'country-information_wrqpper';

    // ------капитал------
    const capital = document.createElement('div');
    capital.className = 'capital';

    const capital_icon = document.createElement('img');
    capital_icon.className = 'capital-icon';
    capital_icon.src = 'images/icons/capital_icon.png';
    capital.appendChild(capital_icon);

    const capital_info = document.createElement('h2');
    capital_info.className = 'capital-info';
    capital_info.textContent = `На данный момент капитал страны - ${content.country_information.country_info.capital}`;
    capital.appendChild(capital_info);

    // ------президент------
    const president = document.createElement('div');
    president.className = 'president';

    const president_icon = document.createElement('img');
    president_icon.className = 'president-icon';
    president_icon.src = 'images/icons/president_icon.png';
    president.appendChild(president_icon);

    const president_info = document.createElement('h2');
    president_info.className = 'president-info';
    president_info.textContent = `Президент страны - ${content.country_information.country_info.president}`;
    president.appendChild(president_info);

    // ------население------
    const population = document.createElement('div');
    population.className = 'population';

    const population_icon = document.createElement('img');
    population_icon.className = 'population-icon';
    population_icon.src = 'images/icons/population_icon.png';
    population.appendChild(population_icon);

    const population_info = document.createElement('h2');
    population_info.className = 'population-info';
    population_info.textContent = `Население страны - ${content.country_information.country_info.population}`;
    population.appendChild(population_info);

    
    /* ------КОММЕНТАРИИ------ */
    const traveler_reviews = document.createElement('div');
    traveler_reviews.className = 'traveler-reviews';
    traveler_reviews.textContent = 'Впечатления путешественников';

    const commentsContainer = document.createElement('div');
    commentsContainer.className = 'comments-popup_container';

    const commentsData = [];

    content.postData.forEach(post => {
        const fullAddress = `${post.address.street}, ${post.address.city}, ${post.address.country}`;
        const words = post.description.split(/\s+/);

        const processedWords = words.map(word => {
            if (word.length > 15) {
                let newWord = '';
                for (let i = 0; i < word.length; i += 5) {
                    newWord += word.substring(i, i + 5);
                    if (i + 5 < word.length) {
                        newWord += '-';
                    }
                }
                return newWord;
            } else {
                return word;
            }
        });
        
        post.description = processedWords.join(' ');

        commentsData.push({
            avatar: 'images/icons/avatar.png',
            image: post.image,
            message: post.description,
            post_date: post.date,
            post_addres: fullAddress
        });
    });

    commentsData.slice(0, 2).forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';

        const avatar = document.createElement('img');
        avatar.src = comment.avatar;
        avatar.className = 'avatar';

        if (comment.image && comment.image.length > 0) {
            const post_image = document.createElement('img');
            post_image.className = 'post_image';
            post_image.src = comment.image;
            post_image.alt = 'Картинка поста';

            commentDiv.appendChild(post_image);
        }

        const post_info_container = document.createElement('div');
        post_info_container.className = 'post_info-container';

        const full_place_post = document.createElement('h3');
        full_place_post.className = 'full_place-post';
        full_place_post.textContent = `Адрес - ${comment.post_addres}`;

        full_place_post.addEventListener('click', function() {
            const address = comment.post_addres;

            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        const place = data[0];
                        console.log(`Координаты: ${place.lat}, ${place.lon}`);

                        const place_lat = place.lat - 0.06;
                        const place_lon = place.lon + 8;

                        map.setView([place_lat, place_lon], 11);
                    } else {
                        console.log("Местоположение не найдено");
                    }
                })
                .catch(error => console.error('Ошибка:', error));
        });

        const post_publication_date = document.createElement('h3');
        post_publication_date.className = 'post_publication_date';
        post_publication_date.textContent = `Дата публикации - ${comment.post_date}`;

        const message = document.createElement('div');
        message.className = 'message';
        message.textContent = comment.message;

        commentDiv.appendChild(post_info_container);
        post_info_container.appendChild(full_place_post); 
        post_info_container.appendChild(post_publication_date); 
        commentDiv.appendChild(avatar);          
        commentDiv.appendChild(message);    

        commentsContainer.appendChild(commentDiv);
    });

    let expandButton = null;
    if (commentsData.length > 2) {
        expandButton = document.createElement('button');
        expandButton.textContent = 'Развернуть';
        expandButton.className = 'expand-btn';

        expandButton.onclick = () => {
            commentsData.slice(2).forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.className = 'comment';

                const avatar = document.createElement('img');
                avatar.src = comment.avatar;
                avatar.className = 'avatar';

                if (comment.image && comment.image.length > 0) {
                    const post_image = document.createElement('img');
                    post_image.className = 'post_image';
                    post_image.src = comment.image;
                    post_image.alt = 'Картинка поста';

                    commentDiv.appendChild(post_image);
                }

                const post_info_container = document.createElement('div');
                post_info_container.className = 'post_info-container';

                const full_place_post = document.createElement('h3');
                full_place_post.className = 'full_place-post';
                full_place_post.textContent = `Адрес - ${comment.post_addres}`;

                full_place_post.addEventListener('click', function() {
                    const address = comment.post_addres;

                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.length > 0) {
                                const place = data[0];
                                console.log(`Координаты: ${place.lat}, ${place.lon}`);

                                const place_lat = place.lat - 0.06;
                                const place_lon = place.lon + 8;

                                map.setView([place_lat, place_lon], 11);
                            } else {
                                console.log("Местоположение не найдено");
                            }
                        })
                        .catch(error => console.error('Ошибка:', error));
                });

                const post_publication_date = document.createElement('h3');
                post_publication_date.className = 'post_publication_date';
                post_publication_date.textContent = `Дата публикации - ${comment.post_date}`;

                const message = document.createElement('div');
                message.className = 'message';
                message.textContent = comment.message;

                commentDiv.appendChild(post_info_container);
                post_info_container.appendChild(full_place_post); 
                post_info_container.appendChild(post_publication_date); 
                commentDiv.appendChild(avatar);          
                commentDiv.appendChild(message);    

                commentsContainer.appendChild(commentDiv);
            });
            expandButton.style.display = 'none';

            commentsContainer.scrollIntoView({ behavior: 'smooth' });
        };
    }

    /* ------КОММЕНАРИЙ ПОЛЬЗОВАТЕЛЯ------ */
    const user_comment_container = document.createElement('div');
    user_comment_container.className = 'user-comment_container';

    const user_comment = document.createElement('input');
    user_comment.className = 'user-comment';
    user_comment.type = 'text'; 
    user_comment.placeholder = 'Введите комментарий'; 

    const upload_image_container = document.createElement('div');
    upload_image_container.className = 'upload_image_container';
    
    const upload_image = document.createElement('input');
    upload_image.className = 'upload-image';
    upload_image.type = 'file'; 
    upload_image.accept = 'images/media'; 
    upload_image.multiple = false; 

    const send_comment = document.createElement('button');
    send_comment.className = 'send-comment';
    send_comment.textContent = 'Отправить'; 

    const uploadButton = document.createElement('button');
    uploadButton.className = 'upload-image';
    uploadButton.innerText = 'Выбрать изображение';

    uploadButton.onclick = () => {
        upload_image.click();
    };

    user_comment_container.appendChild(user_comment);
    user_comment_container.appendChild(upload_image_container);
    upload_image_container.appendChild(upload_image);
    upload_image_container.appendChild(uploadButton);
    upload_image_container.appendChild(upload_image);
    user_comment_container.appendChild(send_comment);

    /* ------ДОБАВЛЯЕМ ЭЛЕМЕНТЫ НА СТРАНИЦУ------ */
    popup_container.appendChild(background_heading);
    popup_container.appendChild(heading)
    popup_container.appendChild(country_information_container);
    country_information_container.appendChild(country_description);
    popup_container.appendChild(country_information_wrapper);
    country_information_wrapper.appendChild(capital);
    country_information_wrapper.appendChild(president);
    country_information_wrapper.appendChild(population);
    popup_container.appendChild(traveler_reviews);
    popup_container.appendChild(commentsContainer);
    popup_container.appendChild(user_comment_container);

    if (expandButton) commentsContainer.appendChild(expandButton);

    popupDiv.appendChild(popup_container);

    document.body.appendChild(popupDiv);

    setTimeout(() => {
        popupDiv.classList.add('show');

        const currentCenter_open = map.getCenter();
        map.panTo([currentCenter_open.lat, currentCenter_open.lng + 0.3], { animate: true });
    }, 10);

    activePopup = popupDiv;

    /* ------ЗАКРЫТИЕ ОКНА------- */
    let close_window = document.createElement('div');
    close_window.className = 'close-window';

    let close_icon = document.createElement('img');
    close_icon.className = 'close-icon';
    close_icon.src = 'images/icons/close_icon.png';

    close_window.appendChild(close_icon);
    popupDiv.appendChild(close_window);

    close_window.addEventListener('click', function() {
        closePopup();

        const currentCenter_close = map.getCenter();
        map.panTo([currentCenter_close.lat, currentCenter_close.lng - 0.3], { animate: true });
    });
}


/* ------ФУНКЦИЯ ЗАКРЫТИЯ ОКНА------ */
function closePopup() {
    if (activePopup) {
        activePopup.classList.remove('show');
    }
}


/* ------ДОБАВЛЕНИЕ ПОСТА------ */
let isAddingPost = false;
let currentPostDiv = null;

function addPost() {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';

    const post_container = document.createElement('div');
    post_container.className = 'post-container';
    
    const post_comment = document.createElement('input');
    post_comment.className = 'post-comment';
    post_comment.type = 'text'; 
    post_comment.placeholder = 'Введите текст поста'; 
    
    const upload_post_image_container = document.createElement('div');
    upload_post_image_container.className = 'upload_post_image_container';
    
    const upload_post_image = document.createElement('input');
    upload_post_image.className = 'upload_post-image';
    upload_post_image.type = 'file'; 
    upload_post_image.accept = 'images/media'; 
    upload_post_image.multiple = false; 
    
    const send_post_comment = document.createElement('button');
    send_post_comment.className = 'send_post-comment';
    send_post_comment.textContent = 'Отправить'; 
    
    const upload_postButton = document.createElement('button');
    upload_postButton.className = 'upload_post-image';
    upload_postButton.innerText = 'Выбрать изображение';
    
    const cancel_sending = document.createElement('button');
    cancel_sending.className = 'cancel_sending';
    cancel_sending.textContent = 'Отменить'; 
    
    upload_postButton.onclick = () => {
        upload_post_image.click();
    };
    
    postDiv.appendChild(post_container);
    post_container.appendChild(post_comment);
    post_container.appendChild(upload_post_image_container);
    upload_post_image_container.appendChild(upload_post_image);
    post_container.appendChild(send_post_comment);
    upload_post_image_container.appendChild(upload_postButton);
    post_container.appendChild(cancel_sending);

    document.body.appendChild(postDiv);

    currentPostDiv = postDiv;
}

document.getElementById('post-box').addEventListener('click', function() {
    if (!isAddingPost) {
        addPost();
        isAddingPost = true;
    }
});

document.addEventListener('click', function(event) {
    if (isAddingPost && currentPostDiv) {
        const postBox = document.getElementById('post-box');
        if (!currentPostDiv.contains(event.target) && !postBox.contains(event.target)) {

            currentPostDiv.remove();
            currentPostDiv = null;
            isAddingPost = false;
        }
    }
});