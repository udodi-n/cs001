import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, onSnapshot }
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyA350xl8lRLoikvM_PbGpHAqEpYmvWhaN0",
  authDomain: "cs-lectures.firebaseapp.com",
  projectId: "cs-lectures",
  storageBucket: "cs-lectures.appspot.com",
  messagingSenderId: "525367035011",
  appId: "1:525367035011:web:aa4c33a6ee734b9e6d87b6",
  measurementId: "G-1690Z8ETFX"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const freedomBtn = document.getElementById("freedom");
const sageBtn = document.getElementById("sage");
const freedomLine = document.getElementById("freedom-line");
const sageLine = document.getElementById("sage-line");
const freedomVotes = document.getElementById("freedom-votes");
const sageVotes = document.getElementById("sage-votes");
const resultsBar = document.getElementById("poll-line");
const confirmBar = document.getElementById("blur");
const voteChoice = document.getElementById("voteChoice")
const confirmBtn = document.getElementById("confirmBtn")
const cancelBtn = document.getElementById("cancelBtn")

let truthyCheck;

const db = getFirestore(app)

function getDeviceFingerprint() {
  const stored = localStorage.getItem("deviceFingerprint");
  if (stored) return stored;
  const fingerprintData = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");
  let hash = 0;
  for (let i = 0; i < fingerprintData.length; i++) {
    const char = fingerprintData.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const fingerprint = `device_${Math.abs(hash)}`;
  localStorage.setItem("deviceFingerprint", fingerprint);
  return fingerprint;
}

async function voteSequence() {
    const docRef = doc(db, "votes", "stats");
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) {
        await setDoc(docRef, {freedom: 0, sage: 0})
    }

    onSnapshot(docRef, (snapshot) => {
        if(snapshot.exists()) {
            const data = snapshot.data();
            freedomVotes.textContent = data.freedom;
            sageVotes.textContent = data.sage;
            const total = parseInt(freedomVotes.textContent) + parseInt(sageVotes.textContent);
            const percent = (data.freedom / total) * 100;
            freedomLine.style.width = percent + "%";
        }
    })

    freedomBtn.addEventListener("click", () => {
        truthyCheck = true;
        confirmBar.classList.remove("hidden");
        voteChoice.innerHTML = "Freedom";
    })

    sageBtn.addEventListener("click", () => {
        truthyCheck = false;
        confirmBar.classList.remove("hidden");
        voteChoice.innerHTML = "S.A.G.E";
    })

    confirmBtn.addEventListener("click", async () => {
        const deviceId = getDeviceFingerprint();
        const userRef = doc(db, "voters", deviceId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            alert("You’ve already voted!");
            confirmBar.classList.add("hidden");
            return;
        }

        if(truthyCheck === true) {
            await updateDoc(docRef, { freedom: increment(1) });
            confirmBar.classList.add("hidden");
        } else if (truthyCheck === false) {
            await updateDoc(docRef, { sage: increment(1) });
            confirmBar.classList.add("hidden");
        }

        await setDoc(userRef, { voted: true });
        confirmBar.classList.add("hidden");
    })

    cancelBtn.addEventListener("click", () => {
        confirmBar.classList.add("hidden");
    })
}

voteSequence()
console.log("Firebase initialized!", db);
