//create variable to hold db connection
let db;

//establish a connection to IndexedDB Database called pizz_hunt
const request = indexedDB.open('pizza_hunt', 1)

//this event will emit if database version changes 
request.onupgradeneeded = function(event){
    const db = event.target.result;
    
    //create an object store (table) called 'new_pizza', set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_pizza', { autoIncrement: true });
}

//upon a successful
request.onsuccess = function(event){
    //when db is successfully created with its object store
    db = event.target.result;

    //check if app is online -- if yes run uploadPizza() function to send all local db data to api
    if (navigator.online){
        uploadPizza();s
    }
};

request.onerror = function(event){
    console.log(event.target.errorCode)
};

//function will be executed if we attempt to submit a new pizza
function saveRecord(record){
    //open a new transaction with the database with read and write permission
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access the object stoire for 'new_pizza'
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //add record to your store with add method
    pizzaObjectStore.add(record);
}

function uploadPizza(){
    //open a transaction on your db
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access your object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //get all record from store and set to a variable
    const getAll = pizzaObjectStore.getAll();

    //upon a successful .getAll() execution, run this function
    getAll.onsuccess = function(){
        //if there was data in indexedDB's store, let's send it to the app
        if(getAll.result.length > 0){
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message){
                    throw new Error(serverResponse);
                }

                //open one more transaction
                const transaction = db.transaction(['new_pizza'], 'readwrite');
                //access the new_pizza object store
                const pizzaObjectStore = transaction.objectStore('new_pizza');
                //clear all items in your stores
                pizzaObjectStore.clear();

                alert('All saved pizza has been submitted!')
            })
            .catch(err => {
                console.log(err);s
            });
        }
    }
};

//listen for app coming back online
window.addEventListener('online', uploadPizza);
