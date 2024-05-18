let cy = null;
let selectedNode = null
let mode = 'view'
let editedNodeID = null
let editedNodeName = null
let newCities = []
let newConnections = []

function createMap(elements) {

    cy = cytoscape({
        container: document.getElementById('train-map'), // елемент, в якому буде мапа
        elements: elements,
        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(name)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'background-color': '#007bff'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#d3d3d3',
                    'curve-style': 'bezier'
                }
            }
        ],
        layout: {
            name: 'preset'
        }
    });
    cy.on('tap', 'node', function (evt) {
        const node = evt.target;
        console.log(mode)
        console.log(editedNodeID);
        if (mode === "view") {
            if (selectedNode === node.id() && editedNodeID === null) {
                node.style('background-color', '#007bff');  // Скидання кольору
                selectedNode = null;
                loadRoutesData();  // Завантаження всіх маршрутів
            } else {
                if (selectedNode) {
                    cy.getElementById(selectedNode).style('background-color', '#007bff');  // Скидання коліру попереднього вузла
                }
                node.style('background-color', '#ff0000');  // Зміна кольору на червоний
                selectedNode = node.id();
                filterTrainsByCity(node.id());  // Фільтрація маршрутів
            }
        }

        if (mode === "addEdges" && editedNodeID !== null && evt.target.id !== editedNodeID) {

            cy.add({
                group: 'edges',
                data: {
                    id: `edge${cy.edges().length + 1}`,
                    source: editedNodeID,
                    target: evt.target.id()
                }
            });
            newConnections.push({
                'cityAName': editedNodeName,
                'cityBName': evt.target._private.data.name
            })

        }

    });
    cy.on('tap', function (event) {
        console.log(mode)
        if (mode === "add" && event.target === cy) {
            let nodeName = promptForNodeName()
            let newNode = cy.add({
                group: 'nodes',
                data: {name: nodeName, id: `node${cy.nodes().length + 1}`},
                style: {'label': nodeName},
                position: {x: event.position.x, y: event.position.y}
            });
            newCities.push({
                'name': nodeName,
                'point': {
                    'x': event.position.x / 100,
                    'y': event.position.y / 100
                }
            })
            editedNodeID = newNode.id();
            editedNodeName = nodeName;
            mode = "addEdges"; // Switch to add edges mode
        }
    });
}


function loadCitiesData() {
    fetch('http://localhost:8080/cities/get_all')
        .then(response => response.json())
        .then(data => {
            var elements = [];
            data.forEach(city => {
                elements.push({
                    group: 'nodes',
                    data: {
                        id: city.id.toString(),
                        name: city.name,
                        x: city.point.x,
                        y: city.point.y
                    },
                    position: {
                        x: city.point.x * 100,
                        y: city.point.y * 100
                    }
                });
                city.citiesIDs.forEach(connectedCityId => {
                    elements.push({
                        group: 'edges',
                        data: {
                            source: city.id.toString(),
                            target: connectedCityId.toString()
                        }
                    });
                });
            });
            createMap(elements);
        })
        .catch(error => console.error('Error loading the cities:', error));
}

document.addEventListener('DOMContentLoaded', function () {
    const editButton = document.getElementById('map-edit-btn');
    const trainMapContainer = document.getElementById('train-map');

    // Create buttons dynamically and hide them initially
    const addButton = document.createElement('button');
    addButton.textContent = 'Додати';
    addButton.style.display = 'none';
    addButton.style.position = 'absolute';
    addButton.style.left = '10px'
    addButton.style.top = '10px'
    addButton.style.zIndex = '10'
    addButton.classList.add("btn");
    addButton.classList.add("btn-primary");
    addButton.addEventListener('click', function () {
        console.log(mode)
        if (mode === "edit") {
            mode = "add";
            addButton.textContent = "Готово";
            // Enable adding nodes mode

        } else if (mode.startsWith("add")) {
            mode = "edit";
            addButton.textContent = "Додати";
            saveCities()

        }
    });
    trainMapContainer.appendChild(addButton);


    editButton.addEventListener('click', function () {
        if (mode === "view") {
            mode = "edit"
            editButton.textContent = "Закінчити редагування";
            // Show the dynamic buttons
            addButton.style.display = 'inline';
            // Enable node movement
            cy.nodes().grabbable(true);
        } else {
            console.log(newCities)
            mode = "view";
            editButton.textContent = "Редагувати";
            // Hide the dynamic buttons
            addButton.style.display = 'none';
            // Disable node movement
        }
    });
});

function promptForNodeName() {
    return prompt("Введіть назву міста:", "Нове місто");
}

function saveCities() {
    fetch('http://localhost:8080/cities/save_all', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCities)
    })
        .then(response => {
            if (response.ok) {
                return
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            console.log('Data saved successfully:', data);
            newCities = []
            saveEdges()
        })
        .catch(error => {
            console.error('Error saving cities:', error);
        });

}
function saveEdges() {
    fetch('http://localhost:8080/city_connections/save_all', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newConnections)
    })
        .then(response => {
            if (response.ok) {
                return
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            console.log('Data saved successfully:', data);
            newConnections = []
        })
        .catch(error => {
            console.error('Error saving cities:', error);
        });
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}