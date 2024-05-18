function loadRoutesData() {
    fetch('http://localhost:8080/route/get_all')
        .then(response => response.json())
        .then(data => {
            tableGenerate(data)
        })
        .catch(error => console.error('Error loading the routes:', error));
}

function filterTrainsByCity(cityId) {
    fetch('http://localhost:8080/route/get_all')  // Або використовуйте збережені дані, якщо вони не змінюються
        .then(response => response.json())
        .then(data => {
            var filteredRoutes = data.filter(route => {
                return route.cities.some(city => city.id.toString() === cityId);
            });
            tableGenerate(filteredRoutes)
        })
        .catch(error => console.error('Error loading filtered routes:', error));
}

function updateTable(data) {
    const tableBody = document.querySelector('#table-container tbody');
    tableBody.innerHTML = '';
    console.log(data)
    data.forEach((route, index) => {
        const cities = route.cities.map(city => city.name).join(', ');
        const row = document.createElement('tr');
        row.innerHTML = `<th scope="row">${index + 1}</th>
                         <td>${route.train.trainNumber}</td>
                         <td>${route.train.type}</td>
                         <td>${cities || 'No cities'}</td>
                         <td>${new Date(route.departureTime).toLocaleString('uk-UA', {timeZone: 'Europe/Kiev'})}</td>`;
        tableBody.appendChild(row);
    });
}

function loadAllRoutes() {
    let routes = null
    fetch('http://localhost:8080/route/get_all')
        .then(response => response.json())
        .then(data => {
            routes = (data);
        })
        .catch(error => console.error('Error loading all routes:', error));
    return routes
}

function tableGenerate(routes) {
    const tableBody = document.querySelector('#table-container tbody');
    tableBody.innerHTML = '';
    routes.forEach((route, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<th scope="row">${index + 1}</th>
                                 <td>${route.train.trainNumber}</td>
                                 <td>${route.train.type}</td>
                                 <td>${route.cities.map(city => city.name).join(', ')}</td>
                                 <td>${new Date(route.departureTime).toLocaleString('uk-UA')}</td>`;
        tableBody.appendChild(row);

        row.addEventListener('mouseenter', () => highlightRoute(route.cities, true));
        row.addEventListener('mouseleave', () => highlightRoute(route.cities, false));

    });
}