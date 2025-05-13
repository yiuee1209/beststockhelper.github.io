window.addEventListener("DOMContentLoaded",()=>{
    renderHistory();
    console.log("初始化完畢")
});

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
        floatingInput.style.bottom = "auto";
    };
});

function showLoading(show){
    document.getElementById("loading-overlay").style.display = show ? "flex" : "none";
}


const customRenderer = new marked.Renderer();
customRenderer.link = function(href, title, text) {
  let html = `<a href="${href}"`;
  if (title) {
    html += ` title="${title}"`;
  }
  html += ` target="_blank" rel="noopener noreferrer">${text}</a>`;
  return html;
};

marked.setOptions({
  renderer: customRenderer,
  breaks: true
});


function analyze(){
    const symbol = document.getElementById("stock-symbol").value.trim();
    if(!symbol){
        alert("請輸入股票代號（例如：0050.TW 或 APPL 等等");
        return;
    }

    showLoading(true);
    document.getElementById("stock-symbol").innerHTML = "";
    fetch("https://beststockhelper.onrender.com/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol })
    })
    .then(res => res.json())
    .then(data => {
        //document.getElementById("analyze_normal").textContent = data.analyze_normal || "錯誤：" + data.error;
        document.getElementById("analyze_normal").innerHTML =  marked.parse(data.analyze_normal);
        
        //document.getElementById("analyze_9").textContent = data.analyze_9 || "錯誤：" + data.error;
        document.getElementById("analyze_9").innerHTML =  marked.parse(data.analyze_9);
        
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
            showPopup(entry.opinion);
        };
        list.appendChild(li);
    });
}
function showPopup(opinionText){
    const popup = document.getElementById("history-popup");
    const content = document.getElementById("popup-content");
    //content.textContent = opinionText || "（抱歉，腦容量不足，想不起來。）";
    content.innerHTML =  marked.parse(opinionText) || "（抱歉，腦容量不足，想不起來。）";
    popup.classList.remove("hidden");
}
function closePopup(){
    const popup = document.getElementById("history-popup");
    popup.classList.add("hidden");
}
