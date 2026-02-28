// ====================== LOGIN / SIGNUP ======================
function signup(){
    const name=document.getElementById("signupName").value.trim();
    const email=document.getElementById("signupEmail").value.trim();
    const password=document.getElementById("signupPassword").value.trim();
    if(!name||!email||!password){ alert("All fields are required!"); return; }
    let users=JSON.parse(localStorage.getItem("users")||"[]");
    if(users.find(u=>u.email===email)){ alert("User already exists!"); return; }
    users.push({name,email,password});
    localStorage.setItem("users",JSON.stringify(users));
    alert("Sign-up successful! Please login."); showLogin();
}

function login(){
    const email=document.getElementById("loginEmail").value.trim();
    const password=document.getElementById("loginPassword").value.trim();
    let users=JSON.parse(localStorage.getItem("users")||"[]");
    let user=users.find(u=>u.email===email && u.password===password);
    if(!user){ alert("Invalid email or password!"); return; }
    localStorage.setItem("currentUser",JSON.stringify(user));
    showTest();
}

function showLogin(){ document.getElementById("loginView").style.display="block"; document.getElementById("signupView").style.display="none"; }
function showSignup(){ document.getElementById("loginView").style.display="none"; document.getElementById("signupView").style.display="block"; }
function showTest(){
    document.getElementById("authContainer").style.display = "none";
    document.getElementById("testView").style.display = "block";
    document.body.classList.remove('no-scroll'); // allow scrolling
}

function logout(){
    localStorage.removeItem("currentUser");
    answers = {}; marked = {}; visited = {};
    document.getElementById("testView").style.display = "none";
    document.getElementById("authContainer").style.display = "flex";
    document.body.classList.add('no-scroll'); // prevent scrolling before login
}

// ====================== TEST LOGIC ======================
let questions=[], currentQuestion=0, answers={}, marked={}, visited={}, timeLeft=3*3600;

// Fetch questions.json
fetch("questions.json")
.then(res=>res.json())
.then(data=>{ questions=data; createPalette(); loadQuestion(); startTimer(); });

// ====================== TIMER ======================
function startTimer(){
    const timer=document.getElementById("timer");
    setInterval(()=>{
        if(timeLeft<=0){ alert("Time Over!"); submitExam(); return; }
        let hrs=Math.floor(timeLeft/3600), mins=Math.floor((timeLeft%3600)/60), secs=timeLeft%60;
        timer.innerText=`${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
        timeLeft--;
    },1000);
}

// ====================== LOAD QUESTION ======================
function loadQuestion(){
    const q=questions[currentQuestion]; visited[currentQuestion]=true;
    document.getElementById("question-info").innerText="Question "+(currentQuestion+1);
    document.getElementById("question-text").innerText=q.question;
    const optionsDiv=document.getElementById("options"); optionsDiv.innerHTML="";
    q.options.forEach((opt,index)=>{
        const checked=answers[currentQuestion]===index?"checked":"";
        optionsDiv.innerHTML+=`<div><input type="radio" name="option" value="${index}" ${checked}> ${opt}</div>`;
    });
    updatePalette();
}

// ====================== SAVE / MARK / CLEAR ======================
function saveNext(){ const sel=document.querySelector('input[name="option"]:checked'); if(sel){ answers[currentQuestion]=parseInt(sel.value); } if(currentQuestion<questions.length-1){ currentQuestion++; loadQuestion(); } }
function markForReview(){ marked[currentQuestion]=true; saveNext(); }
function clearResponse(){ delete answers[currentQuestion]; loadQuestion(); }

// ====================== PALETTE ======================
function createPalette(){ const palette=document.getElementById("palette"); questions.forEach((q,i)=>{ const box=document.createElement("div"); box.innerText=i+1; box.classList.add("palette-box","notVisited"); box.onclick=()=>{ currentQuestion=i; loadQuestion(); }; palette.appendChild(box); }); }
function updatePalette(){ document.querySelectorAll(".palette-box").forEach((box,i)=>{ box.classList.remove("notVisited","notAnswered","answered","marked"); if(!visited[i]) box.classList.add("notVisited"); else if(marked[i]) box.classList.add("marked"); else if(answers[i]!==undefined) box.classList.add("answered"); else box.classList.add("notAnswered"); }); }

// ====================== SUBMIT ======================
function submitExam(){
    let currentUser=JSON.parse(localStorage.getItem("currentUser"));
    if(!currentUser){ alert("Please login!"); return; }

    let finalResult=questions.map((q,i)=>({
        question:q.question, answer:q.answer, marks:q.marks, negative:q.negative, selected: answers[i]!==undefined?answers[i]:null
    }));

    // Save results
    let allResults=JSON.parse(localStorage.getItem("results")||"{}");
    allResults[currentUser.email]=finalResult;
    localStorage.setItem("results",JSON.stringify(allResults));
    localStorage.setItem("gateResult",JSON.stringify(finalResult)); // result.html will use this
    window.location.href="result.html";
}

// ====================== DEBUG PANEL ======================
function showUsers(){
    const users=JSON.parse(localStorage.getItem("users")||"[]");
    const results=JSON.parse(localStorage.getItem("results")||"{}");
    let html="<ul>";
    users.forEach(u=>{
        html+=`<li><strong>${u.name}</strong> (${u.email})`;
        if(results[u.email]){
            html+="<ul>";
            results[u.email].forEach((q,i)=>{
                let sel=q.selected===null?"Not Answered":q.selected;
                html+=`<li>Q${i+1}: Selected = ${sel}, Correct = ${q.answer}</li>`;
            });
            html+="</ul>";
        } else html+=" - No results yet.";
        html+="</li>";
    });
    html+="</ul>";
    document.getElementById("usersList").innerHTML=html;
}