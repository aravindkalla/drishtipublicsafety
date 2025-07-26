// ===================================================================
// STEP 1: CONFIGURE FIREBASE
// ===================================================================
// TODO: Replace the following with your app's Firebase project configuration
// Go to your Firebase project settings -> General -> Your apps -> Web app
const firebaseConfig = {
  apiKey: "AIzaSyB_rRzcVlWRivofvLDJtHGmtRdZyTxFDZQ",
  authDomain: "drishti-event-safety11.firebaseapp.com",
  projectId: "drishti-event-safety11",
  storageBucket: "drishti-event-safety11.firebasestorage.app",
  messagingSenderId: "633268699509",
  appId: "1:633268699509:web:f15d1bc4268a05fe0b533c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// ===================================================================
// STEP 2: CONFIGURE YOUR BACKEND CONNECTION
// ===================================================================
// TODO: Replace this with the HTTP Trigger URL of your 'queryDrishti' Cloud Function
const backendUrl = 'YOUR_HTTP_TRIGGER_URL_HERE';


// ===================================================================
// STEP 3: UI LOGIC
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {

    const alertsContainer = document.getElementById('alerts-container');
    const queryInput = document.getElementById('query-input');
    const submitQueryBtn = document.getElementById('submit-query');
    const responseContainer = document.getElementById('response-container');

    // --- Firestore Real-Time Listener for Alerts ---
    // This function automatically runs whenever a new alert is added to the 'alerts' collection in Firestore by your backend.
    db.collection('alerts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const alertData = change.doc.data();
                const newAlert = document.createElement('div');
                newAlert.classList.add('alert-item');
                
                const time = alertData.timestamp.toDate().toLocaleTimeString();
                
                newAlert.innerHTML = `
                    <p>${alertData.message}</p>
                    <span class="timestamp">${time}</span>
                `;
                alertsContainer.prepend(newAlert); // Add new alerts to the top
            }
        });
    });

    // --- Function to Query the Backend AI ---
    const askDrishti = async () => {
        const question = queryInput.value.trim();
        if (!question) return;

        responseContainer.innerHTML = '<p class="ai-response">Thinking...</p>';
        queryInput.value = '';

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: question }) // Assuming your backend expects a JSON with a 'query' key
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const aiResponse = await response.text(); // Or .json() if your backend sends JSON
            responseContainer.innerHTML = `<p class="ai-response">${aiResponse}</p>`;

        } catch (error) {
            console.error('Error querying backend:', error);
            responseContainer.innerHTML = '<p class="ai-response">Sorry, I encountered an error. Please check the console.</p>';
        }
    };

    // --- Event Listeners ---
    submitQueryBtn.addEventListener('click', askDrishti);
    queryInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            askDrishti();
        }
    });
});