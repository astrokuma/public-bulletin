import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, onValue, set, push, update, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://playground-af098-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const publicBulletinDB = ref(database, "publicBulletin")

const textInput = document.getElementById("input")
const fromInput = document.getElementById("from")
const postDiv = document.getElementById("post")
const heart = document.getElementById("heart")
const icon = document.getElementById("icon")
const iconStyle = document.getElementById("svg-path")
const submitBtn = document.getElementById("submit")

let commentLiked = false

submitBtn.addEventListener("click", () => submitForm())

function submitForm() {
    let inputValue = textInput.value;
    let fromValue = fromInput.value;

    if (inputValue !== "") {
        const newItemRef = push(publicBulletinDB);

        set(newItemRef, {
            text: inputValue,
            from: fromValue || "Anonymous",
            liked: false
        });

        clearFields();
    }
}


function createPost(text, user, key, isLiked) {
    let li = document.createElement("li");
    li.textContent = text;

    let userDiv = document.createElement("div")
    userDiv.id = "user-div"

    let p = document.createElement("p")
    p.textContent = `-${user}`
    userDiv.appendChild(p);

    let iconDiv = document.createElement("div")
    iconDiv.id = "icon"

    let heartSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    heartSVG.id = "heart"
    heartSVG.setAttribute("viewBox", "0 0 20 20")
    let heartPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
    heartPath.id = "svg-path"
    heartPath.setAttribute("class", "default-icon")
    if (user == "Nagel") {
        heartPath.setAttribute("d", "M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z")
    } else {
        heartPath.setAttribute("d", "M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z")
    }

    if (isLiked) {
        heartPath.classList.remove("default-icon");
        heartPath.classList.add("liked");
    } else {
        heartPath.classList.add("default-icon");
        heartPath.classList.remove("liked");
    }

    heartSVG.setAttribute('data-key', key);
    heartSVG.appendChild(heartPath)
    heartSVG.addEventListener("click", () => liked(heartSVG));

    iconDiv.appendChild(heartSVG)

    userDiv.appendChild(iconDiv)
    li.appendChild(userDiv)
    postDiv.insertBefore(li, postDiv.firstChild);
}

function clearFields() {
    textInput.value = ""
    fromInput.value = ""
}

loadMessagesFromDB();

function loadMessagesFromDB() {
    onValue(publicBulletinDB, (snapshot) => {
        const data = snapshot.val()
        postDiv.innerHTML = ''
        for (let key in data) {
            const message = data[key]
            createPost(message.text, message.from, key, message.liked);
        }
    });
}

async function liked(heartIcon) {
    const key = heartIcon.getAttribute('data-key');
    const itemRef = ref(database, "publicBulletin/" + key);

    const snapshot = await get(itemRef);  // Fetch data once using get
    const data = snapshot.val();
    const currentState = data.liked;

    update(itemRef, { liked: !currentState });  // Toggle the liked state
}
