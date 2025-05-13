const floatingInput = document.getElementById("floating-input");
let offset = {x:0, y:0};
let isDragging = false;

floatingInput.addEventListener("mousedown",(e)=>{
    isDragging=true;
    offset = {
        x: floatingInput.offsetLeft - e.clientX,
        y: floatingInput.offsetTop - e.clientY,
    };
});


document.addEventListener("mouseup",()=> isDragging = false);

document.addEventListener("mousemove",(e)=>{
    if (isDragging){
        floatingInput.style.left = e.clientX + offset.x + "px";
        floatingInput.style.top = e.clientY +offset.y + "px";
    };
});

function showLoading(show){
    document.getElementById("loading-overlay").style.display = show ? "flex" : "none";
}

function analyze(){
    const symbol = document.getElementById("stock-symbol").value.trim();
    if(!symbol){
        alert("請輸入股票代號（例如：0050.TW 或 APPL 等等");
        return;
    }

    showLoading(true);
    
    fetch("https://beststockhelper.onrender.com/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol })
    })
    .then(res => res.json())
    .then(data => {
        console.log("摘要：", data.analyze_normal);
        console.log("點評：", data.analyze_9);
        document.getElementById("analyze_normal").textContent = data.analyze_normal || "錯誤：" + data.error;
        document.getElementById("analyze_9").textContent = data.analyze_9 || "錯誤：" + data.error;
        document.getElementById("plt").src = `data:image/png;base64,${data.plt}`;
        updateHistory(symbol,data.analyze_9);
    })
    .finally(()=>showLoading(false));
}

function updateHistory(symbol,opinion){
    const list = document.getElementById("history-list");
    const history = JSON.parse(localStorage.getItem("searchHistory")||"[]");

    const entry = {symbol, opinion};
    history.unshift(entry);
    const unique=[];
    const seen = new Set();

    for (const item of history){
        if (!seen.has(item.symbol)){
            seen.add(item.symbol);
            unique.push(item);
        }
    }

    localStorage.setItem("searchHistory",JSON.stringify(unique.slice(0,10)));
    renderHistory();
}

function renderHistory(){
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    const list = document.getElementById("history-list");
    list.innerHTML = "";
    history.forEach(entry=>{
        const li = document.createElement("li");
        li.textContent = entry.symbol;
        li.style.cursor = "pointer";
        li.onclick = () =>{
            document.getElementById("stock-symbol").value = entry.symbol;
            analyze();
        }
        list.appendChild(li);
    });
}
window.onload = renderHistory;
