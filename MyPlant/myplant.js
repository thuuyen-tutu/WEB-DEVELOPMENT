const daysContainer = document.getElementById('days-container');
const monthTitle = document.getElementById('month-title');
const rewardBtn = document.getElementById('reward-btn');
const greenScoreElem = document.getElementById('green-score');
const periodElem = document.getElementById('period');

let currentDate = new Date();
let claimedDates = []; // lưu ngày đã claim
let streak = 0;        // số ngày liên tiếp claim
let greenScore = 0;    // điểm xanh
let plantStage = "Seed 🌱"; // giai đoạn cây

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  monthTitle.textContent = `${monthNames[month]} ${year}`;
  daysContainer.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Thêm ô trống đầu tuần
  for(let i=0;i<firstDay;i++){
    const emptyCell = document.createElement('div');
    daysContainer.appendChild(emptyCell);
  }

  // Tạo các ô ngày
  for(let day=1; day<=daysInMonth; day++){
    const dayCell = document.createElement('div');
    dayCell.classList.add('day-cell');
    dayCell.textContent = day;

    const cellDate = new Date(year, month, day);
    const isClaimed = claimedDates.some(d => d.toDateString() === cellDate.toDateString());
    if(isClaimed){
      dayCell.classList.add('claimed');
      dayCell.textContent = '🌱';
    }

    daysContainer.appendChild(dayCell);
  }
}

// Tính streak liên tiếp
function updateStreak() {
  if(claimedDates.length === 0) {
    streak = 0;
    return;
  }

  claimedDates.sort((a,b) => a-b);
  streak = 1;
  for(let i=claimedDates.length-1; i>0; i--){
    const diff = (claimedDates[i] - claimedDates[i-1]) / (1000*60*60*24);
    if(diff === 1){
      streak++;
    } else {
      break;
    }
  }
}

// Cập nhật greenscore và giai đoạn cây
function updatePlant() {
  greenScore = streak;
  greenScoreElem.textContent = greenScore;

  if(streak >= 90) {
    plantStage = "Guardian Tree 🌳🏆";
  } else if(streak >= 30) {
    plantStage = "Tree 🌳";
  } else if(streak >= 10) {
    plantStage = "Sapling 🌱🌿";
  } else if(streak >= 3) {
    plantStage = "Sprout 🌱";
  } else {
    plantStage = "Seed 🌱";
  }

  periodElem.textContent = plantStage;
}

// Render lần đầu
renderCalendar(currentDate);
updatePlant();

// Chuyển tháng
document.getElementById('prev-month').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth()-1);
  renderCalendar(currentDate);
});
document.getElementById('next-month').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth()+1);
  renderCalendar(currentDate);
});

// Nút claim reward
rewardBtn.addEventListener('click', () => {
  const today = new Date();
  const todayStr = today.toDateString();

  // Kiểm tra đã claim hôm nay chưa
  const alreadyClaimed = claimedDates.some(d => d.toDateString() === todayStr);
  if(alreadyClaimed){
    alert("You have already claimed today's reward!");
    return;
  }

  claimedDates.push(today);  // claim ngày hôm nay
  updateStreak();            // cập nhật streak liên tiếp
  updatePlant();             // cập nhật greenscore & cây
  renderCalendar(currentDate); // render calendar
});
